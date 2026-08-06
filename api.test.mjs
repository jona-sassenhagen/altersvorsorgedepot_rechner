import assert from "node:assert/strict";
import test from "node:test";

import { handleSimulationRequest, healthResponse } from "./serverless/api-core.mjs";

function samplePayload(overrides = {}) {
  return {
    household: {
      applicant: {
        birthdate: "1990-01-01",
        retirementAge: 67,
        monthlyContribution: 150,
        initialBalance: 0,
        incomeRate: 0.3,
      },
      spouse: null,
      children: [],
      childBenefitDurationYears: 18,
      annualFeeRate: 0.002,
      etfComparison: {
        monthlyContribution: 500,
        startYear: 2020,
        endYear: 2045,
        postSavingsMonthlyFlow: -500,
        trancheCount: 5,
      },
    },
    options: {
      asOfDate: "2026-08-04",
      maxAge: 70,
      samplingMode: "block-bootstrap",
      simulationCount: 2,
      seed: 7,
      adjustInflowsForInflation: true,
      withdrawalRate: 0.04,
      withdrawalRateCandidates: [0.03, 0.04, 0.05],
    },
    ...overrides,
  };
}

function apiRequest(path, payload) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

test("local API health response loads and reports the cached datasets", async () => {
  const response = await healthResponse();
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, "ok");
  assert.equal(body.data.marketAndInflationFrom, "1900-01");
  assert.equal(body.data.marketAndInflationThrough, "2026-06");
  assert.equal(body.data.basisRatesThrough, 2026);
});

test("simulate endpoint returns aggregates without leaking raw paths or ETF lots", async () => {
  const response = await handleSimulationRequest(
    apiRequest("/api/v1/simulate", samplePayload()),
    "simulate",
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.apiVersion, "v1");
  assert.equal(body.metadata.asOfDate, "2026-08-04");
  assert.equal(body.metadata.pathCount, 2);
  assert.ok(body.projection.timeline.length > 0);
  assert.ok(body.etfComparison.real.value.median > 0);
  assert.equal(typeof body.etfComparison.real.totalTaxPaid.median, "number");
  assert.equal(typeof body.etfComparison.real.capitalLossCarryforward.median, "number");
  assert.equal("comparisonPaths" in body, false);
  assert.equal("paths" in body.etfComparison, false);
});

test("compare endpoint exposes the pure AVD-versus-ETF tax comparison", async () => {
  const response = await handleSimulationRequest(
    apiRequest("/api/v1/compare", samplePayload({
      comparison: { pensionMonthly: 1500, terms: "real" },
    })),
    "compare",
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.metadata.terms, "real");
  assert.equal(body.inputs.pensionMonthly, 1500);
  assert.equal(typeof body.comparison.avdAdvantage, "number");
  assert.equal(typeof body.comparison.avdTotalNetIncome, "number");
  assert.equal(typeof body.comparison.etfTotalNetIncome, "number");
  assert.equal(body.comparison.assumedKvdr, true);
  assert.equal(body.comparison.kvdr.assumedKvdr, true);
  assert.equal(typeof body.comparison.kvdrHealthInsurance, "number");
  assert.equal(typeof body.comparison.kvdrCareInsurance, "number");
  assert.equal(
    body.comparison.kvdrTotalContributions,
    body.comparison.kvdrHealthInsurance + body.comparison.kvdrCareInsurance,
  );
  assert.equal(
    body.comparison.kvdrDeductibleContributions,
    body.comparison.kvdrTotalContributions,
  );
  assert.ok(Math.abs(
    body.comparison.avdTotalGrossIncome - body.comparison.avdTotalTax -
      body.comparison.kvdrTotalContributions - body.comparison.avdTotalNetIncome,
  ) < 1e-9);
  assert.equal(typeof body.comparison.advantageDistribution.avdWinRate, "number");
  assert.equal(
    typeof body.comparison.advantageDistribution.returnRegimes.medianRealAnnualReturn,
    "number",
  );
  assert.equal(
    typeof body.comparison.advantageDistribution.returnRegimes.belowMedian.avdWinRate,
    "number",
  );
  assert.equal(
    typeof body.comparison.advantageDistribution.returnRegimes.aboveMedian.avdWinRate,
    "number",
  );
  assert.ok(body.comparison.advantageDistribution.bins.length >= 6);
  assert.ok(body.comparison.advantageDistribution.bins.length <= 16);
  assert.equal(
    body.comparison.advantageDistribution.bins.reduce((sum, bin) => sum + bin.count, 0),
    body.metadata.pathCount,
  );
  assert.ok(Math.abs(
    body.comparison.avdAdvantage - body.comparison.advantageDistribution.mean * 12,
  ) < 1e-9);
  assert.ok(Math.abs(
    body.comparison.avdAdvantage -
      (body.comparison.avdTotalNetIncome - body.comparison.etfTotalNetIncome),
  ) < 1e-9);
  assert.match(body.comparison.etfTaxMethod, /^(flat|tariff)$/);
});

test("API validation rejects an end year before the savings start", async () => {
  const payload = samplePayload();
  payload.household.etfComparison.startYear = 2045;
  payload.household.etfComparison.endYear = 2020;
  const response = await handleSimulationRequest(
    apiRequest("/api/v1/simulate", payload),
    "simulate",
  );
  const body = await response.json();

  assert.equal(response.status, 422);
  assert.equal(body.error.code, "validation_failed");
  assert.equal(body.error.details[0].path, "/household/etfComparison/endYear");
});

test("API validation rejects a horizon that has already passed", async () => {
  const payload = samplePayload();
  payload.options.maxAge = 51;
  payload.household.applicant.birthdate = "1950-01-01";
  const response = await handleSimulationRequest(
    apiRequest("/api/v1/simulate", payload),
    "simulate",
  );
  const body = await response.json();

  assert.equal(response.status, 422);
  assert.equal(body.error.details[0].path, "/options/maxAge");
});
