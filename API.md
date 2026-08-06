# Local simulation API

The API is local-only. The GitHub Pages deployment remains a static calculator and does not expose these endpoints.

The machine-readable contract is available in [`openapi.yaml`](./openapi.yaml). It can be imported into tools such as Bruno, Insomnia, Postman, or an OpenAPI client generator. The specification's server URL points to the default local address.

## Start

Requires Node.js 20 or newer and has no external dependencies.

```sh
npm run api
```

The server listens on `http://127.0.0.1:8001` by default. Set `API_PORT` or `API_HOST` to override either value.

```sh
API_PORT=9000 npm run api
```

The market, inflation, and Basiszins CSV files are loaded once and cached for the lifetime of the process.

## Endpoints

- `GET /api/v1/health` — data availability and coverage.
- `POST /api/v1/simulate` — aggregate projection timelines, withdrawal statistics, and ETF summaries.
- `POST /api/v1/compare` — compact AVD-versus-ETF tax and net-income comparison.

Raw historical paths and individual ETF lots are deliberately omitted from responses. This keeps the JSON response compact and avoids making internal lot structures part of the public API contract.

## Example comparison

```sh
curl -sS http://127.0.0.1:8001/api/v1/compare \
  -H 'content-type: application/json' \
  --data-binary @- <<'JSON'
{
  "household": {
    "applicant": {
      "birthdate": "1990-01-01",
      "retirementAge": 67,
      "monthlyContribution": 150,
      "initialBalance": 0,
      "incomeRate": 0.30
    },
    "spouse": null,
    "children": [],
    "childBenefitDurationYears": 18,
    "annualFeeRate": 0.002,
    "etfComparison": {
      "monthlyContribution": 500,
      "startYear": 2000,
      "endYear": 2045,
      "postSavingsMonthlyFlow": -500,
      "trancheCount": 5
    }
  },
  "options": {
    "asOfDate": "2026-08-04",
    "samplingMode": "historical-paths",
    "maxAge": 90,
    "adjustInflowsForInflation": true,
    "withdrawalRate": 0.04,
    "withdrawalRateCandidates": [0.03, 0.04, 0.05]
  },
  "comparison": {
    "pensionMonthly": 1500,
    "terms": "real"
  }
}
JSON
```

All rates use decimal representation: `0.04` means 4%. `annualFeeRate` is also decimal, so `0.002` means 0.2% per year. Dates must use `YYYY-MM-DD`.

ETF responses expose total pre-retirement tax, the remaining equity-fund loss carryforward, pending next-year Vorabpauschale, and gross/net FIRE withdrawals.

Comparison responses also expose `advantageDistribution`: a symmetric histogram of monthly paired-path total-net differences (`AVD − ETF`), AVD/ETF win rates, ties, the arithmetic mean, paired median, 10th/90th percentiles, and the logarithmic certainty-equivalent advantage. Only aggregated bins and statistics are returned; individual paths remain private implementation details.

`advantageDistribution.returnRegimes` relates the result to capital-market performance. Each paired path is assigned its annualized real equity return from the comparison date through household retirement. The response reports the median return and separate AVD win rates, path counts, and mean monthly advantages for paths strictly below and strictly above that median. Paths exactly equal to the median are counted in `atMedianPathCount` and excluded from both groups.

The top-level comparison amounts are arithmetic averages across all paired historical paths. Each gross stream, tax amount, and net total is averaged separately, so the waterfall identities remain additive. Consequently, `avdTotalNetIncome − etfTotalNetIncome` equals the reported mean paired advantage. The distribution median remains available separately as `advantageDistribution.median`.

Every comparison assumes KVdR, without an opt-out. The 2026 model charges the pensioner's half of the 14.6% general health rate and 2.9% average additional rate, plus the applicable long-term-care rate, on statutory pension income up to the contribution ceiling. AVD, Riester, and ETF withdrawals do not enter the KVdR contribution base. Contributions reduce both spendable net income and taxable ordinary income. The response exposes `assumedKvdr`, `kvdrContributionBase`, `kvdrHealthInsurance`, `kvdrCareInsurance`, `kvdrTotalContributions`, and `kvdrDeductibleContributions`, plus the same values and resolved rates in the nested `kvdr` object. Amounts are annual.

If an existing Riester balance is entered, its modeled withdrawal is consolidated with the additional retirement-income bar and retained as the same deferred-tax income stream in both scenarios. This keeps existing wealth common to the comparison; only the household contribution `X` is directed to the AVD or the ETF. The response exposes the common portion as `commonAvdGrossWithdrawal` and `commonAvdTaxableWithdrawal`.

AVD assets are separated into funded and non-funded tax components. Own contributions up to EUR 1,800 per person and year plus allowances form the fully taxable funded component. Contributions above that cap and the modeled reinvested tax refund retain principal basis; only their attributable earnings are treated as taxable when the app models a securities-depot payout.

`samplingMode` defaults to `historical-paths`, matching the web calculator. Use `block-bootstrap` with `simulationCount` and `seed` for deterministic bootstrap queries. The resolved date, data coverage, sampling mode, and path count are returned in `metadata`.

Invalid input returns status `422` with a stable error object:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "Request validation failed.",
    "details": [
      {
        "path": "/household/etfComparison/endYear",
        "code": "invalid_value",
        "message": "Must be greater than or equal to startYear."
      }
    ]
  }
}
```
