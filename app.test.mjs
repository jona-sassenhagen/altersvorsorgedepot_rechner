import assert from "node:assert/strict";
import test from "node:test";

import {
  annualSupportForYear,
  baseSubsidy,
  buildDataStatusText,
  chartLoadingPatternText,
  parseChildBirthYearInput,
  retirementSummaryValues,
  setLanguage,
  simulateHousehold,
} from "./app.js";
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

test("buildDataStatusText keeps the selected mode on loading", () => {
  const status = buildDataStatusText(buildStatusDataset(), true, false, { isLoading: true });

  assert.match(status, /Inflationsbereinigt(\.|\b)/);
  assert.match(status, /Zuflüsse ohne Inflationsfortschreibung(\.|\b)/);
  assert.doesNotMatch(status, /Berechnung laeuft/);
});

test("buildDataStatusText renders nominal mode", () => {
  const status = buildDataStatusText(buildStatusDataset(), false, false);

  assert.match(status, /Nominal(\.|\b)/);
  assert.match(status, /Zuflüsse ohne Inflationsfortschreibung(\.|\b)/);
  assert.doesNotMatch(status, /Berechnung laeuft/);
});

test("buildDataStatusText renders inflow-adjusted mode", () => {
  const status = buildDataStatusText(buildStatusDataset(), true, true);

  assert.match(status, /Inflationsbereinigt(\.|\b)/);
  assert.match(status, /Zuflüsse mit Inflation fortgeschrieben(\.|\b)/);
});

test("buildDataStatusText renders English copy after locale switch", () => {
  setLanguage("en");
  const status = buildDataStatusText(buildStatusDataset(), true, true);

  assert.match(status, /months of ETF and inflation data/);
  assert.match(status, /Inflation-adjusted(\.|\b)/);
  assert.match(status, /Inflows indexed with inflation(\.|\b)/);

  setLanguage("de");
});

test("parseChildBirthYearInput uses localized English validation messages", () => {
  setLanguage("en");

  assert.throws(
    () =>
      parseChildBirthYearInput({
        hasBadInput: false,
        hasInteracted: true,
        rowLabel: "Child II",
        yearValue: "",
      }),
    /Child II/,
  );

  setLanguage("de");
});

test("chartLoadingPatternText cycles through the expected dot pattern", () => {
  assert.equal(chartLoadingPatternText(0), ".");
  assert.equal(chartLoadingPatternText(1), "..");
  assert.equal(chartLoadingPatternText(2), "...");
  assert.equal(chartLoadingPatternText(3), ".");
});

test("baseSubsidy uses the new 50-cent and 25-cent tiers", () => {
  assert.equal(baseSubsidy(0), 0);
  assert.equal(baseSubsidy(360), 180);
  assert.equal(baseSubsidy(1_800), 540);
  assert.equal(baseSubsidy(2_400), 540);
});

test("annualSupportForYear grants the full child allowance from 25 euros per month", () => {
  const household = {
    applicant: {
      birthdate: new Date(1990, 0, 1),
      incomeRate: 0,
    },
    spouse: null,
    children: [new Date(2020, 0, 1)],
  };

  const belowThreshold = annualSupportForYear(household, {
    applicantAnnualContribution: 240,
    spouseAnnualContribution: 0,
    yearEndDate: new Date(2026, 11, 31),
    yearIndex: 1,
  });

  const atThreshold = annualSupportForYear(household, {
    applicantAnnualContribution: 300,
    spouseAnnualContribution: 0,
    yearEndDate: new Date(2026, 11, 31),
    yearIndex: 1,
  });

  assert.equal(belowThreshold.applicant, 360);
  assert.equal(atThreshold.applicant, 450);
});

test("withdrawal summary does not select a pre-applicant-retirement spouse-only year", () => {
  const now = new Date(2025, 0, 1);
  const bootstrapSeries = Array.from({ length: 55 * 12 }, (_, index) => ({
    inflationRatio: 1.001 + (index % 7) * 0.0003,
    key: `reg-${index}`,
    marketReturn: -0.01 + (index % 17) * 0.002,
  }));

  const applicant = {
    birthdate: new Date(1990, 6, 1),
    incomeRate: 0.3,
    initialBalance: 0,
    monthlyContribution: 150,
    retirementAge: 67,
  };
  const singleHousehold = {
    annualFeeRate: 0.002,
    applicant,
    children: [],
    spouse: null,
  };
  const spouseHousehold = {
    annualFeeRate: 0.002,
    applicant,
    children: [],
    spouse: {
      birthdate: new Date(1985, 6, 1),
      incomeRate: 0.3,
      monthlyContribution: 150,
      retirementAge: 67,
    },
  };
  const options = {
    maxAge: 90,
    now,
    simulationCount: 300,
    simulationSeedOffset: 0,
  };

  const singleResult = simulateHousehold(singleHousehold, bootstrapSeries, options);
  const spouseResult = simulateHousehold(spouseHousehold, bootstrapSeries, options);

  const singleWithdrawal = retirementSummaryValues(singleResult, true).withdrawalIncome;
  const spouseWithdrawal = retirementSummaryValues(spouseResult, true).withdrawalIncome;

  assert.equal(singleResult.preRetirementYear, spouseResult.preRetirementYear);
  assert.ok(spouseWithdrawal >= singleWithdrawal);
});

test("simulateHousehold includes subsidy in inflows and supports real inflow series", () => {
  const bootstrapSeries = Array.from({ length: 181 }, (_, index) => ({
    inflationRatio: 1.002,
    key: `fix-${index}`,
    marketReturn: 0,
  }));
  const household = {
    annualFeeRate: 0,
    applicant: {
      birthdate: new Date(1990, 0, 1),
      incomeRate: 0,
      initialBalance: 0,
      monthlyContribution: 150,
      retirementAge: 67,
    },
    children: [],
    spouse: null,
  };

  const result = simulateHousehold(household, bootstrapSeries, {
    adjustInflowsForInflation: false,
    maxAge: 40,
    now: new Date(2025, 0, 1),
    simulationCount: 1,
    simulationSeedOffset: 0,
  });

  const yearOneNominal = result.yearlyStats[1].nominal;
  const yearOneReal = result.yearlyStats[1].real;

  assert.equal(yearOneNominal.contributions.median, 1_800);
  assert.equal(yearOneNominal.inflows.median, 2_340);
  assert.ok(yearOneReal.inflows.median < yearOneNominal.inflows.median);
});

test("simulateHousehold indexes contributions and subsidies when inflow indexing is enabled", () => {
  const bootstrapSeries = Array.from({ length: 241 }, (_, index) => ({
    inflationRatio: 1.004,
    key: `idx-${index}`,
    marketReturn: 0,
  }));
  const household = {
    annualFeeRate: 0,
    applicant: {
      birthdate: new Date(1990, 0, 1),
      incomeRate: 0,
      initialBalance: 0,
      monthlyContribution: 100,
      retirementAge: 67,
    },
    children: [],
    spouse: null,
  };

  const sharedOptions = {
    maxAge: 45,
    now: new Date(2025, 0, 1),
    simulationCount: 1,
    simulationSeedOffset: 0,
  };

  const withoutIndexing = simulateHousehold(household, bootstrapSeries, {
    ...sharedOptions,
    adjustInflowsForInflation: false,
  });
  const withIndexing = simulateHousehold(household, bootstrapSeries, {
    ...sharedOptions,
    adjustInflowsForInflation: true,
  });

  const yearOneWithout = withoutIndexing.yearlyStats[1].nominal;
  const yearOneWith = withIndexing.yearlyStats[1].nominal;
  const lastYearIndex = withIndexing.yearlyStats.length - 1;
  const lastYearWithout = withoutIndexing.yearlyStats[lastYearIndex].nominal;
  const lastYearWith = withIndexing.yearlyStats[lastYearIndex].nominal;

  assert.equal(yearOneWithout.contributions.median, 1_200);
  assert.ok(yearOneWith.contributions.median > yearOneWithout.contributions.median * 1.02);
  assert.ok(yearOneWith.inflows.median > yearOneWithout.inflows.median * 1.02);
  assert.ok(lastYearWith.household.median > lastYearWithout.household.median * 1.3);
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
