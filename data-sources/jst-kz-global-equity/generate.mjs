#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const DEFAULT_SEED = "jst-kz-msci-world-eur-v1";
export const DEFAULT_START_YEAR = 1900;
export const DEFAULT_END_YEAR = 1969;
export const DEFAULT_REFERENCE_ISO = "DEU";
export const DEFAULT_REAL_RETURN_ISO = "USA";
export const CURRENCY_CONVERSION_METHOD = "usd_real_return_reinflated_with_german_cpi";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(SCRIPT_DIR, "../..");
const DAY_MS = 24 * 60 * 60 * 1000;

function decodeXml(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, digits) =>
      String.fromCodePoint(Number.parseInt(digits, 16)),
    )
    .replace(/&#([0-9]+);/g, (_, digits) =>
      String.fromCodePoint(Number.parseInt(digits, 10)),
    )
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function unzipEntry(workbookPath, entryPath) {
  try {
    return execFileSync("unzip", ["-p", workbookPath, entryPath], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (error) {
    throw new Error(
      `Could not read ${entryPath} from ${workbookPath}. ` +
        `The generator requires the "unzip" command and an unmodified XLSX workbook.`,
      { cause: error },
    );
  }
}

function parseSharedStrings(xml) {
  const strings = [];
  for (const match of xml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)) {
    const parts = [...match[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)];
    strings.push(parts.map((part) => decodeXml(part[1])).join(""));
  }
  return strings;
}

function columnName(cellReference) {
  const match = /^[A-Z]+/.exec(cellReference);
  return match ? match[0] : "";
}

export function readXlsxRows(workbookPath, worksheetEntry) {
  const sharedStrings = parseSharedStrings(
    unzipEntry(workbookPath, "xl/sharedStrings.xml"),
  );
  const worksheetXml = unzipEntry(workbookPath, worksheetEntry);
  const rows = [];

  for (const rowMatch of worksheetXml.matchAll(
    /<row\b[^>]*>([\s\S]*?)<\/row>/g,
  )) {
    const row = {};
    for (const cellMatch of rowMatch[1].matchAll(
      /<c\b([^>]*)>([\s\S]*?)<\/c>/g,
    )) {
      const attributes = cellMatch[1];
      const referenceMatch = /\br="([^"]+)"/.exec(attributes);
      if (!referenceMatch) continue;

      const typeMatch = /\bt="([^"]+)"/.exec(attributes);
      const valueMatch = /<v\b[^>]*>([\s\S]*?)<\/v>/.exec(cellMatch[2]);
      const inlineMatch = /<t\b[^>]*>([\s\S]*?)<\/t>/.exec(cellMatch[2]);
      let value = valueMatch ? decodeXml(valueMatch[1]) : "";

      if (typeMatch?.[1] === "s" && value !== "") {
        value = sharedStrings[Number.parseInt(value, 10)] ?? "";
      } else if (typeMatch?.[1] === "inlineStr" && inlineMatch) {
        value = decodeXml(inlineMatch[1]);
      }

      row[columnName(referenceMatch[1])] = value;
    }
    rows.push(row);
  }

  return rows;
}

function rowsByHeader(rawRows) {
  if (rawRows.length === 0) throw new Error("Workbook sheet is empty.");
  const headers = rawRows[0];
  return rawRows.slice(1).map((rawRow) =>
    Object.fromEntries(
      Object.entries(headers).map(([column, header]) => [
        header,
        rawRow[column] ?? "",
      ]),
    ),
  );
}

function requiredHeaders(rows, headers, sourceName) {
  if (rows.length === 0) throw new Error(`${sourceName} contains no data rows.`);
  for (const header of headers) {
    if (!(header in rows[0])) {
      throw new Error(`${sourceName} is missing the "${header}" column.`);
    }
  }
}

function finiteNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function excelSerialToYear(value) {
  const serial = finiteNumber(value);
  if (serial === null) throw new Error(`Invalid Excel date serial: ${value}`);
  const adjustedSerial = serial >= 60 ? serial - 1 : serial;
  const date = new Date(Date.UTC(1899, 11, 31) + adjustedSerial * DAY_MS);
  return date.getUTCFullYear();
}

export function readJstWorkbook(workbookPath) {
  const rows = rowsByHeader(
    readXlsxRows(workbookPath, "xl/worksheets/sheet1.xml"),
  );
  requiredHeaders(
    rows,
    ["year", "iso", "cpi", "xrusd", "eq_tr", "eq_tr_interp"],
    "JST workbook",
  );

  return rows.map((row) => ({
    year: Number.parseInt(row.year, 10),
    iso: row.iso,
    cpi: finiteNumber(row.cpi),
    xrusd: finiteNumber(row.xrusd),
    equityReturn: finiteNumber(row.eq_tr),
    interpolatedEquityReturn: finiteNumber(row.eq_tr_interp),
  }));
}

export function readBigBangWorkbook(workbookPath) {
  const rows = rowsByHeader(
    readXlsxRows(workbookPath, "xl/worksheets/sheet2.xml"),
  );
  requiredHeaders(
    rows,
    ["year", "iso", "mcap", "eq_tr", "unit"],
    "Big Bang workbook",
  );

  return rows.map((row) => ({
    year: excelSerialToYear(row.year),
    iso: row.iso,
    marketCap: finiteNumber(row.mcap),
    unit: finiteNumber(row.unit),
    alignedEquityReturn: finiteNumber(row.eq_tr),
  }));
}

function observationMap(rows) {
  const observations = new Map();
  for (const row of rows) {
    observations.set(`${row.iso}:${row.year}`, row);
  }
  return observations;
}

function positiveNumber(value) {
  return Number.isFinite(value) && value > 0 ? value : null;
}

function interpolatePositiveSeries(years, rawValues) {
  const result = new Map();
  const known = years
    .map((year) => [year, positiveNumber(rawValues.get(year))])
    .filter(([, value]) => value !== null);

  for (const year of years) {
    const exact = positiveNumber(rawValues.get(year));
    if (exact !== null) {
      result.set(year, { value: exact, interpolated: false });
      continue;
    }

    const previous = [...known].reverse().find(([knownYear]) => knownYear < year);
    const next = known.find(([knownYear]) => knownYear > year);
    if (!previous || !next) {
      throw new Error(`Cannot interpolate reference exchange rate for ${year}.`);
    }

    const fraction = (year - previous[0]) / (next[0] - previous[0]);
    const logValue =
      Math.log(previous[1]) +
      fraction * (Math.log(next[1]) - Math.log(previous[1]));
    result.set(year, { value: Math.exp(logValue), interpolated: true });
  }

  return result;
}

function selectEquityReturn(jstRow, capRow) {
  if (jstRow?.equityReturn !== null && jstRow?.equityReturn !== undefined) {
    return { value: jstRow.equityReturn, source: "JST_R6_EQ_TR" };
  }
  if (
    jstRow?.interpolatedEquityReturn !== null &&
    jstRow?.interpolatedEquityReturn !== undefined
  ) {
    return {
      value: jstRow.interpolatedEquityReturn,
      source: "JST_R6_EQ_TR_INTERP",
    };
  }
  if (
    capRow?.alignedEquityReturn !== null &&
    capRow?.alignedEquityReturn !== undefined
  ) {
    return {
      value: capRow.alignedEquityReturn,
      source: "KZ_R1_EQ_TR_FALLBACK",
    };
  }
  return { value: null, source: "" };
}

export function reconstructAnnualReturns({
  jstRows,
  capRows,
  startYear = DEFAULT_START_YEAR,
  endYear = DEFAULT_END_YEAR,
  referenceIso = DEFAULT_REFERENCE_ISO,
  realReturnIso = DEFAULT_REAL_RETURN_ISO,
}) {
  if (startYear > endYear) throw new Error("startYear must not exceed endYear.");

  const jst = observationMap(jstRows);
  const caps = observationMap(capRows);
  const universe = [...new Set(capRows.map((row) => row.iso))]
    .filter(Boolean)
    .sort();
  const referenceYears = Array.from(
    { length: endYear - startYear + 2 },
    (_, index) => startYear - 1 + index,
  );
  const rawReferenceFx = new Map(
    referenceYears.map((year) => [
      year,
      jst.get(`${referenceIso}:${year}`)?.xrusd,
    ]),
  );
  const referenceFx = interpolatePositiveSeries(
    referenceYears,
    rawReferenceFx,
  );

  const annual = [];
  const countryAudit = [];

  for (let year = startYear; year <= endYear; year += 1) {
    const referenceCpiStart = positiveNumber(
      jst.get(`${referenceIso}:${year - 1}`)?.cpi,
    );
    const referenceCpiEnd = positiveNumber(
      jst.get(`${referenceIso}:${year}`)?.cpi,
    );
    const realReturnCpiStart = positiveNumber(
      jst.get(`${realReturnIso}:${year - 1}`)?.cpi,
    );
    const realReturnCpiEnd = positiveNumber(
      jst.get(`${realReturnIso}:${year}`)?.cpi,
    );
    if (
      referenceCpiStart === null ||
      referenceCpiEnd === null ||
      realReturnCpiStart === null ||
      realReturnCpiEnd === null
    ) {
      throw new Error(
        `Missing positive CPI needed for currency-neutral reconstruction in ${year}.`,
      );
    }
    const referenceInflationFactor = referenceCpiEnd / referenceCpiStart;
    const realReturnInflationFactor =
      realReturnCpiEnd / realReturnCpiStart;
    const purchasingPowerParityFxFactor =
      referenceInflationFactor / realReturnInflationFactor;

    const candidates = [];
    let knownStartCapUsd = 0;

    for (const iso of universe) {
      const capRow = caps.get(`${iso}:${year - 1}`);
      const startJst = jst.get(`${iso}:${year - 1}`);
      const endJst = jst.get(`${iso}:${year}`);
      const returnChoice = selectEquityReturn(endJst, caps.get(`${iso}:${year}`));
      const marketCap = positiveNumber(capRow?.marketCap);
      const unit = positiveNumber(capRow?.unit);
      const startFx = positiveNumber(startJst?.xrusd);
      const endFx = positiveNumber(endJst?.xrusd);
      const marketCapUsd =
        marketCap !== null && unit !== null && startFx !== null
          ? (marketCap * unit) / startFx
          : null;

      if (marketCapUsd !== null) knownStartCapUsd += marketCapUsd;

      let exclusionReason = "";
      if (marketCap === null || unit === null) {
        exclusionReason = "missing_start_market_cap";
      } else if (startFx === null) {
        exclusionReason = "missing_start_fx";
      } else if (endFx === null) {
        exclusionReason = "missing_end_fx";
      } else if (returnChoice.value === null) {
        exclusionReason = "missing_equity_return";
      } else if (1 + returnChoice.value <= 0) {
        exclusionReason = "non_positive_return_factor";
      }

      const usdGross =
        exclusionReason === ""
          ? (1 + returnChoice.value) * (startFx / endFx)
          : null;
      if (usdGross !== null && usdGross <= 0) {
        exclusionReason = "non_positive_usd_return_factor";
      }

      candidates.push({
        year,
        iso,
        capYear: year - 1,
        included: exclusionReason === "",
        exclusionReason,
        marketCapUsd,
        localReturn: returnChoice.value,
        returnSource: returnChoice.source,
        startFx,
        endFx,
        usdGross: exclusionReason === "" ? usdGross : null,
      });
    }

    const included = candidates.filter((candidate) => candidate.included);
    const eligibleCapUsd = included.reduce(
      (sum, candidate) => sum + candidate.marketCapUsd,
      0,
    );
    if (!(eligibleCapUsd > 0)) {
      throw new Error(`No eligible country observations for ${year}.`);
    }

    const startReference = referenceFx.get(year - 1);
    const endReference = referenceFx.get(year);
    const rawReferenceFxFactor = endReference.value / startReference.value;
    let worldUsdGross = 0;

    for (const candidate of candidates) {
      const startWeight = candidate.included
        ? candidate.marketCapUsd / eligibleCapUsd
        : null;
      const contributionUsd = candidate.included
        ? startWeight * (candidate.usdGross - 1)
        : null;
      const currencyNeutralReferenceReturn = candidate.included
        ? candidate.usdGross * purchasingPowerParityFxFactor - 1
        : null;
      const rawReferenceCurrencyReturn = candidate.included
        ? candidate.usdGross * rawReferenceFxFactor - 1
        : null;

      if (candidate.included) {
        worldUsdGross += startWeight * candidate.usdGross;
      }

      countryAudit.push({
        ...candidate,
        startWeight,
        usdReturn: candidate.included ? candidate.usdGross - 1 : null,
        referenceCurrencyReturn: currencyNeutralReferenceReturn,
        rawReferenceCurrencyReturn,
        contributionUsd,
      });
    }

    const realUsdGross = worldUsdGross / realReturnInflationFactor;
    const referenceCurrencyGross =
      realUsdGross * referenceInflationFactor;
    const rawReferenceCurrencyGross =
      worldUsdGross * rawReferenceFxFactor;
    if (!(referenceCurrencyGross > 0)) {
      throw new Error(
        `Reconstructed reference-currency return factor is not positive for ${year}.`,
      );
    }

    annual.push({
      year,
      referenceCurrencyReturn: referenceCurrencyGross - 1,
      realUsdReturn: realUsdGross - 1,
      usdReturn: worldUsdGross - 1,
      referenceInflationFactor,
      realReturnInflationFactor,
      purchasingPowerParityFxFactor,
      rawReferenceCurrencyReturn: rawReferenceCurrencyGross - 1,
      referenceFxStart: startReference.value,
      referenceFxEnd: endReference.value,
      referenceFxInterpolated:
        startReference.interpolated || endReference.interpolated,
      currencyConversionMethod: CURRENCY_CONVERSION_METHOD,
      eligibleCountries: included.length,
      universeCountries: universe.length,
      knownCapCoverage:
        knownStartCapUsd > 0 ? eligibleCapUsd / knownStartCapUsd : null,
    });
  }

  return { annual, countryAudit, universe };
}

function parseSimpleCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) throw new Error("CSV contains no data rows.");
  return {
    header: lines[0].split(","),
    rows: lines.slice(1).map((line) => line.split(",")),
  };
}

function isoDate(year, month) {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

export function extendGermanInflationCsv({
  jstRows,
  observedCsv,
  startYear = DEFAULT_START_YEAR,
  observedStartYear = 1955,
  referenceIso = DEFAULT_REFERENCE_ISO,
}) {
  const parsed = parseSimpleCsv(observedCsv);
  if (
    parsed.header[0] !== "date" ||
    parsed.header[1] !== "cpi_index_2015_100"
  ) {
    throw new Error(
      "Inflation CSV must start with date,cpi_index_2015_100.",
    );
  }

  const inputRows = parsed.rows.map((columns) => {
    const date = columns[0];
    const value = positiveNumber(finiteNumber(columns[1]));
    const match = /^(\d{4})-(\d{2})-01$/.exec(date);
    if (!match || value === null) {
      throw new Error(`Invalid observed CPI row: ${columns.join(",")}`);
    }
    return {
      date,
      year: Number.parseInt(match[1], 10),
      month: Number.parseInt(match[2], 10),
      value,
      rawLine: columns.join(","),
    };
  });
  const observed = inputRows.filter((row) => row.year >= observedStartYear);

  const firstObserved = observed[0];
  if (
    !firstObserved ||
    firstObserved.year !== observedStartYear ||
    firstObserved.month !== 1
  ) {
    throw new Error(
      `Observed CPI suffix must contain January ${observedStartYear}.`,
    );
  }
  if (startYear >= firstObserved.year) {
    throw new Error("Synthetic CPI start must precede the observed series.");
  }

  for (let index = 1; index < observed.length; index += 1) {
    const previous = observed[index - 1];
    const expected =
      previous.month === 12
        ? { year: previous.year + 1, month: 1 }
        : { year: previous.year, month: previous.month + 1 };
    if (
      observed[index].year !== expected.year ||
      observed[index].month !== expected.month
    ) {
      throw new Error(`Observed CPI series has a gap before ${observed[index].date}.`);
    }
  }

  const annualCpi = new Map(
    jstRows
      .filter((row) => row.iso === referenceIso)
      .map((row) => [row.year, positiveNumber(row.cpi)]),
  );
  for (let year = startYear - 1; year <= firstObserved.year; year += 1) {
    if (annualCpi.get(year) === null || annualCpi.get(year) === undefined) {
      throw new Error(`Missing positive JST CPI for ${referenceIso} in ${year}.`);
    }
  }

  const bridgeAnnualFactor =
    annualCpi.get(firstObserved.year) /
    annualCpi.get(firstObserved.year - 1);
  const bridgeMonthlyFactor = bridgeAnnualFactor ** (1 / 12);
  let currentLevel = firstObserved.value / bridgeMonthlyFactor;
  const syntheticDescending = [];
  const annualAudit = [];

  for (let year = firstObserved.year - 1; year >= startYear; year -= 1) {
    const annualFactor = annualCpi.get(year) / annualCpi.get(year - 1);
    if (!(annualFactor > 0)) {
      throw new Error(`Non-positive annual CPI factor for ${year}.`);
    }
    const monthlyFactor = annualFactor ** (1 / 12);
    annualAudit.push({
      year,
      jstCpi: annualCpi.get(year),
      annualFactor,
      monthlyFactor,
      method: "synthetic_full_year",
    });
    for (let month = 12; month >= 1; month -= 1) {
      syntheticDescending.push({
        date: isoDate(year, month),
        value: currentLevel,
      });
      currentLevel /= monthlyFactor;
    }
  }

  const baseline = {
    date: isoDate(startYear - 1, 12),
    value: currentLevel,
  };
  const synthetic = syntheticDescending.reverse();
  const lines = [
    parsed.header.join(","),
    `${baseline.date},${baseline.value}`,
    ...synthetic.map((row) => `${row.date},${row.value}`),
    ...observed.map((row) => row.rawLine),
    "",
  ];

  return {
    csv: lines.join("\n"),
    baseline,
    synthetic,
    observed,
    bridgeMonthlyFactor,
    firstObservedDate: firstObserved.date,
    annualAudit: [
      ...annualAudit.reverse(),
      {
        year: firstObserved.year,
        jstCpi: annualCpi.get(firstObserved.year),
        annualFactor: bridgeAnnualFactor,
        monthlyFactor: bridgeMonthlyFactor,
        method: "observed_splice_month_only",
      },
    ],
  };
}

function monthKey(year, month) {
  return `${String(month).padStart(2, "0")}/${year}`;
}

function parseMonthKey(key) {
  const match = /^(\d{2})\/(\d{4})$/.exec(key);
  if (!match) throw new Error(`Invalid monthly date: ${key}`);
  const month = Number.parseInt(match[1], 10);
  const year = Number.parseInt(match[2], 10);
  if (month < 1 || month > 12) throw new Error(`Invalid monthly date: ${key}`);
  return { year, month };
}

function previousMonth(year, month) {
  return month === 1
    ? { year: year - 1, month: 12 }
    : { year, month: month - 1 };
}

export function parseMonthlyIndexCsv(text) {
  const parsed = parseSimpleCsv(text);
  if (parsed.header.length < 2) {
    throw new Error("Monthly index CSV must contain date and level columns.");
  }

  const seen = new Set();
  const rows = parsed.rows.map((columns) => {
    const key = columns[0];
    const { year, month } = parseMonthKey(key);
    const level = finiteNumber(columns[1]);
    if (!(level > 0)) throw new Error(`Invalid index level for ${key}.`);
    if (seen.has(key)) throw new Error(`Duplicate monthly date: ${key}`);
    seen.add(key);
    return { key, year, month, level, rawLevel: columns[1] };
  });

  rows.sort((a, b) => a.year - b.year || a.month - b.month);
  return rows;
}

export function buildCompleteDonorYears(indexRows, minimumYear = 1970) {
  const byKey = new Map(indexRows.map((row) => [row.key, row]));
  const maximumYear = Math.max(...indexRows.map((row) => row.year));
  const donorYears = [];

  for (let year = minimumYear; year <= maximumYear; year += 1) {
    const factors = [];
    let complete = true;
    for (let month = 1; month <= 12; month += 1) {
      const current = byKey.get(monthKey(year, month));
      const previous = previousMonth(year, month);
      const prior = byKey.get(monthKey(previous.year, previous.month));
      if (!current || !prior) {
        complete = false;
        break;
      }
      const factor = current.level / prior.level;
      if (!(factor > 0)) {
        throw new Error(`Non-positive donor return factor in ${year}-${month}.`);
      }
      factors.push(factor);
    }
    if (complete) donorYears.push({ year, factors });
  }

  if (donorYears.length === 0) {
    throw new Error("No complete 12-month donor years were found.");
  }
  return donorYears;
}

function fnv1a(value) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function selectDonorYear(targetYear, donorYears, seed = DEFAULT_SEED) {
  if (donorYears.length === 0) throw new Error("Donor-year list is empty.");
  const random = mulberry32(fnv1a(`${seed}:${targetYear}`));
  return donorYears[Math.floor(random() * donorYears.length)];
}

function compound(factors) {
  return factors.reduce((product, factor) => product * factor, 1);
}

export function rescaleMonthlyFactors(donorFactors, targetAnnualReturn) {
  if (donorFactors.length !== 12) {
    throw new Error("A donor path must contain exactly 12 monthly factors.");
  }
  if (donorFactors.some((factor) => !(factor > 0))) {
    throw new Error("All donor monthly factors must be positive.");
  }

  const targetFactor = 1 + targetAnnualReturn;
  if (!(targetFactor > 0)) {
    throw new Error("Target annual return must be greater than -100%.");
  }

  const donorFactor = compound(donorFactors);
  const logShift = (Math.log(targetFactor) - Math.log(donorFactor)) / 12;
  const factors = donorFactors
    .slice(0, 11)
    .map((factor) => Math.exp(Math.log(factor) + logShift));
  factors.push(targetFactor / compound(factors));

  return { factors, donorFactor, targetFactor, logShift };
}

export function synthesizeMonthlyReturns({
  annualReturns,
  donorYears,
  seed = DEFAULT_SEED,
}) {
  const monthly = [];
  const provenance = [];

  for (const annual of annualReturns) {
    const donor = selectDonorYear(annual.year, donorYears, seed);
    const scaled = rescaleMonthlyFactors(
      donor.factors,
      annual.referenceCurrencyReturn,
    );

    scaled.factors.forEach((grossFactor, index) => {
      monthly.push({
        year: annual.year,
        month: index + 1,
        grossFactor,
        donorYear: donor.year,
      });
    });
    provenance.push({
      targetYear: annual.year,
      donorYear: donor.year,
      targetAnnualReturn: annual.referenceCurrencyReturn,
      donorAnnualReturn: scaled.donorFactor - 1,
      logShift: scaled.logShift,
      compoundedSyntheticReturn: compound(scaled.factors) - 1,
      seed,
    });
  }

  return { monthly, provenance };
}

export function buildStitchedIndex({
  syntheticMonthly,
  observedRows,
  anchorKey = "12/1969",
}) {
  const observedByKey = new Map(observedRows.map((row) => [row.key, row]));
  const anchor = observedByKey.get(anchorKey);
  if (!anchor) throw new Error(`Observed series is missing anchor ${anchorKey}.`);

  const syntheticDescending = [...syntheticMonthly].sort(
    (a, b) => b.year - a.year || b.month - a.month,
  );
  const syntheticLevels = new Map([[anchorKey, anchor.level]]);
  let currentLevel = anchor.level;

  for (const row of syntheticDescending) {
    const expectedKey = monthKey(row.year, row.month);
    if (
      syntheticLevels.size === 1 &&
      expectedKey !== monthKey(anchor.year, anchor.month)
    ) {
      const next =
        row.month === 12
          ? { year: row.year + 1, month: 1 }
          : { year: row.year, month: row.month + 1 };
      if (monthKey(next.year, next.month) !== anchorKey) {
        throw new Error("Synthetic series does not end immediately before anchor.");
      }
    }
    currentLevel /= row.grossFactor;
    const previous = previousMonth(row.year, row.month);
    syntheticLevels.set(monthKey(previous.year, previous.month), currentLevel);
  }

  const firstSynthetic = syntheticMonthly
    .slice()
    .sort((a, b) => a.year - b.year || a.month - b.month)[0];
  if (!firstSynthetic) throw new Error("Synthetic monthly series is empty.");

  const output = [];
  const baseline = previousMonth(firstSynthetic.year, firstSynthetic.month);
  output.push({
    key: monthKey(baseline.year, baseline.month),
    level: syntheticLevels.get(monthKey(baseline.year, baseline.month)),
  });

  for (const row of [...syntheticMonthly].sort(
    (a, b) => a.year - b.year || a.month - b.month,
  )) {
    output.push({
      key: monthKey(row.year, row.month),
      level: syntheticLevels.get(monthKey(row.year, row.month)),
    });
  }

  for (const row of observedRows) {
    if (
      row.year > anchor.year ||
      (row.year === anchor.year && row.month > anchor.month)
    ) {
      output.push({
        key: row.key,
        level: row.level,
        rawLevel: row.rawLevel,
        observed: true,
      });
    }
  }

  return output;
}

function csvCell(value) {
  if (value === null || value === undefined) return "";
  const text = typeof value === "number" ? String(value) : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function csvText(headers, rows) {
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(",")),
    "",
  ].join("\n");
}

function writeOutput(filePath, text) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, text, "utf8");
}

export function renderOutputs({
  annual,
  countryAudit,
  provenance,
  stitchedIndex,
}) {
  return {
    monthly: csvText(
      ["Date", "JST-KZ Developed Markets"],
      stitchedIndex.map((row) => ({
        Date: row.key,
        "JST-KZ Developed Markets": row.rawLevel ?? row.level,
      })),
    ),
    annual: csvText(
      [
        "year",
        "annual_return_german_currency_neutral",
        "annual_return_real_usd",
        "annual_return_usd",
        "german_inflation_factor",
        "us_inflation_factor",
        "ppp_fx_factor",
        "annual_return_german_raw_fx_diagnostic",
        "reference_fx_start",
        "reference_fx_end",
        "reference_fx_interpolated",
        "currency_conversion_method",
        "eligible_countries",
        "universe_countries",
        "known_cap_coverage",
      ],
      annual.map((row) => ({
        year: row.year,
        annual_return_german_currency_neutral: row.referenceCurrencyReturn,
        annual_return_real_usd: row.realUsdReturn,
        annual_return_usd: row.usdReturn,
        german_inflation_factor: row.referenceInflationFactor,
        us_inflation_factor: row.realReturnInflationFactor,
        ppp_fx_factor: row.purchasingPowerParityFxFactor,
        annual_return_german_raw_fx_diagnostic:
          row.rawReferenceCurrencyReturn,
        reference_fx_start: row.referenceFxStart,
        reference_fx_end: row.referenceFxEnd,
        reference_fx_interpolated: row.referenceFxInterpolated,
        currency_conversion_method: row.currencyConversionMethod,
        eligible_countries: row.eligibleCountries,
        universe_countries: row.universeCountries,
        known_cap_coverage: row.knownCapCoverage,
      })),
    ),
    countryAudit: csvText(
      [
        "year",
        "iso",
        "included",
        "exclusion_reason",
        "cap_year",
        "market_cap_usd",
        "start_weight",
        "return_source",
        "local_return",
        "usd_return",
        "currency_neutral_german_return",
        "raw_german_fx_return_diagnostic",
        "usd_return_contribution",
      ],
      countryAudit.map((row) => ({
        year: row.year,
        iso: row.iso,
        included: row.included,
        exclusion_reason: row.exclusionReason,
        cap_year: row.capYear,
        market_cap_usd: row.marketCapUsd,
        start_weight: row.startWeight,
        return_source: row.returnSource,
        local_return: row.localReturn,
        usd_return: row.usdReturn,
        currency_neutral_german_return: row.referenceCurrencyReturn,
        raw_german_fx_return_diagnostic: row.rawReferenceCurrencyReturn,
        usd_return_contribution: row.contributionUsd,
      })),
    ),
    provenance: csvText(
      [
        "target_year",
        "donor_year",
        "target_annual_return",
        "donor_annual_return",
        "log_shift",
        "compounded_synthetic_return",
        "seed",
      ],
      provenance.map((row) => ({
        target_year: row.targetYear,
        donor_year: row.donorYear,
        target_annual_return: row.targetAnnualReturn,
        donor_annual_return: row.donorAnnualReturn,
        log_shift: row.logShift,
        compounded_synthetic_return: row.compoundedSyntheticReturn,
        seed: row.seed,
      })),
    ),
  };
}

function parseArguments(argumentsList) {
  const options = {};
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (!argument.startsWith("--")) {
      throw new Error(`Unexpected argument: ${argument}`);
    }
    const key = argument.slice(2);
    const value = argumentsList[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    options[key] = value;
    index += 1;
  }
  return options;
}

function requiredPath(options, key) {
  if (!options[key]) {
    throw new Error(`Missing required --${key} /path/to/workbook.xlsx`);
  }
  return resolve(options[key]);
}

export function generateDataSource({
  jstWorkbook,
  marketCapWorkbook,
  donorCsv = resolve(PROJECT_ROOT, "msci_world.csv"),
  startYear = DEFAULT_START_YEAR,
  endYear = DEFAULT_END_YEAR,
  seed = DEFAULT_SEED,
}) {
  const jstRows = readJstWorkbook(jstWorkbook);
  const capRows = readBigBangWorkbook(marketCapWorkbook);
  const reconstruction = reconstructAnnualReturns({
    jstRows,
    capRows,
    startYear,
    endYear,
  });
  const observedRows = parseMonthlyIndexCsv(readFileSync(donorCsv, "utf8"));
  const donorYears = buildCompleteDonorYears(observedRows, 1970);
  const synthetic = synthesizeMonthlyReturns({
    annualReturns: reconstruction.annual,
    donorYears,
    seed,
  });
  const stitchedIndex = buildStitchedIndex({
    syntheticMonthly: synthetic.monthly,
    observedRows,
  });
  const outputs = renderOutputs({
    annual: reconstruction.annual,
    countryAudit: reconstruction.countryAudit,
    provenance: synthetic.provenance,
    stitchedIndex,
  });

  return {
    ...reconstruction,
    ...synthetic,
    stitchedIndex,
    donorYears,
    outputs,
  };
}

function runCli() {
  const options = parseArguments(process.argv.slice(2));
  const result = generateDataSource({
    jstWorkbook: requiredPath(options, "jst"),
    marketCapWorkbook: requiredPath(options, "market-caps"),
    donorCsv: options.donor
      ? resolve(options.donor)
      : resolve(PROJECT_ROOT, "msci_world.csv"),
    startYear: options["start-year"]
      ? Number.parseInt(options["start-year"], 10)
      : DEFAULT_START_YEAR,
    endYear: options["end-year"]
      ? Number.parseInt(options["end-year"], 10)
      : DEFAULT_END_YEAR,
    seed: options.seed ?? DEFAULT_SEED,
  });

  const monthlyOutput = options.output
    ? resolve(options.output)
    : resolve(PROJECT_ROOT, "jst_kz_global_equity_monthly.csv");
  const outputDirectory = options["audit-dir"]
    ? resolve(options["audit-dir"])
    : SCRIPT_DIR;

  writeOutput(monthlyOutput, result.outputs.monthly);
  writeOutput(
    resolve(outputDirectory, "annual-reconstruction.csv"),
    result.outputs.annual,
  );
  writeOutput(
    resolve(outputDirectory, "country-audit.csv"),
    result.outputs.countryAudit,
  );
  writeOutput(
    resolve(outputDirectory, "monthly-provenance.csv"),
    result.outputs.provenance,
  );

  const firstYear = result.annual[0].year;
  const lastYear = result.annual.at(-1).year;
  const donorStart = result.donorYears[0].year;
  const donorEnd = result.donorYears.at(-1).year;
  console.log(
    `Generated ${monthlyOutput}: synthetic ${firstYear}-${lastYear}, ` +
      `donor years ${donorStart}-${donorEnd}, ${result.universe.length} countries.`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    runCli();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
