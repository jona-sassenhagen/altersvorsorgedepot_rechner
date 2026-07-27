const MARKET_DATA_PATH = "./jst_kz_global_equity_monthly.csv";
const CPI_DATA_PATH = "./inflation.csv";
const BOOTSTRAP_BLOCK_MONTHS = 15 * 12;
const SIMULATION_COUNT = 2500;
const MAX_AGE = 90;
const DEFAULT_WITHDRAWAL_RATE = 0.04;
const MIN_WITHDRAWAL_RATE = 0;
const MAX_WITHDRAWAL_RATE = 1;
const WITHDRAWAL_RATE_OPTIONS = [
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
const WITHDRAWAL_SHORTFALL_EPSILON = Number.EPSILON * 32;
const DEFAULT_BIRTH_MONTH = 7;
const DEFAULT_THEME = "dark";
const DEFAULT_LANGUAGE = "de";
const INPUT_RECOMPUTE_DEBOUNCE_MS = 180;
const CHART_LOADING_FRAME_MS = 380;
const CHART_LOADING_SEQUENCE = [".", "..", "..."];
const MAX_CHILDREN = 25;
const SESSION_STORAGE_KEY = "altersvorsorgedepot.session.v1";
const SESSION_VERSION = 5;
const LEGACY_THEME_STORAGE_KEY = "theme";
const DEFAULT_CHILD_BENEFIT_YEARS = 18;
const MIN_CHILD_BENEFIT_YEARS = 16;
const MAX_CHILD_BENEFIT_YEARS = 25;
const RETURN_MODE_HISTORICAL = "historical";
const RETURN_MODE_CUSTOM = "custom";
const SAMPLING_MODE_HISTORICAL_PATHS = "historical-paths";
const SAMPLING_MODE_BLOCK_BOOTSTRAP = "block-bootstrap";
const MIN_EXPECTED_REAL_RETURN = -1;
const MAX_EXPECTED_REAL_RETURN = 1;

const INCOME_BRACKETS = [
  { id: "zero", rate: 0.0 },
  { id: "low", rate: 0.2 },
  { id: "medium", rate: 0.3 },
  { id: "high", rate: 0.42 },
];

const TRANSLATIONS = {
  de: {
    locale: "de-DE",
    htmlLang: "de",
    meta: {
      title: "Altersvorsorgedepot-Rechner",
      description:
        "Statischer Haushaltsrechner für das Altersvorsorgedepot mit vollständigen historischen Weltaktienpfaden ab 1900.",
    },
    hero: { title: "Altersvorsorgedepot-Rechner" },
    themeToggle: { label: "Farbschema umschalten" },
    controls: {
      title: "Haushaltsdaten",
      reset: "Werte<br />zurücksetzen",
      productFee: "Produktkosten pro Jahr",
      expectedRealReturn: "Erwartete reale Rendite p.a.",
      historicalReturnPreset: "Historisch",
      applicant: "Antragstellende Person",
      birthYear: "Geburtsjahr",
      retirementAge: "Renteneintrittsalter",
      existingContractDesktop: "Bestehender<br />Riester-Vertrag €",
      existingContractMobile: "Bestehender Riester €",
      monthlyContribution: "Monatlicher Beitrag €",
      marginalTaxRate: "Grenzsteuersatz",
      spouse: "Partner",
      addSpouse: "Partner hinzufügen",
      removeSpouse: "Partner entfernen",
      children: "Kinder",
      addChild: "Kind hinzufügen",
      removeChild: "Entfernen",
      child: "Kind",
      childBenefitDuration: "Dauer des Kindergeldbezugs",
      years: "Jahre",
      childrenHint: ({ years = DEFAULT_CHILD_BENEFIT_YEARS } = {}) =>
        `Kinder werden bis zum ${years}. Lebensjahr für die modellierte Kinderförderung berücksichtigt.`,
    },
    results: {
      title: "Projektion | Historische Daten",
      simulationCount: ({ count } = {}) =>
        Number.isFinite(count) ? `${formatNumber(count, { maximumFractionDigits: 0 })} historische Pfade` : "Historische Pfade",
      marketSeries: "Weltaktien 1900–2026",
      retirementValue: "Ø Depotwert bei Rentenbeginn",
      withdrawalIncome: "Ø Zusatzrente (Brutto)",
      withdrawalRateCaption: "Entnahme% (Erfolg%)",
      retirementBand: "95%-Band bei Renteneintritt",
      averageSupport: "Ø jährliche Förderung",
    },
    chart: {
      title: "Wertentwicklung des Depots",
      subtitle:
        "Depotwert und Zuflüsse (Einzahlungen + Förderung) im Zeitverlauf. Nach dem Renteneintritt wird eine Entnahme mit dem gewählten Entnahmesatz angenommen.",
      svgTitle: "Projektion des Depotvermögens",
      svgDesc:
        "Zeitreihe mit Depotwert, eigenen Einzahlungen, 95-Prozent-Band, Markierungen zum Renteneintritt und Entnahmen mit dem gewählten Entnahmesatz.",
      loadingAria: "Berechnung laeuft",
      inflationOn: "Inflationsbereinigung an",
      inflationOff: "Inflationsbereinigung aus",
      confidenceBandOn: "95%-Band an",
      confidenceBandOff: "95%-Band aus",
      inflowsAdjustedOn: "Zuflüsse mit Inflation fortschreiben an",
      inflowsAdjustedOff: "Zuflüsse mit Inflation fortschreiben aus",
      ageLabel: "Alter",
      spouseAgeLabel: "Alter Partner",
      medianLabel: "Depot Median",
      bandLabel: "95%-Band",
      legendValue: "Depotwert",
      legendBand: "95%-Band",
    },
    notes: {
      assumptionsTitle: "Annahmen",
      assumptionsBody1:
        "Diese Vorschau zeigt, wie sich ein Altersvorsorgedepot bei gleichbleibenden monatlichen Einzahlungen entwickelt hätte. Jeder Pfad beginnt in einem anderen historischen Kalenderjahr und folgt anschließend der tatsächlich vorliegenden monatlichen Markt- und Inflationsfolge ohne Neuanordnung oder Wiederholung. Verwendet werden alle vollständigen, überlappenden Zeitfenster, die den persönlichen Modellhorizont bis Alter 90 abdecken. Die zentrale Projektion ist der Median: 50 % der historischen Ergebnisse liegen darunter und 50 % darüber. Eine benutzerdefinierte reale Renditeannahme verschiebt lediglich das langfristige Renditeniveau.",
      assumptionsBody2:
        'Direkte Förderung, Kinderförderung und der vereinfachte Steuervorteil folgen den <a href="./Annahmen.md">Annahmen in diesem Projekt</a>. Die modellierte Steuererstattung wird vollständig wieder in das Depot investiert. Nach dem Renteneintritt enden neue Einzahlungen; die Brutto-Entnahme mit dem gewählten Entnahmesatz ist auf das tatsächlich verfügbare Depotvermögen begrenzt. Auf Wunsch werden jährliche Produktkosten eingerechnet. Weitere offizielle Informationen gibt es beim <a href="https://www.bundesfinanzministerium.de/Content/DE/FAQ/reform-der-privaten-altersvorsorge.html">Bundesfinanzministerium</a>.',
      dataTitle: "Datenbasis",
      dataBody:
        'Für 1900–1969 werden jährliche Aktienrenditen aus der <a href="https://www.macrohistory.net/database/">JST Macrohistory Database</a> mit historischen Marktkapitalisierungen von <a href="https://dkuvshinov.com/">Kuvshinov/Zimmermann</a> gewichtet. Synthetische Monatsverläufe werden auf diese Jahresrenditen skaliert; ab 1970 wird die lokale <a href="https://curvo.eu/backtest/en/market-index/msci-world?currency=eur">MSCI-World-EUR-Reihe von Curvo</a> unverändert fortgeführt. Deutsche Inflation wird 1900–1954 aus JST-Jahreswerten monatlich interpoliert, stammt 1955 bis März 2025 von <a href="https://fred.stlouisfed.org/series/DEUCPIALLMINMEI">FRED/OECD</a> und ab April 2025 vom <a href="https://www.destatis.de/DE/Themen/Wirtschaft/Preise/Verbraucherpreisindex/_inhalt.html">Statistischen Bundesamt</a>. <a href="./data-sources/jst-kz-global-equity/README.md">Methodik und Einschränkungen</a>.',
      interpretationTitle: "Interpretation",
      interpretationBody:
        "Die Projektion ist kein garantiertes Ergebnis und keine Steuerberatung. Sie soll helfen, Größenordnungen zu vergleichen: Depotwert, eigene Einzahlungen, mögliche Förderung und wie stark Ergebnisse je nach historischer Marktphase schwanken.",
    },
    footer: {
      disclaimer: "Keine Anlage-, Steuer- oder Rechtsberatung. Alle Angaben ohne Gewähr.",
    },
    aria: {
      productFeeInfo: "Info zu Produktkosten",
      expectedRealReturnInfo: "Info zur erwarteten realen Rendite",
      expectedRealReturnInput: "Erwartete reale Rendite pro Jahr in Prozent",
      expectedRealReturnPresets: "Voreinstellungen für die reale Rendite",
      applicantBirthYear: "Geburtsjahr antragstellende Person",
      existingContractInfo: "Info zu bestehendem Riester",
      applicantTaxInfo: "Info zu Grenzsteuersatz antragstellende Person",
      applicantIncomeGroup: "Grenzsteuersatz antragstellende Person",
      spouseBirthYear: "Geburtsjahr Partner",
      spouseTaxInfo: "Info zu Grenzsteuersatz Partner",
      spouseIncomeGroup: "Grenzsteuersatz Partnerin oder Partner",
      retirementMedianInfo: "Info zu Ø Depotwert bei Rentenbeginn",
      withdrawalRuleInfo:
        "Info zur Brutto-Zusatzrente, Erfolgsquote und möglichen Entnahmelücken beim gewählten Entnahmesatz",
      withdrawalRate: "Jährlichen Entnahmesatz wählen",
      withdrawalRateHelp:
        "Die zweite Prozentzahl je Option ist der Anteil der Pfade ohne Entnahmelücke bis zum Modellende im Alter 90 der antragstellenden Person.",
      withdrawalRateStatus: ({ rate, successRate }) =>
        `${rate} Entnahmesatz: ${successRate} der Pfade ohne Entnahmelücke bis Alter 90.`,
      retirementBandInfo: "Info zu 95 Prozent Band bei Renteneintritt",
      averageSupportInfo: "Info zu Ø jährlicher Förderung",
      childBirthYear: "Geburtsjahr Kind",
      childBenefitDurationInfo: "Info zur Dauer des Kindergeldbezugs",
      childBenefitDurationInput: "Dauer des Kindergeldbezugs in Jahren",
      removeChild: "Kind entfernen",
      languageSwitcher: "Sprache",
    },
    tooltips: {
      info: {
        productFee:
          "Produktkosten werden jährlich vom Depotwert abgezogen. Schon kleine prozentuale Kosten können den langfristigen Vermögensaufbau spürbar schmälern. Für dieses Produkt gilt eine gesetzliche Obergrenze von 1,5 % pro Jahr, aber gute Produkte sollten deutlich darunter liegen.",
        expectedRealReturn:
          "Die reale Rendite beschreibt die Marktentwicklung oberhalb der Inflation und vor Produktkosten. Die historischen Monatsverläufe, Schwankungen und Krisen bleiben erhalten; nur ihr langfristiges Renditeniveau wird angepasst.",
        existingContract:
          "Ein bestehender Riester-Vertrag kann in das Altersvorsorgedepot übertragen werden. Bereits angespartes Guthaben kann so im neuen System weiter investiert bleiben.",
        applicantTaxRate:
          "Beim Altersvorsorgedepot hängt der mögliche steuerliche Vorteil davon ab, wie hoch dein persönlicher Grenzsteuersatz ist.",
        spouseTaxRate:
          "Beim Altersvorsorgedepot hängt der mögliche steuerliche Vorteil davon ab, wie hoch dein persönlicher Grenzsteuersatz ist.",
        retirementMedian:
          "Zeigt den Median der modellierten Depotwerte zum Rentenbeginn. Der Median ist der mittlere Wert einer Verteilung: 50 % der Ergebnisse liegen darunter und 50 % darüber. Wenn ein Partner einbezogen ist, bezieht sich der Wert auf das gemeinsame Depot zu dem Zeitpunkt, an dem beide im Ruhestand sind.",
        withdrawalRule: ({ rate }) =>
          `Brutto vor Steuern. Der angezeigte Wert ist der Median der modellierten Zusatzrenten: 50 % der Ergebnisse liegen darunter und 50 % darüber. Die anfängliche jährliche Entnahme beträgt ${rate} des Depotwerts zum Ruhestart und wird danach mit der Inflation fortgeschrieben. Ausgewiesen wird höchstens der Betrag, den das jeweilige Depot tatsächlich bezahlen kann.`,
        retirementBand:
          "Ein 95-%-Band beschreibt den Bereich, in dem 95 % der betrachteten Ergebnisse liegen. Es hilft, die Bandbreite möglicher Entwicklungen zu visualisieren.",
        averageSupport:
          "Die ausgewiesene durchschnittliche jährliche Förderung umfasst die direkte Förderung inklusive Steuervorteil im vereinfachten Modell dieses Rechners.",
        childBenefitDuration:
          "Legt fest, bis zu welchem Alter ein eingetragenes Kind in der modellierten Kinderförderung berücksichtigt wird. Die Einstellung bildet keine individuelle rechtliche Anspruchsprüfung ab.",
      },
      presets: {
        min10:
          "10 Euro pro Monat sind der gesetzliche Mindestbeitrag für ein Altersvorsorgedepot im vorgeschlagenen Reformmodell.",
        max150:
          "150 Euro pro Monat sind 1.800 Euro pro Jahr. Damit wird der maximal geförderte Jahresbeitrag erreicht: 360 Euro mit 50 Prozent plus weitere 1.440 Euro mit 25 Prozent.",
        high570:
          "570 Euro pro Monat sind 6.840 Euro pro Jahr. Im BMF-Entwurf ist das die genannte Obergrenze, bis zu der Beiträge in der Ansparphase steuerfrei bleiben; zusätzliche proportionale Förderung gibt es aber nur bis 1.800 Euro pro Jahr.",
      },
      withdrawalDiagnostics: {
        success: ({ age, pathCount, successRate, successfulPathCount }) =>
          `Bis zum Modellende (Alter ${age} der antragstellenden Person) konnten ${successRate} der Pfade jede geplante Entnahme vollständig leisten (${successfulPathCount} von ${pathCount} Pfaden).`,
        noShortfall:
          "In den modellierten Pfaden trat keine Entnahmelücke auf.",
        shortfall: ({ age, amount, valueMode }) =>
          `In den nicht erfolgreichen Pfaden lag das Medianalter der antragstellenden Person beim ersten Haushalts-Einkommensfehlbetrag bei ${age} Jahren. Die kumulierte Entnahmelücke betrug dort im Median ${amount} (${valueMode}).`,
        realValueMode: "inflationsbereinigt",
        nominalValueMode: "nominal",
      },
    },
    status: {
      loadingData: "Lokale Markt- und Inflationsdaten werden geladen…",
      loadError: "Lokale Daten konnten nicht geladen werden.",
      dataLoaded: () => "Inflation und Aktienmärkte 1900-2026.",
      adjusted: "Inflationsbereinigt.",
      nominal: "Nominal.",
      inflowsAdjusted: "Zuflüsse mit Inflation fortgeschrieben.",
      inflowsNominal: "Zuflüsse ohne Inflationsfortschreibung.",
      realReturn: ({ value }) => `Reale Renditeannahme: ${value} p.a.`,
    },
    errors: {
      cancelledSimulation: "Berechnung abgebrochen.",
      fetchFailed: ({ path }) => `${path} konnte nicht geladen werden.`,
      insufficientHistory: "Zu wenig historische Marktdaten.",
      insufficientOverlap: "Zu wenig überlappende Markt- und Inflationshistorie.",
      emptyCpi: "Die CPI-Datei enthaelt keine Werte.",
      applicantBirthdate: "Bitte das Geburtsdatum der antragstellenden Person eingeben.",
      spouseBirthdate: "Bitte das Geburtsdatum der Partnerperson eingeben.",
      childBirthYearInvalid: ({ rowLabel }) => `Bitte ein gueltiges Geburtsjahr fuer ${rowLabel} eingeben oder die Zeile entfernen.`,
      childBirthYearRange: ({ rowLabel }) => `Bitte ein gueltiges Geburtsjahr fuer ${rowLabel} zwischen 1900 und 2050 eingeben.`,
      applicantTooOld:
        "Die antragstellende Person ist bereits 90 oder aelter. Damit gibt es keinen Projektionshorizont mehr.",
      expectedRealReturn: "Bitte eine reale Rendite zwischen −100 % und +100 % eingeben.",
      childBenefitDuration: "Bitte eine Dauer zwischen 16 und 25 Jahren eingeben.",
    },
    presets: {
      min10: "Min 10",
      max150: "Max Förderung 150",
      high570: "Hoch 570",
    },
    contributions: {
      single: "Zuflüsse",
      household: "Zuflüsse inkl. Partner",
      singleAdjusted: "Zuflüsse",
      householdAdjusted: "Zuflüsse inkl. Partner",
    },
    markers: {
      retirement: "Rentenbeginn",
      spouseRetirement: "Rente Partner",
    },
    compactUnits: {
      million: "Mio",
      thousand: "Tsd",
      range: "Tsd. €",
      rangeSeparator: "-",
      rangeBandSeparator: "bis",
    },
  },
  en: {
    locale: "en-US",
    htmlLang: "en",
    meta: {
      title: "Retirement Savings Portfolio Calculator",
      description:
        "Static household calculator for the retirement savings portfolio using complete historical global-equity paths from 1900.",
    },
    hero: { title: "Retirement Savings Portfolio Calculator" },
    themeToggle: { label: "Toggle color theme" },
    controls: {
      title: "Household details",
      reset: "Reset<br />values",
      productFee: "Product fee per year",
      expectedRealReturn: "Expected real return p.a.",
      historicalReturnPreset: "Historical",
      applicant: "Applicant",
      birthYear: "Birth year",
      retirementAge: "Retirement age",
      existingContractDesktop: "Existing<br />Riester balance €",
      existingContractMobile: "Existing Riester €",
      monthlyContribution: "Monthly contribution €",
      marginalTaxRate: "Marginal tax rate",
      spouse: "Spouse",
      addSpouse: "Add spouse",
      removeSpouse: "Remove spouse",
      children: "Children",
      addChild: "Add child",
      removeChild: "Remove",
      child: "Child",
      childBenefitDuration: "Child-benefit duration",
      years: "years",
      childrenHint: ({ years = DEFAULT_CHILD_BENEFIT_YEARS } = {}) =>
        `Children are included in the modeled child subsidy until age ${years}.`,
    },
    results: {
      title: "Projection | Historical data",
      simulationCount: ({ count } = {}) =>
        Number.isFinite(count) ? `${formatNumber(count, { maximumFractionDigits: 0 })} historical paths` : "Historical paths",
      marketSeries: "Global equities 1900–2026",
      retirementValue: "Avg. portfolio value at retirement",
      withdrawalIncome: "Avg. extra income (gross)",
      withdrawalRateCaption: "Withdrawal% (success%)",
      retirementBand: "95% band at retirement",
      averageSupport: "Avg. annual subsidy",
    },
    chart: {
      title: "Portfolio growth over time",
      subtitle:
        "Portfolio value and inflows (contributions + subsidies) over time. After retirement, withdrawals use the selected withdrawal rate.",
      svgTitle: "Projected retirement portfolio",
      svgDesc:
        "Time series showing portfolio value, own contributions, the 95 percent band, retirement markers, and withdrawals at the selected rate.",
      loadingAria: "Calculation running",
      inflationOn: "Inflation adjustment on",
      inflationOff: "Inflation adjustment off",
      confidenceBandOn: "95% band on",
      confidenceBandOff: "95% band off",
      inflowsAdjustedOn: "Inflation-indexed inflows on",
      inflowsAdjustedOff: "Inflation-indexed inflows off",
      ageLabel: "Age",
      spouseAgeLabel: "Spouse age",
      medianLabel: "Median portfolio",
      bandLabel: "95% band",
      legendValue: "Portfolio value",
      legendBand: "95% band",
    },
    notes: {
      assumptionsTitle: "Assumptions",
      assumptionsBody1:
        "This preview shows how a retirement savings portfolio would have developed with constant monthly contributions. Each path begins in a different historical calendar year and then follows the available monthly market and inflation sequence without reordering or repetition. It uses every complete overlapping window long enough to cover the personal model horizon through age 90. The central projection is the median: 50% of historical outcomes are below it and 50% are above it. A custom real-return assumption only shifts the long-run return level.",
      assumptionsBody2:
        'Direct subsidies, child subsidies, and the simplified tax benefit follow the <a href="./Annahmen.md">assumptions used in this project</a>. The modeled tax refund is reinvested in full. After retirement, new contributions stop; gross withdrawals at the selected rate are capped at the assets actually available. Annual product fees can optionally be included. More official information is available from the <a href="https://www.bundesfinanzministerium.de/Content/DE/FAQ/reform-der-privaten-altersvorsorge.html">Federal Ministry of Finance</a>.',
      dataTitle: "Data basis",
      dataBody:
        'For 1900–1969, annual equity returns from the <a href="https://www.macrohistory.net/database/">JST Macrohistory Database</a> are weighted using historical market capitalizations from <a href="https://dkuvshinov.com/">Kuvshinov/Zimmermann</a>. Synthetic monthly paths are scaled to those annual returns; from 1970 onward, the local <a href="https://curvo.eu/backtest/en/market-index/msci-world?currency=eur">Curvo MSCI World EUR series</a> is continued unchanged. German inflation for 1900–1954 is monthly-interpolated from JST annual observations, comes from <a href="https://fred.stlouisfed.org/series/DEUCPIALLMINMEI">FRED/OECD</a> from 1955 through March 2025, and from the <a href="https://www.destatis.de/EN/Themes/Economy/Prices/Consumer-Price-Index/_node.html">German Federal Statistical Office</a> thereafter. See the <a href="./data-sources/jst-kz-global-equity/README.md">methodology and limitations</a>.',
      interpretationTitle: "Interpretation",
      interpretationBody:
        "This projection is not a guaranteed outcome and not tax advice. It is meant to help compare orders of magnitude: portfolio value, own contributions, possible subsidies, and how strongly results can vary across historical market phases.",
    },
    footer: {
      disclaimer: "No investment, tax, or legal advice. No guarantee for completeness or accuracy.",
    },
    aria: {
      productFeeInfo: "Info about product fees",
      expectedRealReturnInfo: "Info about the expected real return",
      expectedRealReturnInput: "Expected annual real return in percent",
      expectedRealReturnPresets: "Real-return presets",
      applicantBirthYear: "Applicant birth year",
      existingContractInfo: "Info about existing Riester balance",
      applicantTaxInfo: "Info about applicant marginal tax rate",
      applicantIncomeGroup: "Applicant marginal tax rate",
      spouseBirthYear: "Spouse birth year",
      spouseTaxInfo: "Info about spouse marginal tax rate",
      spouseIncomeGroup: "Spouse marginal tax rate",
      retirementMedianInfo: "Info about average portfolio value at retirement",
      withdrawalRuleInfo:
        "Information about gross extra income, success rate, and possible shortfalls at the selected withdrawal rate",
      withdrawalRate: "Select the annual withdrawal rate",
      withdrawalRateHelp:
        "The second percentage in each option is the share of paths without a withdrawal shortfall through the model horizon at applicant age 90.",
      withdrawalRateStatus: ({ rate, successRate }) =>
        `${rate} withdrawal rate: ${successRate} of paths without a shortfall through age 90.`,
      retirementBandInfo: "Info about the 95 percent band at retirement",
      averageSupportInfo: "Info about average annual subsidy",
      childBirthYear: "Child birth year",
      childBenefitDurationInfo: "Info about child-benefit duration",
      childBenefitDurationInput: "Child-benefit duration in years",
      removeChild: "Remove child",
      languageSwitcher: "Language",
    },
    tooltips: {
      info: {
        productFee:
          "Product fees are deducted from portfolio assets every year. Even small percentage fees can noticeably reduce long-term wealth accumulation. This product type has a statutory cap of 1.5% per year, but good products should be well below that.",
        expectedRealReturn:
          "Real return is market performance above inflation and before product fees. Historical monthly paths, volatility, and crashes remain intact; only their long-run return level is adjusted.",
        existingContract:
          "An existing Riester contract can be transferred into the retirement savings portfolio. Assets already accumulated can then remain invested in the new system.",
        applicantTaxRate:
          "In the retirement savings portfolio, the potential tax advantage depends on your personal marginal tax rate.",
        spouseTaxRate:
          "In the retirement savings portfolio, the potential tax advantage depends on your personal marginal tax rate.",
        retirementMedian:
          "Shows the median modeled portfolio value at retirement. The median is the middle of the distribution: 50% of outcomes are below it and 50% are above it. If a spouse is included, the value refers to the joint portfolio once both people are retired.",
        withdrawalRule: ({ rate }) =>
          `Gross before tax. The displayed value is the median modeled extra income: 50% of outcomes are below it and 50% are above it. The initial annual withdrawal is ${rate} of the portfolio value at retirement and is then increased with inflation. The amount shown is capped at what each portfolio can actually pay.`,
        retirementBand:
          "A 95% band shows the range that contains 95% of the modeled outcomes. It helps visualize the spread of possible paths.",
        averageSupport:
          "The reported average annual subsidy includes direct subsidies plus the tax benefit in this calculator's simplified model.",
        childBenefitDuration:
          "Sets the age until which an entered child is included in the modeled child subsidy. This setting is not an individual legal eligibility assessment.",
      },
      presets: {
        min10:
          "10 euros per month is the statutory minimum contribution for a retirement savings portfolio in the proposed reform model.",
        max150:
          "150 euros per month equal 1,800 euros per year. That reaches the maximum subsidized annual contribution: 360 euros at 50 percent plus another 1,440 euros at 25 percent.",
        high570:
          "570 euros per month equals 6,840 euros per year. In the Finance Ministry draft, that is the stated cap up to which contributions remain tax-free during accumulation, but proportional subsidies only apply up to 1,800 euros per year.",
      },
      withdrawalDiagnostics: {
        success: ({ age, pathCount, successRate, successfulPathCount }) =>
          `Through the end of the model (applicant age ${age}), ${successRate} of paths paid every scheduled withdrawal in full (${successfulPathCount} of ${pathCount} paths).`,
        noShortfall:
          "No withdrawal shortfall occurred in the modeled paths.",
        shortfall: ({ age, amount, valueMode }) =>
          `Among unsuccessful paths, the applicant’s median age at the first household income shortfall was ${age}. Their median cumulative withdrawal shortfall was ${amount} (${valueMode}).`,
        realValueMode: "inflation-adjusted",
        nominalValueMode: "nominal",
      },
    },
    status: {
      loadingData: "Loading local market and inflation data…",
      loadError: "Local data could not be loaded.",
      dataLoaded: ({ years, start, end }) => `${years} years of equity and inflation data (${start} to ${end}).`,
      adjusted: "Inflation-adjusted.",
      nominal: "Nominal.",
      inflowsAdjusted: "Inflows indexed with inflation.",
      inflowsNominal: "Inflows not indexed with inflation.",
      realReturn: ({ value }) => `Real return assumption: ${value} p.a.`,
    },
    errors: {
      cancelledSimulation: "Calculation cancelled.",
      fetchFailed: ({ path }) => `Could not load ${path}.`,
      insufficientHistory: "Not enough historical market data.",
      insufficientOverlap: "Not enough overlapping market and inflation history.",
      emptyCpi: "The CPI file contains no values.",
      applicantBirthdate: "Please enter the applicant's birth year.",
      spouseBirthdate: "Please enter the spouse's birth year.",
      childBirthYearInvalid: ({ rowLabel }) => `Please enter a valid birth year for ${rowLabel} or remove the row.`,
      childBirthYearRange: ({ rowLabel }) => `Please enter a valid birth year for ${rowLabel} between 1900 and 2050.`,
      applicantTooOld: "The applicant is already age 90 or older. There is no projection horizon left.",
      expectedRealReturn: "Please enter a real return between −100% and +100%.",
      childBenefitDuration: "Please enter a duration between 16 and 25 years.",
    },
    presets: {
      min10: "Min 10",
      max150: "Max subsidy 150",
      high570: "High 570",
    },
    contributions: {
      single: "Inflows",
      household: "Inflows incl. spouse",
      singleAdjusted: "Inflows",
      householdAdjusted: "Inflows incl. spouse",
    },
    markers: {
      retirement: "Retirement",
      spouseRetirement: "Spouse retirement",
    },
    compactUnits: {
      million: "M",
      thousand: "k",
      range: "k EUR",
      rangeSeparator: "-",
      rangeBandSeparator: "to",
    },
  },
};

const CONTRIBUTION_PRESETS = [
  {
    value: 10,
    labelKey: "min10",
    tooltipKey: "min10",
  },
  {
    value: 150,
    labelKey: "max150",
    tooltipKey: "max150",
  },
  {
    value: 570,
    labelKey: "high570",
    tooltipKey: "high570",
  },
];

const colors = {
  markerApplicant: "#d4a853",
  markerSpouse: "#a07ccc",
  contributions: "#5a94a8",
};

const hasDom = typeof document !== "undefined";
const elements = hasDom
  ? {
      themeToggle: document.querySelector("#theme-toggle"),
      languageSwitcher: document.querySelector(".language-switcher"),
      languageButtons: document.querySelectorAll("[data-language]"),
      ciToggle: document.querySelector("#ci-toggle"),
      inflationToggle: document.querySelector("#inflation-toggle"),
      inflowsInflationToggle: document.querySelector("#inflows-inflation-toggle"),
      toggleSpouseButton: document.querySelector("#toggle-spouse"),
      resetSessionButton: document.querySelector("#reset-session"),
      spouseFields: document.querySelector("#spouse-fields"),
      childrenList: document.querySelector("#children-list"),
      childrenHint: document.querySelector("#children-hint"),
      childBenefitDuration: document.querySelector("#child-benefit-duration"),
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
      expectedRealReturn: document.querySelector("#expected-real-return"),
      returnPresetButtons: document.querySelectorAll("[data-return-preset]"),
      dataStatus: document.querySelector("#data-status"),
      errorBanner: document.querySelector("#error-banner"),
      retirementValue: document.querySelector("#retirement-value"),
      withdrawalIncome: document.querySelector("#withdrawal-income"),
      withdrawalRate: document.querySelector("#withdrawal-rate"),
      withdrawalRateStatus: document.querySelector("#withdrawal-rate-status"),
      finalRange: document.querySelector("#final-range"),
      averageSupport: document.querySelector("#average-support"),
      rerunSimulationsButton: document.querySelector("#rerun-simulations"),
      chartLoading: document.querySelector("#chart-loading"),
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
let simulationWorker = null;
let activeSimulationRequest = null;
let latestChartState = null;
let latestChartRenderState = null;
let chartLoadingTimer = null;
let chartLoadingStep = 0;
let hoverState = null;
const uiState = {
  adjustInflation: true,
  adjustInflowsForInflation: false,
  showConfidenceBand: true,
  hasSpouse: false,
  language: DEFAULT_LANGUAGE,
  expectedRealReturnMode: RETURN_MODE_HISTORICAL,
  customExpectedRealReturn: 0.03,
};

function activeLanguage() {
  return TRANSLATIONS[uiState.language] ? uiState.language : DEFAULT_LANGUAGE;
}

function activeMessages() {
  return TRANSLATIONS[activeLanguage()];
}

function lookupTranslation(key) {
  return key.split(".").reduce((value, segment) => value?.[segment], activeMessages());
}

function t(key, params = {}) {
  const value = lookupTranslation(key);
  if (typeof value === "function") {
    return value(params);
  }
  return value ?? key;
}

function numberFormat(options = {}) {
  return new Intl.NumberFormat(activeMessages().locale, options);
}

function formatCurrency(value) {
  return numberFormat({
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCurrencyDetailed(value) {
  return numberFormat({
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value, options = {}) {
  return numberFormat({ maximumFractionDigits: 1, ...options }).format(value);
}

function applyTranslations(root = document) {
  if (!hasDom) {
    return;
  }

  document.documentElement.lang = activeMessages().htmlLang;
  document.title = t("meta.title");
  const description = document.querySelector("#page-description");
  if (description) {
    description.setAttribute("content", t("meta.description"));
  }

  for (const element of root.querySelectorAll?.("[data-i18n]") ?? []) {
    element.textContent = t(element.dataset.i18n);
  }

  for (const element of root.querySelectorAll?.("[data-i18n-html]") ?? []) {
    element.innerHTML = t(element.dataset.i18nHtml);
  }

  for (const element of root.querySelectorAll?.("[data-i18n-title]") ?? []) {
    element.setAttribute("title", t(element.dataset.i18nTitle));
  }

  for (const element of root.querySelectorAll?.("[data-i18n-aria-label]") ?? []) {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  }

  elements.languageSwitcher?.setAttribute("aria-label", t("aria.languageSwitcher"));
  syncLanguageButtons();
}

function syncLanguageButtons() {
  for (const button of elements.languageButtons ?? []) {
    const isActive = button.dataset.language === activeLanguage();
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }
}

function setLanguage(language) {
  uiState.language = TRANSLATIONS[language] ? language : DEFAULT_LANGUAGE;
}

function localizeChildRow(row) {
  if (!row) {
    return;
  }

  row.querySelector(".remove-child")?.setAttribute("aria-label", t("aria.removeChild"));
  row.querySelector(".remove-child").textContent = t("controls.removeChild");
  row.querySelector(".child-birth-year-label").textContent = t("controls.birthYear");
  row.querySelector(".child-birth-year")?.setAttribute("aria-label", t("aria.childBirthYear"));
}

function refreshLocalizedUi() {
  applyTranslations(document);
  populateInfoTooltips();
  rebuildIncomeButtons();
  buildContributionPresets();
  for (const row of elements.childrenList?.querySelectorAll(".child-row") ?? []) {
    localizeChildRow(row);
  }
  syncChildLabels();
  syncChildrenHint();
  syncReturnControl();
  syncWithdrawalRateControl();
  syncChartToggleButtons();
  syncSpouseSection();
  setDataStatus();
  if (latestChartState) {
    renderSummary(latestChartState, uiState.adjustInflation);
    renderChart(latestChartState);
  }
}

function rebuildIncomeButtons() {
  const applicantRateId = elements.applicantIncome?.dataset.selectedRateId || "medium";
  const spouseRateId = elements.spouseIncome?.dataset.selectedRateId || "medium";
  buildIncomeButtons(elements.applicantIncome);
  buildIncomeButtons(elements.spouseIncome);
  setIncomeSelection(elements.applicantIncome, applicantRateId);
  setIncomeSelection(elements.spouseIncome, spouseRateId);
}

if (hasDom) {
  initialize();
}

async function initialize() {
  const savedSession = loadSession();
  setLanguage(savedSession?.language || DEFAULT_LANGUAGE);
  applyTheme(savedSession?.theme || localStorage.getItem(LEGACY_THEME_STORAGE_KEY) || preferredTheme());
  seedDefaults();
  applyTranslations(document);
  populateInfoTooltips();
  buildIncomeButtons(elements.applicantIncome);
  buildIncomeButtons(elements.spouseIncome);
  restoreSession(savedSession);
  refreshLocalizedUi();
  wireEvents();
  syncAddChildButton();
  saveSession();

  try {
    // Both datasets are required before the first calculation can run, so load them together.
    const [marketCsv, cpiCsv] = await Promise.all([fetchText(MARKET_DATA_PATH), fetchText(CPI_DATA_PATH)]);
    const inflation = parseCpiCsv(cpiCsv);
    const market = parseMarketCsv(marketCsv, inflation);
    datasets = {
      market,
      inflation,
    };
    syncReturnControl();
    ensureSimulationWorker();
    setDataStatus();
    runCalculation();
  } catch (error) {
    showError(error.message);
    elements.dataStatus.textContent = t("status.loadError");
  }
}

function ensureSimulationWorker() {
  if (!hasDom || typeof Worker === "undefined" || simulationWorker) {
    return simulationWorker;
  }

  try {
    simulationWorker = new Worker(new URL("./simulation-worker.js", import.meta.url), { type: "module" });
    simulationWorker.addEventListener("message", handleSimulationWorkerMessage);
    simulationWorker.addEventListener("error", handleSimulationWorkerError);
  } catch {
    simulationWorker = null;
  }

  return simulationWorker;
}

function teardownSimulationWorker() {
  if (!simulationWorker) {
    return;
  }

  simulationWorker.removeEventListener("message", handleSimulationWorkerMessage);
  simulationWorker.removeEventListener("error", handleSimulationWorkerError);
  simulationWorker.terminate();
  simulationWorker = null;
}

function createCancelledSimulationError() {
  const error = new Error(t("errors.cancelledSimulation"));
  error.name = "CancelledSimulationError";
  return error;
}

function cancelActiveSimulationRequest() {
  if (!activeSimulationRequest) {
    return;
  }

  // The UI always renders only the newest request. Cancelling here prevents stale worker results
  // from racing the latest input state back onto the screen.
  const { reject } = activeSimulationRequest;
  activeSimulationRequest = null;
  teardownSimulationWorker();
  reject(createCancelledSimulationError());
}

function handleSimulationWorkerMessage(event) {
  const { error, requestId, result } = event.data ?? {};
  if (!activeSimulationRequest || activeSimulationRequest.requestId !== requestId) {
    return;
  }

  const { reject, resolve } = activeSimulationRequest;
  activeSimulationRequest = null;
  if (error) {
    reject(new Error(error));
    return;
  }
  resolve(result);
}

function handleSimulationWorkerError() {
  if (!activeSimulationRequest) {
    teardownSimulationWorker();
    return;
  }

  const request = activeSimulationRequest;
  activeSimulationRequest = null;
  teardownSimulationWorker();

  try {
    const result = simulateHousehold(request.household, datasets, request.options);
    request.resolve(result);
  } catch (error) {
    request.reject(error);
  }
}

function waitForNextFrame() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

function requestSimulation(household, token) {
  const options = {
    maxAge: MAX_AGE,
    now: new Date(),
    samplingMode: SAMPLING_MODE_HISTORICAL_PATHS,
    adjustInflowsForInflation: uiState.adjustInflowsForInflation,
    withdrawalRate: Number(elements.withdrawalRate.value),
    withdrawalRateCandidates: WITHDRAWAL_RATE_OPTIONS,
    expectedRealAnnualReturn:
      uiState.expectedRealReturnMode === RETURN_MODE_CUSTOM
        ? uiState.customExpectedRealReturn
        : historicalRealAnnualReturn(),
  };
  const worker = ensureSimulationWorker();

  if (!worker) {
    return waitForNextFrame().then(() => {
      if (token !== recomputeToken) {
        throw createCancelledSimulationError();
      }
      return simulateHousehold(household, datasets, options);
    });
  }

  return new Promise((resolve, reject) => {
    activeSimulationRequest = {
      household,
      options,
      reject,
      requestId: token,
      resolve,
    };

    worker.postMessage({
      bootstrapSeries: datasets.market.bootstrapSeries,
      household,
      options,
      requestId: token,
    });
  });
}

function preferredTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : DEFAULT_THEME;
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

function seedDefaults() {
  uiState.adjustInflation = true;
  uiState.adjustInflowsForInflation = false;
  uiState.showConfidenceBand = true;
  uiState.hasSpouse = false;
  uiState.language = activeLanguage();
  uiState.expectedRealReturnMode = RETURN_MODE_HISTORICAL;
  uiState.customExpectedRealReturn = 0.03;
  elements.applicantBirthYear.value = "1990";
  elements.applicantContribution.value = "150";
  elements.existingContract.value = "0";
  elements.retirementAge.value = "67";
  elements.projectedFee.value = "0.2";
  elements.childBenefitDuration.value = String(DEFAULT_CHILD_BENEFIT_YEARS);
  elements.withdrawalRate.value = String(DEFAULT_WITHDRAWAL_RATE);
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
    button.textContent = `${Math.round(bracket.rate * 100)} %`;
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

function buildContributionPresets() {
  for (const row of document.querySelectorAll(".preset-row")) {
    row.innerHTML = "";
    const target = document.querySelector(`#${row.dataset.target}`);
    for (const preset of CONTRIBUTION_PRESETS) {
      const tooltip = t(`tooltips.presets.${preset.tooltipKey}`);
      const label = t(`presets.${preset.labelKey}`);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preset-button";
      button.textContent = label;
      button.title = tooltip;
      button.setAttribute("aria-label", `${label}: ${tooltip}`);
      button.addEventListener("click", () => {
        target.value = preset.value;
        saveSession();
        runCalculation();
      });
      row.append(button);
    }
  }
}

function historicalRealAnnualReturn() {
  return datasets ? calculateHistoricalRealCagr(datasets.market.bootstrapSeries) : null;
}

function formatReturnPercent(value, { sign = false } = {}) {
  const formatted = numberFormat({
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: sign ? "exceptZero" : "auto",
  }).format(value * 100);
  return `${formatted} %`;
}

function formatSuccessPercent(value) {
  return `${numberFormat({ maximumFractionDigits: 0 }).format(value * 100)} %`;
}

function formatWithdrawalRate(value) {
  const formatted = numberFormat({
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value * 100);
  return `${formatted} %`;
}

function syncWithdrawalRateControl(result = latestChartState) {
  if (!elements.withdrawalRate) {
    return;
  }
  const rateStats = result?.withdrawalRateStats ?? [];
  for (const option of elements.withdrawalRate.options) {
    const rate = Number(option.value);
    const stats = rateStats.find(
      (candidate) => Math.abs(candidate.withdrawalRate - rate) < 1e-12,
    );
    option.textContent = stats
      ? `${formatWithdrawalRate(rate)} (${formatSuccessPercent(stats.successRate)})`
      : formatWithdrawalRate(rate);
  }
  if (result) {
    const selectedStats = rateStats.find(
      (candidate) =>
        Math.abs(candidate.withdrawalRate - result.withdrawalRate) < 1e-12,
    );
    if (selectedStats && elements.withdrawalRateStatus) {
      elements.withdrawalRateStatus.textContent = t("aria.withdrawalRateStatus", {
        rate: formatWithdrawalRate(selectedStats.withdrawalRate),
        successRate: formatSuccessPercent(selectedStats.successRate),
      });
    }
    elements.withdrawalRate.setAttribute("aria-busy", "false");
  }
}

function syncReturnControl({ preserveInput = false } = {}) {
  if (!elements.expectedRealReturn) {
    return;
  }

  const historicalReturn = historicalRealAnnualReturn();
  const activeValue =
    uiState.expectedRealReturnMode === RETURN_MODE_HISTORICAL
      ? historicalReturn
      : uiState.customExpectedRealReturn;

  if (!preserveInput && activeValue !== null) {
    elements.expectedRealReturn.value = (activeValue * 100).toFixed(1);
  }

  for (const button of elements.returnPresetButtons ?? []) {
    const preset = button.dataset.returnPreset;
    const isActive =
      (preset === RETURN_MODE_HISTORICAL && uiState.expectedRealReturnMode === RETURN_MODE_HISTORICAL) ||
      (uiState.expectedRealReturnMode === RETURN_MODE_CUSTOM &&
        Number.isFinite(Number(preset)) &&
        Math.abs(uiState.customExpectedRealReturn - Number(preset)) < 1e-12);
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
    if (preset === RETURN_MODE_HISTORICAL) {
      button.textContent =
        historicalReturn === null
          ? t("controls.historicalReturnPreset")
          : `${t("controls.historicalReturnPreset")} ${formatReturnPercent(historicalReturn)}`;
    }
  }
}

function selectReturnPreset(preset) {
  if (preset === RETURN_MODE_HISTORICAL) {
    uiState.expectedRealReturnMode = RETURN_MODE_HISTORICAL;
  } else {
    uiState.expectedRealReturnMode = RETURN_MODE_CUSTOM;
    uiState.customExpectedRealReturn = clamp(
      Number(preset),
      MIN_EXPECTED_REAL_RETURN,
      MAX_EXPECTED_REAL_RETURN,
    );
  }
  syncReturnControl();
  saveSession();
  runCalculation();
}

function populateInfoTooltips(
  result = latestChartState,
  adjustInflation = uiState.adjustInflation,
) {
  for (const wrap of document.querySelectorAll(".info-wrap[data-tooltip-key]")) {
    const tooltipText =
      wrap.dataset.tooltipKey === "withdrawalRule"
        ? buildWithdrawalTooltipText(result, adjustInflation)
        : t(`tooltips.info.${wrap.dataset.tooltipKey}`);
    const tooltipElement = wrap.querySelector(".info-tooltip");
    if (!tooltipText || !tooltipElement) {
      continue;
    }

    tooltipElement.textContent = tooltipText;
  }
}

function buildWithdrawalTooltipText(result, adjustInflation = true) {
  const stats = result?.withdrawalStats;
  const withdrawalRate = stats?.withdrawalRate ?? DEFAULT_WITHDRAWAL_RATE;
  const baseText = t("tooltips.info.withdrawalRule", {
    rate: formatWithdrawalRate(withdrawalRate),
  });
  if (!stats) {
    return baseText;
  }

  const successText = t("tooltips.withdrawalDiagnostics.success", {
    age: formatNumber(stats.horizonApplicantAge),
    pathCount: formatNumber(stats.pathCount, { maximumFractionDigits: 0 }),
    successRate: formatSuccessPercent(stats.successRate),
    successfulPathCount: formatNumber(stats.successfulPathCount, {
      maximumFractionDigits: 0,
    }),
  });
  if (stats.failedPathCount === 0) {
    return `${baseText}\n\n${successText}\n${t("tooltips.withdrawalDiagnostics.noShortfall")}`;
  }

  const shortfallSummary = adjustInflation
    ? stats.failedPathCumulativeShortfallReal
    : stats.failedPathCumulativeShortfallNominal;
  const shortfallText = t("tooltips.withdrawalDiagnostics.shortfall", {
    age: formatNumber(stats.firstShortfallApplicantAge.median),
    amount: formatCurrency(shortfallSummary.median),
    valueMode: adjustInflation
      ? t("tooltips.withdrawalDiagnostics.realValueMode")
      : t("tooltips.withdrawalDiagnostics.nominalValueMode"),
  });
  return `${baseText}\n\n${successText}\n${shortfallText}`;
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

  for (const button of elements.languageButtons ?? []) {
    button.addEventListener("click", () => {
      setLanguage(button.dataset.language);
      refreshLocalizedUi();
      saveSession();
    });
  }

  elements.inflationToggle.addEventListener("click", () => {
    uiState.adjustInflation = !uiState.adjustInflation;
    syncChartToggleButtons();
    saveSession();
    rerenderOutputs();
  });

  elements.inflowsInflationToggle.addEventListener("click", () => {
    uiState.adjustInflowsForInflation = !uiState.adjustInflowsForInflation;
    syncChartToggleButtons();
    saveSession();
    runCalculation();
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

  elements.expectedRealReturn.addEventListener("input", () => {
    const percent = Number(elements.expectedRealReturn.value);
    uiState.expectedRealReturnMode = RETURN_MODE_CUSTOM;
    if (Number.isFinite(percent)) {
      uiState.customExpectedRealReturn = percent / 100;
    }
    syncReturnControl({ preserveInput: true });
    saveSession();
  });

  for (const button of elements.returnPresetButtons ?? []) {
    button.addEventListener("click", () => selectReturnPreset(button.dataset.returnPreset));
  }

  elements.childBenefitDuration.addEventListener("input", syncChildrenHint);
  elements.withdrawalRate.addEventListener("change", () => {
    markWithdrawalSummaryBusy();
    saveSession();
    runCalculation();
  });

  elements.resetSessionButton.addEventListener("click", resetSession);
}

function addChildRow(initialValue = "") {
  if (elements.childrenList.querySelectorAll(".child-row").length >= MAX_CHILDREN) {
    return;
  }

  const fragment = elements.childTemplate.content.cloneNode(true);
  const row = fragment.querySelector(".child-row");
  const yearInput = fragment.querySelector(".child-birth-year");
  localizeChildRow(row);
  row.dataset.hasInteracted = initialValue?.year ? "true" : "false";
  if (initialValue?.year) {
    yearInput.value = String(initialValue.year);
  }
  row.querySelector(".remove-child").addEventListener("click", () => {
    row.remove();
    syncChildLabels();
    syncChildrenHint();
    syncAddChildButton();
    saveSession();
    runCalculation();
  });
  yearInput.addEventListener("input", () => {
    if (yearInput.value.trim() !== "" || yearInput.validity.badInput) {
      row.dataset.hasInteracted = "true";
    }
    saveSession();
    scheduleCalculation();
  });
  elements.childrenList.append(fragment);
  syncChildLabels();
  syncChildrenHint();
  syncAddChildButton();
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
  syncAddChildButton();
}

function syncChildLabels() {
  const rows = elements.childrenList.querySelectorAll(".child-row");
  rows.forEach((row, index) => {
    const label = row.querySelector(".child-label");
    if (!label) {
      return;
    }
    const childLabel = t("controls.child");
    label.textContent = index === 0 ? childLabel : `${childLabel} ${toRoman(index + 1)}`;
    localizeChildRow(row);
  });
}

function syncChildrenHint() {
  const hasChildren = elements.childrenList.querySelector(".child-row") !== null;
  elements.childrenHint.classList.toggle("hidden", !hasChildren);
  elements.childrenHint.textContent = t("controls.childrenHint", {
    years: resolvedChildBenefitDurationInput(),
  });
}

function resolvedChildBenefitDurationInput() {
  const duration = Number(elements.childBenefitDuration?.value);
  return Number.isInteger(duration) &&
    duration >= MIN_CHILD_BENEFIT_YEARS &&
    duration <= MAX_CHILD_BENEFIT_YEARS
    ? duration
    : DEFAULT_CHILD_BENEFIT_YEARS;
}

function syncAddChildButton() {
  elements.addChildButton.disabled = elements.childrenList.querySelectorAll(".child-row").length >= MAX_CHILDREN;
}

function toRoman(value) {
  if (!Number.isInteger(value) || value < 1 || value > MAX_CHILDREN) {
    throw new RangeError(`toRoman only supports integers from 1 to ${MAX_CHILDREN}`);
  }

  const numerals = [
    { value: 20, numeral: "XX" },
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
    if (!parsed || typeof parsed !== "object" || ![1, 2, 3, 4, 5].includes(parsed.version)) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return migrateSession(parsed);
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

function migrateSession(session) {
  const migrated = {
    ...session,
    version: SESSION_VERSION,
    controls: { ...(session.controls ?? {}) },
  };
  if (session.version < 3) {
    migrated.controls.expectedRealReturnMode = RETURN_MODE_HISTORICAL;
    migrated.controls.customExpectedRealReturn = 0.03;
  }
  if (session.version < 4) {
    migrated.controls.childBenefitDurationYears = DEFAULT_CHILD_BENEFIT_YEARS;
  }
  if (session.version < 5) {
    migrated.controls.withdrawalRate = DEFAULT_WITHDRAWAL_RATE;
  }
  return migrated;
}

function restoreSession(session) {
  if (!session) {
    return;
  }

  if (session.language) {
    setLanguage(session.language);
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
    setInputValue(elements.childBenefitDuration, session.controls.childBenefitDurationYears);
    setStoredWithdrawalRate(session.controls.withdrawalRate);
    if (typeof session.controls.adjustInflation === "boolean") {
      uiState.adjustInflation = session.controls.adjustInflation;
    }
    if (typeof session.controls.adjustInflowsForInflation === "boolean") {
      uiState.adjustInflowsForInflation = session.controls.adjustInflowsForInflation;
    }
    if (typeof session.controls.showConfidenceBand === "boolean") {
      uiState.showConfidenceBand = session.controls.showConfidenceBand;
    }
    if (
      session.controls.expectedRealReturnMode === RETURN_MODE_CUSTOM &&
      Number.isFinite(Number(session.controls.customExpectedRealReturn))
    ) {
      uiState.expectedRealReturnMode = RETURN_MODE_CUSTOM;
      uiState.customExpectedRealReturn = clamp(
        Number(session.controls.customExpectedRealReturn),
        MIN_EXPECTED_REAL_RETURN,
        MAX_EXPECTED_REAL_RETURN,
      );
    } else {
      uiState.expectedRealReturnMode = RETURN_MODE_HISTORICAL;
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
  if (monthSelect && birthdate.month !== undefined) {
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

function setStoredWithdrawalRate(rate) {
  const value = Number(rate);
  const matchingOption = Array.from(elements.withdrawalRate.options).some(
    (option) => Number(option.value) === value,
  );
  elements.withdrawalRate.value = matchingOption
    ? String(value)
    : String(DEFAULT_WITHDRAWAL_RATE);
}

function snapshotSession() {
  return {
    version: SESSION_VERSION,
    language: activeLanguage(),
    theme: document.documentElement.dataset.theme || DEFAULT_THEME,
    applicant: {
      birthdate: snapshotMonthYear(elements.applicantBirthMonth?.value, elements.applicantBirthYear.value),
      monthlyContribution: elements.applicantContribution.value,
      initialBalance: elements.existingContract.value,
      incomeRateId: elements.applicantIncome.dataset.selectedRateId || "medium",
    },
    spouse: {
      enabled: uiState.hasSpouse,
      birthdate: snapshotMonthYear(elements.spouseBirthMonth?.value, elements.spouseBirthYear.value),
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
      adjustInflowsForInflation: uiState.adjustInflowsForInflation,
      showConfidenceBand: uiState.showConfidenceBand,
      expectedRealReturnMode: uiState.expectedRealReturnMode,
      customExpectedRealReturn: uiState.customExpectedRealReturn,
      childBenefitDurationYears: elements.childBenefitDuration.value,
      withdrawalRate: elements.withdrawalRate.value,
    },
  };
}

function snapshotMonthYear(monthValue, yearValue) {
  return {
    month: monthValue ? Number(monthValue) : DEFAULT_BIRTH_MONTH,
    year: yearValue ? Number(yearValue) : "",
  };
}

function saveSession() {
  const session = snapshotSession();
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  localStorage.setItem(LEGACY_THEME_STORAGE_KEY, session.theme);
}

function resetSession() {
  cancelActiveSimulationRequest();
  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
  applyTheme(preferredTheme());
  setLanguage(DEFAULT_LANGUAGE);
  seedDefaults();
  refreshLocalizedUi();
  syncChartToggleButtons();
  syncSpouseSection();
  hoverState = null;
  hideChartLoadingIndicator();
  elements.chartTooltip.classList.add("hidden");
  latestChartState = null;
  latestChartRenderState = null;
  saveSession();
  if (datasets) {
    setDataStatus();
    runCalculation();
  }
}

async function fetchText(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(t("errors.fetchFailed", { path }));
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
    throw new Error(t("errors.insufficientHistory"));
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
    throw new Error(t("errors.insufficientOverlap"));
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
    throw new Error(t("errors.emptyCpi"));
  }

  const lookup = new Map(entries.map((entry) => [entry.key, entry.value]));
  const monthlyRatios = new Map();
  for (let index = 1; index < entries.length; index += 1) {
    monthlyRatios.set(entries[index].key, entries[index].value / entries[index - 1].value);
  }
  return { entries, lookup, monthlyRatios };
}

function calculateHistoricalRealCagr(bootstrapSeries) {
  if (!Array.isArray(bootstrapSeries) || bootstrapSeries.length === 0) {
    throw new RangeError("A non-empty bootstrap series is required.");
  }

  let realLogSum = 0;
  for (const observation of bootstrapSeries) {
    realLogSum += realLogReturnForObservation(observation);
  }

  return Math.expm1((realLogSum / bootstrapSeries.length) * 12);
}

function calculateBootstrapSamplingRealCagr(
  bootstrapSeries,
  blockMonths = BOOTSTRAP_BLOCK_MONTHS,
) {
  if (!Array.isArray(bootstrapSeries) || bootstrapSeries.length === 0) {
    throw new RangeError("A non-empty bootstrap series is required.");
  }
  if (!Number.isInteger(blockMonths) || blockMonths < 1) {
    throw new RangeError("blockMonths must be a positive integer.");
  }

  // Mirror the circular block sampler exactly. Averaging over every possible start and position
  // makes the return target depend on the observations the sampler can actually emit.
  let sampledRealLogSum = 0;
  let sampledObservationCount = 0;
  for (let start = 0; start < bootstrapSeries.length; start += 1) {
    for (let offset = 0; offset < blockMonths; offset += 1) {
      const observation = bootstrapSeries[(start + offset) % bootstrapSeries.length];
      sampledRealLogSum += realLogReturnForObservation(observation);
      sampledObservationCount += 1;
    }
  }

  return Math.expm1((sampledRealLogSum / sampledObservationCount) * 12);
}

function realLogReturnForObservation(observation) {
  const marketFactor = 1 + Number(observation.marketReturn);
  const inflationRatio = Number(observation.inflationRatio);
  if (!(marketFactor > 0) || !(inflationRatio > 0)) {
    throw new RangeError("Market factors and inflation ratios must be positive.");
  }
  return Math.log(marketFactor / inflationRatio);
}

function recenterBootstrapSeries(bootstrapSeries, expectedRealAnnualReturn) {
  if (expectedRealAnnualReturn === undefined || expectedRealAnnualReturn === null) {
    return bootstrapSeries;
  }
  if (
    !Number.isFinite(expectedRealAnnualReturn) ||
    expectedRealAnnualReturn < MIN_EXPECTED_REAL_RETURN ||
    expectedRealAnnualReturn > MAX_EXPECTED_REAL_RETURN
  ) {
    throw new RangeError("expectedRealAnnualReturn must be between -1 and 1.");
  }
  if (!Array.isArray(bootstrapSeries) || bootstrapSeries.length === 0) {
    throw new RangeError("A non-empty bootstrap series is required.");
  }

  if (expectedRealAnnualReturn === -1) {
    return bootstrapSeries.map((observation) => ({ ...observation, marketReturn: -1 }));
  }

  const sampledRealAnnualReturn = calculateBootstrapSamplingRealCagr(bootstrapSeries);
  if (Math.abs(expectedRealAnnualReturn - sampledRealAnnualReturn) <= 1e-14) {
    return bootstrapSeries;
  }

  const sampledMonthlyRealLog = Math.log1p(sampledRealAnnualReturn) / 12;
  const targetMonthlyRealLog = Math.log1p(expectedRealAnnualReturn) / 12;
  const logShift = targetMonthlyRealLog - sampledMonthlyRealLog;

  return bootstrapSeries.map((observation) => ({
    ...observation,
    marketReturn: Math.expm1(Math.log1p(observation.marketReturn) + logShift),
  }));
}

function buildLoadedMessage(data) {
  const overlapStart = parseSeriesMonthKey(data.market.bootstrapSeries[0]?.key);
  const overlapEnd = parseSeriesMonthKey(data.market.bootstrapSeries.at(-1)?.key);
  return t("status.dataLoaded", {
    end: formatAxisDate(overlapEnd),
    start: formatAxisDate(overlapStart),
    years: Math.floor(data.market.bootstrapSeries.length / 12),
  });
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

function buildDataStatusText(
  data,
  _adjustInflation,
  _adjustInflowsForInflation = false,
  _expectedRealAnnualReturn,
) {
  if (!data) {
    return t("status.loadingData");
  }

  return buildLoadedMessage(data);
}

function setDataStatus(options = {}) {
  if (!elements.dataStatus) {
    return;
  }
  elements.dataStatus.textContent = buildDataStatusText(
    datasets,
    uiState.adjustInflation,
    uiState.adjustInflowsForInflation,
    uiState.expectedRealReturnMode === RETURN_MODE_CUSTOM ? uiState.customExpectedRealReturn : undefined,
  );
}

function chartLoadingPatternText(step = 0) {
  return CHART_LOADING_SEQUENCE[step % CHART_LOADING_SEQUENCE.length];
}

function showChartLoadingIndicator() {
  if (!elements.chartLoading) {
    return;
  }

  chartLoadingStep = 0;
  elements.chartLoading.textContent = chartLoadingPatternText(chartLoadingStep);
  elements.chartLoading.classList.remove("hidden");

  if (chartLoadingTimer !== null) {
    clearInterval(chartLoadingTimer);
  }

  chartLoadingTimer = window.setInterval(() => {
    chartLoadingStep = (chartLoadingStep + 1) % CHART_LOADING_SEQUENCE.length;
    elements.chartLoading.textContent = chartLoadingPatternText(chartLoadingStep);
  }, CHART_LOADING_FRAME_MS);
}

function hideChartLoadingIndicator() {
  if (!elements.chartLoading) {
    return;
  }

  if (chartLoadingTimer !== null) {
    clearInterval(chartLoadingTimer);
    chartLoadingTimer = null;
  }

  chartLoadingStep = 0;
  elements.chartLoading.classList.add("hidden");
  elements.chartLoading.textContent = chartLoadingPatternText(chartLoadingStep);
}

function childRowShortLabel(index) {
  const childLabel = t("controls.child");
  return index === 0 ? childLabel : `${childLabel} ${toRoman(index + 1)}`;
}

function parseChildBirthYearInput(options) {
  const normalizedYear = String(options.yearValue ?? "").trim();

  if (!normalizedYear || options.hasBadInput) {
    // Empty untouched rows are treated as placeholders rather than validation errors so the user
    // can add a child row before deciding whether to fill it.
    if (!options.hasInteracted && !options.hasBadInput) {
      return null;
    }
    throw new Error(t("errors.childBirthYearInvalid", { rowLabel: options.rowLabel }));
  }

  const numericYear = Number(normalizedYear);
  if (!Number.isInteger(numericYear)) {
    throw new Error(t("errors.childBirthYearRange", { rowLabel: options.rowLabel }));
  }

  const birthdate = parseMonthYearInput(undefined, String(numericYear));
  if (!birthdate) {
    throw new Error(t("errors.childBirthYearRange", { rowLabel: options.rowLabel }));
  }

  return birthdate;
}

function readHouseholdState() {
  const applicantBirthdate = parseMonthYearInput(elements.applicantBirthMonth?.value, elements.applicantBirthYear.value);
  const spouseBirthdate = uiState.hasSpouse
    ? parseMonthYearInput(elements.spouseBirthMonth?.value, elements.spouseBirthYear.value)
    : null;
  const retirementAge = clamp(Number(elements.retirementAge.value) || 67, 50, 75);
  const spouseRetirementAge = clamp(Number(elements.spouseRetirementAge.value) || 67, 50, 75);
  const annualFeeRate = sanitizePercent(elements.projectedFee.value, 1.5);
  const childBenefitDurationYears = readChildBenefitDuration();
  validateExpectedRealReturn();

  if (!applicantBirthdate) {
    throw new Error(t("errors.applicantBirthdate"));
  }

  if (uiState.hasSpouse && !spouseBirthdate) {
    throw new Error(t("errors.spouseBirthdate"));
  }

  const children = Array.from(elements.childrenList.querySelectorAll(".child-row"))
    .map((row, index) => {
      const yearInput = row.querySelector(".child-birth-year");
      return parseChildBirthYearInput({
        hasBadInput: yearInput?.validity?.badInput ?? false,
        hasInteracted: row.dataset.hasInteracted === "true",
        rowLabel: childRowShortLabel(index),
        yearValue: yearInput?.value,
      });
    })
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
    childBenefitDurationYears,
    annualFeeRate,
  };
}

function readChildBenefitDuration() {
  const duration = Number(elements.childBenefitDuration.value);
  if (
    elements.childBenefitDuration.validity.badInput ||
    !Number.isInteger(duration) ||
    duration < MIN_CHILD_BENEFIT_YEARS ||
    duration > MAX_CHILD_BENEFIT_YEARS
  ) {
    throw new Error(t("errors.childBenefitDuration"));
  }
  return duration;
}

function validateExpectedRealReturn() {
  if (uiState.expectedRealReturnMode === RETURN_MODE_HISTORICAL) {
    return;
  }
  const percent = Number(elements.expectedRealReturn.value);
  if (
    elements.expectedRealReturn.validity.badInput ||
    !Number.isFinite(percent) ||
    percent < MIN_EXPECTED_REAL_RETURN * 100 ||
    percent > MAX_EXPECTED_REAL_RETURN * 100
  ) {
    throw new Error(t("errors.expectedRealReturn"));
  }
  uiState.customExpectedRealReturn = percent / 100;
}

function parseMonthYearInput(monthValue, yearValue) {
  if (!yearValue) {
    return null;
  }
  const year = Number(yearValue);
  const month = monthValue ? Number(monthValue) : DEFAULT_BIRTH_MONTH;
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

  const token = ++recomputeToken;
  clearError();
  cancelActiveSimulationRequest();
  let household;

  try {
    household = readHouseholdState();
  } catch (error) {
    hideChartLoadingIndicator();
    setDataStatus();
    showError(error.message);
    return;
  }

  hoverState = null;
  hideChartHover();
  markWithdrawalSummaryBusy();
  showChartLoadingIndicator();
  setDataStatus();
  // Token-gating makes every async calculation idempotent from the UI's perspective:
  // only the newest completed request is allowed to update the rendered outputs.
  requestSimulation(household, token)
    .then((result) => {
      if (token !== recomputeToken) {
        return;
      }

      hideChartLoadingIndicator();
      latestChartState = result;
      latestChartRenderState = null;
      saveSession();
      setDataStatus();
      renderSummary(result, uiState.adjustInflation);
      renderChart(result);
    })
    .catch((error) => {
      if (token !== recomputeToken || error?.name === "CancelledSimulationError") {
        return;
      }

      hideChartLoadingIndicator();
      setDataStatus();
      showError(error.message);
    });
}

function resolveWithdrawalRate(value) {
  if (value === undefined || value === null) {
    return DEFAULT_WITHDRAWAL_RATE;
  }
  const rate = Number(value);
  if (
    !Number.isFinite(rate) ||
    rate < MIN_WITHDRAWAL_RATE ||
    rate > MAX_WITHDRAWAL_RATE
  ) {
    throw new RangeError("withdrawalRate must be between 0 and 1.");
  }
  return rate;
}

function resolveWithdrawalRateCandidates(values, selectedRate) {
  const source = Array.isArray(values) && values.length > 0
    ? [...values, selectedRate]
    : [selectedRate];
  const unique = [];
  for (const value of source) {
    const rate = resolveWithdrawalRate(value);
    if (!unique.some((candidate) => Math.abs(candidate - rate) < 1e-12)) {
      unique.push(rate);
    }
  }
  return unique;
}

function simulateHousehold(household, data, options = {}) {
  const sourceBootstrapSeries = Array.isArray(data) ? data : data.market.bootstrapSeries;
  const bootstrapSeries = recenterBootstrapSeries(sourceBootstrapSeries, options.expectedRealAnnualReturn);
  const samplingMode = options.samplingMode ?? SAMPLING_MODE_BLOCK_BOOTSTRAP;
  const withdrawalRate = resolveWithdrawalRate(options.withdrawalRate);
  const withdrawalRateCandidates = resolveWithdrawalRateCandidates(
    options.withdrawalRateCandidates,
    withdrawalRate,
  );
  const maxAge = Number.isFinite(options.maxAge) ? options.maxAge : MAX_AGE;
  const now = options.now ? new Date(options.now) : new Date();
  let resolvedSimulationCount = Number.isFinite(options.simulationCount) ? options.simulationCount : SIMULATION_COUNT;
  const resolvedSeedOffset =
    options.simulationSeedOffset === undefined ? simulationSeedOffset : Number(options.simulationSeedOffset) || 0;
  const adjustInflowsForInflation = Boolean(options.adjustInflowsForInflation);
  const applicantAge = preciseAge(household.applicant.birthdate, now);
  if (applicantAge >= maxAge) {
    throw new Error(t("errors.applicantTooOld"));
  }

  const years = Math.ceil(maxAge - applicantAge);
  const totalMonths = years * 12;
  const historicalPaths =
    samplingMode === SAMPLING_MODE_HISTORICAL_PATHS
      ? buildHistoricalPaths(bootstrapSeries, totalMonths, {
          startMonth: now.getMonth() + 1,
        })
      : null;
  if (historicalPaths) {
    resolvedSimulationCount = historicalPaths.length;
  }
  const chartYearStart = now.getFullYear();
  const chartYearEnd = addMonths(now, totalMonths - 1).getFullYear();
  const chartYears = chartYearEnd - chartYearStart + 1;
  // We keep full path samples per year so we can derive medians and percentile bands after all
  // simulations finish, rather than committing to a single aggregate during the run.
  const paths = {
    householdNominal: Array.from({ length: years + 1 }, () => []),
    householdReal: Array.from({ length: years + 1 }, () => []),
    applicantNominal: Array.from({ length: years + 1 }, () => []),
    applicantReal: Array.from({ length: years + 1 }, () => []),
    spouseNominal: Array.from({ length: years + 1 }, () => []),
    spouseReal: Array.from({ length: years + 1 }, () => []),
    contributionsNominal: Array.from({ length: years + 1 }, () => []),
    contributionsReal: Array.from({ length: years + 1 }, () => []),
    inflowsNominal: Array.from({ length: years + 1 }, () => []),
    inflowsReal: Array.from({ length: years + 1 }, () => []),
    withdrawalsNominal: Array.from({ length: years + 1 }, () => []),
    withdrawalsReal: Array.from({ length: years + 1 }, () => []),
  };
  const chartPaths = {
    householdNominal: Array.from({ length: chartYears }, () => []),
    householdReal: Array.from({ length: chartYears }, () => []),
    contributionsNominal: Array.from({ length: chartYears }, () => []),
    contributionsReal: Array.from({ length: chartYears }, () => []),
    inflowsNominal: Array.from({ length: chartYears }, () => []),
    inflowsReal: Array.from({ length: chartYears }, () => []),
    withdrawalsNominal: Array.from({ length: chartYears }, () => []),
    withdrawalsReal: Array.from({ length: chartYears }, () => []),
  };

  let aggregateSupport = 0;
  const withdrawalOutcomes = [];
  const withdrawalRateSuccessCounts = new Map(
    withdrawalRateCandidates.map((rate) => [rate, 0]),
  );

  for (let iteration = 0; iteration < resolvedSimulationCount; iteration += 1) {
    const monthlyPath = historicalPaths
      ? historicalPaths[iteration].observations
      : makeBootstrapPath(
          bootstrapSeries,
          totalMonths,
          mulberry32(seedForIteration(iteration, resolvedSeedOffset)),
        );
    const path = projectPath(
      household,
      monthlyPath,
      now,
      years,
      adjustInflowsForInflation,
      withdrawalRate,
      withdrawalRateCandidates,
    );
    aggregateSupport += path.totalSupport;
    withdrawalOutcomes.push(path.withdrawalOutcome);
    for (const outcome of path.withdrawalRateOutcomes) {
      if (outcome.success) {
        withdrawalRateSuccessCounts.set(
          outcome.withdrawalRate,
          withdrawalRateSuccessCounts.get(outcome.withdrawalRate) + 1,
        );
      }
    }

    for (let yearIndex = 0; yearIndex <= years; yearIndex += 1) {
      paths.householdNominal[yearIndex].push(path.householdNominal[yearIndex]);
      paths.householdReal[yearIndex].push(path.householdReal[yearIndex]);
      paths.applicantNominal[yearIndex].push(path.applicantNominal[yearIndex]);
      paths.applicantReal[yearIndex].push(path.applicantReal[yearIndex]);
      paths.spouseNominal[yearIndex].push(path.spouseNominal[yearIndex]);
      paths.spouseReal[yearIndex].push(path.spouseReal[yearIndex]);
      paths.contributionsNominal[yearIndex].push(path.householdContributionNominal[yearIndex]);
      paths.contributionsReal[yearIndex].push(path.householdContributionReal[yearIndex]);
      paths.inflowsNominal[yearIndex].push(path.householdInflowNominal[yearIndex]);
      paths.inflowsReal[yearIndex].push(path.householdInflowReal[yearIndex]);
      paths.withdrawalsNominal[yearIndex].push(path.householdWithdrawalNominal[yearIndex]);
      paths.withdrawalsReal[yearIndex].push(path.householdWithdrawalReal[yearIndex]);
    }

    for (let chartIndex = 0; chartIndex < chartYears; chartIndex += 1) {
      chartPaths.householdNominal[chartIndex].push(path.chartStats[chartIndex].nominal.household);
      chartPaths.householdReal[chartIndex].push(path.chartStats[chartIndex].real.household);
      chartPaths.contributionsNominal[chartIndex].push(path.chartStats[chartIndex].nominal.contributions);
      chartPaths.contributionsReal[chartIndex].push(path.chartStats[chartIndex].real.contributions);
      chartPaths.inflowsNominal[chartIndex].push(path.chartStats[chartIndex].nominal.inflows);
      chartPaths.inflowsReal[chartIndex].push(path.chartStats[chartIndex].real.inflows);
      chartPaths.withdrawalsNominal[chartIndex].push(path.chartStats[chartIndex].nominal.withdrawals);
      chartPaths.withdrawalsReal[chartIndex].push(path.chartStats[chartIndex].real.withdrawals);
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
        inflows: summarizeSamples(paths.inflowsNominal[yearIndex]),
        withdrawals: summarizeSamples(paths.withdrawalsNominal[yearIndex]),
      },
      real: {
        household: summarizeSamples(paths.householdReal[yearIndex]),
        applicant: summarizeSamples(paths.applicantReal[yearIndex]),
        spouse: summarizeSamples(paths.spouseReal[yearIndex]),
        contributions: summarizeSamples(paths.contributionsReal[yearIndex]),
        inflows: summarizeSamples(paths.inflowsReal[yearIndex]),
        withdrawals: summarizeSamples(paths.withdrawalsReal[yearIndex]),
      },
    });
  }

  const chartStats = [];
  for (let chartIndex = 0; chartIndex < chartYears; chartIndex += 1) {
    const pointDate = new Date(chartYearStart + chartIndex, 0, 1);
    chartStats.push({
      chartIndex,
      pointDate,
      applicantAge: preciseAge(household.applicant.birthdate, pointDate),
      spouseAge: household.spouse ? preciseAge(household.spouse.birthdate, pointDate) : null,
      nominal: {
        household: summarizeSamples(chartPaths.householdNominal[chartIndex]),
        contributions: summarizeSamples(chartPaths.contributionsNominal[chartIndex]),
        inflows: summarizeSamples(chartPaths.inflowsNominal[chartIndex]),
        withdrawals: summarizeSamples(chartPaths.withdrawalsNominal[chartIndex]),
      },
      real: {
        household: summarizeSamples(chartPaths.householdReal[chartIndex]),
        contributions: summarizeSamples(chartPaths.contributionsReal[chartIndex]),
        inflows: summarizeSamples(chartPaths.inflowsReal[chartIndex]),
        withdrawals: summarizeSamples(chartPaths.withdrawalsReal[chartIndex]),
      },
    });
  }

  const retirementYear = clamp(Math.ceil(household.applicant.retirementAge - applicantAge), 0, years);
  const spouseRetirementYear =
    spouseAgeNow === null ? null : clamp(Math.ceil(household.spouse.retirementAge - spouseAgeNow), 0, years);
  const preRetirementYear = Math.max(retirementYear, spouseRetirementYear ?? retirementYear);
  const applicantRetirementDate = retirementDateForPerson(household.applicant.birthdate, household.applicant.retirementAge);
  const spouseRetirementDate = household.spouse
    ? retirementDateForPerson(household.spouse.birthdate, household.spouse.retirementAge)
    : null;
  const retirementChartPosition = chartPositionForDate(applicantRetirementDate, chartYearStart, chartYears);
  const spouseRetirementChartPosition = spouseRetirementDate
    ? chartPositionForDate(spouseRetirementDate, chartYearStart, chartYears)
    : null;
  const preRetirementChartIndex = Math.max(
    Math.floor(retirementChartPosition),
    spouseRetirementChartPosition === null ? Math.floor(retirementChartPosition) : Math.floor(spouseRetirementChartPosition),
  );

  return {
    pathCount: resolvedSimulationCount,
    samplingMode,
    historicalPathStartKeys: historicalPaths?.map((path) => path.startKey) ?? null,
    historicalPathEndKeys: historicalPaths?.map((path) => path.endKey) ?? null,
    years,
    yearlyStats,
    chartStats,
    retirementYear,
    spouseRetirementYear,
    preRetirementYear,
    retirementChartPosition,
    spouseRetirementChartPosition,
    preRetirementChartIndex,
    averageAnnualSupport: aggregateSupport / (resolvedSimulationCount * years),
    withdrawalRate,
    withdrawalStats: summarizeWithdrawalOutcomes(
      withdrawalOutcomes,
      maxAge,
      withdrawalRate,
    ),
    withdrawalRateStats: withdrawalRateCandidates.map((rate) => ({
      withdrawalRate: rate,
      pathCount: resolvedSimulationCount,
      successfulPathCount: withdrawalRateSuccessCounts.get(rate),
      failedPathCount:
        resolvedSimulationCount - withdrawalRateSuccessCounts.get(rate),
      successRate:
        withdrawalRateSuccessCounts.get(rate) /
        Math.max(resolvedSimulationCount, 1),
    })),
    hasSpouse: Boolean(household.spouse),
  };
}

function createWithdrawalRateTrackers(rates) {
  return rates.map((withdrawalRate) => ({
    withdrawalRate,
    value: 0,
    monthlyWithdrawalReal: 0,
    initialized: false,
    success: true,
  }));
}

function advanceWithdrawalRateTrackers(
  trackers,
  {
    contribution,
    cumulativeInflation,
    monthlyFeeFactor,
    monthlyReturn,
    sourceValueAtWithdrawalStart,
    startsWithdrawal,
  },
) {
  for (const tracker of trackers) {
    if (!tracker.success && tracker.initialized) {
      continue;
    }
    if (tracker.initialized) {
      tracker.value =
        (tracker.value * (1 + monthlyReturn) + contribution) *
        monthlyFeeFactor;
    } else if (startsWithdrawal) {
      tracker.value = sourceValueAtWithdrawalStart;
      tracker.monthlyWithdrawalReal =
        ((tracker.value / cumulativeInflation) * tracker.withdrawalRate) / 12;
      tracker.initialized = true;
    }
    if (!tracker.initialized) {
      continue;
    }

    const requestedWithdrawalNominal =
      tracker.monthlyWithdrawalReal * cumulativeInflation;
    const paidWithdrawalNominal = Math.min(
      tracker.value,
      requestedWithdrawalNominal,
    );
    const shortfallNominal =
      requestedWithdrawalNominal - paidWithdrawalNominal;
    tracker.value -= paidWithdrawalNominal;
    if (
      shortfallNominal >
      WITHDRAWAL_SHORTFALL_EPSILON *
        Math.max(1, requestedWithdrawalNominal)
    ) {
      tracker.success = false;
    }
  }
}

function creditWithdrawalRateTrackers(trackers, support) {
  for (const tracker of trackers) {
    if (tracker.initialized && tracker.success) {
      tracker.value += support;
    }
  }
}

function projectPath(
  household,
  bootstrap,
  now,
  years,
  adjustInflowsForInflation = false,
  withdrawalRate = DEFAULT_WITHDRAWAL_RATE,
  withdrawalRateCandidates = [withdrawalRate],
) {
  const resolvedWithdrawalRate = resolveWithdrawalRate(withdrawalRate);
  const resolvedWithdrawalRateCandidates = resolveWithdrawalRateCandidates(
    withdrawalRateCandidates,
    resolvedWithdrawalRate,
  );
  let applicantValue = household.applicant.initialBalance;
  let spouseValue = 0;
  let totalSupport = 0;
  let householdContributionValue = 0;
  let householdContributionRealValue = 0;
  let householdInflowValue = 0;
  let householdInflowRealValue = 0;
  let cumulativeInflation = 1;
  const monthlyFeeFactor = Math.pow(1 - household.annualFeeRate, 1 / 12);
  let applicantMonthlyWithdrawalReal = 0;
  let spouseMonthlyWithdrawalReal = 0;
  let applicantWithdrawalInitialized = false;
  let spouseWithdrawalInitialized = false;
  let latestHouseholdWithdrawalNominal = 0;
  let latestHouseholdWithdrawalReal = 0;
  let cumulativeRequestedWithdrawalNominal = 0;
  let cumulativeRequestedWithdrawalReal = 0;
  let cumulativePaidWithdrawalNominal = 0;
  let cumulativePaidWithdrawalReal = 0;
  let cumulativeWithdrawalShortfallNominal = 0;
  let cumulativeWithdrawalShortfallReal = 0;
  let firstWithdrawalShortfallDate = null;
  let firstWithdrawalShortfallApplicantAge = null;
  const applicantWithdrawalRateTrackers = createWithdrawalRateTrackers(
    resolvedWithdrawalRateCandidates,
  );
  const spouseWithdrawalRateTrackers = household.spouse
    ? createWithdrawalRateTrackers(resolvedWithdrawalRateCandidates)
    : [];

  const applicantNominal = [applicantValue];
  const spouseNominal = [0];
  const householdNominal = [applicantValue];
  const applicantReal = [applicantValue];
  const spouseReal = [0];
  const householdReal = [applicantValue];
  const householdContributionNominal = [0];
  const householdContributionReal = [0];
  const householdInflowNominal = [0];
  const householdInflowReal = [0];
  const householdWithdrawalNominal = [0];
  const householdWithdrawalReal = [0];
  const chartYearStart = now.getFullYear();
  const chartYearEnd = addMonths(now, bootstrap.length - 1).getFullYear();
  const chartBuckets = Array.from({ length: chartYearEnd - chartYearStart + 1 }, (_, index) =>
    createChartYearBucket(chartYearStart + index),
  );

  let applicantAnnualContribution = 0;
  let spouseAnnualContribution = 0;

  for (let monthIndex = 0; monthIndex < bootstrap.length; monthIndex += 1) {
    const monthlySample = bootstrap[monthIndex];
    const monthlyReturn = monthlySample.marketReturn;
    const monthDate = addMonths(now, monthIndex);
    const nextMonthDate = addMonths(now, monthIndex + 1);

    const applicantAgeAtMonth = preciseAge(household.applicant.birthdate, monthDate);
    const applicantBaseContribution =
      applicantAgeAtMonth < household.applicant.retirementAge ? household.applicant.monthlyContribution : 0;
    const applicantContribution = adjustInflowsForInflation
      ? applicantBaseContribution * cumulativeInflation
      : applicantBaseContribution;
    applicantValue = (applicantValue * (1 + monthlyReturn) + applicantContribution) * monthlyFeeFactor;
    const applicantStartsWithdrawal =
      !applicantWithdrawalInitialized &&
      preciseAge(household.applicant.birthdate, nextMonthDate) >=
        household.applicant.retirementAge;
    advanceWithdrawalRateTrackers(applicantWithdrawalRateTrackers, {
      contribution: applicantContribution,
      cumulativeInflation,
      monthlyFeeFactor,
      monthlyReturn,
      sourceValueAtWithdrawalStart: applicantValue,
      startsWithdrawal: applicantStartsWithdrawal,
    });
    if (applicantStartsWithdrawal) {
      // Withdrawals start once at retirement using the selected annualized rate in real terms and
      // are then carried forward with inflation instead of being recalculated from future balances.
      applicantMonthlyWithdrawalReal =
        ((applicantValue / cumulativeInflation) * resolvedWithdrawalRate) / 12;
      applicantWithdrawalInitialized = true;
    }
    const applicantRequestedWithdrawalNominal =
      applicantMonthlyWithdrawalReal * cumulativeInflation;
    const applicantPaidWithdrawalNominal = Math.min(
      applicantValue,
      applicantRequestedWithdrawalNominal,
    );
    const applicantWithdrawalShortfallNominal =
      applicantRequestedWithdrawalNominal - applicantPaidWithdrawalNominal;
    applicantValue -= applicantPaidWithdrawalNominal;
    applicantAnnualContribution += applicantContribution;
    householdContributionValue += applicantContribution;
    householdContributionRealValue += applicantContribution / cumulativeInflation;
    householdInflowValue += applicantContribution;
    householdInflowRealValue += applicantContribution / cumulativeInflation;

    let spouseContribution = 0;
    if (household.spouse) {
      const spouseAgeAtMonth = preciseAge(household.spouse.birthdate, monthDate);
      const spouseBaseContribution =
        spouseAgeAtMonth < household.spouse.retirementAge ? household.spouse.monthlyContribution : 0;
      spouseContribution = adjustInflowsForInflation ? spouseBaseContribution * cumulativeInflation : spouseBaseContribution;
      spouseValue = (spouseValue * (1 + monthlyReturn) + spouseContribution) * monthlyFeeFactor;
      const spouseStartsWithdrawal =
        !spouseWithdrawalInitialized &&
        preciseAge(household.spouse.birthdate, nextMonthDate) >=
          household.spouse.retirementAge;
      advanceWithdrawalRateTrackers(spouseWithdrawalRateTrackers, {
        contribution: spouseContribution,
        cumulativeInflation,
        monthlyFeeFactor,
        monthlyReturn,
        sourceValueAtWithdrawalStart: spouseValue,
        startsWithdrawal: spouseStartsWithdrawal,
      });
      if (spouseStartsWithdrawal) {
        spouseMonthlyWithdrawalReal =
          ((spouseValue / cumulativeInflation) * resolvedWithdrawalRate) / 12;
        spouseWithdrawalInitialized = true;
      }
      spouseAnnualContribution += spouseContribution;
      householdContributionValue += spouseContribution;
      householdContributionRealValue += spouseContribution / cumulativeInflation;
      householdInflowValue += spouseContribution;
      householdInflowRealValue += spouseContribution / cumulativeInflation;
    }

    const spouseRequestedWithdrawalNominal =
      spouseMonthlyWithdrawalReal * cumulativeInflation;
    const spousePaidWithdrawalNominal = Math.min(
      spouseValue,
      spouseRequestedWithdrawalNominal,
    );
    const spouseWithdrawalShortfallNominal =
      spouseRequestedWithdrawalNominal - spousePaidWithdrawalNominal;
    spouseValue -= spousePaidWithdrawalNominal;

    const requestedWithdrawalNominal =
      applicantRequestedWithdrawalNominal + spouseRequestedWithdrawalNominal;
    const paidWithdrawalNominal =
      applicantPaidWithdrawalNominal + spousePaidWithdrawalNominal;
    const withdrawalShortfallNominal =
      applicantWithdrawalShortfallNominal + spouseWithdrawalShortfallNominal;
    const requestedWithdrawalReal = requestedWithdrawalNominal / cumulativeInflation;
    const paidWithdrawalReal = paidWithdrawalNominal / cumulativeInflation;
    const withdrawalShortfallReal = withdrawalShortfallNominal / cumulativeInflation;

    latestHouseholdWithdrawalNominal = paidWithdrawalNominal;
    latestHouseholdWithdrawalReal = paidWithdrawalReal;
    cumulativeRequestedWithdrawalNominal += requestedWithdrawalNominal;
    cumulativeRequestedWithdrawalReal += requestedWithdrawalReal;
    cumulativePaidWithdrawalNominal += paidWithdrawalNominal;
    cumulativePaidWithdrawalReal += paidWithdrawalReal;
    cumulativeWithdrawalShortfallNominal += withdrawalShortfallNominal;
    cumulativeWithdrawalShortfallReal += withdrawalShortfallReal;
    if (
      firstWithdrawalShortfallDate === null &&
      withdrawalShortfallNominal >
        WITHDRAWAL_SHORTFALL_EPSILON * Math.max(1, requestedWithdrawalNominal)
    ) {
      firstWithdrawalShortfallDate = nextMonthDate;
      firstWithdrawalShortfallApplicantAge = preciseAge(
        household.applicant.birthdate,
        nextMonthDate,
      );
    }

    cumulativeInflation *= monthlySample.inflationRatio;

    if ((monthIndex + 1) % 12 === 0) {
      const yearEndDate = addMonths(now, monthIndex + 1);
      const yearIndex = (monthIndex + 1) / 12;
      // Support is modeled as an annual top-up after the year's contributions have been made.
      const support = annualSupportForYear(household, {
        applicantAnnualContribution,
        spouseAnnualContribution,
        yearEndDate,
        yearIndex,
      });
      const supportInflationFactor = adjustInflowsForInflation ? cumulativeInflation : 1;
      const applicantSupport = support.applicant * supportInflationFactor;
      const spouseSupport = support.spouse * supportInflationFactor;

      applicantValue += applicantSupport;
      spouseValue += spouseSupport;
      creditWithdrawalRateTrackers(
        applicantWithdrawalRateTrackers,
        applicantSupport,
      );
      creditWithdrawalRateTrackers(
        spouseWithdrawalRateTrackers,
        spouseSupport,
      );
      totalSupport += applicantSupport + spouseSupport;
      householdInflowValue += applicantSupport + spouseSupport;
      householdInflowRealValue += (applicantSupport + spouseSupport) / cumulativeInflation;

      applicantNominal.push(applicantValue);
      spouseNominal.push(spouseValue);
      householdNominal.push(applicantValue + spouseValue);
      applicantReal.push(applicantValue / cumulativeInflation);
      spouseReal.push(spouseValue / cumulativeInflation);
      householdReal.push((applicantValue + spouseValue) / cumulativeInflation);
      householdContributionNominal.push(householdContributionValue);
      householdContributionReal.push(householdContributionRealValue);
      householdInflowNominal.push(householdInflowValue);
      householdInflowReal.push(householdInflowRealValue);
      householdWithdrawalNominal.push(latestHouseholdWithdrawalNominal);
      householdWithdrawalReal.push(latestHouseholdWithdrawalReal);

      applicantAnnualContribution = 0;
      spouseAnnualContribution = 0;
    }

    const chartBucket = chartBuckets[monthDate.getFullYear() - chartYearStart];
    const householdNominalValue = applicantValue + spouseValue;
    chartBucket.count += 1;
    chartBucket.nominal.household += householdNominalValue;
    chartBucket.real.household += householdNominalValue / cumulativeInflation;
    chartBucket.nominal.contributions += householdContributionValue;
    chartBucket.real.contributions += householdContributionRealValue;
    chartBucket.nominal.inflows += householdInflowValue;
    chartBucket.real.inflows += householdInflowRealValue;
    chartBucket.nominal.withdrawals += latestHouseholdWithdrawalNominal;
    chartBucket.real.withdrawals += latestHouseholdWithdrawalReal;
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
    householdInflowNominal.push(householdInflowValue);
    householdInflowReal.push(householdInflowRealValue);
    householdWithdrawalNominal.push(latestHouseholdWithdrawalNominal);
    householdWithdrawalReal.push(latestHouseholdWithdrawalReal);
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
    householdInflowNominal,
    householdInflowReal,
    householdWithdrawalNominal,
    householdWithdrawalReal,
    chartStats: chartBuckets.map(finalizeChartYearBucket),
    totalSupport,
    withdrawalOutcome: {
      withdrawalRate: resolvedWithdrawalRate,
      success: firstWithdrawalShortfallDate === null,
      firstShortfallDate: firstWithdrawalShortfallDate,
      firstShortfallApplicantAge: firstWithdrawalShortfallApplicantAge,
      cumulativeRequestedNominal: cumulativeRequestedWithdrawalNominal,
      cumulativeRequestedReal: cumulativeRequestedWithdrawalReal,
      cumulativePaidNominal: cumulativePaidWithdrawalNominal,
      cumulativePaidReal: cumulativePaidWithdrawalReal,
      cumulativeShortfallNominal: cumulativeWithdrawalShortfallNominal,
      cumulativeShortfallReal: cumulativeWithdrawalShortfallReal,
    },
    withdrawalRateOutcomes: resolvedWithdrawalRateCandidates.map(
      (candidateRate, index) => ({
        withdrawalRate: candidateRate,
        success:
          applicantWithdrawalRateTrackers[index].success &&
          (spouseWithdrawalRateTrackers[index]?.success ?? true),
      }),
    ),
  };
}

function createChartYearBucket(year) {
  return {
    year,
    count: 0,
    nominal: {
      household: 0,
      contributions: 0,
      inflows: 0,
      withdrawals: 0,
    },
    real: {
      household: 0,
      contributions: 0,
      inflows: 0,
      withdrawals: 0,
    },
  };
}

function finalizeChartYearBucket(bucket) {
  const divisor = Math.max(bucket.count, 1);
  return {
    pointDate: new Date(bucket.year, 0, 1),
    nominal: {
      household: bucket.nominal.household / divisor,
      contributions: bucket.nominal.contributions / divisor,
      inflows: bucket.nominal.inflows / divisor,
      withdrawals: bucket.nominal.withdrawals / divisor,
    },
    real: {
      household: bucket.real.household / divisor,
      contributions: bucket.real.contributions / divisor,
      inflows: bucket.real.inflows / divisor,
      withdrawals: bucket.real.withdrawals / divisor,
    },
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

  // Child support is shared in proportion to each adult's eligible contribution base so the
  // household-level child subsidy can still be attributed back to applicant and spouse balances.
  const childBenefitDurationYears =
    Number.isInteger(household.childBenefitDurationYears) &&
    household.childBenefitDurationYears >= MIN_CHILD_BENEFIT_YEARS &&
    household.childBenefitDurationYears <= MAX_CHILD_BENEFIT_YEARS
      ? household.childBenefitDurationYears
      : DEFAULT_CHILD_BENEFIT_YEARS;
  const eligibleChildren = household.children.filter(
    (birthdate) => preciseAge(birthdate, context.yearEndDate) < childBenefitDurationYears,
  ).length;
  // This app continues to model child support proportionally, but now reaches the full
  // EUR 300 allowance once household contributions hit EUR 300/year (EUR 25/month).
  const applicantEligibleChildBase = Math.min(context.applicantAnnualContribution, 300);
  const spouseEligibleChildBase = Math.min(context.spouseAnnualContribution, 300);
  const householdEligibleChildBase = Math.min(applicantEligibleChildBase + spouseEligibleChildBase, 300);
  const childSubsidyTotal = eligibleChildren * householdEligibleChildBase;
  const contributionWeightTotal = applicantEligibleChildBase + spouseEligibleChildBase;

  const applicantChildSubsidy =
    contributionWeightTotal > 0 ? childSubsidyTotal * (applicantEligibleChildBase / contributionWeightTotal) : 0;
  const spouseChildSubsidy =
    contributionWeightTotal > 0 ? childSubsidyTotal * (spouseEligibleChildBase / contributionWeightTotal) : 0;

  const applicantDirect = applicantBase + applicantStarter + applicantChildSubsidy;
  const spouseDirect = spouseBase + spouseStarter + spouseChildSubsidy;
  // The simplified tax benefit is modeled as "marginal relief minus direct subsidy", floored at
  // zero so support is never double-counted as both grant and tax credit.
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
  const firstTier = Math.min(annualContribution, 360) * 0.5;
  const secondTier = Math.min(Math.max(annualContribution - 360, 0), 1440) * 0.25;
  return firstTier + secondTier;
}

function makeBootstrapPath(monthlyReturns, targetMonths, random) {
  if (!Array.isArray(monthlyReturns) || monthlyReturns.length === 0) {
    throw new RangeError("A non-empty monthly return series is required.");
  }
  const output = [];

  while (output.length < targetMonths) {
    // Circular blocks allow every historical observation to appear in every block position with
    // equal probability while preserving monthly order except at the explicit circular boundary.
    const start = Math.floor(random() * monthlyReturns.length);
    for (let offset = 0; offset < BOOTSTRAP_BLOCK_MONTHS; offset += 1) {
      output.push(monthlyReturns[(start + offset) % monthlyReturns.length]);
      if (output.length === targetMonths) {
        break;
      }
    }
  }

  return output;
}

function buildHistoricalPaths(
  monthlyReturns,
  targetMonths,
  { startMonth = 1 } = {},
) {
  if (!Array.isArray(monthlyReturns) || monthlyReturns.length === 0) {
    throw new RangeError("A non-empty monthly return series is required.");
  }
  if (!Number.isInteger(targetMonths) || targetMonths < 1) {
    throw new RangeError("targetMonths must be a positive integer.");
  }
  if (!Number.isInteger(startMonth) || startMonth < 1 || startMonth > 12) {
    throw new RangeError("startMonth must be between 1 and 12.");
  }

  const paths = [];
  for (let start = 0; start + targetMonths <= monthlyReturns.length; start += 1) {
    const [, month] = String(monthlyReturns[start].key).split("-");
    if (Number.parseInt(month, 10) !== startMonth) {
      continue;
    }
    const observations = monthlyReturns.slice(start, start + targetMonths);
    paths.push({
      startKey: observations[0].key,
      endKey: observations.at(-1).key,
      observations,
    });
  }

  if (paths.length === 0) {
    throw new RangeError(
      "The historical series is not long enough for this projection horizon.",
    );
  }
  return paths;
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

function summarizeWithdrawalOutcomes(
  outcomes,
  horizonApplicantAge,
  withdrawalRate = DEFAULT_WITHDRAWAL_RATE,
) {
  const failedOutcomes = outcomes.filter((outcome) => !outcome.success);
  const successfulPathCount = outcomes.length - failedOutcomes.length;
  const firstShortfallDateMilliseconds = failedOutcomes.map((outcome) =>
    outcome.firstShortfallDate.getTime(),
  );
  const firstShortfallDateSummary =
    firstShortfallDateMilliseconds.length > 0
      ? summarizeSamples(firstShortfallDateMilliseconds)
      : null;

  return {
    withdrawalRate: resolveWithdrawalRate(withdrawalRate),
    horizonApplicantAge,
    pathCount: outcomes.length,
    successfulPathCount,
    failedPathCount: failedOutcomes.length,
    successRate: successfulPathCount / Math.max(outcomes.length, 1),
    firstShortfallApplicantAge:
      failedOutcomes.length > 0
        ? summarizeSamples(
            failedOutcomes.map((outcome) => outcome.firstShortfallApplicantAge),
          )
        : null,
    firstShortfallDateMedian:
      firstShortfallDateSummary === null
        ? null
        : new Date(firstShortfallDateSummary.median),
    cumulativeRequestedNominal: summarizeSamples(
      outcomes.map((outcome) => outcome.cumulativeRequestedNominal),
    ),
    cumulativeRequestedReal: summarizeSamples(
      outcomes.map((outcome) => outcome.cumulativeRequestedReal),
    ),
    cumulativePaidNominal: summarizeSamples(
      outcomes.map((outcome) => outcome.cumulativePaidNominal),
    ),
    cumulativePaidReal: summarizeSamples(
      outcomes.map((outcome) => outcome.cumulativePaidReal),
    ),
    cumulativeShortfallNominal: summarizeSamples(
      outcomes.map((outcome) => outcome.cumulativeShortfallNominal),
    ),
    cumulativeShortfallReal: summarizeSamples(
      outcomes.map((outcome) => outcome.cumulativeShortfallReal),
    ),
    failedPathCumulativeShortfallNominal:
      failedOutcomes.length > 0
        ? summarizeSamples(
            failedOutcomes.map((outcome) => outcome.cumulativeShortfallNominal),
          )
        : null,
    failedPathCumulativeShortfallReal:
      failedOutcomes.length > 0
        ? summarizeSamples(
            failedOutcomes.map((outcome) => outcome.cumulativeShortfallReal),
          )
        : null,
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

function retirementDateForPerson(birthdate, retirementAge) {
  const retirementDate = new Date(birthdate);
  retirementDate.setFullYear(retirementDate.getFullYear() + retirementAge);
  return retirementDate;
}

function chartPositionForDate(date, chartYearStart, chartYears) {
  const yearFraction = (date.getMonth() + 0.5) / 12;
  return clamp(date.getFullYear() - chartYearStart + yearFraction, 0, Math.max(chartYears - 1, 0));
}

function formatAxisDate(date) {
  return date.toLocaleDateString(activeMessages().locale, { year: "numeric" });
}

function formatTooltipDate(date) {
  return date.toLocaleDateString(activeMessages().locale, { year: "numeric" });
}

function formatAgeYears(age) {
  return String(Math.max(0, Math.floor(age)));
}

function seriesTypeForResult(result) {
  return result.adjustedForInflation ? "real" : "nominal";
}

function markWithdrawalSummaryBusy() {
  elements.withdrawalIncome?.setAttribute("aria-busy", "true");
  elements.withdrawalRate?.setAttribute("aria-busy", "true");
}

function renderSummary(result, adjustInflation) {
  result.adjustedForInflation = adjustInflation;
  const summary = retirementSummaryValues(result, adjustInflation);

  const summaryEls = [elements.retirementValue, elements.withdrawalIncome, elements.finalRange, elements.averageSupport];
  elements.rerunSimulationsButton.textContent = t("results.simulationCount", {
    count: result.pathCount,
  });
  elements.retirementValue.textContent = formatCurrency(summary.retirementValue);
  elements.withdrawalIncome.textContent = formatCurrency(summary.withdrawalIncome);
  elements.withdrawalIncome.setAttribute("aria-busy", "false");
  syncWithdrawalRateControl(result);
  elements.finalRange.textContent = formatCompactRangeEuro(summary.finalRangeMin, summary.finalRangeMax);
  elements.averageSupport.textContent = formatCurrency(summary.averageSupport);
  populateInfoTooltips(result, adjustInflation);
  for (const el of summaryEls) {
    el.classList.remove("value-updated");
    void el.offsetWidth;
    el.classList.add("value-updated");
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

function inflowSeriesType() {
  return uiState.adjustInflowsForInflation ? "real" : "nominal";
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
  const inflowType = inflowSeriesType();
  const points = result.chartStats;
  const preRetirementPoints = points.slice(0, result.preRetirementChartIndex + 1);
  const yAxis = buildNiceYAxis(resolveChartMaxY(preRetirementPoints, seriesType, inflowType));
  const maxY = yAxis.max;
  const chartLength = Math.max(points.length - 1, 1);
  const xScale = (chartIndex) => margin.left + (plotWidth * chartIndex) / chartLength;
  const yScale = (value) => margin.top + plotHeight - (value / maxY) * plotHeight;
  latestChartRenderState = {
    chartLength,
    height,
    margin,
    plotHeight,
    plotWidth,
    result,
    seriesType,
    inflowType,
    width,
    xScale,
    yScale,
  };

  const gridLines = [];
  for (const value of yAxis.ticks) {
    const y = yScale(value);
    gridLines.push(`<line class="grid-line" x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}"></line>`);
    gridLines.push(`<text x="${margin.left - 12}" y="${y + 4}" text-anchor="end">${compactCurrency(value)}</text>`);
  }

  const xTicks = [];
  const tickCount = Math.min(isCompactChart ? 4 : 6, Math.max(points.length - 1, 1));
  for (let tick = 0; tick <= tickCount; tick += 1) {
    const chartIndex = Math.round((chartLength * tick) / Math.max(tickCount, 1));
    const x = xScale(chartIndex);
    const point = points[chartIndex];
    xTicks.push(`<line class="grid-line" x1="${x}" y1="${margin.top}" x2="${x}" y2="${height - margin.bottom}"></line>`);
    xTicks.push(`<text x="${x}" y="${height - 14}" text-anchor="middle">${formatAxisDate(point.pointDate)}</text>`);
  }

  const bandPrePath = buildBandPath(points.slice(0, result.preRetirementChartIndex + 1), xScale, yScale, seriesType);
  const bandPostPath = buildBandPath(points.slice(result.preRetirementChartIndex), xScale, yScale, seriesType);
  // Pre/post retirement segments are rendered separately so styling can switch after withdrawals start.
  const medianPrePath = buildLinePath(
    points.slice(0, result.preRetirementChartIndex + 1),
    xScale,
    (point) => yScale(point[seriesType].household.median),
  );
  const medianPostPath = buildLinePath(
    points.slice(result.preRetirementChartIndex),
    xScale,
    (point) => yScale(point[seriesType].household.median),
  );
  const contributionsPrePath = buildLinePath(
    points.slice(0, result.preRetirementChartIndex + 1),
    xScale,
    (point) => yScale(point[inflowType].inflows.median),
  );
  const contributionsPostPath = buildLinePath(
    points.slice(result.preRetirementChartIndex),
    xScale,
    (point) => yScale(point[inflowType].inflows.median),
  );

  const applicantMarker = markerLine(
    result.retirementChartPosition,
    xScale,
    margin,
    plotHeight,
    colors.markerApplicant,
    t("markers.retirement"),
  );
  const spouseMarker =
    result.hasSpouse && result.spouseRetirementChartPosition !== null
      ? markerLine(result.spouseRetirementChartPosition, xScale, margin, plotHeight, colors.markerSpouse, t("markers.spouseRetirement"), 34)
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
    <g id="hover-layer" class="hidden">
      <line id="hover-line" class="hover-line" x1="0" y1="${margin.top}" x2="0" y2="${height - margin.bottom}"></line>
      <circle id="hover-dot" class="hover-dot" cx="0" cy="0" r="5"></circle>
      <circle id="hover-contribution-dot" class="hover-dot contribution-dot" cx="0" cy="0" r="4.5"></circle>
    </g>
    <rect id="hover-capture" x="${margin.left}" y="${margin.top}" width="${plotWidth}" height="${plotHeight}" fill="transparent"></rect>
  `;

  const hoverCapture = svg.querySelector("#hover-capture");
  hoverCapture.addEventListener("pointermove", handleChartHover);
  hoverCapture.addEventListener("pointerleave", () => {
    hoverState = null;
    hideChartHover();
  });

  renderLegend(result);
  if (hoverState) {
    updateChartHover();
  } else {
    hideChartHover();
  }
}

function handleChartHover(event) {
  if (!latestChartRenderState) {
    return;
  }

  const bounds = elements.chartSvg.getBoundingClientRect();
  // Hover snaps to the nearest yearly chart sample rather than interpolating between years.
  const x = ((event.clientX - bounds.left) / bounds.width) * latestChartRenderState.width;
  const rawYear = ((x - latestChartRenderState.margin.left) / latestChartRenderState.plotWidth) * latestChartRenderState.chartLength;
  hoverState = {
    yearIndex: clamp(Math.round(rawYear), 0, latestChartRenderState.chartLength),
    pointerX: event.clientX - bounds.left,
    pointerY: event.clientY - bounds.top,
  };
  updateChartHover();
}

function hideChartHover() {
  const hoverLayer = elements.chartSvg?.querySelector("#hover-layer");
  if (hoverLayer) {
    hoverLayer.classList.add("hidden");
  }
  elements.chartTooltip.classList.add("hidden");
}

function updateChartHover() {
  if (!latestChartRenderState || !hoverState) {
    hideChartHover();
    return;
  }

  const point = latestChartRenderState.result.chartStats[hoverState.yearIndex];
  const hoverLayer = elements.chartSvg.querySelector("#hover-layer");
  if (!point || !hoverLayer) {
    hideChartHover();
    return;
  }

  const householdValue = point[latestChartRenderState.seriesType].household.median;
  const inflowValue = point[latestChartRenderState.inflowType].inflows.median;
  const x = latestChartRenderState.xScale(hoverState.yearIndex);
  const y = latestChartRenderState.yScale(householdValue);
  const contributionY = latestChartRenderState.yScale(inflowValue);
  hoverLayer.classList.remove("hidden");
  elements.chartSvg.querySelector("#hover-line")?.setAttribute("x1", String(x));
  elements.chartSvg.querySelector("#hover-line")?.setAttribute("x2", String(x));
  elements.chartSvg.querySelector("#hover-dot")?.setAttribute("cx", String(x));
  elements.chartSvg.querySelector("#hover-dot")?.setAttribute("cy", String(y));
  elements.chartSvg.querySelector("#hover-contribution-dot")?.setAttribute("cx", String(x));
  elements.chartSvg.querySelector("#hover-contribution-dot")?.setAttribute("cy", String(contributionY));
  updateTooltip(latestChartRenderState.result, hoverState.yearIndex, hoverState.pointerX, hoverState.pointerY);
}

function updateTooltip(result, yearIndex, pointerX = 20, pointerY = 20) {
  const point = result.chartStats[yearIndex];
  const type = seriesTypeForResult(result);
  const tooltip = elements.chartTooltip;
  const contributionsLabel = contributionsLabelForResult(result);
  const lines = [
    `<strong>${formatTooltipDate(point.pointDate)}</strong>`,
    `<span>${t("chart.ageLabel")}: ${formatAgeYears(point.applicantAge)}</span>`,
  ];

  if (point.spouseAge !== null) {
    lines.push(`<span>${t("chart.spouseAgeLabel")}: ${formatAgeYears(point.spouseAge)}</span>`);
  }

  lines.push(`<span>${t("chart.medianLabel")}: ${formatCurrency(point[type].household.median)}</span>`);
  const inflowModeLabel =
    latestChartRenderState.inflowType === "real"
      ? t("status.inflowsAdjusted").replace(/\.$/, "")
      : t("status.inflowsNominal").replace(/\.$/, "");
  lines.push(`<span>${contributionsLabel} (${inflowModeLabel}): ${formatCurrencyDetailed(point[latestChartRenderState.inflowType].inflows.median)}</span>`);
  lines.push(
    `<span>${t("chart.bandLabel")}: ${formatCurrency(point[type].household.p2_5)} ${t("compactUnits.rangeBandSeparator")} ${formatCurrency(point[type].household.p97_5)}</span>`,
  );
  tooltip.innerHTML = lines.join("");
  tooltip.classList.remove("hidden");

  const wrapperBounds = elements.chartWrapper.getBoundingClientRect();
  const tooltipHeight = tooltip.offsetHeight;
  const tooltipWidth = tooltip.offsetWidth;
  // Clamp the floating tooltip into the chart wrapper so it stays readable near the bottom/right edges.
  const desiredLeft = Math.min(pointerX + 22, wrapperBounds.width - tooltipWidth - 16);
  const desiredTop = Math.min(pointerY + 20, wrapperBounds.height - tooltipHeight - 16);
  tooltip.style.left = `${Math.max(16, desiredLeft)}px`;
  tooltip.style.top = `${Math.max(16, desiredTop)}px`;
}

function renderLegend(result) {
  const contributionsLabel = contributionsLabelForResult(result);
  const items = [
    { label: t("chart.legendValue"), color: "var(--accent)" },
    { label: contributionsLabel, color: colors.contributions },
  ];

  if (uiState.showConfidenceBand) {
    items.splice(1, 0, { label: t("chart.legendBand"), color: "rgba(72, 151, 123, 0.45)" });
  }

  elements.chartLegend.innerHTML = items
    .map(
      (item) =>
        `<span class="legend-item"><span class="legend-swatch" style="background:${item.color}"></span>${item.label}</span>`,
    )
    .join("");
}

function contributionsLabelForResult(result) {
  return result.hasSpouse ? t("contributions.household") : t("contributions.single");
}

function buildBandPath(points, xScale, yScale, type) {
  if (points.length < 2) {
    return "";
  }
  const upper = points.map((point) => `${xScale(point.chartIndex ?? point.yearIndex)},${yScale(point[type].household.p97_5)}`).join(" L ");
  const lower = [...points]
    .reverse()
    .map((point) => `${xScale(point.chartIndex ?? point.yearIndex)},${yScale(point[type].household.p2_5)}`)
    .join(" L ");
  return `M ${upper} L ${lower} Z`;
}

function buildLinePath(points, xScale, ySelector) {
  if (points.length < 2) {
    return "";
  }
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${xScale(point.chartIndex ?? point.yearIndex)} ${ySelector(point)}`)
    .join(" ");
}

function resolveChartMaxY(points, seriesType, inflowType) {
  const candidates = [];
  for (const point of points) {
    candidates.push(point[seriesType].household.median, point[inflowType].inflows.median);
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

function markerLine(yearIndex, xScale, margin, plotHeight, color, label, labelYOffset = 16) {
  const x = xScale(yearIndex);
  const labelY = margin.top + labelYOffset;
  return `
    <line class="marker-line" x1="${x}" y1="${margin.top}" x2="${x}" y2="${margin.top + plotHeight}" stroke="${color}"></line>
    <text class="marker-label" x="${x + 6}" y="${labelY}" fill="${color}">${label}</text>
  `;
}

function compactCurrency(value) {
  if (value >= 1_000_000) {
    return `${formatNumber(value / 1_000_000)} ${t("compactUnits.million")}`;
  }
  if (value >= 1_000) {
    return `${formatNumber(value / 1_000)} ${t("compactUnits.thousand")}`;
  }
  return formatNumber(value);
}

function formatCompactRangeEuro(minValue, maxValue) {
  return `${formatRangeThousandsValue(minValue)}${t("compactUnits.rangeSeparator")}${formatRangeThousandsValue(maxValue)} ${t("compactUnits.range")}`;
}

function formatRangeThousandsValue(value) {
  return numberFormat({ maximumFractionDigits: 0 }).format(Math.round(value / 1000));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function syncChartToggleButtons() {
  setToggleState(elements.inflationToggle, uiState.adjustInflation, t("chart.inflationOff"), t("chart.inflationOn"));
  setToggleState(
    elements.inflowsInflationToggle,
    uiState.adjustInflowsForInflation,
    t("chart.inflowsAdjustedOff"),
    t("chart.inflowsAdjustedOn"),
  );
  setToggleState(elements.ciToggle, uiState.showConfidenceBand, t("chart.confidenceBandOff"), t("chart.confidenceBandOn"));
}

function setToggleState(button, isActive, inactiveLabel, activeLabel) {
  button.classList.toggle("active", isActive);
  button.setAttribute("aria-pressed", String(isActive));
  button.textContent = isActive ? activeLabel : inactiveLabel;
}

function rerenderOutputs() {
  if (!latestChartState || !datasets) {
    return;
  }
  setDataStatus();
  renderSummary(latestChartState, uiState.adjustInflation);
  renderChart(latestChartState);
}

function syncSpouseSection() {
  elements.spouseFields.classList.toggle("hidden", !uiState.hasSpouse);
  elements.toggleSpouseButton.textContent = uiState.hasSpouse ? t("controls.removeSpouse") : t("controls.addSpouse");
}

export {
  addMonths,
  annualSupportForYear,
  baseSubsidy,
  buildDataStatusText,
  buildHistoricalPaths,
  buildWithdrawalTooltipText,
  calculateBootstrapSamplingRealCagr,
  calculateHistoricalRealCagr,
  chartLoadingPatternText,
  formatSuccessPercent,
  makeBootstrapPath,
  migrateSession,
  parseChildBirthYearInput,
  preciseAge,
  projectPath,
  recenterBootstrapSeries,
  retirementSummaryValues,
  setLanguage,
  simulateHousehold,
};
