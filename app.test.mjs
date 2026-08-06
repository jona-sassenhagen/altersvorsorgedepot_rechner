import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  annualSupportForYear,
  baseSubsidy,
  buildDataStatusText,
  buildEtfHistoricalPrelude,
  buildHistoricalPaths,
  buildAdvantageDistribution,
  buildWithdrawalTooltipText,
  calculateBootstrapSamplingRealCagr,
  calculateKvdrContributions,
  calculateHistoricalRealCagr,
  calculateEtfTaxYear,
  chartLoadingPatternText,
  compareSimulationResult,
  compareNetWithdrawals,
  comparisonAdvantageFromTotals,
  formatSuccessPercent,
  incomeWaterfallGeometry,
  waterfallConnectorPercent,
  incomeTax2026,
  makeBootstrapPath,
  averageComparison,
  migrateSession,
  parseBasisRateCsv,
  parseChildBirthYearInput,
  projectOrdinaryEtfPath,
  projectPath,
  recenterBootstrapSeries,
  realizeEtfWithdrawal,
  resolveMonthlyPension,
  retirementSummaryValues,
  setLanguage,
  simulateHousehold,
  statutoryPensionTaxableShare,
  kvdrCareInsuranceRateForHousehold,
} from "./app.js";
import { computeSimulationResult } from "./simulation-worker.js";

function buildStatusDataset() {
  return {
    market: {
      bootstrapSeries: Array.from({ length: 1518 }, (_, index) => {
        const year = 1900 + Math.floor(index / 12);
        const month = (index % 12) + 1;
        return { key: `${year}-${String(month).padStart(2, "0")}` };
      }),
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

function buildMonthlySeries(startYear, yearCount) {
  return Array.from({ length: yearCount * 12 }, (_, index) => {
    const year = startYear + Math.floor(index / 12);
    const month = (index % 12) + 1;
    return {
      inflationRatio: 1 + (index % 4) * 0.0001,
      key: `${year}-${String(month).padStart(2, "0")}`,
      marketReturn: 0.002 + (index % 7) * 0.0005,
    };
  });
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

test("buildDataStatusText shows the full history in completed years", () => {
  const status = buildDataStatusText(buildStatusDataset(), true, false, { isLoading: true });

  assert.equal(status, "Inflation und Aktienmärkte 1900-2026.");
  assert.doesNotMatch(status, /1518 Monate/);
  assert.doesNotMatch(status, /Inflationsbereinigt|Zuflüsse|Renditeannahme/);
});

test("buildDataStatusText renders English copy after locale switch", () => {
  setLanguage("en");
  const status = buildDataStatusText(buildStatusDataset(), true, true);

  assert.match(status, /126 years of equity and inflation data/);
  assert.doesNotMatch(status, /Inflation-adjusted|Inflows indexed|return assumption/);

  setLanguage("de");
});

test("success percentages are rounded to whole numbers", () => {
  assert.equal(formatSuccessPercent(2 / 3), "67 %");
  assert.equal(formatSuccessPercent(0.724), "72 %");
  assert.equal(formatSuccessPercent(1), "100 %");
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

test("annualSupportForYear uses the configurable child-benefit duration with an 18-year default", () => {
  const context = {
    applicantAnnualContribution: 300,
    spouseAnnualContribution: 0,
    yearEndDate: new Date(2026, 11, 31),
    yearIndex: 2,
  };
  const household = {
    applicant: {
      birthdate: new Date(1990, 0, 1),
      incomeRate: 0,
    },
    spouse: null,
    children: [new Date(2006, 0, 1)],
  };

  assert.equal(annualSupportForYear(household, context).applicant, 150);
  assert.equal(
    annualSupportForYear({ ...household, childBenefitDurationYears: 20 }, context).applicant,
    150,
  );
  assert.equal(
    annualSupportForYear({ ...household, childBenefitDurationYears: 21 }, context).applicant,
    450,
  );
});

test("§10a approximation deducts eligible own contributions plus allowances", () => {
  const support = annualSupportForYear({
    applicant: { birthdate: new Date(1990, 0, 1), incomeRate: 0.3 },
    spouse: null,
    children: [],
  }, {
    applicantAnnualContribution: 1_800,
    spouseAnnualContribution: 0,
    yearEndDate: new Date(2026, 11, 31),
    yearIndex: 1,
  });

  assert.equal(support.applicantDirect, 540);
  assert.equal(support.applicantTax, 162);
  assert.equal(support.applicant, 702);
});

test("starter bonus uses the actual contract start date", () => {
  const support = annualSupportForYear({
    applicant: { birthdate: new Date(2001, 0, 1), incomeRate: 0 },
    spouse: null,
    children: [],
  }, {
    applicantAnnualContribution: 100,
    spouseAnnualContribution: 0,
    contractStartDate: new Date(2026, 11, 1),
    yearEndDate: new Date(2026, 11, 31),
    yearIndex: 1,
  });

  assert.equal(support.applicantDirect, 50);
});

test("AVD tracks contributions above EUR 1,800 as non-funded principal", () => {
  const household = {
    annualFeeRate: 0,
    applicant: {
      birthdate: new Date(1990, 0, 1),
      incomeRate: 0.3,
      initialBalance: 0,
      monthlyContribution: 200,
      retirementAge: 67,
    },
    children: [],
    spouse: null,
  };
  const bootstrap = Array.from({ length: 12 }, (_, index) => ({
    inflationRatio: 1,
    key: `2026-${String(index + 1).padStart(2, "0")}`,
    marketReturn: 0,
  }));

  const path = projectPath(household, bootstrap, new Date(2026, 0, 1), 1);

  assert.equal(path.avdTaxPools.applicant.fundedValue, 2_340);
  assert.equal(path.avdTaxPools.applicant.unfundedValue, 762);
  assert.equal(path.avdTaxPools.applicant.unfundedBasis, 762);
  assert.equal(path.householdNominal[1], 3_102);
});

test("projectPath caps withdrawals at the available balance and records shortfalls", () => {
  const now = new Date(2026, 0, 1);
  const household = {
    annualFeeRate: 0,
    applicant: {
      birthdate: new Date(1959, 0, 1),
      incomeRate: 0,
      initialBalance: 1_200,
      monthlyContribution: 0,
      retirementAge: 67,
    },
    children: [],
    spouse: null,
  };
  const bootstrap = Array.from({ length: 24 }, (_, index) => ({
    inflationRatio: 1,
    key: `loss-${index}`,
    marketReturn: index === 11 ? -0.999 : 0,
  }));

  const path = projectPath(household, bootstrap, now, 2);

  assert.ok(Math.abs(path.householdWithdrawalReal[1] - 1.156) < 1e-9);
  assert.equal(path.householdWithdrawalReal[2], 0);
  assert.equal(path.householdNominal[1], 0);
  assert.equal(path.householdNominal[2], 0);
  assert.equal(path.withdrawalOutcome.success, false);
  assert.ok(path.withdrawalOutcome.firstShortfallDate instanceof Date);
  assert.ok(path.withdrawalOutcome.firstShortfallApplicantAge > 67);
  assert.ok(
    Math.abs(
      path.withdrawalOutcome.cumulativeRequestedReal -
        path.withdrawalOutcome.cumulativePaidReal -
        path.withdrawalOutcome.cumulativeShortfallReal,
    ) < 1e-9,
  );
  assert.ok(path.withdrawalOutcome.cumulativeShortfallReal > 50);
  assert.doesNotMatch(JSON.stringify(path.withdrawalOutcome), /NaN|Infinity/);
});

test("withdrawal statistics distinguish fully funded and shortfall paths", () => {
  const now = new Date(2026, 0, 1);
  const household = {
    annualFeeRate: 0,
    applicant: {
      birthdate: new Date(1960, 0, 1),
      incomeRate: 0,
      initialBalance: 1_200,
      monthlyContribution: 0,
      retirementAge: 67,
    },
    children: [],
    spouse: null,
  };
  const sharedOptions = {
    maxAge: 68,
    now,
    simulationCount: 3,
    simulationSeedOffset: 0,
  };
  const funded = simulateHousehold(
    household,
    Array.from({ length: 180 }, (_, index) => ({
      inflationRatio: 1,
      key: `funded-${index}`,
      marketReturn: 0,
    })),
    sharedOptions,
  );
  const depleted = simulateHousehold(
    household,
    Array.from({ length: 180 }, (_, index) => ({
      inflationRatio: 1,
      key: `depleted-${index}`,
      marketReturn: -0.9,
    })),
    sharedOptions,
  );

  assert.equal(funded.withdrawalStats.successRate, 1);
  assert.equal(funded.withdrawalStats.failedPathCount, 0);
  assert.equal(funded.withdrawalStats.firstShortfallApplicantAge, null);
  assert.equal(depleted.withdrawalStats.successRate, 0);
  assert.equal(depleted.withdrawalStats.failedPathCount, 3);
  assert.ok(depleted.withdrawalStats.firstShortfallApplicantAge.median > 67);
  assert.ok(
    depleted.withdrawalStats.failedPathCumulativeShortfallReal.median > 0,
  );

  setLanguage("de");
  assert.match(buildWithdrawalTooltipText(funded, true), /keine Entnahmelücke/i);
  assert.match(buildWithdrawalTooltipText(depleted, true), /inflationsbereinigt/);
  assert.match(buildWithdrawalTooltipText(depleted, false), /nominal/);
  setLanguage("en");
  assert.match(buildWithdrawalTooltipText(depleted, true), /first household income shortfall/i);
  assert.match(buildWithdrawalTooltipText(depleted, true), /inflation-adjusted/);
  setLanguage("de");
});

test("selected withdrawal rate changes income and path success without changing the default", () => {
  const now = new Date(2026, 0, 1);
  const household = {
    annualFeeRate: 0,
    applicant: {
      birthdate: new Date(1959, 0, 1),
      incomeRate: 0,
      initialBalance: 1_200,
      monthlyContribution: 0,
      retirementAge: 67,
    },
    children: [],
    spouse: null,
  };
  const bootstrapSeries = Array.from({ length: 180 }, (_, index) => ({
    inflationRatio: 1,
    key: `flat-${index}`,
    marketReturn: 0,
  }));
  const options = {
    maxAge: 90,
    now,
    simulationCount: 3,
    simulationSeedOffset: 0,
  };
  const candidateRates = [
    0.03,
    0.0325,
    0.035,
    0.0375,
    0.04,
    0.0425,
    0.045,
    0.0475,
    0.05,
  ];

  const omitted = simulateHousehold(household, bootstrapSeries, options);
  const explicitDefault = simulateHousehold(household, bootstrapSeries, {
    ...options,
    withdrawalRate: 0.04,
  });
  const lower = simulateHousehold(household, bootstrapSeries, {
    ...options,
    withdrawalRate: 0.03,
    withdrawalRateCandidates: candidateRates,
  });
  const higher = simulateHousehold(household, bootstrapSeries, {
    ...options,
    withdrawalRate: 0.05,
    withdrawalRateCandidates: candidateRates,
  });

  assert.deepEqual(omitted, explicitDefault);
  assert.equal(lower.withdrawalRate, 0.03);
  assert.equal(lower.withdrawalStats.withdrawalRate, 0.03);
  assert.equal(higher.withdrawalStats.withdrawalRate, 0.05);
  assert.equal(lower.withdrawalStats.successRate, 1);
  assert.equal(higher.withdrawalStats.successRate, 0);
  assert.equal(lower.withdrawalRateStats.length, 9);
  assert.ok(
    lower.withdrawalRateStats.some(
      (stats) => stats.withdrawalRate === 0.0375,
    ),
  );
  assert.deepEqual(lower.withdrawalRateStats, higher.withdrawalRateStats);
  for (let index = 1; index < lower.withdrawalRateStats.length; index += 1) {
    assert.ok(
      lower.withdrawalRateStats[index].successRate <=
        lower.withdrawalRateStats[index - 1].successRate,
    );
  }
  const selectedLowerStats = lower.withdrawalRateStats.find(
    (stats) => stats.withdrawalRate === lower.withdrawalRate,
  );
  const selectedHigherStats = higher.withdrawalRateStats.find(
    (stats) => stats.withdrawalRate === higher.withdrawalRate,
  );
  assert.equal(
    selectedLowerStats.successRate,
    lower.withdrawalStats.successRate,
  );
  assert.equal(
    selectedHigherStats.successRate,
    higher.withdrawalStats.successRate,
  );
  for (const candidateRate of candidateRates) {
    const standalone = simulateHousehold(household, bootstrapSeries, {
      ...options,
      withdrawalRate: candidateRate,
    });
    const comparison = lower.withdrawalRateStats.find(
      (stats) => stats.withdrawalRate === candidateRate,
    );
    assert.equal(comparison.successRate, standalone.withdrawalStats.successRate);
  }
  assert.ok(
    retirementSummaryValues(higher, true).withdrawalIncome >
      retirementSummaryValues(lower, true).withdrawalIncome,
  );
  const transferredRiesterComparison = compareSimulationResult(lower, {
    pensionMonthly: 1_500,
    terms: "real",
  });
  assert.ok(transferredRiesterComparison.commonAvdGrossWithdrawal > 0);
  assert.equal(
    transferredRiesterComparison.grossWithdrawal,
    transferredRiesterComparison.commonAvdGrossWithdrawal,
  );
  assert.equal(
    transferredRiesterComparison.etfGrossWithdrawal,
    transferredRiesterComparison.commonAvdGrossWithdrawal,
  );
  assert.ok(Math.abs(
    retirementSummaryValues(lower, true).withdrawalIncome -
      transferredRiesterComparison.grossWithdrawal / 12,
  ) < 1e-9);

  setLanguage("de");
  assert.match(buildWithdrawalTooltipText(higher, true), /5 % des jeweiligen Depotwerts/);
  setLanguage("en");
  assert.match(buildWithdrawalTooltipText(higher, true), /5 % of each portfolio value/);
  setLanguage("de");

  for (const invalidRate of [-0.01, 1.01, Number.NaN]) {
    assert.throws(
      () =>
        simulateHousehold(household, bootstrapSeries, {
          ...options,
          withdrawalRate: invalidRate,
        }),
      /withdrawalRate must be between 0 and 1/,
    );
  }
  assert.throws(
    () =>
      simulateHousehold(household, bootstrapSeries, {
        ...options,
        withdrawalRateCandidates: [0.03, -0.01],
      }),
    /withdrawalRate must be between 0 and 1/,
  );
  const deduplicated = simulateHousehold(household, bootstrapSeries, {
    ...options,
    withdrawalRate: 0.03,
    withdrawalRateCandidates: [0.03, 0.03],
  });
  assert.equal(deduplicated.withdrawalRateStats.length, 1);
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
  const singleComparisonWithdrawal = compareSimulationResult(singleResult, {
    pensionMonthly: 1_500,
    terms: "real",
  }).grossWithdrawal / 12;

  assert.equal(singleResult.preRetirementYear, spouseResult.preRetirementYear);
  assert.ok(Math.abs(singleWithdrawal - singleComparisonWithdrawal) < 1e-9);
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

test("inflation-indexed support is summarized in real euros without nominal inflation outliers", () => {
  const extremeInflationSeries = Array.from({ length: 24 }, (_, index) => ({
    inflationRatio: 2,
    key: `inflation-${index}`,
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

  const result = simulateHousehold(household, extremeInflationSeries, {
    adjustInflowsForInflation: true,
    maxAge: 37,
    now: new Date(2025, 0, 1),
    simulationCount: 1,
    simulationSeedOffset: 0,
  });

  assert.ok(Math.abs(result.averageAnnualSupport - 540) < 1e-9);
  assert.ok(Math.abs(result.averageAnnualSupportStats.real.median - 540) < 1e-9);
  assert.ok(result.averageAnnualSupportStats.nominal.median > 1_000_000);
  assert.ok(Math.abs(retirementSummaryValues(result, true).averageSupport - 540) < 1e-9);
  assert.equal(
    retirementSummaryValues(result, false).averageSupport,
    result.averageAnnualSupportStats.nominal.median,
  );
});

test("worker computation matches direct simulation for a fixed request", () => {
  const bootstrapSeries = buildBootstrapSeries();
  const household = buildHousehold();
  const options = {
    maxAge: 90,
    now: new Date(2025, 0, 1),
    simulationCount: 6,
    simulationSeedOffset: 3,
    expectedRealAnnualReturn: 0.03,
    withdrawalRate: 0.045,
  };

  const directResult = simulateHousehold(household, bootstrapSeries, options);
  const workerResult = computeSimulationResult({ bootstrapSeries, household, options });

  assert.deepEqual(workerResult, directResult);
});

test("calculateHistoricalRealCagr uses the geometric mean of real monthly factors", () => {
  const monthlyRealFactors = [1.01, 0.99, 1.02, 1.005];
  const inflationRatios = [1.001, 1.002, 0.999, 1.003];
  const series = monthlyRealFactors.map((realFactor, index) => ({
    key: `2020-0${index + 1}`,
    inflationRatio: inflationRatios[index],
    marketReturn: realFactor * inflationRatios[index] - 1,
  }));
  const expected = Math.pow(monthlyRealFactors.reduce((product, factor) => product * factor, 1), 12 / 4) - 1;

  assert.ok(Math.abs(calculateHistoricalRealCagr(series) - expected) < 1e-12);
});

test("circular bootstrap wraps at the boundary and includes every month equally", () => {
  const series = Array.from({ length: 7 }, (_, sourceIndex) => ({ sourceIndex }));
  const wrapped = makeBootstrapPath(series, 6, () => (6.25 / series.length));
  assert.deepEqual(
    wrapped.map((observation) => observation.sourceIndex),
    [6, 0, 1, 2, 3, 4],
  );

  for (const targetMonths of [17, 180]) {
    const inclusionCounts = Array.from({ length: series.length }, () => 0);
    for (let start = 0; start < series.length; start += 1) {
      const path = makeBootstrapPath(
        series,
        targetMonths,
        () => (start + 0.25) / series.length,
      );
      assert.equal(path.length, targetMonths);
      for (const observation of path) {
        inclusionCounts[observation.sourceIndex] += 1;
      }
    }
    assert.ok(inclusionCounts.every((count) => count === targetMonths));
  }
});

test("historical paths use every eligible annual start without reordering or wraparound", () => {
  const source = buildMonthlySeries(1900, 11);
  const paths = buildHistoricalPaths(source, 5 * 12, { startMonth: 7 });

  assert.equal(paths.length, 6);
  assert.deepEqual(
    paths.map((path) => path.startKey),
    ["1900-07", "1901-07", "1902-07", "1903-07", "1904-07", "1905-07"],
  );
  assert.deepEqual(
    paths.map((path) => path.endKey),
    ["1905-06", "1906-06", "1907-06", "1908-06", "1909-06", "1910-06"],
  );
  for (const path of paths) {
    assert.equal(path.observations.length, 60);
    const sourceStart = source.findIndex(
      (observation) => observation.key === path.startKey,
    );
    assert.deepEqual(
      path.observations,
      source.slice(sourceStart, sourceStart + 60),
    );
  }
});

test("historical simulation uses its actual path count and ignores random seeds", () => {
  const household = {
    annualFeeRate: 0,
    applicant: {
      birthdate: new Date(1986, 6, 1),
      incomeRate: 0,
      initialBalance: 1_000,
      monthlyContribution: 100,
      retirementAge: 67,
    },
    children: [],
    spouse: null,
  };
  const source = buildMonthlySeries(1900, 11);
  const options = {
    samplingMode: "historical-paths",
    now: new Date(2026, 6, 1),
    maxAge: 45,
    simulationCount: 999,
    simulationSeedOffset: 0,
  };
  const first = simulateHousehold(household, source, options);
  const second = simulateHousehold(household, source, {
    ...options,
    simulationSeedOffset: 999,
  });

  assert.equal(first.pathCount, 6);
  assert.equal(first.samplingMode, "historical-paths");
  assert.deepEqual(first.historicalPathStartKeys, [
    "1900-07",
    "1901-07",
    "1902-07",
    "1903-07",
    "1904-07",
    "1905-07",
  ]);
  assert.deepEqual(first, second);
});

test("sampler-weighted real-return center matches historical and custom targets", () => {
  const source = buildBootstrapSeries(191);
  const historical = calculateHistoricalRealCagr(source);
  assert.ok(
    Math.abs(calculateBootstrapSamplingRealCagr(source) - historical) < 1e-12,
  );

  for (const target of [-0.5, 0, 0.03, 0.1, 1]) {
    const adjusted = recenterBootstrapSeries(source, target);
    let sampledRealLogSum = 0;
    let sampledCount = 0;
    for (let start = 0; start < adjusted.length; start += 1) {
      const path = makeBootstrapPath(
        adjusted,
        180,
        () => (start + 0.25) / adjusted.length,
      );
      for (const observation of path) {
        sampledRealLogSum += Math.log(
          (1 + observation.marketReturn) / observation.inflationRatio,
        );
        sampledCount += 1;
      }
    }
    const sampledAnnualReturn = Math.expm1((sampledRealLogSum / sampledCount) * 12);
    assert.ok(
      Math.abs(sampledAnnualReturn - target) < 2e-12,
      `target ${target}, sampled ${sampledAnnualReturn}`,
    );
  }
});

test("omitted and historical targets leave the source series and seeded result unchanged", () => {
  const bootstrapSeries = buildBootstrapSeries();
  const historical = calculateHistoricalRealCagr(bootstrapSeries);

  assert.strictEqual(recenterBootstrapSeries(bootstrapSeries), bootstrapSeries);
  assert.strictEqual(recenterBootstrapSeries(bootstrapSeries, historical), bootstrapSeries);

  const options = {
    maxAge: 90,
    now: new Date(2025, 0, 1),
    simulationCount: 4,
    simulationSeedOffset: 7,
  };
  const omitted = simulateHousehold(buildHousehold(), bootstrapSeries, options);
  const explicitHistorical = simulateHousehold(buildHousehold(), bootstrapSeries, {
    ...options,
    expectedRealAnnualReturn: historical,
  });
  assert.deepEqual(explicitHistorical, omitted);
});

test("re-centered series compound to supported annual real-return targets", () => {
  const bootstrapSeries = buildBootstrapSeries();
  for (const target of [-0.5, 0, 0.03, 0.1, 1]) {
    const adjusted = recenterBootstrapSeries(bootstrapSeries, target);
    assert.ok(Math.abs(calculateHistoricalRealCagr(adjusted) - target) < 2e-12, `target ${target}`);
  }
});

test("re-centering preserves real log deviations, inflation, order, and metadata", () => {
  const source = buildBootstrapSeries().map((observation, index) => ({ ...observation, sourceIndex: index }));
  const adjusted = recenterBootstrapSeries(source, 0.1);
  const originalMean =
    source.reduce(
      (sum, observation) => sum + Math.log((1 + observation.marketReturn) / observation.inflationRatio),
      0,
    ) / source.length;
  const adjustedMean =
    adjusted.reduce(
      (sum, observation) => sum + Math.log((1 + observation.marketReturn) / observation.inflationRatio),
      0,
    ) / adjusted.length;

  adjusted.forEach((observation, index) => {
    const originalDeviation =
      Math.log((1 + source[index].marketReturn) / source[index].inflationRatio) - originalMean;
    const adjustedDeviation =
      Math.log((1 + observation.marketReturn) / observation.inflationRatio) - adjustedMean;
    assert.ok(Math.abs(originalDeviation - adjustedDeviation) < 1e-14);
    assert.equal(observation.inflationRatio, source[index].inflationRatio);
    assert.equal(observation.key, source[index].key);
    assert.equal(observation.sourceIndex, index);
  });
});

test("-100% is a finite total-loss simulation and invalid targets are rejected", () => {
  const bootstrapSeries = buildBootstrapSeries();
  const adjusted = recenterBootstrapSeries(bootstrapSeries, -1);
  assert.ok(adjusted.every((observation) => observation.marketReturn === -1));

  const result = simulateHousehold(buildHousehold(), bootstrapSeries, {
    maxAge: 90,
    now: new Date(2025, 0, 1),
    simulationCount: 3,
    simulationSeedOffset: 2,
    expectedRealAnnualReturn: -1,
  });
  const serialized = JSON.stringify(result);
  assert.doesNotMatch(serialized, /NaN|Infinity/);
  assert.throws(() => recenterBootstrapSeries(bootstrapSeries, -1.01), /between -1 and 1/);
  assert.throws(() => recenterBootstrapSeries(bootstrapSeries, 1.01), /between -1 and 1/);
});

test("lower and higher real-return assumptions move identical seeded paths in order", () => {
  const bootstrapSeries = buildBootstrapSeries();
  const options = {
    maxAge: 90,
    now: new Date(2025, 0, 1),
    simulationCount: 8,
    simulationSeedOffset: 11,
  };
  const lower = simulateHousehold(buildHousehold(), bootstrapSeries, {
    ...options,
    expectedRealAnnualReturn: 0.03,
  });
  const higher = simulateHousehold(buildHousehold(), bootstrapSeries, {
    ...options,
    expectedRealAnnualReturn: 0.1,
  });

  assert.ok(
    higher.yearlyStats.at(-1).real.household.median >
      lower.yearlyStats.at(-1).real.household.median,
  );
});

test("session v11 adds ETF tax inputs without changing older saved scenarios", () => {
  const v5 = migrateSession({
    version: 5,
    controls: {
      expectedRealReturnMode: "custom",
      customExpectedRealReturn: 0.1,
      childBenefitDurationYears: 25,
      withdrawalRate: 0.045,
    },
  });
  assert.equal(v5.version, 11);
  assert.equal(v5.controls.expectedRealReturnMode, "custom");
  assert.equal(v5.controls.customExpectedRealReturn, 0.1);
  assert.equal(v5.controls.childBenefitDurationYears, 25);
  assert.equal(v5.controls.withdrawalRate, 0.045);
  assert.equal(v5.controls.resultMode, "projection");
  assert.equal(v5.controls.comparisonPensionMonthly, 1500);
  assert.equal(v5.controls.comparisonPensionInputMode, "monthly");
  assert.ok(Math.abs(v5.controls.comparisonPensionPoints * 42.52 - 1500) < 1e-9);
  assert.equal(v5.controls.comparisonPostSavingsFlowMonthly, 0);
  assert.equal(v5.controls.comparisonEtfContributionMonthly, 500);
  assert.equal(v5.controls.comparisonTrancheCount, 5);
  assert.equal(v5.controls.comparisonSavingsEndYear, 2057);
  assert.equal("comparisonGainShare" in v5.controls, false);
  assert.equal("comparisonEtfMonthly" in v5.controls, false);

  const v4 = migrateSession({
    version: 4,
    controls: {
      expectedRealReturnMode: "custom",
      customExpectedRealReturn: 0.1,
      childBenefitDurationYears: 25,
    },
  });
  assert.equal(v4.version, 11);
  assert.equal(v4.controls.childBenefitDurationYears, 25);
  assert.equal(v4.controls.withdrawalRate, 0.04);

  const v3 = migrateSession({
    version: 3,
    controls: { expectedRealReturnMode: "custom", customExpectedRealReturn: 0.1 },
  });
  assert.equal(v3.version, 11);
  assert.equal(v3.controls.expectedRealReturnMode, "custom");
  assert.equal(v3.controls.customExpectedRealReturn, 0.1);
  assert.equal(v3.controls.childBenefitDurationYears, 18);
  assert.equal(v3.controls.withdrawalRate, 0.04);

  for (const version of [1, 2]) {
    const migrated = migrateSession({ version, controls: { projectedFee: "0.2" } });
    assert.equal(migrated.version, 11);
    assert.equal(migrated.controls.expectedRealReturnMode, "historical");
    assert.equal(migrated.controls.customExpectedRealReturn, 0.03);
    assert.equal(migrated.controls.childBenefitDurationYears, 18);
    assert.equal(migrated.controls.withdrawalRate, 0.04);
  }
});

test("pension points convert to monthly gross pension at the July 2026 value", () => {
  assert.ok(Math.abs(resolveMonthlyPension({ mode: "points", points: 40 }) - 1700.8) < 1e-9);
  assert.equal(resolveMonthlyPension({ mode: "monthly", monthly: 1500 }), 1500);
  assert.equal(resolveMonthlyPension({ mode: "points", points: -5 }), 0);
});

test("ETF tranches implement newest-tranche-first and FIFO within each tranche", () => {
  const household = {
    applicant: {
      birthdate: new Date(1990, 0, 1),
      monthlyContribution: 100,
      retirementAge: 67,
    },
    spouse: null,
  };
  const monthlyPath = Array.from({ length: 24 }, (_, index) => ({
    basisRate: 0.032,
    inflationRatio: 1,
    key: `${2026 + Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`,
    marketReturn: 0.01,
  }));
  const common = {
    adjustInflowsForInflation: true,
    household,
    monthlyPath,
    now: new Date(2026, 0, 1),
    retirementDate: new Date(2028, 0, 1),
  };
  const oneTranche = projectOrdinaryEtfPath({
    ...common,
    config: { monthlyContribution: 250, startYear: 2026, endYear: 2027, trancheCount: 1 },
  });
  const fourTranches = projectOrdinaryEtfPath({
    ...common,
    config: { monthlyContribution: 250, startYear: 2026, endYear: 2027, trancheCount: 4 },
  });
  const sevenUnevenTranches = projectOrdinaryEtfPath({
    ...common,
    adjustInflowsForInflation: true,
    monthlyPath: monthlyPath.map((sample) => ({ ...sample, inflationRatio: 1.0017 })),
    config: { monthlyContribution: 233, startYear: 2026, endYear: 2027, trancheCount: 7 },
  });
  const baselinePlusDecision = projectOrdinaryEtfPath({
    ...common,
    config: { monthlyContribution: 250, startYear: 2026, endYear: 2027, trancheCount: 4 },
    includeDecisionContribution: true,
  });
  const fireWithdrawal = projectOrdinaryEtfPath({
    ...common,
    config: {
      monthlyContribution: 250,
      startYear: 2026,
      endYear: 2026,
      postSavingsMonthlyFlow: -100,
      trancheCount: 4,
    },
  });
  const fifoGain = realizeEtfWithdrawal(oneTranche.lots, 600).gain;
  const newestTrancheGain = realizeEtfWithdrawal(fourTranches.lots, 600).gain;
  assert.ok(newestTrancheGain < fifoGain);
  assert.ok(fourTranches.advanceAssessments > 0);
  assert.equal(fourTranches.contributions, 6000);
  assert.equal(fourTranches.realContributions, 6000);
  assert.equal(baselinePlusDecision.realContributions - fourTranches.realContributions, 2400);
  assert.ok(baselinePlusDecision.value > fourTranches.value);
  assert.ok(fireWithdrawal.preRetirementWithdrawals > 0);
  assert.equal(fireWithdrawal.preRetirementWithdrawalShortfall, 0);
  assert.ok(fireWithdrawal.value < fourTranches.value);
  assert.ok(sevenUnevenTranches.contributions > 24 * 233);
  assert.equal(new Set(sevenUnevenTranches.lots.map((lot) => lot.trancheIndex)).size, 7);
});

test("Vorabpauschale is recognized in the following tax year", () => {
  const household = {
    applicant: { birthdate: new Date(1990, 0, 1), monthlyContribution: 0, retirementAge: 67 },
    spouse: null,
  };
  const monthlyPath = Array.from({ length: 24 }, (_, index) => ({
    basisRate: index < 12 ? 0.032 : 0,
    inflationRatio: 1,
    key: `${2026 + Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`,
    marketReturn: index < 12 ? 0.01 : 0,
  }));
  const common = {
    adjustInflowsForInflation: false,
    household,
    now: new Date(2026, 0, 1),
    config: {
      monthlyContribution: 20_000,
      startYear: 2026,
      endYear: 2026,
      trancheCount: 1,
    },
  };

  const throughDecember = projectOrdinaryEtfPath({
    ...common,
    monthlyPath: monthlyPath.slice(0, 12),
    retirementDate: new Date(2027, 0, 1),
  });
  const throughJanuary = projectOrdinaryEtfPath({
    ...common,
    monthlyPath: monthlyPath.slice(0, 13),
    retirementDate: new Date(2027, 1, 1),
  });
  const throughFollowingDecember = projectOrdinaryEtfPath({
    ...common,
    monthlyPath,
    retirementDate: new Date(2028, 0, 1),
  });

  assert.ok(throughDecember.pendingAdvanceAssessment > 0);
  assert.equal(throughDecember.totalTaxPaid, 0);
  assert.equal(throughJanuary.pendingAdvanceAssessment, 0);
  assert.ok(throughJanuary.totalTaxPaid > 0);
  assert.equal(throughJanuary.totalTaxPaid, throughFollowingDecember.totalTaxPaid);
  assert.equal(throughJanuary.advanceTaxPaid, throughFollowingDecember.advanceTaxPaid);
});

test("ETF losses carry forward and the saver allowance reduces tax", () => {
  const lossYear = calculateEtfTaxYear({
    grossCapitalIncome: -1_000,
    grossNonWithdrawalIncome: 0,
    lossCarryforward: 0,
    saverAllowance: 0,
  });
  const laterGain = calculateEtfTaxYear({
    grossCapitalIncome: 1_500,
    grossNonWithdrawalIncome: 0,
    lossCarryforward: lossYear.remainingLossCarryforward,
    saverAllowance: 0,
  });
  const laterGainWithoutLoss = calculateEtfTaxYear({
    grossCapitalIncome: 1_500,
    grossNonWithdrawalIncome: 0,
    lossCarryforward: 0,
    saverAllowance: 0,
  });
  const withAllowance = calculateEtfTaxYear({
    grossCapitalIncome: 2_000,
    grossNonWithdrawalIncome: 2_000,
    lossCarryforward: 0,
    saverAllowance: 1_000,
  });
  const allowanceUsedElsewhere = calculateEtfTaxYear({
    grossCapitalIncome: 2_000,
    grossNonWithdrawalIncome: 2_000,
    lossCarryforward: 0,
    saverAllowance: 0,
  });

  assert.equal(lossYear.remainingLossCarryforward, 700);
  assert.ok(laterGain.totalTax < laterGainWithoutLoss.totalTax);
  assert.ok(allowanceUsedElsewhere.totalTax > withAllowance.totalTax);
});

test("historical ETF prelude makes a past Sparbeginn affect the retirement portfolio", () => {
  const history = Array.from({ length: 24 }, (_, index) => ({
    basisRate: 0,
    inflationRatio: 1,
    key: `${2020 + Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`,
    marketReturn: 0,
  }));
  const future = Array.from({ length: 12 }, (_, index) => ({
    basisRate: 0,
    inflationRatio: 1,
    key: `future-${index}`,
    marketReturn: 0,
  }));
  const now = new Date(2022, 0, 1);
  const household = {
    applicant: {
      birthdate: new Date(1990, 0, 1),
      monthlyContribution: 50,
      retirementAge: 67,
    },
    spouse: null,
  };
  const prelude2020 = buildEtfHistoricalPrelude(history, 2020, now);
  const prelude2021 = buildEtfHistoricalPrelude(history, 2021, now);
  const common = {
    adjustInflowsForInflation: false,
    household,
    decisionStartDate: now,
    retirementDate: new Date(2023, 0, 1),
    config: { monthlyContribution: 100, endYear: 2022, trancheCount: 1 },
  };
  const from2020 = projectOrdinaryEtfPath({
    ...common,
    config: { ...common.config, startYear: 2020 },
    monthlyPath: [...prelude2020, ...future],
    now: new Date(2020, 0, 1),
  });
  const from2021 = projectOrdinaryEtfPath({
    ...common,
    config: { ...common.config, startYear: 2021 },
    monthlyPath: [...prelude2021, ...future],
    now: new Date(2021, 0, 1),
  });
  const noAvdFrom2020 = projectOrdinaryEtfPath({
    ...common,
    config: { ...common.config, startYear: 2020 },
    includeDecisionContribution: true,
    monthlyPath: [...prelude2020, ...future],
    now: new Date(2020, 0, 1),
  });

  assert.equal(prelude2020.length, 24);
  assert.equal(prelude2021.length, 12);
  assert.equal(from2020.contributions, 36 * 100);
  assert.equal(from2021.contributions, 24 * 100);
  assert.ok(from2020.value > from2021.value);
  assert.equal(noAvdFrom2020.contributions - from2020.contributions, 12 * 50);
});

test("FIRE withdrawals empty the ETF, report shortfalls, and net X against withdrawals", () => {
  const household = {
    applicant: {
      birthdate: new Date(1990, 0, 1),
      monthlyContribution: 100,
      retirementAge: 67,
    },
    spouse: null,
  };
  const monthlyPath = Array.from({ length: 24 }, (_, index) => ({
    basisRate: 0,
    inflationRatio: 1,
    key: `${2026 + Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`,
    marketReturn: 0,
  }));
  const common = {
    adjustInflowsForInflation: false,
    household,
    monthlyPath,
    now: new Date(2026, 0, 1),
    retirementDate: new Date(2028, 0, 1),
    config: {
      monthlyContribution: 100,
      startYear: 2026,
      endYear: 2026,
      postSavingsMonthlyFlow: -10_000,
      trancheCount: 2,
    },
  };
  const baseline = projectOrdinaryEtfPath(common);
  const withDecisionContribution = projectOrdinaryEtfPath({
    ...common,
    includeDecisionContribution: true,
  });

  assert.equal(baseline.value, 0);
  assert.equal(baseline.remainingCostBasis, 0);
  assert.ok(baseline.preRetirementWithdrawalShortfall > 0);
  assert.equal(withDecisionContribution.value, 0);
  assert.equal(withDecisionContribution.remainingCostBasis, 0);
  assert.ok(withDecisionContribution.preRetirementWithdrawals > baseline.preRetirementWithdrawals);
  assert.ok(withDecisionContribution.preRetirementWithdrawalShortfall < baseline.preRetirementWithdrawalShortfall);
  assert.equal(
    baseline.preRetirementWithdrawals + baseline.preRetirementWithdrawalShortfall,
    12 * 10_000,
  );
  assert.equal(
    withDecisionContribution.preRetirementWithdrawals + withDecisionContribution.preRetirementWithdrawalShortfall,
    12 * (10_000 - 100),
  );
  assert.equal(withDecisionContribution.contributions, 12 * (100 + 100));
});

test("netting X against FIRE withdrawals avoids fictitious lots and reduces realized-gain tax", () => {
  const household = {
    applicant: {
      birthdate: new Date(1990, 0, 1),
      monthlyContribution: 2_000,
      retirementAge: 67,
    },
    spouse: null,
  };
  const monthlyPath = Array.from({ length: 24 }, (_, index) => ({
    basisRate: 0,
    inflationRatio: 1,
    key: `${2026 + Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`,
    marketReturn: index < 12 ? 0.02 : 0,
  }));
  const common = {
    adjustInflowsForInflation: false,
    household,
    monthlyPath,
    now: new Date(2026, 0, 1),
    retirementDate: new Date(2028, 0, 1),
    config: {
      monthlyContribution: 10_000,
      startYear: 2026,
      endYear: 2026,
      postSavingsMonthlyFlow: -10_000,
      trancheCount: 4,
    },
  };
  const baseline = projectOrdinaryEtfPath(common);
  const noAvd = projectOrdinaryEtfPath({ ...common, includeDecisionContribution: true });

  assert.equal(baseline.contributions, 120_000);
  assert.equal(noAvd.contributions, 144_000);
  assert.equal(baseline.preRetirementWithdrawals, 120_000);
  assert.equal(noAvd.preRetirementWithdrawals, 96_000);
  assert.ok(baseline.preRetirementWithdrawalTax > 0);
  assert.ok(noAvd.preRetirementWithdrawalTax < baseline.preRetirementWithdrawalTax);
});

test("Basiszins data spans all market years and retains the official 2026 value", async () => {
  const csv = await readFile(new URL("./basiszins.csv", import.meta.url), "utf8");
  const rates = parseBasisRateCsv(csv);
  assert.equal(rates.size, 127);
  assert.equal(rates.get(2026), 0.032);
  assert.ok(rates.get(1900) > 0);
});

test("2026 tax comparison applies the favorable tax assessment to ETF gains", () => {
  assert.equal(incomeTax2026(12_348), 0);
  assert.ok(incomeTax2026(12_400) > 0);
  assert.equal(statutoryPensionTaxableShare(2026), 0.84);
  assert.equal(statutoryPensionTaxableShare(2058), 1);

  const lowIncome = compareNetWithdrawals({
    grossWithdrawal: 12_000,
    retirementValue: 300_000,
    pensionAnnual: 0,
    parallelEtfAnnual: 0,
    etfGainShare: 0.5,
    retirementYear: 2026,
  });
  assert.equal(lowIncome.avdTax, 0);
  assert.equal(lowIncome.avdNetRate, 0.04);
  assert.equal(lowIncome.etfTax, 0);
  assert.equal(lowIncome.etfTaxMethod, "tariff");
  assert.equal(lowIncome.avdNet, lowIncome.etfNet);
  assert.equal(lowIncome.avdTotalNetIncome, 12_000);
  assert.equal(lowIncome.etfTotalNetIncome, 12_000);

  const pensionIncome = compareNetWithdrawals({
    grossWithdrawal: 12_000,
    retirementValue: 300_000,
    pensionAnnual: 36_000,
    parallelEtfAnnual: 0,
    etfGainShare: 0.5,
    retirementYear: 2026,
  });
  assert.ok(pensionIncome.avdTax > lowIncome.avdTax);
  assert.ok(pensionIncome.etfNet > pensionIncome.avdNet);

  const highIncome = compareNetWithdrawals({
    grossWithdrawal: 12_000,
    retirementValue: 300_000,
    pensionAnnual: 120_000,
    parallelEtfAnnual: 0,
    etfGainShare: 0.5,
    retirementYear: 2026,
  });
  assert.equal(highIncome.etfTaxMethod, "flat");
  assert.ok(highIncome.etfTax > 0);

  const usedAllowance = compareNetWithdrawals({
    grossWithdrawal: 12_000,
    retirementValue: 300_000,
    pensionAnnual: 120_000,
    parallelEtfAnnual: 12_000,
    etfGainShare: 0.5,
    retirementYear: 2026,
  });
  assert.ok(usedAllowance.etfTax > highIncome.etfTax);

  const combinedIncome = compareNetWithdrawals({
    grossWithdrawal: 12_000,
    retirementValue: 300_000,
    pensionAnnual: 24_000,
    parallelEtfAnnual: 6_000,
    etfGainShare: 0.5,
    retirementYear: 2026,
  });
  assert.equal(combinedIncome.totalGrossIncome, 42_000);
  assert.ok(combinedIncome.avdTotalNetIncome < combinedIncome.totalGrossIncome);
  assert.ok(combinedIncome.etfTotalNetIncome < combinedIncome.totalGrossIncome);
  assert.ok(
    Math.abs(
      combinedIncome.pensionNetIncome +
        combinedIncome.parallelEtfNetIncome +
        combinedIncome.avdNet -
        combinedIncome.avdTotalNetIncome,
    ) < 1e-9,
  );
  assert.ok(
    Math.abs(
      combinedIncome.pensionNetIncome +
        combinedIncome.parallelEtfNetIncome +
        combinedIncome.etfNet -
        combinedIncome.etfTotalNetIncome,
    ) < 1e-9,
  );
  assert.ok(
    Math.abs(
      (combinedIncome.avdTotalNetIncome - combinedIncome.etfTotalNetIncome) -
        (combinedIncome.avdNet - combinedIncome.etfNet),
    ) < 1e-9,
  );
  assert.ok(Math.abs(
    combinedIncome.avdTotalGrossIncome - combinedIncome.avdTotalTax -
      combinedIncome.kvdrTotalContributions - combinedIncome.avdTotalNetIncome,
  ) < 1e-9);
  assert.ok(Math.abs(
    combinedIncome.etfTotalGrossIncome - combinedIncome.etfTotalTax -
      combinedIncome.kvdrTotalContributions - combinedIncome.etfTotalNetIncome,
  ) < 1e-9);
});

test("KVdR universally charges statutory pension and deducts the same contributions", () => {
  const contributions = calculateKvdrContributions({
    pensionAnnual: 24_000,
    careInsuranceRate: 0.036,
  });

  assert.equal(contributions.assumedKvdr, true);
  assert.equal(contributions.contributionBase, 24_000);
  assert.equal(contributions.healthInsurance, 2_100);
  assert.ok(Math.abs(contributions.careInsurance - 864) < 1e-9);
  assert.ok(Math.abs(contributions.total - 2_964) < 1e-9);
  assert.equal(contributions.deductible, contributions.total);
  assert.equal(contributions.healthInsuranceRate, 0.0875);

  const capped = calculateKvdrContributions({
    pensionAnnual: 100_000,
    careInsuranceRate: 0.042,
  });
  assert.equal(capped.contributionBase, 69_750);

  assert.equal(kvdrCareInsuranceRateForHousehold([], new Date(2050, 0, 1)), 0.042);
  assert.ok(Math.abs(kvdrCareInsuranceRateForHousehold(
    [new Date(2030, 0, 1), new Date(2032, 0, 1), new Date(2034, 0, 1)],
    new Date(2050, 0, 1),
  ) - 0.031) < 1e-12);

  const lowAvd = compareNetWithdrawals({
    grossWithdrawal: 6_000,
    pensionAnnual: 24_000,
    kvdrCareInsuranceRate: 0.042,
  });
  const highAvd = compareNetWithdrawals({
    grossWithdrawal: 60_000,
    pensionAnnual: 24_000,
    kvdrCareInsuranceRate: 0.042,
  });
  assert.equal(lowAvd.assumedKvdr, true);
  assert.equal(lowAvd.kvdrTotalContributions, highAvd.kvdrTotalContributions);
  assert.equal(lowAvd.pensionTaxable, Math.max(
    lowAvd.pensionTaxableBeforeKvdr - lowAvd.kvdrDeductibleContributions,
    0,
  ));
});

test("income waterfall adds gross streams and subtracts tax on one shared scale", () => {
  const geometry = incomeWaterfallGeometry({
    pension: 18_000,
    baselineEtf: 12_000,
    decision: 6_000,
    netTotal: 31_500,
  }, 48_000);

  assert.equal(geometry.gross, 36_000);
  assert.equal(geometry.tax, 4_500);
  assert.equal(geometry.net, 31_500);
  assert.deepEqual(
    geometry.steps.map(({ start, end, value }) => ({ start, end, value })),
    [
      { start: 0, end: 18_000, value: 18_000 },
      { start: 18_000, end: 30_000, value: 12_000 },
      { start: 30_000, end: 36_000, value: 6_000 },
      { start: 36_000, end: 31_500, value: -4_500 },
      { start: 0, end: 31_500, value: 31_500 },
    ],
  );
  assert.equal(geometry.steps[0].heightPercent, 37.5);
  assert.equal(geometry.steps[3].bottomPercent, 65.625);
  assert.equal(geometry.steps[4].heightPercent, 65.625);
  assert.equal(waterfallConnectorPercent(geometry.steps[0], geometry.steps[1], geometry.scale), 37.5);
  assert.equal(waterfallConnectorPercent(geometry.steps[3], geometry.steps[4], geometry.scale), 65.625);
  assert.equal(waterfallConnectorPercent(geometry.steps[4], geometry.steps[3], geometry.scale), 65.625);
  assert.equal(waterfallConnectorPercent(geometry.steps[3], geometry.steps[2], geometry.scale), 75);
});

test("the displayed AVD advantage is the difference between the displayed total-net scenarios", () => {
  const comparison = {
    avdAdvantage: 221 * 12,
    avdTotalNetIncome: 7_052 * 12,
    etfTotalNetIncome: 7_058 * 12,
  };

  assert.equal(comparisonAdvantageFromTotals(comparison), -6 * 12);
});

test("waterfall comparison averages every component across paired runs", () => {
  const representative = averageComparison([
    { avdTotalNetIncome: 50, etfTotalNetIncome: 150, grossWithdrawal: 10 },
    { avdTotalNetIncome: 110, etfTotalNetIncome: 100, grossWithdrawal: 20 },
    { avdTotalNetIncome: 230, etfTotalNetIncome: 200, grossWithdrawal: 40 },
    { avdTotalNetIncome: 300, etfTotalNetIncome: 200, grossWithdrawal: 80 },
  ]);

  assert.equal(representative.avdTotalNetIncome, 172.5);
  assert.equal(representative.etfTotalNetIncome, 162.5);
  assert.equal(representative.avdAdvantage, 10);
  assert.equal(representative.grossWithdrawal, 37.5);
});

test("paired AVD advantages produce a symmetric histogram and decision statistics", () => {
  const distribution = buildAdvantageDistribution([
    { avdTotalNetIncome: 110, etfTotalNetIncome: 100 },
    { avdTotalNetIncome: 90, etfTotalNetIncome: 100 },
    { avdTotalNetIncome: 120, etfTotalNetIncome: 100 },
    { avdTotalNetIncome: 80, etfTotalNetIncome: 100 },
    { avdTotalNetIncome: 100, etfTotalNetIncome: 100 },
  ]);

  assert.equal(distribution.pathCount, 5);
  assert.equal(distribution.avdWinCount, 2);
  assert.equal(distribution.etfWinCount, 2);
  assert.equal(distribution.tieCount, 1);
  assert.equal(distribution.avdWinRate, 0.4);
  assert.equal(distribution.median, 0);
  assert.equal(distribution.bins.length, 6);
  assert.equal(distribution.bins.reduce((sum, bin) => sum + bin.count, 0), 5);
  assert.ok(distribution.logCertaintyEquivalentAdvantage < 0);
});

test("advantage histogram uses a robust range and keeps outliers in tail bins", () => {
  const comparisons = Array.from({ length: 49 }, (_, index) => ({
    avdTotalNetIncome: (4_000 + index - 24) * 12,
    etfTotalNetIncome: 4_000 * 12,
  }));
  comparisons.push({
    avdTotalNetIncome: 6_000 * 12,
    etfTotalNetIncome: 4_000 * 12,
  });

  const distribution = buildAdvantageDistribution(comparisons);

  assert.equal(distribution.bins.length, 8);
  assert.ok(distribution.bound < 2_000);
  assert.equal(distribution.bins.at(-1).count, 1);
  assert.equal(distribution.bins.reduce((sum, bin) => sum + bin.count, 0), 50);
});

test("AVD win rates are split by below- and above-median real stock returns", () => {
  const distribution = buildAdvantageDistribution([
    { avdTotalNetIncome: 4_100 * 12, etfTotalNetIncome: 4_000 * 12, pathRealAnnualReturn: 0.01 },
    { avdTotalNetIncome: 4_050 * 12, etfTotalNetIncome: 4_000 * 12, pathRealAnnualReturn: 0.03 },
    { avdTotalNetIncome: 3_950 * 12, etfTotalNetIncome: 4_000 * 12, pathRealAnnualReturn: 0.07 },
    { avdTotalNetIncome: 3_900 * 12, etfTotalNetIncome: 4_000 * 12, pathRealAnnualReturn: 0.09 },
  ]);

  assert.equal(distribution.returnRegimes.medianRealAnnualReturn, 0.05);
  assert.equal(distribution.returnRegimes.belowMedian.pathCount, 2);
  assert.equal(distribution.returnRegimes.belowMedian.avdWinRate, 1);
  assert.equal(distribution.returnRegimes.aboveMedian.pathCount, 2);
  assert.equal(distribution.returnRegimes.aboveMedian.avdWinRate, 0);
});

test("return assumption is omitted from localized status messages", () => {
  const dataset = {
    market: {
      bootstrapSeries: buildBootstrapSeries(),
    },
  };
  assert.doesNotMatch(buildDataStatusText(dataset, true, false, 0.03), /Renditeannahme/);
  setLanguage("en");
  assert.doesNotMatch(buildDataStatusText(dataset, true, false, 0.1), /return assumption/);
  setLanguage("de");
});

test("return control exposes constraints, presets, localization, and mobile styling", async () => {
  const [html, css] = await Promise.all([
    readFile(new URL("./index.html", import.meta.url), "utf8"),
    readFile(new URL("./styles.css", import.meta.url), "utf8"),
  ]);

  assert.match(html, /id="expected-real-return"/);
  assert.match(html, />Projektion \| Historische Daten<\/h2>/);
  assert.doesNotMatch(html, /id="data-status"/);
  assert.match(html, /min="-100"/);
  assert.match(html, /max="100"/);
  assert.match(html, /step="0\.1"/);
  assert.match(html, /data-return-preset="0\.03"/);
  assert.match(html, /data-return-preset="historical"/);
  assert.match(html, /data-return-preset="0\.1"/);
  assert.match(html, /data-i18n-aria-label="aria\.expectedRealReturnInput"/);
  assert.match(css, /@media \(max-width: 720px\)[\s\S]*\.return-preset-row/);
});

test("child-benefit duration control exposes its range and localized accessibility contract", async () => {
  const [html, css, source] = await Promise.all([
    readFile(new URL("./index.html", import.meta.url), "utf8"),
    readFile(new URL("./styles.css", import.meta.url), "utf8"),
    readFile(new URL("./app.js", import.meta.url), "utf8"),
  ]);

  assert.match(html, /id="child-benefit-duration"/);
  assert.match(html, /name="childBenefitDuration"/);
  assert.match(html, /min="16"/);
  assert.match(html, /max="25"/);
  assert.match(html, /value="18"/);
  assert.match(html, /data-i18n-aria-label="aria\.childBenefitDurationInput"/);
  assert.match(css, /\.child-benefit-duration-row/);
  assert.match(source, /childBenefitDuration: "Child-benefit duration"/);
  assert.match(source, /Bitte eine Dauer zwischen 16 und 25 Jahren eingeben/);
});

test("withdrawal diagnostics and model qualifications are exposed accessibly", async () => {
  const [html, css, source, assumptions] = await Promise.all([
    readFile(new URL("./index.html", import.meta.url), "utf8"),
    readFile(new URL("./styles.css", import.meta.url), "utf8"),
    readFile(new URL("./app.js", import.meta.url), "utf8"),
    readFile(new URL("./Annahmen.md", import.meta.url), "utf8"),
  ]);

  assert.match(html, /id="withdrawal-rule-tooltip"/);
  assert.match(html, /aria-describedby="withdrawal-rule-tooltip"/);
  assert.match(html, /role="tooltip"/);
  assert.match(html, /id="withdrawal-rate"/);
  assert.match(html, /for="withdrawal-rate"/);
  assert.equal(
    (html.match(/<option value="0\.(?:03|0325|035|0375|04|0425|045|0475|05)"/g) ?? [])
      .length,
    9,
  );
  assert.match(html, /option value="0\.0375">3,75 %/);
  assert.match(html, /option value="0\.04" selected/);
  assert.doesNotMatch(html, /id="withdrawal-success"/);
  assert.match(html, /id="withdrawal-rate-help"/);
  assert.match(html, /id="withdrawal-rate-status"/);
  assert.match(html, /id="comparison-bars"/);
  assert.match(html, /aria-labelledby="income-chart-title"/);
  assert.match(html, /aria-describedby="withdrawal-rate-help"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(css, /\.withdrawal-info-tooltip[\s\S]*white-space: pre-line/);
  assert.match(css, /\.withdrawal-rate-picker #withdrawal-rate[\s\S]*?width: 100%/);
  assert.match(css, /\.withdrawal-rate-caption[\s\S]*?text-transform: uppercase/);
  assert.match(css, /@media \(max-width: 420px\)[\s\S]*?\.summary-grid[\s\S]*?grid-template-columns: 1fr/);
  assert.match(css, /\.summary-grid\s*\{[\s\S]*?position: relative;[\s\S]*?z-index: 2;/);
  assert.match(css, /\.vertical-waterfall\s*\{[\s\S]*?grid-template-columns:/);
  assert.match(css, /\.waterfall-step\s*\{[\s\S]*?grid-template-rows:/);
  assert.match(css, /\.tax-step \.waterfall-bar\s*\{[\s\S]*?repeating-linear-gradient/);
  assert.match(css, /\.waterfall-connector\s*\{[\s\S]*?border-top:/);
  assert.match(css, /\.advantage-histogram-ticks\s*\{[\s\S]*?font-variant-numeric:/);
  assert.match(css, /repeat\(var\(--histogram-bin-count, 16\), minmax\(0, 1fr\)\)/);
  assert.match(css, /\.advantage-histogram-bin::after\s*\{[\s\S]*?data-histogram-tooltip/);
  assert.match(source, /data-histogram-tooltip="\$\{title\}" aria-label="\$\{title\}"/);
  assert.match(css, /\.income-bars\s*\{[\s\S]*?grid-template-columns: repeat\(2/);
  assert.match(source, /scenario\.mirrored \? \[4, 3, 2, 1, 0\] : \[0, 1, 2, 3, 4\]/);
  assert.match(css, /\.chart-panel\s*\{[\s\S]*?position: relative;[\s\S]*?z-index: 1;/);
  assert.match(css, /\.summary-card:hover,[\s\S]*?\.summary-card:focus-within\s*\{[\s\S]*?z-index: 1;/);
  assert.match(source, /Avg\. extra income incl\. Riester \(gross\)/);
  assert.match(source, /withdrawalRateStatus/);
  assert.match(source, /withdrawalRateCandidates: WITHDRAWAL_RATE_OPTIONS/);
  assert.match(source, /withdrawalRate: Number\(elements\.withdrawalRate\.value\)/);
  assert.match(source, /formatWithdrawalRate\(rate\)} \(\${formatSuccessPercent\(stats\.successRate\)}\)/);
  assert.match(source, /same arithmetic average consolidated AVD gross withdrawal used in the net comparison/);
  assert.match(source, /first household income shortfall/);
  assert.match(assumptions, /gesamte modellierte Steuererstattung[\s\S]*wieder/);
  assert.match(assumptions, /zentrale Projektion ist der Median/);
  assert.match(assumptions, /1900 bis 1969[\s\S]*synthetisch/);
});

test("active market and inflation data cover the full January 1900 to June 2026 window", async () => {
  const [marketCsv, inflationCsv, source] = await Promise.all([
    readFile(new URL("./jst_kz_global_equity_monthly.csv", import.meta.url), "utf8"),
    readFile(new URL("./inflation.csv", import.meta.url), "utf8"),
    readFile(new URL("./app.js", import.meta.url), "utf8"),
  ]);
  assert.match(source, /const MARKET_DATA_PATH = "\.\/jst_kz_global_equity_monthly\.csv"/);
  assert.match(source, /samplingMode: SAMPLING_MODE_HISTORICAL_PATHS/);
  const marketMonths = marketCsv
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [monthYear, rawValue] = line.split(",");
      const [month, year] = monthYear.split("/");
      return { key: `${year}-${month}`, value: Number(rawValue) };
    });
  const inflationMonths = inflationCsv
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [date, rawValue] = line.split(",");
      return { key: date.slice(0, 7), value: Number(rawValue) };
    });

  const assertMonthlyContinuity = (rows) => {
    for (let index = 1; index < rows.length; index += 1) {
      const previous = new Date(`${rows[index - 1].key}-01T00:00:00Z`);
      previous.setUTCMonth(previous.getUTCMonth() + 1);
      assert.equal(rows[index].key, previous.toISOString().slice(0, 7));
      assert.ok(Number.isFinite(rows[index].value) && rows[index].value > 0);
    }
  };
  assertMonthlyContinuity(marketMonths);
  assertMonthlyContinuity(inflationMonths);

  const inflationKeys = new Set(inflationMonths.slice(1).map((row) => row.key));
  const overlap = marketMonths.slice(1).filter((row) => inflationKeys.has(row.key));
  assert.equal(overlap[0].key, "1900-01");
  assert.equal(overlap.at(-1).key, "2026-06");
  assert.equal(overlap.length, 1518);

  const defaultHistoricalPaths = buildHistoricalPaths(overlap, 54 * 12, {
    startMonth: 7,
  });
  assert.equal(defaultHistoricalPaths.length, 73);
  assert.equal(defaultHistoricalPaths[0].startKey, "1900-07");
  assert.equal(defaultHistoricalPaths.at(-1).endKey, "2026-06");
});
