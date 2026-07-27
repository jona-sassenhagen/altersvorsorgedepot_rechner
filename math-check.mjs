import assert from "node:assert/strict";

import { projectPath, retirementSummaryValues } from "./app.js";

function approximatelyEqual(actual, expected, epsilon = 1e-9) {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `expected ${actual} to be within ${epsilon} of ${expected}`,
  );
}

function buildBootstrap(months, marketReturn = 0, inflationRatio = 1) {
  return Array.from({ length: months }, () => ({ marketReturn, inflationRatio }));
}

function buildHousehold(overrides = {}) {
  const now = new Date(2026, 0, 1);
  return {
    now,
    household: {
      applicant: {
        birthdate: new Date(1996, 0, 1),
        monthlyContribution: 100,
        initialBalance: 0,
        retirementAge: 67,
        incomeRate: 0,
      },
      spouse: null,
      children: [],
      annualFeeRate: 0,
      ...overrides,
    },
  };
}

{
  const { household, now } = buildHousehold();
  const path = projectPath(household, buildBootstrap(24), now, 2);

  approximatelyEqual(path.householdContributionNominal[1], 1200);
  approximatelyEqual(path.householdContributionNominal[2], 2400);
  approximatelyEqual(path.householdNominal[1], 1590);
  approximatelyEqual(path.householdNominal[2], 3180);
}

{
  const { household, now } = buildHousehold({
    applicant: {
      birthdate: new Date(1959, 0, 1),
      monthlyContribution: 0,
      initialBalance: 1200,
      retirementAge: 67,
      incomeRate: 0,
    },
  });
  const path = projectPath(household, buildBootstrap(12), now, 1);

  approximatelyEqual(path.householdWithdrawalReal[1], 4);
  approximatelyEqual(path.householdNominal[1], 1152);
}

{
  const summary = retirementSummaryValues(
    {
      preRetirementYear: 1,
      averageAnnualSupport: 0,
      yearlyStats: [
        {
          nominal: {
            household: { median: 0, p2_5: 0, p97_5: 0 },
            withdrawals: { median: 0 },
          },
          real: {
            household: { median: 0, p2_5: 0, p97_5: 0 },
            withdrawals: { median: 0 },
          },
        },
        {
          nominal: {
            household: { median: 90000, p2_5: 80000, p97_5: 100000 },
            withdrawals: { median: 500 },
          },
          real: {
            household: { median: 90000, p2_5: 80000, p97_5: 100000 },
            withdrawals: { median: 500 },
          },
        },
      ],
    },
    false,
  );

  assert.equal(summary.withdrawalIncome, 500);
  assert.notEqual(summary.withdrawalIncome, (90000 * 0.04) / 12);
}

console.log("math-check: ok");
