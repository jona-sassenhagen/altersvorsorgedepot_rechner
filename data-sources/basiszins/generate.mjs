#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { readXlsxRows } from "../jst-kz-global-equity/generate.mjs";

const FIRST_YEAR = 1900;
const LAST_YEAR = 2026;

function parseArguments(argumentsList) {
  const options = {};
  for (let index = 0; index < argumentsList.length; index += 2) {
    const key = argumentsList[index]?.replace(/^--/, "");
    const value = argumentsList[index + 1];
    if (!key || !value) throw new Error("Expected --jst, --bundesbank and --output paths.");
    options[key] = value;
  }
  return options;
}

function jstGermanLongRates(workbookPath) {
  const rows = readXlsxRows(workbookPath, "xl/worksheets/sheet1.xml");
  const header = rows[0] ?? {};
  const columnFor = (name) => Object.keys(header).find((column) => header[column] === name);
  const yearColumn = columnFor("year");
  const isoColumn = columnFor("iso");
  const rateColumn = columnFor("ltrate");
  if (!yearColumn || !isoColumn || !rateColumn) throw new Error("JST workbook is missing year, iso or ltrate.");
  return new Map(rows.slice(1)
    .filter((row) => row[isoColumn] === "DEU")
    .map((row) => [Number(row[yearColumn]), Number(row[rateColumn])])
    .filter(([year, rate]) => Number.isInteger(year) && Number.isFinite(rate)));
}

function bundesbankFirstTradingDayRates(csvPath) {
  const rates = new Map();
  for (const line of readFileSync(csvPath, "utf8").split(/\r?\n/)) {
    const match = /^(\d{4})-\d{2}-\d{2},(-?\d+(?:\.\d+)?),/.exec(line.replace(/^\uFEFF/, ""));
    if (!match) continue;
    const year = Number(match[1]);
    if (!rates.has(year)) rates.set(year, Number(match[2]));
  }
  return rates;
}

function affineCalibration(proxyRates, exactRates) {
  const overlap = [...exactRates]
    .filter(([year]) => proxyRates.has(year))
    .map(([year, exact]) => ({ exact, proxy: proxyRates.get(year) }));
  const n = overlap.length;
  if (n < 2) throw new Error("At least two overlapping years are required for calibration.");
  const sumProxy = overlap.reduce((sum, row) => sum + row.proxy, 0);
  const sumExact = overlap.reduce((sum, row) => sum + row.exact, 0);
  const sumProxySquared = overlap.reduce((sum, row) => sum + row.proxy ** 2, 0);
  const sumCross = overlap.reduce((sum, row) => sum + row.proxy * row.exact, 0);
  const slope = (n * sumCross - sumProxy * sumExact) / (n * sumProxySquared - sumProxy ** 2);
  return { intercept: (sumExact - slope * sumProxy) / n, slope, overlapYears: n };
}

function interpolatedRate(rates, year) {
  if (rates.has(year)) return rates.get(year);
  const priorYear = [...rates.keys()].filter((candidate) => candidate < year).sort((a, b) => b - a)[0];
  const nextYear = [...rates.keys()].filter((candidate) => candidate > year).sort((a, b) => a - b)[0];
  if (!Number.isFinite(priorYear) || !Number.isFinite(nextYear)) return null;
  const weight = (year - priorYear) / (nextYear - priorYear);
  return rates.get(priorYear) + (rates.get(nextYear) - rates.get(priorYear)) * weight;
}

export function buildBasisRateSeries({ jstWorkbook, bundesbankCsv }) {
  const proxyRates = jstGermanLongRates(jstWorkbook);
  const exactRates = bundesbankFirstTradingDayRates(bundesbankCsv);
  const calibration = affineCalibration(proxyRates, exactRates);
  const firstExactYear = Math.min(...exactRates.keys());
  const rows = [];
  for (let year = FIRST_YEAR; year <= LAST_YEAR; year += 1) {
    if (exactRates.has(year)) {
      rows.push({ year, rate: exactRates.get(year), source: "bundesbank_15y_par_yield" });
      continue;
    }
    const proxy = interpolatedRate(proxyRates, year);
    if (!Number.isFinite(proxy) || year >= firstExactYear) {
      throw new Error(`Missing Basiszins input for ${year}.`);
    }
    rows.push({
      year,
      rate: calibration.intercept + calibration.slope * proxy,
      source: proxyRates.has(year)
        ? "jst_deu_ltrate_affine_proxy"
        : "jst_deu_ltrate_interpolated_affine_proxy",
    });
  }
  return { calibration, rows };
}

function renderCsv(result) {
  const lines = ["year,basis_rate,source"];
  for (const row of result.rows) {
    lines.push(`${row.year},${row.rate.toFixed(6)},${row.source}`);
  }
  return `${lines.join("\n")}\n`;
}

function runCli() {
  const options = parseArguments(process.argv.slice(2));
  const result = buildBasisRateSeries({
    jstWorkbook: resolve(options.jst),
    bundesbankCsv: resolve(options.bundesbank),
  });
  writeFileSync(resolve(options.output), renderCsv(result), "utf8");
  console.log(JSON.stringify(result.calibration));
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) runCli();
