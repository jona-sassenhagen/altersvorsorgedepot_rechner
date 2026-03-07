import assert from "node:assert/strict";
import test from "node:test";

import { buildDataStatusText, parseChildBirthYearInput, simulateHousehold } from "./app.js";
import { computeSimulationResult } from "./simulation-worker.js";

function buildStatusDataset() {
  return {
    market: {
      bootstrapSeries: [{ key: "1979-01" }, { key: "2025-12" }],
    },
  };
}

function buildBootstrapSeries(length = 180) {
  return Array.from({ length }, (_, index) => ({
    inflationRatio: 1 + ((index % 3) - 1) * 0.0005,
    key: `2000-${String((index % 12) + 1).padStart(2, "0")}`,
    marketReturn: 0.004 + (index % 5) * 0.001,
  }));
}

function buildHousehold() {
  return {
    annualFeeRate: 0.002,
    applicant: {
      birthdate: new Date(1990, 6, 1),
      incomeRate: 0.3,
      initialBalance: 1_000,
      monthlyContribution: 150,
      retirementAge: 67,
    },
    children: [new Date(2018, 6, 1)],
    spouse: {
      birthdate: new Date(1992, 6, 1),
      incomeRate: 0.2,
      monthlyContribution: 100,
      retirementAge: 67,
    },
  };
}

test("parseChildBirthYearInput accepts a valid year", () => {
  const birthdate = parseChildBirthYearInput({
    hasBadInput: false,
    hasInteracted: true,
    rowLabel: "Kind",
    yearValue: "2018",
  });

  assert.ok(birthdate instanceof Date);
  assert.equal(birthdate.getFullYear(), 2018);
});

test("parseChildBirthYearInput ignores untouched empty rows", () => {
  const birthdate = parseChildBirthYearInput({
    hasBadInput: false,
    hasInteracted: false,
    rowLabel: "Kind",
    yearValue: "",
  });

  assert.equal(birthdate, null);
});

test("parseChildBirthYearInput rejects touched empty rows", () => {
  assert.throws(
    () =>
      parseChildBirthYearInput({
        hasBadInput: false,
        hasInteracted: true,
        rowLabel: "Kind II",
        yearValue: "",
      }),
    /Kind II/,
  );
});

test("parseChildBirthYearInput rejects invalid years", () => {
  assert.throws(
    () =>
      parseChildBirthYearInput({
        hasBadInput: false,
        hasInteracted: true,
        rowLabel: "Kind",
        yearValue: "1800",
      }),
    /1900 und 2050/,
  );
});

test("buildDataStatusText keeps the selected mode and loading state", () => {
  const status = buildDataStatusText(buildStatusDataset(), true, { isLoading: true });

  assert.match(status, /Inflationsbereinigt\./);
  assert.match(status, /Berechnung laeuft…/);
});

test("buildDataStatusText renders nominal mode", () => {
  const status = buildDataStatusText(buildStatusDataset(), false);

  assert.match(status, /Nominal\./);
  assert.doesNotMatch(status, /Berechnung laeuft/);
});

test("worker computation matches direct simulation for a fixed request", () => {
  const bootstrapSeries = buildBootstrapSeries();
  const household = buildHousehold();
  const options = {
    maxAge: 90,
    now: new Date(2025, 0, 1),
    simulationCount: 6,
    simulationSeedOffset: 3,
  };

  const directResult = simulateHousehold(household, bootstrapSeries, options);
  const workerResult = computeSimulationResult({ bootstrapSeries, household, options });

  assert.deepEqual(workerResult, directResult);
});
