import { readFile } from "node:fs/promises";

import {
  compareSimulationResult,
  parseBasisRateCsv,
  parseCpiCsv,
  parseMarketCsv,
  preciseAge,
  simulateHousehold,
} from "../app.js";

const API_VERSION = "v1";
const MAX_BODY_BYTES = 64 * 1024;
let simulationDataPromise;

class ApiError extends Error {
  constructor(status, code, message, details = undefined) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function loadSimulationData() {
  if (!simulationDataPromise) {
    simulationDataPromise = Promise.all([
      readFile(new URL("../jst_kz_global_equity_monthly.csv", import.meta.url), "utf8"),
      readFile(new URL("../inflation.csv", import.meta.url), "utf8"),
      readFile(new URL("../basiszins.csv", import.meta.url), "utf8"),
    ]).then(([marketCsv, inflationCsv, basisRateCsv]) => {
      const inflation = parseCpiCsv(inflationCsv);
      const basisRates = parseBasisRateCsv(basisRateCsv);
      return {
        market: parseMarketCsv(marketCsv, inflation, basisRates),
        inflation,
        basisRates,
      };
    });
  }
  return simulationDataPromise;
}

function validationError(path, message, code = "invalid_value") {
  throw new ApiError(422, "validation_failed", "Request validation failed.", [
    { path, code, message },
  ]);
}

function finiteNumber(value, path, { defaultValue, min = -Infinity, max = Infinity } = {}) {
  const resolved = value === undefined ? defaultValue : value;
  if (typeof resolved !== "number" || !Number.isFinite(resolved) || resolved < min || resolved > max) {
    validationError(path, `Must be a finite number between ${min} and ${max}.`);
  }
  return resolved;
}

function integer(value, path, options = {}) {
  const resolved = finiteNumber(value, path, options);
  if (!Number.isInteger(resolved)) validationError(path, "Must be an integer.");
  return resolved;
}

function booleanValue(value, path, defaultValue) {
  if (value === undefined) return defaultValue;
  if (typeof value !== "boolean") validationError(path, "Must be a boolean.");
  return value;
}

function isoDate(value, path) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    validationError(path, "Must be a calendar date in YYYY-MM-DD format.", "invalid_date");
  }
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    validationError(path, "Must be a valid calendar date.", "invalid_date");
  }
  return parsed;
}

function normalizePerson(person, path, { initialBalance = false } = {}) {
  if (!person || typeof person !== "object" || Array.isArray(person)) {
    validationError(path, "Must be an object.");
  }
  return {
    birthdate: isoDate(person.birthdate, `${path}/birthdate`),
    monthlyContribution: finiteNumber(person.monthlyContribution, `${path}/monthlyContribution`, {
      defaultValue: 0,
      min: 0,
      max: 20_000,
    }),
    ...(initialBalance
      ? {
          initialBalance: finiteNumber(person.initialBalance, `${path}/initialBalance`, {
            defaultValue: 0,
            min: 0,
            max: 100_000_000,
          }),
        }
      : {}),
    retirementAge: finiteNumber(person.retirementAge, `${path}/retirementAge`, {
      defaultValue: 67,
      min: 50,
      max: 75,
    }),
    incomeRate: finiteNumber(person.incomeRate, `${path}/incomeRate`, {
      defaultValue: 0.3,
      min: 0,
      max: 1,
    }),
  };
}

function normalizeHousehold(source, asOfDate) {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    validationError("/household", "Must be an object.");
  }
  const applicant = normalizePerson(source.applicant, "/household/applicant", { initialBalance: true });
  const spouse = source.spouse == null
    ? null
    : normalizePerson(source.spouse, "/household/spouse");
  const childrenSource = source.children ?? [];
  if (!Array.isArray(childrenSource) || childrenSource.length > 25) {
    validationError("/household/children", "Must be an array containing at most 25 dates.");
  }
  const children = childrenSource.map((date, index) =>
    isoDate(date, `/household/children/${index}`));
  const applicantRetirementYear = applicant.birthdate.getFullYear() + applicant.retirementAge;
  const etf = source.etfComparison ?? {};
  if (typeof etf !== "object" || Array.isArray(etf)) {
    validationError("/household/etfComparison", "Must be an object.");
  }
  const startYear = integer(etf.startYear, "/household/etfComparison/startYear", {
    defaultValue: asOfDate.getFullYear(),
    min: 1900,
    max: 2100,
  });
  const endYear = integer(etf.endYear, "/household/etfComparison/endYear", {
    defaultValue: Math.min(Math.round(applicantRetirementYear), 2100),
    min: 1900,
    max: 2100,
  });
  if (endYear < startYear) {
    validationError("/household/etfComparison/endYear", "Must be greater than or equal to startYear.");
  }
  return {
    applicant,
    spouse,
    children,
    childBenefitDurationYears: integer(
      source.childBenefitDurationYears,
      "/household/childBenefitDurationYears",
      { defaultValue: 18, min: 16, max: 25 },
    ),
    annualFeeRate: finiteNumber(source.annualFeeRate, "/household/annualFeeRate", {
      defaultValue: 0.002,
      min: 0,
      max: 0.015,
    }),
    etfComparison: {
      monthlyContribution: finiteNumber(etf.monthlyContribution, "/household/etfComparison/monthlyContribution", {
        defaultValue: 500,
        min: 0,
        max: 20_000,
      }),
      startYear,
      endYear,
      postSavingsMonthlyFlow: finiteNumber(
        etf.postSavingsMonthlyFlow,
        "/household/etfComparison/postSavingsMonthlyFlow",
        { defaultValue: 0, min: -20_000, max: 20_000 },
      ),
      trancheCount: integer(etf.trancheCount, "/household/etfComparison/trancheCount", {
        defaultValue: 5,
        min: 1,
        max: 20,
      }),
    },
  };
}

function normalizeRequest(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    validationError("/", "Request body must be a JSON object.");
  }
  const sourceOptions = payload.options ?? {};
  if (typeof sourceOptions !== "object" || Array.isArray(sourceOptions)) {
    validationError("/options", "Must be an object.");
  }
  const asOfDate = sourceOptions.asOfDate === undefined
    ? new Date()
    : isoDate(sourceOptions.asOfDate, "/options/asOfDate");
  const samplingMode = sourceOptions.samplingMode ?? "historical-paths";
  if (!["historical-paths", "block-bootstrap"].includes(samplingMode)) {
    validationError("/options/samplingMode", "Must be historical-paths or block-bootstrap.");
  }
  const withdrawalRate = finiteNumber(sourceOptions.withdrawalRate, "/options/withdrawalRate", {
    defaultValue: 0.04,
    min: 0,
    max: 1,
  });
  const candidateSource = sourceOptions.withdrawalRateCandidates ?? [0.03, 0.04, 0.05];
  if (!Array.isArray(candidateSource) || candidateSource.length < 1 || candidateSource.length > 20) {
    validationError("/options/withdrawalRateCandidates", "Must contain between 1 and 20 rates.");
  }
  const withdrawalRateCandidates = candidateSource.map((rate, index) =>
    finiteNumber(rate, `/options/withdrawalRateCandidates/${index}`, { min: 0, max: 1 }));
  const expectedRealAnnualReturn = sourceOptions.expectedRealAnnualReturn == null
    ? undefined
    : finiteNumber(
        sourceOptions.expectedRealAnnualReturn,
        "/options/expectedRealAnnualReturn",
        { min: -1, max: 1 },
      );
  const household = normalizeHousehold(payload.household, asOfDate);
  const maxAge = integer(sourceOptions.maxAge, "/options/maxAge", {
    defaultValue: 90,
    min: 51,
    max: 100,
  });
  if (preciseAge(household.applicant.birthdate, asOfDate) >= maxAge) {
    validationError("/options/maxAge", "Must be greater than the applicant's age on asOfDate.");
  }
  return {
    household,
    options: {
      now: asOfDate,
      maxAge,
      samplingMode,
      simulationCount: integer(sourceOptions.simulationCount, "/options/simulationCount", {
        defaultValue: 250,
        min: 1,
        max: 2_500,
      }),
      simulationSeedOffset: integer(sourceOptions.seed, "/options/seed", {
        defaultValue: 0,
        min: 0,
        max: 0xffff_ffff,
      }),
      adjustInflowsForInflation: booleanValue(
        sourceOptions.adjustInflowsForInflation,
        "/options/adjustInflowsForInflation",
        true,
      ),
      withdrawalRate,
      withdrawalRateCandidates,
      expectedRealAnnualReturn,
    },
    comparison: payload.comparison ?? {},
    asOfDate,
  };
}

function dateString(value) {
  if (!(value instanceof Date)) return value;
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

function dataMetadata(data) {
  const series = data.market.bootstrapSeries;
  return {
    marketAndInflationFrom: series[0]?.key ?? null,
    marketAndInflationThrough: series.at(-1)?.key ?? null,
    basisRatesFrom: Math.min(...data.basisRates.keys()),
    basisRatesThrough: Math.max(...data.basisRates.keys()),
  };
}

function metadata(result, normalized, data, terms = undefined) {
  return {
    asOfDate: dateString(normalized.asOfDate),
    currency: "EUR",
    data: dataMetadata(data),
    pathCount: result.pathCount,
    samplingMode: result.samplingMode,
    terms,
    withdrawalRate: result.withdrawalRate,
  };
}

function aggregateEtfComparison(result) {
  const source = result.etfComparison ?? {};
  return {
    config: source.config,
    nominal: source.nominal,
    real: source.real,
    alternativeNominal: source.alternativeNominal,
    alternativeReal: source.alternativeReal,
  };
}

function simulationDto(result, normalized, data) {
  return {
    apiVersion: API_VERSION,
    metadata: metadata(result, normalized, data),
    projection: {
      years: result.years,
      retirement: {
        applicantYearIndex: result.retirementYear,
        spouseYearIndex: result.spouseRetirementYear,
        householdYearIndex: result.preRetirementYear,
      },
      averageAnnualSupport: result.averageAnnualSupport,
      withdrawal: result.withdrawalStats,
      withdrawalRateGrid: result.withdrawalRateStats,
      timeline: result.yearlyStats,
      chartTimeline: result.chartStats,
    },
    etfComparison: aggregateEtfComparison(result),
  };
}

function comparisonDto(result, normalized, data) {
  const comparisonSource = normalized.comparison;
  if (typeof comparisonSource !== "object" || Array.isArray(comparisonSource)) {
    validationError("/comparison", "Must be an object.");
  }
  const terms = comparisonSource.terms ?? "real";
  if (!["real", "nominal"].includes(terms)) {
    validationError("/comparison/terms", "Must be real or nominal.");
  }
  const pensionMonthly = finiteNumber(
    comparisonSource.pensionMonthly,
    "/comparison/pensionMonthly",
    { defaultValue: 0, min: 0, max: 20_000 },
  );
  return {
    apiVersion: API_VERSION,
    metadata: metadata(result, normalized, data, terms),
    inputs: { pensionMonthly },
    comparison: compareSimulationResult(result, { pensionMonthly, terms }),
    etfComparison: aggregateEtfComparison(result),
  };
}

async function runSimulation(payload, kind = "simulate") {
  const normalized = normalizeRequest(payload);
  const data = await loadSimulationData();
  const result = simulateHousehold(normalized.household, data, normalized.options);
  return kind === "compare"
    ? comparisonDto(result, normalized, data)
    : simulationDto(result, normalized, data);
}

function corsHeaders() {
  return {
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-origin": "*",
    "cache-control": "no-store",
  };
}

function jsonResponse(body, status = 200) {
  return Response.json(body, { status, headers: corsHeaders() });
}

async function parseJsonRequest(request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new ApiError(415, "invalid_content_type", "Content-Type must be application/json.");
  }
  const length = Number(request.headers.get("content-length"));
  if (Number.isFinite(length) && length > MAX_BODY_BYTES) {
    throw new ApiError(413, "request_too_large", `Request body must not exceed ${MAX_BODY_BYTES} bytes.`);
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    throw new ApiError(413, "request_too_large", `Request body must not exceed ${MAX_BODY_BYTES} bytes.`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError(400, "invalid_json", "Request body must contain valid JSON.");
  }
}

async function handleSimulationRequest(request, kind) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders() });
  if (request.method !== "POST") {
    return jsonResponse({ error: { code: "method_not_allowed", message: "Use POST." } }, 405);
  }
  try {
    return jsonResponse(await runSimulation(await parseJsonRequest(request), kind));
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonResponse({
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
        },
      }, error.status);
    }
    console.error(error);
    return jsonResponse({
      error: { code: "internal_error", message: "The simulation could not be completed." },
    }, 500);
  }
}

async function healthResponse() {
  try {
    const data = await loadSimulationData();
    return jsonResponse({ apiVersion: API_VERSION, status: "ok", data: dataMetadata(data) });
  } catch (error) {
    console.error(error);
    return jsonResponse({
      apiVersion: API_VERSION,
      status: "error",
      error: { code: "data_unavailable", message: "Simulation data could not be loaded." },
    }, 503);
  }
}

export {
  API_VERSION,
  healthResponse,
  handleSimulationRequest,
  loadSimulationData,
  normalizeRequest,
  runSimulation,
};
