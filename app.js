const MARKET_DATA_PATH = "./chart-2.csv";
const CPI_DATA_PATH = "./germany_monthly_cpi_1978_2025.csv";
const BOOTSTRAP_BLOCK_MONTHS = 15 * 12;
const SIMULATION_COUNT = 2500;
const MAX_AGE = 90;
const DEFAULT_THEME = "light";
const INPUT_RECOMPUTE_DEBOUNCE_MS = 180;
const SESSION_STORAGE_KEY = "altersvorsorgedepot.session.v1";
const LEGACY_THEME_STORAGE_KEY = "theme";

const CURRENCY = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const NUMBER = new Intl.NumberFormat("de-DE", {
  maximumFractionDigits: 1,
});

const INCOME_BRACKETS = [
  { id: "zero", label: "0 %", rate: 0.0 },
  { id: "low", label: "20 %", rate: 0.2 },
  { id: "medium", label: "30 %", rate: 0.3 },
  { id: "high", label: "42 %", rate: 0.42 },
];

const CONTRIBUTION_PRESETS = [
  { label: "Min 10", value: 10 },
  { label: "Förderstufe 100", value: 100 },
  { label: "Max Förderung 150", value: 150 },
  { label: "Hoch 570", value: 570 },
];

const colors = {
  markerApplicant: "#bc7a3c",
  markerSpouse: "#8d63d2",
  contributions: "#2e8f9a",
};

const hasDom = typeof document !== "undefined";
const elements = hasDom
  ? {
      themeToggle: document.querySelector("#theme-toggle"),
      ciToggle: document.querySelector("#ci-toggle"),
      inflationToggle: document.querySelector("#inflation-toggle"),
      toggleSpouseButton: document.querySelector("#toggle-spouse"),
      resetSessionButton: document.querySelector("#reset-session"),
      spouseFields: document.querySelector("#spouse-fields"),
      childrenList: document.querySelector("#children-list"),
      childrenHint: document.querySelector("#children-hint"),
      addChildButton: document.querySelector("#add-child"),
      childTemplate: document.querySelector("#child-row-template"),
      form: document.querySelector("#calculator-form"),
      applicantBirthMonth: document.querySelector("#applicant-birth-month"),
      applicantBirthYear: document.querySelector("#applicant-birth-year"),
      applicantContribution: document.querySelector("#applicant-contribution"),
      existingContract: document.querySelector("#existing-contract"),
      applicantIncome: document.querySelector("#applicant-income"),
      spouseBirthMonth: document.querySelector("#spouse-birth-month"),
      spouseBirthYear: document.querySelector("#spouse-birth-year"),
      spouseContribution: document.querySelector("#spouse-contribution"),
      spouseRetirementAge: document.querySelector("#spouse-retirement-age"),
      spouseIncome: document.querySelector("#spouse-income"),
      retirementAge: document.querySelector("#retirement-age"),
      projectedFee: document.querySelector("#projected-fee"),
      dataStatus: document.querySelector("#data-status"),
      errorBanner: document.querySelector("#error-banner"),
      retirementValue: document.querySelector("#retirement-value"),
      withdrawalIncome: document.querySelector("#withdrawal-income"),
      finalRange: document.querySelector("#final-range"),
      averageSupport: document.querySelector("#average-support"),
      rerunSimulationsButton: document.querySelector("#rerun-simulations"),
      chartSvg: document.querySelector("#chart-svg"),
      chartTooltip: document.querySelector("#chart-tooltip"),
      chartWrapper: document.querySelector("#chart-wrapper"),
      chartLegend: document.querySelector("#chart-legend"),
    }
  : {};

let datasets = null;
let recomputeToken = 0;
let recomputeTimer = null;
let simulationSeedOffset = 0;
let latestChartState = null;
let hoverState = null;
const uiState = {
  adjustInflation: true,
  showConfidenceBand: true,
  hasSpouse: false,
};

if (hasDom) {
  initialize();
}

async function initialize() {
  const savedSession = loadSession();
  applyTheme(savedSession?.theme || localStorage.getItem(LEGACY_THEME_STORAGE_KEY) || preferredTheme());
  populateMonthSelect(elements.applicantBirthMonth);
  populateMonthSelect(elements.spouseBirthMonth);
  buildIncomeButtons(elements.applicantIncome);
  buildIncomeButtons(elements.spouseIncome);
  seedDefaults();
  restoreSession(savedSession);
  buildContributionPresets();
  wireEvents();
  syncChartToggleButtons();
  syncSpouseSection();
  saveSession();

  try {
    const [marketCsv, cpiCsv] = await Promise.all([fetchText(MARKET_DATA_PATH), fetchText(CPI_DATA_PATH)]);
    const inflation = parseCpiCsv(cpiCsv);
    const market = parseMarketCsv(marketCsv, inflation);
    datasets = {
      market,
      inflation,
    };
    elements.dataStatus.textContent = buildLoadedMessage(datasets);
    runCalculation();
  } catch (error) {
    showError(error.message);
    elements.dataStatus.textContent = "Lokale Daten konnten nicht geladen werden.";
  }
}

function preferredTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : DEFAULT_THEME;
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

function seedDefaults() {
  uiState.adjustInflation = true;
  uiState.showConfidenceBand = true;
  uiState.hasSpouse = false;
  elements.applicantBirthMonth.value = "6";
  elements.applicantBirthYear.value = "1990";
  elements.applicantContribution.value = "150";
  elements.existingContract.value = "0";
  elements.retirementAge.value = "67";
  elements.projectedFee.value = "0.2";
  elements.spouseBirthMonth.value = "6";
  elements.spouseBirthYear.value = "1992";
  elements.spouseContribution.value = "150";
  elements.spouseRetirementAge.value = "67";
  setIncomeSelection(elements.applicantIncome, "medium");
  setIncomeSelection(elements.spouseIncome, "medium");
  clearChildren();
}

function buildIncomeButtons(container) {
  container.innerHTML = "";
  for (const bracket of INCOME_BRACKETS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tax-button";
    button.dataset.rateId = bracket.id;
    button.dataset.rateValue = String(bracket.rate);
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", "false");
    button.textContent = bracket.label;
    button.addEventListener("click", () => {
      setIncomeSelection(container, bracket.id);
      saveSession();
      runCalculation();
    });
    container.append(button);
  }
  setIncomeSelection(container, "medium");
}

function setIncomeSelection(container, rateId) {
  container.dataset.selectedRateId = rateId;
  for (const button of container.querySelectorAll(".tax-button")) {
    const isActive = button.dataset.rateId === rateId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-checked", String(isActive));
  }
}

function populateMonthSelect(select) {
  select.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Monat";
  select.append(placeholder);

  for (let month = 1; month <= 12; month += 1) {
    const option = document.createElement("option");
    option.value = String(month);
    option.textContent = String(month);
    select.append(option);
  }
}

function buildContributionPresets() {
  for (const row of document.querySelectorAll(".preset-row")) {
    row.innerHTML = "";
    const target = document.querySelector(`#${row.dataset.target}`);
    for (const preset of CONTRIBUTION_PRESETS) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preset-button";
      button.textContent = preset.label;
      button.addEventListener("click", () => {
        target.value = preset.value;
        saveSession();
        runCalculation();
      });
      row.append(button);
    }
  }
}

function wireEvents() {
  elements.themeToggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    saveSession();
    if (latestChartState) {
      renderChart(latestChartState);
    }
  });

  elements.inflationToggle.addEventListener("click", () => {
    uiState.adjustInflation = !uiState.adjustInflation;
    syncChartToggleButtons();
    saveSession();
    rerenderOutputs();
  });

  elements.ciToggle.addEventListener("click", () => {
    uiState.showConfidenceBand = !uiState.showConfidenceBand;
    syncChartToggleButtons();
    saveSession();
    if (latestChartState) {
      renderChart(latestChartState);
    }
  });

  elements.toggleSpouseButton.addEventListener("click", () => {
    uiState.hasSpouse = !uiState.hasSpouse;
    syncSpouseSection();
    saveSession();
    runCalculation();
  });

  elements.form.addEventListener("input", () => {
    saveSession();
    scheduleCalculation();
  });
  elements.form.addEventListener("change", () => {
    saveSession();
    runCalculation();
  });

  elements.addChildButton.addEventListener("click", () => {
    addChildRow();
    saveSession();
    runCalculation();
  });

  elements.resetSessionButton.addEventListener("click", resetSession);
  elements.rerunSimulationsButton.addEventListener("click", () => {
    simulationSeedOffset += 1;
    runCalculation();
  });
}

function addChildRow(initialValue = "") {
  const fragment = elements.childTemplate.content.cloneNode(true);
  const row = fragment.querySelector(".child-row");
  const monthSelect = fragment.querySelector(".child-birth-month");
  const yearInput = fragment.querySelector(".child-birth-year");
  populateMonthSelect(monthSelect);
  if (initialValue?.month) {
    monthSelect.value = String(initialValue.month);
  }
  if (initialValue?.year) {
    yearInput.value = String(initialValue.year);
  }
  row.querySelector(".remove-child").addEventListener("click", () => {
    row.remove();
    syncChildLabels();
    syncChildrenHint();
    saveSession();
    runCalculation();
  });
  monthSelect.addEventListener("input", () => {
    saveSession();
    scheduleCalculation();
  });
  yearInput.addEventListener("input", () => {
    saveSession();
    scheduleCalculation();
  });
  elements.childrenList.append(fragment);
  syncChildLabels();
  syncChildrenHint();
}

function scheduleCalculation() {
  if (recomputeTimer !== null) {
    clearTimeout(recomputeTimer);
  }
  recomputeTimer = window.setTimeout(() => {
    recomputeTimer = null;
    runCalculation();
  }, INPUT_RECOMPUTE_DEBOUNCE_MS);
}

function clearChildren() {
  elements.childrenList.innerHTML = "";
  syncChildrenHint();
}

function syncChildLabels() {
  const rows = elements.childrenList.querySelectorAll(".child-row");
  rows.forEach((row, index) => {
    const label = row.querySelector(".child-label");
    if (!label) {
      return;
    }
    label.textContent = index === 0 ? "Geburtsdatum Kind" : `Geburtsdatum Kind ${toRoman(index + 1)}`;
  });
}

function syncChildrenHint() {
  const hasChildren = elements.childrenList.querySelector(".child-row") !== null;
  elements.childrenHint.classList.toggle("hidden", !hasChildren);
}

function toRoman(value) {
  const numerals = [
    { value: 1000, numeral: "M" },
    { value: 900, numeral: "CM" },
    { value: 500, numeral: "D" },
    { value: 400, numeral: "CD" },
    { value: 100, numeral: "C" },
    { value: 90, numeral: "XC" },
    { value: 50, numeral: "L" },
    { value: 40, numeral: "XL" },
    { value: 10, numeral: "X" },
    { value: 9, numeral: "IX" },
    { value: 5, numeral: "V" },
    { value: 4, numeral: "IV" },
    { value: 1, numeral: "I" },
  ];
  let remainder = value;
  let output = "";
  for (const entry of numerals) {
    while (remainder >= entry.value) {
      output += entry.numeral;
      remainder -= entry.value;
    }
  }
  return output;
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || parsed.version !== 1) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

function restoreSession(session) {
  if (!session) {
    return;
  }

  if (session.theme === "dark" || session.theme === "light") {
    applyTheme(session.theme);
  }

  if (session.applicant) {
    setMonthYearFields(elements.applicantBirthMonth, elements.applicantBirthYear, session.applicant.birthdate);
    setInputValue(elements.applicantContribution, session.applicant.monthlyContribution);
    setInputValue(elements.existingContract, session.applicant.initialBalance);
    setStoredIncomeSelection(elements.applicantIncome, session.applicant.incomeRateId);
  }

  if (session.spouse) {
    uiState.hasSpouse = Boolean(session.spouse.enabled);
    setMonthYearFields(elements.spouseBirthMonth, elements.spouseBirthYear, session.spouse.birthdate);
    setInputValue(elements.spouseContribution, session.spouse.monthlyContribution);
    setInputValue(elements.spouseRetirementAge, session.spouse.retirementAge);
    setStoredIncomeSelection(elements.spouseIncome, session.spouse.incomeRateId);
  }

  if (session.controls) {
    setInputValue(elements.retirementAge, session.controls.retirementAge);
    setInputValue(elements.projectedFee, session.controls.projectedFee);
    if (typeof session.controls.adjustInflation === "boolean") {
      uiState.adjustInflation = session.controls.adjustInflation;
    }
    if (typeof session.controls.showConfidenceBand === "boolean") {
      uiState.showConfidenceBand = session.controls.showConfidenceBand;
    }
  }

  if (Array.isArray(session.children)) {
    clearChildren();
    for (const child of session.children) {
      addChildRow(child);
    }
  }
}

function setMonthYearFields(monthSelect, yearInput, birthdate) {
  if (!birthdate || typeof birthdate !== "object") {
    return;
  }
  if (birthdate.month !== undefined) {
    monthSelect.value = String(birthdate.month);
  }
  if (birthdate.year !== undefined) {
    yearInput.value = String(birthdate.year);
  }
}

function setInputValue(element, value) {
  if (value === undefined || value === null || value === "") {
    return;
  }
  element.value = String(value);
}

function setStoredIncomeSelection(container, rateId) {
  const resolvedRateId = INCOME_BRACKETS.some((bracket) => bracket.id === rateId) ? rateId : "medium";
  setIncomeSelection(container, resolvedRateId);
}

function snapshotSession() {
  return {
    version: 1,
    theme: document.documentElement.dataset.theme || DEFAULT_THEME,
    applicant: {
      birthdate: snapshotMonthYear(elements.applicantBirthMonth.value, elements.applicantBirthYear.value),
      monthlyContribution: elements.applicantContribution.value,
      initialBalance: elements.existingContract.value,
      incomeRateId: elements.applicantIncome.dataset.selectedRateId || "medium",
    },
    spouse: {
      enabled: uiState.hasSpouse,
      birthdate: snapshotMonthYear(elements.spouseBirthMonth.value, elements.spouseBirthYear.value),
      monthlyContribution: elements.spouseContribution.value,
      retirementAge: elements.spouseRetirementAge.value,
      incomeRateId: elements.spouseIncome.dataset.selectedRateId || "medium",
    },
    children: Array.from(elements.childrenList.querySelectorAll(".child-row")).map((row) =>
      snapshotMonthYear(
        row.querySelector(".child-birth-month")?.value,
        row.querySelector(".child-birth-year")?.value,
      ),
    ),
    controls: {
      retirementAge: elements.retirementAge.value,
      projectedFee: elements.projectedFee.value,
      adjustInflation: uiState.adjustInflation,
      showConfidenceBand: uiState.showConfidenceBand,
    },
  };
}

function snapshotMonthYear(monthValue, yearValue) {
  return {
    month: monthValue ? Number(monthValue) : "",
    year: yearValue ? Number(yearValue) : "",
  };
}

function saveSession() {
  const session = snapshotSession();
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  localStorage.setItem(LEGACY_THEME_STORAGE_KEY, session.theme);
}

function resetSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
  applyTheme(preferredTheme());
  seedDefaults();
  syncChartToggleButtons();
  syncSpouseSection();
  hoverState = null;
  elements.chartTooltip.classList.add("hidden");
  latestChartState = null;
  saveSession();
  if (datasets) {
    runCalculation();
  }
}

async function fetchText(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${path} konnte nicht geladen werden.`);
  }
  return response.text();
}

function parseMarketCsv(csvText, inflation) {
  const lines = csvText.trim().split(/\r?\n/);
  const levels = lines.slice(1).map((line) => {
    const [month, value] = line.split(",");
    const [mm, yyyy] = month.split("/");
    return {
      key: `${yyyy}-${String(mm).padStart(2, "0")}`,
      date: new Date(Number(yyyy), Number(mm) - 1, 1),
      level: Number(value),
    };
  });

  if (levels.length < BOOTSTRAP_BLOCK_MONTHS + 1) {
    throw new Error("Zu wenig Historie fuer 15-Jahres-Bootstraps.");
  }

  const returns = [];
  for (let index = 1; index < levels.length; index += 1) {
    returns.push({
      key: levels[index].key,
      value: levels[index].level / levels[index - 1].level - 1,
    });
  }

  const bootstrapSeries = returns
    .filter((entry) => inflation.lookup.has(entry.key) && inflation.monthlyRatios.has(entry.key))
    .map((entry) => ({
      key: entry.key,
      marketReturn: entry.value,
      inflationRatio: inflation.monthlyRatios.get(entry.key),
    }));

  if (bootstrapSeries.length < BOOTSTRAP_BLOCK_MONTHS + 1) {
    throw new Error("Zu wenig ueberlappende Markt- und Inflationshistorie fuer 15-Jahres-Bootstraps.");
  }

  return { levels, returns, bootstrapSeries };
}

function parseCpiCsv(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  const entries = lines.slice(1).map((line) => {
    const [date, value] = line.split(",");
    return {
      key: date.slice(0, 7),
      date: new Date(date),
      value: Number(value),
    };
  });

  if (entries.length === 0) {
    throw new Error("Die CPI-Datei enthaelt keine Werte.");
  }

  const lookup = new Map(entries.map((entry) => [entry.key, entry.value]));
  const monthlyRatios = new Map();
  for (let index = 1; index < entries.length; index += 1) {
    monthlyRatios.set(entries[index].key, entries[index].value / entries[index - 1].value);
  }
  return { entries, lookup, monthlyRatios };
}

function buildLoadedMessage(data) {
  const overlapStart = parseSeriesMonthKey(data.market.bootstrapSeries[0]?.key);
  const overlapEnd = parseSeriesMonthKey(data.market.bootstrapSeries.at(-1)?.key);
  return `${data.market.bootstrapSeries.length} Monate mit ETF- und Inflationsdaten (${formatMonth(overlapStart)} bis ${formatMonth(overlapEnd)}).`;
}

function parseSeriesMonthKey(key) {
  const [year, month] = String(key).split("-");
  return new Date(Number(year), Number(month) - 1, 1);
}

function showError(message) {
  elements.errorBanner.textContent = message;
  elements.errorBanner.classList.remove("hidden");
}

function clearError() {
  elements.errorBanner.classList.add("hidden");
  elements.errorBanner.textContent = "";
}

function readHouseholdState() {
  const applicantBirthdate = parseMonthYearInput(elements.applicantBirthMonth.value, elements.applicantBirthYear.value);
  const spouseBirthdate = uiState.hasSpouse
    ? parseMonthYearInput(elements.spouseBirthMonth.value, elements.spouseBirthYear.value)
    : null;
  const retirementAge = clamp(Number(elements.retirementAge.value) || 67, 50, 75);
  const spouseRetirementAge = clamp(Number(elements.spouseRetirementAge.value) || 67, 50, 75);
  const annualFeeRate = sanitizePercent(elements.projectedFee.value, 1.5);

  if (!applicantBirthdate) {
    throw new Error("Bitte das Geburtsdatum der antragstellenden Person eingeben.");
  }

  if (uiState.hasSpouse && !spouseBirthdate) {
    throw new Error("Bitte das Geburtsdatum der Partnerperson eingeben.");
  }

  const children = Array.from(elements.childrenList.querySelectorAll(".child-row"))
    .map((row) =>
      parseMonthYearInput(
        row.querySelector(".child-birth-month")?.value,
        row.querySelector(".child-birth-year")?.value,
      ),
    )
    .filter(Boolean);

  return {
    applicant: {
      birthdate: applicantBirthdate,
      monthlyContribution: sanitizeMoney(elements.applicantContribution.value),
      initialBalance: sanitizeMoney(elements.existingContract.value),
      retirementAge,
      incomeRate: selectedIncomeRate(elements.applicantIncome),
    },
    spouse: uiState.hasSpouse
      ? {
          birthdate: spouseBirthdate,
          monthlyContribution: sanitizeMoney(elements.spouseContribution.value),
          retirementAge: spouseRetirementAge,
          incomeRate: selectedIncomeRate(elements.spouseIncome),
        }
      : null,
    children,
    annualFeeRate,
  };
}

function parseMonthYearInput(monthValue, yearValue) {
  if (!monthValue || !yearValue) {
    return null;
  }
  const year = Number(yearValue);
  const month = Number(monthValue);
  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return null;
  }
  if (year < 1900 || year > 2050 || month < 1 || month > 12) {
    return null;
  }
  return new Date(year, month - 1, 1);
}

function sanitizeMoney(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function sanitizePercent(value, maxPercent) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return 0;
  }
  return clamp(amount, 0, maxPercent) / 100;
}

function selectedIncomeRate(container) {
  const id = container.dataset.selectedRateId;
  return INCOME_BRACKETS.find((bracket) => bracket.id === id)?.rate ?? 0;
}

function runCalculation() {
  if (recomputeTimer !== null) {
    clearTimeout(recomputeTimer);
    recomputeTimer = null;
  }
  if (!datasets) {
    return;
  }

  clearError();
  elements.dataStatus.textContent = `${buildLoadedMessage(datasets)} Berechnung laeuft…`;
  const token = ++recomputeToken;

  requestAnimationFrame(() => {
    if (token !== recomputeToken) {
      return;
    }

    try {
      const household = readHouseholdState();
      const result = simulateHousehold(household, datasets);
      hoverState = null;
      elements.chartTooltip.classList.add("hidden");
      latestChartState = result;
      saveSession();
      renderSummary(result, uiState.adjustInflation);
      renderChart(result);
      elements.dataStatus.textContent = buildLoadedMessage(datasets);
    } catch (error) {
      showError(error.message);
    }
  });
}

function simulateHousehold(household, data) {
  const now = new Date();
  const applicantAge = preciseAge(household.applicant.birthdate, now);
  if (applicantAge >= MAX_AGE) {
    throw new Error("Die antragstellende Person ist bereits 90 oder aelter. Damit gibt es keinen Projektionshorizont mehr.");
  }

  const years = Math.ceil(MAX_AGE - applicantAge);
  const totalMonths = years * 12;
  const paths = {
    householdNominal: Array.from({ length: years + 1 }, () => []),
    householdReal: Array.from({ length: years + 1 }, () => []),
    applicantNominal: Array.from({ length: years + 1 }, () => []),
    applicantReal: Array.from({ length: years + 1 }, () => []),
    spouseNominal: Array.from({ length: years + 1 }, () => []),
    spouseReal: Array.from({ length: years + 1 }, () => []),
    contributionsNominal: Array.from({ length: years + 1 }, () => []),
    contributionsReal: Array.from({ length: years + 1 }, () => []),
    withdrawalsNominal: Array.from({ length: years + 1 }, () => []),
    withdrawalsReal: Array.from({ length: years + 1 }, () => []),
  };

  let aggregateSupport = 0;

  for (let iteration = 0; iteration < SIMULATION_COUNT; iteration += 1) {
    const random = mulberry32(seedForIteration(iteration, simulationSeedOffset));
    const bootstrap = makeBootstrapPath(data.market.bootstrapSeries, totalMonths, random);
    const path = projectPath(household, bootstrap, now, years);
    aggregateSupport += path.totalSupport;

    for (let yearIndex = 0; yearIndex <= years; yearIndex += 1) {
      paths.householdNominal[yearIndex].push(path.householdNominal[yearIndex]);
      paths.householdReal[yearIndex].push(path.householdReal[yearIndex]);
      paths.applicantNominal[yearIndex].push(path.applicantNominal[yearIndex]);
      paths.applicantReal[yearIndex].push(path.applicantReal[yearIndex]);
      paths.spouseNominal[yearIndex].push(path.spouseNominal[yearIndex]);
      paths.spouseReal[yearIndex].push(path.spouseReal[yearIndex]);
      paths.contributionsNominal[yearIndex].push(path.householdContributionNominal[yearIndex]);
      paths.contributionsReal[yearIndex].push(path.householdContributionReal[yearIndex]);
      paths.withdrawalsNominal[yearIndex].push(path.householdWithdrawalNominal[yearIndex]);
      paths.withdrawalsReal[yearIndex].push(path.householdWithdrawalReal[yearIndex]);
    }
  }

  const yearlyStats = [];
  const spouseAgeNow = household.spouse ? preciseAge(household.spouse.birthdate, now) : null;

  for (let yearIndex = 0; yearIndex <= years; yearIndex += 1) {
    yearlyStats.push({
      yearIndex,
      pointDate: addMonths(now, yearIndex * 12),
      applicantAge: applicantAge + yearIndex,
      spouseAge: spouseAgeNow === null ? null : spouseAgeNow + yearIndex,
      nominal: {
        household: summarizeSamples(paths.householdNominal[yearIndex]),
        applicant: summarizeSamples(paths.applicantNominal[yearIndex]),
        spouse: summarizeSamples(paths.spouseNominal[yearIndex]),
        contributions: summarizeSamples(paths.contributionsNominal[yearIndex]),
        withdrawals: summarizeSamples(paths.withdrawalsNominal[yearIndex]),
      },
      real: {
        household: summarizeSamples(paths.householdReal[yearIndex]),
        applicant: summarizeSamples(paths.applicantReal[yearIndex]),
        spouse: summarizeSamples(paths.spouseReal[yearIndex]),
        contributions: summarizeSamples(paths.contributionsReal[yearIndex]),
        withdrawals: summarizeSamples(paths.withdrawalsReal[yearIndex]),
      },
    });
  }

  const retirementYear = clamp(Math.round(household.applicant.retirementAge - applicantAge), 0, years);
  const spouseRetirementYear =
    spouseAgeNow === null ? null : clamp(Math.round(household.spouse.retirementAge - spouseAgeNow), 0, years);
  const preRetirementYear = Math.max(retirementYear, spouseRetirementYear ?? retirementYear);

  return {
    years,
    yearlyStats,
    retirementYear,
    spouseRetirementYear,
    preRetirementYear,
    averageAnnualSupport: aggregateSupport / (SIMULATION_COUNT * years),
    hasSpouse: Boolean(household.spouse),
  };
}

function projectPath(household, bootstrap, now, years) {
  let applicantValue = household.applicant.initialBalance;
  let spouseValue = 0;
  let totalSupport = 0;
  let householdContributionValue = 0;
  let householdContributionRealValue = 0;
  let cumulativeInflation = 1;
  const monthlyFeeFactor = Math.pow(1 - household.annualFeeRate, 1 / 12);
  let applicantMonthlyWithdrawalReal = 0;
  let spouseMonthlyWithdrawalReal = 0;

  const applicantNominal = [applicantValue];
  const spouseNominal = [0];
  const householdNominal = [applicantValue];
  const applicantReal = [applicantValue];
  const spouseReal = [0];
  const householdReal = [applicantValue];
  const householdContributionNominal = [0];
  const householdContributionReal = [0];
  const householdWithdrawalNominal = [0];
  const householdWithdrawalReal = [0];

  let applicantAnnualContribution = 0;
  let spouseAnnualContribution = 0;

  for (let monthIndex = 0; monthIndex < bootstrap.length; monthIndex += 1) {
    const monthlySample = bootstrap[monthIndex];
    const monthlyReturn = monthlySample.marketReturn;
    const monthDate = addMonths(now, monthIndex);
    const nextMonthDate = addMonths(now, monthIndex + 1);

    const applicantAgeAtMonth = preciseAge(household.applicant.birthdate, monthDate);
    const applicantContribution =
      applicantAgeAtMonth < household.applicant.retirementAge ? household.applicant.monthlyContribution : 0;
    applicantValue = (applicantValue * (1 + monthlyReturn) + applicantContribution) * monthlyFeeFactor;
    if (
      applicantMonthlyWithdrawalReal === 0 &&
      preciseAge(household.applicant.birthdate, nextMonthDate) >= household.applicant.retirementAge
    ) {
      applicantMonthlyWithdrawalReal = ((applicantValue / cumulativeInflation) * 0.04) / 12;
    }
    applicantValue = Math.max(applicantValue - applicantMonthlyWithdrawalReal * cumulativeInflation, 0);
    applicantAnnualContribution += applicantContribution;
    householdContributionValue += applicantContribution;
    householdContributionRealValue += applicantContribution / cumulativeInflation;

    let spouseContribution = 0;
    if (household.spouse) {
      const spouseAgeAtMonth = preciseAge(household.spouse.birthdate, monthDate);
      spouseContribution = spouseAgeAtMonth < household.spouse.retirementAge ? household.spouse.monthlyContribution : 0;
      spouseValue = (spouseValue * (1 + monthlyReturn) + spouseContribution) * monthlyFeeFactor;
      if (
        spouseMonthlyWithdrawalReal === 0 &&
        preciseAge(household.spouse.birthdate, nextMonthDate) >= household.spouse.retirementAge
      ) {
        spouseMonthlyWithdrawalReal = ((spouseValue / cumulativeInflation) * 0.04) / 12;
      }
      spouseValue = Math.max(spouseValue - spouseMonthlyWithdrawalReal * cumulativeInflation, 0);
      spouseAnnualContribution += spouseContribution;
      householdContributionValue += spouseContribution;
      householdContributionRealValue += spouseContribution / cumulativeInflation;
    }

    cumulativeInflation *= monthlySample.inflationRatio;

    if ((monthIndex + 1) % 12 === 0) {
      const yearEndDate = addMonths(now, monthIndex + 1);
      const yearIndex = (monthIndex + 1) / 12;
      const support = annualSupportForYear(household, {
        applicantAnnualContribution,
        spouseAnnualContribution,
        yearEndDate,
        yearIndex,
      });

      applicantValue += support.applicant;
      spouseValue += support.spouse;
      totalSupport += support.applicant + support.spouse;

      applicantNominal.push(applicantValue);
      spouseNominal.push(spouseValue);
      householdNominal.push(applicantValue + spouseValue);
      applicantReal.push(applicantValue / cumulativeInflation);
      spouseReal.push(spouseValue / cumulativeInflation);
      householdReal.push((applicantValue + spouseValue) / cumulativeInflation);
      householdContributionNominal.push(householdContributionValue);
      householdContributionReal.push(householdContributionRealValue);
      householdWithdrawalNominal.push((applicantMonthlyWithdrawalReal + spouseMonthlyWithdrawalReal) * cumulativeInflation);
      householdWithdrawalReal.push(applicantMonthlyWithdrawalReal + spouseMonthlyWithdrawalReal);

      applicantAnnualContribution = 0;
      spouseAnnualContribution = 0;
    }
  }

  while (applicantNominal.length <= years) {
    applicantNominal.push(applicantValue);
    spouseNominal.push(spouseValue);
    householdNominal.push(applicantValue + spouseValue);
    applicantReal.push(applicantValue / cumulativeInflation);
    spouseReal.push(spouseValue / cumulativeInflation);
    householdReal.push((applicantValue + spouseValue) / cumulativeInflation);
    householdContributionNominal.push(householdContributionValue);
    householdContributionReal.push(householdContributionRealValue);
    householdWithdrawalNominal.push((applicantMonthlyWithdrawalReal + spouseMonthlyWithdrawalReal) * cumulativeInflation);
    householdWithdrawalReal.push(applicantMonthlyWithdrawalReal + spouseMonthlyWithdrawalReal);
  }

  return {
    applicantNominal,
    spouseNominal,
    householdNominal,
    applicantReal,
    spouseReal,
    householdReal,
    householdContributionNominal,
    householdContributionReal,
    householdWithdrawalNominal,
    householdWithdrawalReal,
    totalSupport,
  };
}

function annualSupportForYear(household, context) {
  const applicantBase = baseSubsidy(context.applicantAnnualContribution);
  const spouseBase = household.spouse ? baseSubsidy(context.spouseAnnualContribution) : 0;

  const applicantStarter =
    context.yearIndex === 1 &&
    preciseAge(household.applicant.birthdate, addMonths(context.yearEndDate, -12)) < 25 &&
    context.applicantAnnualContribution > 0
      ? 200
      : 0;

  const spouseStarter =
    household.spouse &&
    context.yearIndex === 1 &&
    preciseAge(household.spouse.birthdate, addMonths(context.yearEndDate, -12)) < 25 &&
    context.spouseAnnualContribution > 0
      ? 200
      : 0;

  const eligibleChildren = household.children.filter((birthdate) => preciseAge(birthdate, context.yearEndDate) < 18).length;
  const applicantEligibleChildBase = Math.min(context.applicantAnnualContribution, 1200);
  const spouseEligibleChildBase = Math.min(context.spouseAnnualContribution, 1200);
  const householdEligibleChildBase = Math.min(applicantEligibleChildBase + spouseEligibleChildBase, 1200);
  const childSubsidyTotal = eligibleChildren * 0.25 * householdEligibleChildBase;
  const contributionWeightTotal = applicantEligibleChildBase + spouseEligibleChildBase;

  const applicantChildSubsidy =
    contributionWeightTotal > 0 ? childSubsidyTotal * (applicantEligibleChildBase / contributionWeightTotal) : 0;
  const spouseChildSubsidy =
    contributionWeightTotal > 0 ? childSubsidyTotal * (spouseEligibleChildBase / contributionWeightTotal) : 0;

  const applicantDirect = applicantBase + applicantStarter + applicantChildSubsidy;
  const spouseDirect = spouseBase + spouseStarter + spouseChildSubsidy;
  const applicantTax = Math.max(Math.min(context.applicantAnnualContribution, 1800) * household.applicant.incomeRate - applicantDirect, 0);
  const spouseTax = household.spouse
    ? Math.max(Math.min(context.spouseAnnualContribution, 1800) * household.spouse.incomeRate - spouseDirect, 0)
    : 0;

  return {
    applicant: applicantDirect + applicantTax,
    spouse: spouseDirect + spouseTax,
  };
}

function baseSubsidy(annualContribution) {
  const firstTier = Math.min(annualContribution, 1200) * 0.3;
  const secondTier = Math.min(Math.max(annualContribution - 1200, 0), 600) * 0.2;
  return firstTier + secondTier;
}

function makeBootstrapPath(monthlyReturns, targetMonths, random) {
  const maxStart = monthlyReturns.length - BOOTSTRAP_BLOCK_MONTHS;
  const output = [];

  while (output.length < targetMonths) {
    const start = Math.floor(random() * (maxStart + 1));
    const block = monthlyReturns.slice(start, start + BOOTSTRAP_BLOCK_MONTHS);
    for (const item of block) {
      output.push(item);
      if (output.length === targetMonths) {
        break;
      }
    }
  }

  return output;
}

function seedForIteration(iteration, offset = 0) {
  return (0x9e3779b9 ^ (iteration + 1) * 0x85ebca6b ^ (offset + 1) * 0xc2b2ae35) >>> 0;
}

function mulberry32(seed) {
  let current = seed >>> 0;
  return function next() {
    current |= 0;
    current = (current + 0x6d2b79f5) | 0;
    let result = Math.imul(current ^ (current >>> 15), 1 | current);
    result = (result + Math.imul(result ^ (result >>> 7), 61 | result)) ^ result;
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function summarizeSamples(samples) {
  const sorted = [...samples].sort((left, right) => left - right);
  const mean = samples.reduce((total, sample) => total + sample, 0) / Math.max(samples.length, 1);
  return {
    mean,
    p2_5: percentile(sorted, 0.025),
    median: percentile(sorted, 0.5),
    p97_5: percentile(sorted, 0.975),
  };
}

function percentile(sortedSamples, quantile) {
  if (sortedSamples.length === 0) {
    return 0;
  }
  const index = (sortedSamples.length - 1) * quantile;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) {
    return sortedSamples[lower];
  }
  const weight = index - lower;
  return sortedSamples[lower] * (1 - weight) + sortedSamples[upper] * weight;
}

function preciseAge(birthdate, referenceDate) {
  return (referenceDate - birthdate) / (365.2425 * 24 * 60 * 60 * 1000);
}

function addMonths(date, months) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

function formatMonth(date) {
  return date.toLocaleDateString("de-DE", { month: "short", year: "numeric" });
}

function formatAxisDate(date) {
  return date.toLocaleDateString("de-DE", { year: "numeric" });
}

function formatTooltipDate(date) {
  return date.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
}

function seriesTypeForResult(result) {
  return result.adjustedForInflation ? "real" : "nominal";
}

function renderSummary(result, adjustInflation) {
  result.adjustedForInflation = adjustInflation;
  const summary = retirementSummaryValues(result, adjustInflation);

  const summaryEls = [elements.retirementValue, elements.withdrawalIncome, elements.finalRange, elements.averageSupport];
  elements.retirementValue.textContent = CURRENCY.format(summary.retirementValue);
  elements.withdrawalIncome.textContent = CURRENCY.format(summary.withdrawalIncome);
  elements.finalRange.textContent = formatCompactRangeEuro(summary.finalRangeMin, summary.finalRangeMax);
  elements.averageSupport.textContent = CURRENCY.format(summary.averageSupport);
  for (const el of summaryEls) {
    el.classList.remove("value-updated");
    void el.offsetWidth;
    el.classList.add("value-updated");
  }

  if (adjustInflation) {
    elements.dataStatus.textContent += " Inflationsbereinigt.";
  } else {
    elements.dataStatus.textContent += " Nominal.";
  }
}

function retirementSummaryValues(result, adjustInflation) {
  const seriesType = adjustInflation ? "real" : "nominal";
  const retirementStats = result.yearlyStats[result.preRetirementYear][seriesType];
  const withdrawalYearIndex = firstWithdrawalYearIndex(result, seriesType);
  return {
    seriesType,
    retirementValue: retirementStats.household.median,
    withdrawalIncome: result.yearlyStats[withdrawalYearIndex][seriesType].withdrawals.median,
    finalRangeMin: retirementStats.household.p2_5,
    finalRangeMax: retirementStats.household.p97_5,
    averageSupport: result.averageAnnualSupport,
  };
}

function firstWithdrawalYearIndex(result, seriesType) {
  for (let yearIndex = result.preRetirementYear; yearIndex < result.yearlyStats.length; yearIndex += 1) {
    if (result.yearlyStats[yearIndex][seriesType].withdrawals.median > 0) {
      return yearIndex;
    }
  }
  return result.preRetirementYear;
}

function renderChart(result) {
  const svg = elements.chartSvg;
  const width = 920;
  const height = 420;
  const isCompactChart = window.innerWidth <= 720;
  const margin = { top: 20, right: 22, bottom: 44, left: 76 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const seriesType = seriesTypeForResult(result);
  const points = result.yearlyStats;
  const preRetirementPoints = points.slice(0, result.preRetirementYear + 1);
  const yAxis = buildNiceYAxis(resolveChartMaxY(preRetirementPoints, seriesType));
  const maxY = yAxis.max;
  const xScale = (yearIndex) => margin.left + (plotWidth * yearIndex) / Math.max(result.years, 1);
  const yScale = (value) => margin.top + plotHeight - (value / maxY) * plotHeight;

  const gridLines = [];
  for (const value of yAxis.ticks) {
    const y = yScale(value);
    gridLines.push(`<line class="grid-line" x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}"></line>`);
    gridLines.push(`<text x="${margin.left - 12}" y="${y + 4}" text-anchor="end">${compactCurrency(value)}</text>`);
  }

  const xTicks = [];
  const tickCount = Math.min(isCompactChart ? 4 : 6, result.years);
  for (let tick = 0; tick <= tickCount; tick += 1) {
    const yearIndex = Math.round((result.years * tick) / Math.max(tickCount, 1));
    const x = xScale(yearIndex);
    const point = points[yearIndex];
    xTicks.push(`<line class="grid-line" x1="${x}" y1="${margin.top}" x2="${x}" y2="${height - margin.bottom}"></line>`);
    xTicks.push(`<text x="${x}" y="${height - 14}" text-anchor="middle">${formatAxisDate(point.pointDate)}</text>`);
  }

  const bandPrePath = buildBandPath(points.slice(0, result.preRetirementYear + 1), xScale, yScale, seriesType);
  const bandPostPath = buildBandPath(points.slice(result.preRetirementYear), xScale, yScale, seriesType);
  const medianPrePath = buildLinePath(points.slice(0, result.preRetirementYear + 1), xScale, (point) => yScale(point[seriesType].household.median));
  const medianPostPath = buildLinePath(points.slice(result.preRetirementYear), xScale, (point) => yScale(point[seriesType].household.median));
  const contributionsPrePath = buildLinePath(
    points.slice(0, result.preRetirementYear + 1),
    xScale,
    (point) => yScale(point[seriesType].contributions.median),
  );
  const contributionsPostPath = buildLinePath(
    points.slice(result.preRetirementYear),
    xScale,
    (point) => yScale(point[seriesType].contributions.median),
  );
  const hoveredPoint = hoverState ? points[hoverState.yearIndex] : null;
  const hoverX = hoverState ? xScale(hoverState.yearIndex) : null;
  const hoverY = hoveredPoint ? yScale(hoveredPoint[seriesType].household.median) : null;
  const hoverContributionY = hoveredPoint ? yScale(hoveredPoint[seriesType].contributions.median) : null;

  const applicantMarker = markerLine(result.retirementYear, xScale, margin, plotHeight, colors.markerApplicant, "Rente Antrag");
  const spouseMarker =
    result.hasSpouse && result.spouseRetirementYear !== null
      ? markerLine(result.spouseRetirementYear, xScale, margin, plotHeight, colors.markerSpouse, "Rente Partner")
      : "";

  svg.innerHTML = `
    <rect x="0" y="0" width="${width}" height="${height}" fill="transparent"></rect>
    ${gridLines.join("")}
    ${xTicks.join("")}
    <line class="axis-line" x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}"></line>
    ${uiState.showConfidenceBand && bandPrePath ? `<path class="band-area" d="${bandPrePath}"></path>` : ""}
    ${uiState.showConfidenceBand && bandPostPath ? `<path class="band-area chart-segment-post" d="${bandPostPath}"></path>` : ""}
    ${contributionsPrePath ? `<path class="contribution-line" d="${contributionsPrePath}"></path>` : ""}
    ${contributionsPostPath ? `<path class="contribution-line chart-segment-post" d="${contributionsPostPath}"></path>` : ""}
    ${medianPrePath ? `<path class="median-line" d="${medianPrePath}"></path>` : ""}
    ${medianPostPath ? `<path class="median-line chart-segment-post" d="${medianPostPath}"></path>` : ""}
    ${applicantMarker}
    ${spouseMarker}
    ${
      hoveredPoint
        ? `<line class="hover-line" x1="${hoverX}" y1="${margin.top}" x2="${hoverX}" y2="${height - margin.bottom}"></line>
           <circle class="hover-dot" cx="${hoverX}" cy="${hoverY}" r="5"></circle>
           <circle class="hover-dot contribution-dot" cx="${hoverX}" cy="${hoverContributionY}" r="4.5"></circle>`
        : ""
    }
    <rect id="hover-capture" x="${margin.left}" y="${margin.top}" width="${plotWidth}" height="${plotHeight}" fill="transparent"></rect>
  `;

  const hoverCapture = svg.querySelector("#hover-capture");
  hoverCapture.addEventListener("pointermove", handleChartHover(result, width, margin, plotWidth));
  hoverCapture.addEventListener("pointerleave", () => {
    hoverState = null;
    elements.chartTooltip.classList.add("hidden");
    renderChart(result);
  });

  renderLegend(result);
  if (hoverState) {
    updateTooltip(result, hoverState.yearIndex, hoverState.pointerX, hoverState.pointerY);
  }
}

function handleChartHover(result, width, margin, plotWidth) {
  return (event) => {
    const bounds = elements.chartSvg.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * width;
    const rawYear = ((x - margin.left) / plotWidth) * result.years;
    hoverState = {
      yearIndex: clamp(Math.round(rawYear), 0, result.years),
      pointerX: event.clientX - bounds.left,
      pointerY: event.clientY - bounds.top,
    };
    updateTooltip(result, hoverState.yearIndex, hoverState.pointerX, hoverState.pointerY);
    renderChart(result);
  };
}

function updateTooltip(result, yearIndex, pointerX = 20, pointerY = 20) {
  const point = result.yearlyStats[yearIndex];
  const type = seriesTypeForResult(result);
  const tooltip = elements.chartTooltip;
  const contributionsLabel = contributionsLabelForResult(result);
  const lines = [
    `<strong>${formatTooltipDate(point.pointDate)}</strong>`,
    `<span>Alter: ${NUMBER.format(point.applicantAge)}</span>`,
  ];

  if (point.spouseAge !== null) {
    lines.push(`<span>Alter Partner: ${NUMBER.format(point.spouseAge)}</span>`);
  }

  lines.push(`<span>Depot Median: ${CURRENCY.format(point[type].household.median)}</span>`);
  lines.push(`<span>${contributionsLabel}: ${CURRENCY.format(point[type].contributions.median)}</span>`);

  lines.push(`<span>95%-Band: ${CURRENCY.format(point[type].household.p2_5)} bis ${CURRENCY.format(point[type].household.p97_5)}</span>`);
  tooltip.innerHTML = lines.join("");
  tooltip.classList.remove("hidden");

  const wrapperBounds = elements.chartWrapper.getBoundingClientRect();
  const tooltipHeight = tooltip.offsetHeight;
  const tooltipWidth = tooltip.offsetWidth;
  const desiredLeft = Math.min(pointerX + 22, wrapperBounds.width - tooltipWidth - 16);
  const desiredTop = Math.min(pointerY + 20, wrapperBounds.height - tooltipHeight - 16);
  tooltip.style.left = `${Math.max(16, desiredLeft)}px`;
  tooltip.style.top = `${Math.max(16, desiredTop)}px`;
}

function renderLegend(result) {
  const valueMode = result.adjustedForInflation ? "Reale Werte" : "Nominale Werte";
  const contributionsLabel = contributionsLabelForResult(result);
  const items = [
    { label: "Depotwert", color: "var(--accent)" },
    { label: contributionsLabel, color: colors.contributions },
    { label: "Rentenbeginn Antrag", color: colors.markerApplicant },
    { label: valueMode, color: "var(--accent-strong)" },
  ];

  if (uiState.showConfidenceBand) {
    items.splice(1, 0, { label: "95%-Band", color: "rgba(72, 151, 123, 0.45)" });
  }

  if (result.hasSpouse) {
    items.push({ label: "Rentenbeginn Partner", color: colors.markerSpouse });
  }

  elements.chartLegend.innerHTML = items
    .map(
      (item) =>
        `<span class="legend-item"><span class="legend-swatch" style="background:${item.color}"></span>${item.label}</span>`,
    )
    .join("");
}

function contributionsLabelForResult(result) {
  return result.hasSpouse ? "Eigene Einzahlungen inkl. Partner" : "Eigene Einzahlungen";
}

function buildBandPath(points, xScale, yScale, type) {
  if (points.length < 2) {
    return "";
  }
  const upper = points.map((point) => `${xScale(point.yearIndex)},${yScale(point[type].household.p97_5)}`).join(" L ");
  const lower = [...points]
    .reverse()
    .map((point) => `${xScale(point.yearIndex)},${yScale(point[type].household.p2_5)}`)
    .join(" L ");
  return `M ${upper} L ${lower} Z`;
}

function buildLinePath(points, xScale, ySelector) {
  if (points.length < 2) {
    return "";
  }
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${xScale(point.yearIndex)} ${ySelector(point)}`).join(" ");
}

function resolveChartMaxY(points, seriesType) {
  const candidates = [];
  for (const point of points) {
    candidates.push(point[seriesType].household.median, point[seriesType].contributions.median);
    if (uiState.showConfidenceBand) {
      candidates.push(point[seriesType].household.p97_5);
    }
  }
  return Math.max(...candidates, 1);
}

function buildNiceYAxis(rawMax) {
  const safeMax = Math.max(rawMax, 1);
  const step = chooseNiceTickStep(safeMax);
  const max = Math.max(step, Math.ceil(safeMax / step) * step);
  return { max, ticks: buildTickValues(max, step), step };
}

function chooseNiceTickStep(rawMax) {
  const targetLabelCount = 5;
  const minimumLabelCount = 4;
  const maximumLabelCount = 6;
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(rawMax, 1)));
  const candidateMultipliers = [1, 2, 2.5, 5, 10];
  let bestStep = magnitude;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const exponentOffset of [-1, 0, 1]) {
    const scaledMagnitude = magnitude * 10 ** exponentOffset;
    for (const multiplier of candidateMultipliers) {
      const step = multiplier * scaledMagnitude;
      const labelCount = Math.floor(Math.ceil(rawMax / step)) + 1;
      if (labelCount < minimumLabelCount || labelCount > maximumLabelCount) {
        continue;
      }
      const score = Math.abs(labelCount - targetLabelCount);
      if (score < bestScore || (score === bestScore && step > bestStep)) {
        bestStep = step;
        bestScore = score;
      }
    }
  }

  if (bestScore !== Number.POSITIVE_INFINITY) {
    return bestStep;
  }

  return magnitude;
}

function buildTickValues(max, step) {
  const ticks = [];
  for (let value = 0; value <= max; value += step) {
    ticks.push(value);
  }
  return ticks;
}

function markerLine(yearIndex, xScale, margin, plotHeight, color, label) {
  const x = xScale(yearIndex);
  return `
    <line class="marker-line" x1="${x}" y1="${margin.top}" x2="${x}" y2="${margin.top + plotHeight}" stroke="${color}"></line>
    <text x="${x + 6}" y="${margin.top + 16}" fill="${color}">${label}</text>
  `;
}

function compactCurrency(value) {
  if (value >= 1_000_000) {
    return `${NUMBER.format(value / 1_000_000)} Mio`;
  }
  if (value >= 1_000) {
    return `${NUMBER.format(value / 1_000)} Tsd`;
  }
  return NUMBER.format(value);
}

function formatCompactRangeEuro(minValue, maxValue) {
  return `${formatRangeThousandsValue(minValue)}-${formatRangeThousandsValue(maxValue)} Tsd. €`;
}

function formatRangeThousandsValue(value) {
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(Math.round(value / 1000));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function syncChartToggleButtons() {
  setToggleState(elements.inflationToggle, uiState.adjustInflation, "Inflationsbereinigung");
  setToggleState(elements.ciToggle, uiState.showConfidenceBand, "95%-Band");
}

function setToggleState(button, isActive, label) {
  button.classList.toggle("active", isActive);
  button.setAttribute("aria-pressed", String(isActive));
  button.textContent = isActive ? `${label} an` : `${label} aus`;
}

function rerenderOutputs() {
  if (!latestChartState || !datasets) {
    return;
  }
  elements.dataStatus.textContent = buildLoadedMessage(datasets);
  renderSummary(latestChartState, uiState.adjustInflation);
  renderChart(latestChartState);
}

function syncSpouseSection() {
  elements.spouseFields.classList.toggle("hidden", !uiState.hasSpouse);
  elements.toggleSpouseButton.textContent = uiState.hasSpouse ? "Partner entfernen" : "Partner hinzufügen";
}

export { addMonths, annualSupportForYear, baseSubsidy, preciseAge, projectPath, retirementSummaryValues };
