import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  DEFAULT_SEED,
  buildCompleteDonorYears,
  excelSerialToYear,
  extendGermanInflationCsv,
  parseMonthlyIndexCsv,
  reconstructAnnualReturns,
  rescaleMonthlyFactors,
  selectDonorYear,
} from "./data-sources/jst-kz-global-equity/generate.mjs";

function compound(factors) {
  return factors.reduce((product, factor) => product * factor, 1);
}

function parseCsv(text) {
  const [headerLine, ...dataLines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(",");
  return dataLines.map((line) =>
    Object.fromEntries(
      line.split(",").map((value, index) => [headers[index], value]),
    ),
  );
}

function assertClose(actual, expected, tolerance = 1e-12) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}

test("Excel serial years are decoded on both sides of the 1900 leap-year bug", () => {
  assert.equal(excelSerialToYear(-10_956), 1870);
  assert.equal(excelSerialToYear(1), 1900);
  assert.equal(excelSerialToYear(367), 1901);
});

test("annual German CPI is backcast monthly while the observed suffix stays exact", () => {
  const jstRows = [
    { year: 1999, iso: "DEU", cpi: 100 },
    { year: 2000, iso: "DEU", cpi: 121 },
    { year: 2001, iso: "DEU", cpi: 146.41 },
  ];
  const observedCsv = [
    "date,cpi_index_2015_100",
    "2001-01-01,200.0000",
    "2001-02-01,201.2500",
    "",
  ].join("\n");
  const result = extendGermanInflationCsv({
    jstRows,
    observedCsv,
    startYear: 2000,
    observedStartYear: 2001,
  });
  const rows = parseCsv(result.csv);
  const levels = new Map(
    rows.map((row) => [row.date, Number(row.cpi_index_2015_100)]),
  );

  assert.equal(rows[0].date, "1999-12-01");
  assert.equal(rows.at(-2).cpi_index_2015_100, "200.0000");
  assert.equal(rows.at(-1).cpi_index_2015_100, "201.2500");
  assertClose(
    levels.get("2000-12-01") / levels.get("1999-12-01"),
    1.21,
    2e-15,
  );
  assertClose(
    levels.get("2001-01-01") / levels.get("2000-12-01"),
    (146.41 / 121) ** (1 / 12),
    2e-15,
  );
});

test("monthly log shifting compounds to the annual target and preserves shape", () => {
  const donorFactors = [
    1.02, 0.98, 1.03, 1.01, 0.97, 1.04, 1.005, 0.99, 1.015, 1.025, 0.96,
    1.035,
  ];
  const targetReturn = 0.123456789;
  const scaled = rescaleMonthlyFactors(donorFactors, targetReturn);

  assertClose(compound(scaled.factors), 1 + targetReturn, 2e-15);

  const donorLogs = donorFactors.map(Math.log);
  const scaledLogs = scaled.factors.map(Math.log);
  const donorMean = donorLogs.reduce((sum, value) => sum + value, 0) / 12;
  const scaledMean = scaledLogs.reduce((sum, value) => sum + value, 0) / 12;

  for (let index = 0; index < 11; index += 1) {
    assertClose(
      scaledLogs[index] - scaledMean,
      donorLogs[index] - donorMean,
      2e-15,
    );
  }
});

test("only complete observed calendar years become donor paths", () => {
  const lines = ["Date,Index", "12/1969,100"];
  let level = 100;
  for (let month = 1; month <= 12; month += 1) {
    level *= 1.01;
    lines.push(`${String(month).padStart(2, "0")}/1970,${level}`);
  }
  for (let month = 1; month <= 11; month += 1) {
    level *= 1.01;
    lines.push(`${String(month).padStart(2, "0")}/1971,${level}`);
  }

  const donors = buildCompleteDonorYears(
    parseMonthlyIndexCsv(`${lines.join("\n")}\n`),
  );
  assert.deepEqual(
    donors.map((donor) => donor.year),
    [1970],
  );
  assertClose(compound(donors[0].factors), 1.01 ** 12);
});

test("donor selection is deterministic and stable for each target year", () => {
  const donors = Array.from({ length: 56 }, (_, index) => ({
    year: 1970 + index,
    factors: Array(12).fill(1),
  }));
  const first = selectDonorYear(1929, donors, DEFAULT_SEED);
  const second = selectDonorYear(1929, donors, DEFAULT_SEED);
  const afterUnrelatedSelection = selectDonorYear(1929, donors, DEFAULT_SEED);

  assert.equal(first.year, second.year);
  assert.equal(first.year, afterUnrelatedSelection.year);
  assert.ok(first.year >= 1970 && first.year <= 2025);
});

test("annual reconstruction uses prior-year USD market caps and currency returns", () => {
  const jstRows = [
    {
      year: 1999,
      iso: "DEU",
      xrusd: 2,
      equityReturn: null,
      interpolatedEquityReturn: null,
    },
    {
      year: 2000,
      iso: "DEU",
      xrusd: 4,
      equityReturn: 0.1,
      interpolatedEquityReturn: null,
    },
    {
      year: 1999,
      iso: "USA",
      xrusd: 1,
      equityReturn: null,
      interpolatedEquityReturn: null,
    },
    {
      year: 2000,
      iso: "USA",
      xrusd: 1,
      equityReturn: null,
      interpolatedEquityReturn: null,
    },
  ];
  const capRows = [
    {
      year: 1999,
      iso: "DEU",
      marketCap: 100,
      unit: 1,
      alignedEquityReturn: null,
    },
    {
      year: 2000,
      iso: "DEU",
      marketCap: 110,
      unit: 1,
      alignedEquityReturn: 0.1,
    },
    {
      year: 1999,
      iso: "USA",
      marketCap: 100,
      unit: 1,
      alignedEquityReturn: null,
    },
    {
      year: 2000,
      iso: "USA",
      marketCap: 120,
      unit: 1,
      alignedEquityReturn: 0.2,
    },
  ];

  const result = reconstructAnnualReturns({
    jstRows,
    capRows,
    startYear: 2000,
    endYear: 2000,
  });
  const [annual] = result.annual;
  const audit = new Map(
    result.countryAudit.map((row) => [row.iso, row]),
  );

  assertClose(audit.get("DEU").startWeight, 1 / 3);
  assertClose(audit.get("USA").startWeight, 2 / 3);
  assert.equal(audit.get("DEU").returnSource, "JST_R6_EQ_TR");
  assert.equal(audit.get("USA").returnSource, "KZ_R1_EQ_TR_FALLBACK");

  const expectedUsdGross = (1 / 3) * (1.1 * 2 / 4) + (2 / 3) * 1.2;
  assertClose(annual.usdReturn, expectedUsdGross - 1);
  assertClose(
    annual.referenceCurrencyReturn,
    expectedUsdGross * (4 / 2) - 1,
  );
});

test("committed synthetic years exactly match their reconstructed annual returns", () => {
  const indexRows = parseMonthlyIndexCsv(
    readFileSync("jst_kz_global_equity_monthly.csv", "utf8"),
  );
  const annualRows = parseCsv(
    readFileSync(
      "data-sources/jst-kz-global-equity/annual-reconstruction.csv",
      "utf8",
    ),
  );
  const levels = new Map(indexRows.map((row) => [row.key, row.level]));

  for (const annual of annualRows) {
    const year = Number(annual.year);
    const actual =
      levels.get(`12/${year}`) / levels.get(`12/${year - 1}`) - 1;
    const expected = Number(annual.annual_return_german_currency);
    assertClose(actual, expected, Math.max(2e-12, Math.abs(expected) * 2e-14));
  }
});

test("committed CPI backcast matches JST annual factors and preserves the observed suffix", () => {
  const inflationText = readFileSync("inflation.csv", "utf8");
  const inflationRows = parseCsv(inflationText);
  const auditRows = parseCsv(
    readFileSync(
      "data-sources/jst-kz-global-equity/inflation-annual-backcast.csv",
      "utf8",
    ),
  );
  const source = JSON.parse(
    readFileSync("data-sources/jst-kz-global-equity/source.json", "utf8"),
  );
  const levels = new Map(
    inflationRows.map((row) => [row.date, Number(row.cpi_index_2015_100)]),
  );

  assert.equal(inflationRows[0].date, "1899-12-01");
  assert.equal(inflationRows.at(-1).date, "2026-06-01");
  assert.equal(auditRows[0].year, "1900");
  assert.equal(auditRows.at(-1).year, "1955");

  for (let index = 1; index < inflationRows.length; index += 1) {
    const previous = new Date(`${inflationRows[index - 1].date}T00:00:00Z`);
    const current = new Date(`${inflationRows[index].date}T00:00:00Z`);
    previous.setUTCMonth(previous.getUTCMonth() + 1);
    assert.equal(current.toISOString(), previous.toISOString());
  }

  for (const row of auditRows.filter(
    (entry) => entry.method === "synthetic_full_year",
  )) {
    const year = Number(row.year);
    const actual =
      levels.get(`${year}-12-01`) / levels.get(`${year - 1}-12-01`);
    const expected = Number(row.annual_factor);
    assertClose(actual, expected, Math.max(2e-14, expected * 2e-14));
  }

  const bridge = auditRows.at(-1);
  assertClose(
    levels.get("1955-01-01") / levels.get("1954-12-01"),
    Number(bridge.monthly_factor),
    2e-15,
  );

  const lines = inflationText.trimEnd().split(/\r?\n/);
  const observedSuffix =
    [
      lines[0],
      ...lines.slice(1).filter((line) => line >= "1955-01-01"),
    ].join("\n") + "\n";
  const suffixChecksum = createHash("sha256")
    .update(observedSuffix)
    .digest("hex");
  assert.equal(
    suffixChecksum,
    source.inputChecksumsSha256.observedInflationSuffix1955To2026,
  );
});

test("committed donor provenance is complete and compounds to every target", () => {
  const rows = parseCsv(
    readFileSync(
      "data-sources/jst-kz-global-equity/monthly-provenance.csv",
      "utf8",
    ),
  );
  assert.equal(rows.length, 70);
  assert.deepEqual(
    rows.map((row) => Number(row.target_year)),
    Array.from({ length: 70 }, (_, index) => 1900 + index),
  );

  for (const row of rows) {
    const donorYear = Number(row.donor_year);
    assert.ok(donorYear >= 1970 && donorYear <= 2025);
    assert.equal(row.seed, DEFAULT_SEED);
    assertClose(
      Number(row.compounded_synthetic_return),
      Number(row.target_annual_return),
      Math.max(2e-12, Math.abs(Number(row.target_annual_return)) * 2e-14),
    );
  }
});

test("committed country weights sum to one and contributions match world USD returns", () => {
  const auditRows = parseCsv(
    readFileSync(
      "data-sources/jst-kz-global-equity/country-audit.csv",
      "utf8",
    ),
  );
  const annualRows = new Map(
    parseCsv(
      readFileSync(
        "data-sources/jst-kz-global-equity/annual-reconstruction.csv",
        "utf8",
      ),
    ).map((row) => [row.year, row]),
  );
  const byYear = new Map();
  for (const row of auditRows) {
    if (!byYear.has(row.year)) byYear.set(row.year, []);
    byYear.get(row.year).push(row);
  }

  for (const [year, rows] of byYear) {
    const included = rows.filter((row) => row.included === "true");
    const weightTotal = included.reduce(
      (sum, row) => sum + Number(row.start_weight),
      0,
    );
    const contributionTotal = included.reduce(
      (sum, row) => sum + Number(row.usd_return_contribution),
      0,
    );
    assertClose(weightTotal, 1, 2e-15);
    assertClose(
      contributionTotal,
      Number(annualRows.get(year).annual_return_usd),
      2e-15,
    );
  }

  const canadianRows = auditRows.filter((row) => row.iso === "CAN");
  assert.equal(canadianRows.length, 70);
  assert.ok(
    canadianRows.every(
      (row) =>
        row.included === "false" ||
        row.return_source === "KZ_R1_EQ_TR_FALLBACK",
    ),
  );
});

test("the observed series is copied unchanged from the December 1969 anchor", () => {
  const observed = parseMonthlyIndexCsv(readFileSync("msci_world.csv", "utf8"));
  const stitched = parseMonthlyIndexCsv(
    readFileSync("jst_kz_global_equity_monthly.csv", "utf8"),
  );
  const stitchedByKey = new Map(stitched.map((row) => [row.key, row.rawLevel]));

  for (const row of observed) {
    const afterAnchor =
      row.year > 1969 || (row.year === 1969 && row.month >= 12);
    if (afterAnchor) assert.equal(stitchedByKey.get(row.key), row.rawLevel);
  }
});

test("the source manifest marks the full series as the active default", () => {
  const source = JSON.parse(
    readFileSync("data-sources/jst-kz-global-equity/source.json", "utf8"),
  );
  assert.equal(source.status, "active-default");
  assert.equal(source.marketDataPath, "../../jst_kz_global_equity_monthly.csv");
  assert.equal(source.seed, DEFAULT_SEED);
  assert.equal(
    source.simulationSampling.activeMode,
    "overlapping-historical-paths",
  );
  assert.equal(source.simulationSampling.sequence, "contiguous-no-wrap");
});
