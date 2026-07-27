import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  annualSupportForYear,
  baseSubsidy,
  buildDataStatusText,
  buildWithdrawalTooltipText,
  calculateBootstrapSamplingRealCagr,
  calculateHistoricalRealCagr,
  chartLoadingPatternText,
  makeBootstrapPath,
  migrateSession,
  parseChildBirthYearInput,
  projectPath,
  recenterBootstrapSeries,
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

  setLanguage("de");
  assert.match(buildWithdrawalTooltipText(higher, true), /5 % des Depotwerts/);
  setLanguage("en");
  assert.match(buildWithdrawalTooltipText(higher, true), /5 % of the portfolio value/);
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

test("session v5 round-trips withdrawal rate and older sessions migrate to 4 percent", () => {
  const v5 = migrateSession({
    version: 5,
    controls: {
      expectedRealReturnMode: "custom",
      customExpectedRealReturn: 0.1,
      childBenefitDurationYears: 25,
      withdrawalRate: 0.045,
    },
  });
  assert.equal(v5.version, 5);
  assert.equal(v5.controls.expectedRealReturnMode, "custom");
  assert.equal(v5.controls.customExpectedRealReturn, 0.1);
  assert.equal(v5.controls.childBenefitDurationYears, 25);
  assert.equal(v5.controls.withdrawalRate, 0.045);

  const v4 = migrateSession({
    version: 4,
    controls: {
      expectedRealReturnMode: "custom",
      customExpectedRealReturn: 0.1,
      childBenefitDurationYears: 25,
    },
  });
  assert.equal(v4.version, 5);
  assert.equal(v4.controls.childBenefitDurationYears, 25);
  assert.equal(v4.controls.withdrawalRate, 0.04);

  const v3 = migrateSession({
    version: 3,
    controls: { expectedRealReturnMode: "custom", customExpectedRealReturn: 0.1 },
  });
  assert.equal(v3.version, 5);
  assert.equal(v3.controls.expectedRealReturnMode, "custom");
  assert.equal(v3.controls.customExpectedRealReturn, 0.1);
  assert.equal(v3.controls.childBenefitDurationYears, 18);
  assert.equal(v3.controls.withdrawalRate, 0.04);

  for (const version of [1, 2]) {
    const migrated = migrateSession({ version, controls: { projectedFee: "0.2" } });
    assert.equal(migrated.version, 5);
    assert.equal(migrated.controls.expectedRealReturnMode, "historical");
    assert.equal(migrated.controls.customExpectedRealReturn, 0.03);
    assert.equal(migrated.controls.childBenefitDurationYears, 18);
    assert.equal(migrated.controls.withdrawalRate, 0.04);
  }
});

test("return assumption appears in both localized status messages", () => {
  const dataset = {
    market: {
      bootstrapSeries: buildBootstrapSeries(),
    },
  };
  assert.match(buildDataStatusText(dataset, true, false, 0.03), /Reale Renditeannahme: \+3,0 % p\.a\./);
  setLanguage("en");
  assert.match(buildDataStatusText(dataset, true, false, 0.1), /Real return assumption: \+10\.0 % p\.a\./);
  setLanguage("de");
});

test("return control exposes constraints, presets, localization, and mobile styling", async () => {
  const [html, css] = await Promise.all([
    readFile(new URL("./index.html", import.meta.url), "utf8"),
    readFile(new URL("./styles.css", import.meta.url), "utf8"),
  ]);

  assert.match(html, /id="expected-real-return"/);
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
  assert.match(html, /aria-describedby="withdrawal-rate-help"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(css, /\.withdrawal-info-tooltip[\s\S]*white-space: pre-line/);
  assert.match(css, /\.withdrawal-rate-picker #withdrawal-rate[\s\S]*?width: min\(148px, 100%\)/);
  assert.match(css, /@media \(max-width: 420px\)[\s\S]*?\.summary-grid[\s\S]*?grid-template-columns: 1fr/);
  assert.match(css, /\.summary-grid\s*\{[\s\S]*?position: relative;[\s\S]*?z-index: 2;/);
  assert.match(css, /\.chart-panel\s*\{[\s\S]*?position: relative;[\s\S]*?z-index: 1;/);
  assert.match(css, /\.summary-card:hover,[\s\S]*?\.summary-card:focus-within\s*\{[\s\S]*?z-index: 1;/);
  assert.match(source, /Avg\. extra income \(gross\)/);
  assert.match(source, /withdrawalRateStatus/);
  assert.match(source, /withdrawalRateCandidates: WITHDRAWAL_RATE_OPTIONS/);
  assert.match(source, /withdrawalRate: Number\(elements\.withdrawalRate\.value\)/);
  assert.match(source, /displayed value is the median modeled extra income/);
  assert.match(source, /first household income shortfall/);
  assert.match(assumptions, /gesamte modellierte Steuererstattung[\s\S]*wieder/);
  assert.match(assumptions, /zentrale Projektion ist der Median/);
  assert.match(assumptions, /Werte vor 1986 sind rückgerechnete Backtest-Daten/);
});

test("bundled market and inflation data cover the full January 1970 to June 2026 window", async () => {
  const [marketCsv, inflationCsv] = await Promise.all([
    readFile(new URL("./msci_world.csv", import.meta.url), "utf8"),
    readFile(new URL("./inflation.csv", import.meta.url), "utf8"),
  ]);
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
  assert.equal(overlap[0].key, "1970-01");
  assert.equal(overlap.at(-1).key, "2026-06");
  assert.equal(overlap.length, 678);
});
