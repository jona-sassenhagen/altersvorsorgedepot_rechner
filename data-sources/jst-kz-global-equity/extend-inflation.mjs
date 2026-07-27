#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  DEFAULT_START_YEAR,
  extendGermanInflationCsv,
  readJstWorkbook,
} from "./generate.mjs";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(SCRIPT_DIR, "../..");

function parseArguments(argumentsList) {
  const options = {};
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (!argument.startsWith("--")) {
      throw new Error(`Unexpected argument: ${argument}`);
    }
    const value = argumentsList[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for ${argument}`);
    }
    options[argument.slice(2)] = value;
    index += 1;
  }
  return options;
}

function runCli() {
  const options = parseArguments(process.argv.slice(2));
  if (!options.jst) {
    throw new Error("Missing required --jst /path/to/JSTdatasetR6.xlsx");
  }

  const inputPath = resolve(options.input ?? resolve(PROJECT_ROOT, "inflation.csv"));
  const outputPath = resolve(options.output ?? inputPath);
  const auditPath = resolve(
    options.audit ?? resolve(SCRIPT_DIR, "inflation-annual-backcast.csv"),
  );
  const startYear = options["start-year"]
    ? Number.parseInt(options["start-year"], 10)
    : DEFAULT_START_YEAR;
  const observedStartYear = options["observed-start-year"]
    ? Number.parseInt(options["observed-start-year"], 10)
    : 1955;
  const result = extendGermanInflationCsv({
    jstRows: readJstWorkbook(resolve(options.jst)),
    observedCsv: readFileSync(inputPath, "utf8"),
    startYear,
    observedStartYear,
  });

  writeFileSync(outputPath, result.csv, "utf8");
  writeFileSync(
    auditPath,
    [
      "year,jst_cpi,annual_factor,monthly_factor,method",
      ...result.annualAudit.map(
        (row) =>
          `${row.year},${row.jstCpi},${row.annualFactor},` +
          `${row.monthlyFactor},${row.method}`,
      ),
      "",
    ].join("\n"),
    "utf8",
  );
  console.log(
    `Extended ${outputPath} from ${result.baseline.date} through ` +
      `${result.firstObservedDate}; the observed suffix is unchanged. ` +
      `Audit: ${auditPath}.`,
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
