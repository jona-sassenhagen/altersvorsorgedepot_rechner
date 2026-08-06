const MARKET_DATA_PATH = "./jst_kz_global_equity_monthly.csv";
const CPI_DATA_PATH = "./inflation.csv";
const BASIS_RATE_DATA_PATH = "./basiszins.csv";
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
const SESSION_VERSION = 11;
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
const CAPITAL_GAINS_TAX_RATE = 0.25;
const SOLIDARITY_SURCHARGE_RATE = 0.055;
const EQUITY_FUND_TAXABLE_SHARE = 0.7;
const SAVER_ALLOWANCE_SINGLE = 1000;
const AVD_ELIGIBLE_OWN_CONTRIBUTION_CAP = 1800;
const PENSION_EXPENSE_ALLOWANCE = 102;
const KVDR_ANNUAL_CONTRIBUTION_CEILING_2026 = 69_750;
const KVDR_GENERAL_HEALTH_INSURANCE_RATE_2026 = 0.146;
const KVDR_AVERAGE_ADDITIONAL_RATE_2026 = 0.029;
const KVDR_PENSIONER_HEALTH_SHARE = 0.5;
const KVDR_CARE_INSURANCE_PARENT_RATE = 0.036;
const KVDR_CARE_INSURANCE_CHILDLESS_RATE = 0.042;
const KVDR_CARE_INSURANCE_CHILD_DISCOUNT = 0.0025;
const SOLIDARITY_SURCHARGE_EXEMPTION_SINGLE = 20_350;
const SOLIDARITY_SURCHARGE_MITIGATION_RATE = 0.119;
const COMPARISON_PENSION_LEVELS = [0, 1000, 2000, 3000];
const DEFAULT_ETF_TRANCHE_COUNT = 5;
const DEFAULT_ETF_MONTHLY_CONTRIBUTION = 500;
const MIN_ETF_TRANCHE_COUNT = 1;
const MAX_ETF_TRANCHE_COUNT = 20;
const ETF_HISTORY_START_YEAR = 1900;
const ETF_HISTORY_END_YEAR = 2100;
const CURRENT_PENSION_POINT_VALUE = 42.52;
const PENSION_INPUT_MODE_MONTHLY = "monthly";
const PENSION_INPUT_MODE_POINTS = "points";

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
      withdrawalIncome: "Ø Zusatzrente inkl. Riester (Brutto)",
      withdrawalRateCaption: "Entnahme% (Erfolg%)",
      retirementBand: "95%-Band bei Renteneintritt",
      averageSupport: "Ø jährliche Förderung",
    },
    comparison: {
      modeAria: "Ansicht wählen",
      projectionMode: "Projektion",
      comparisonMode: "Nettovergleich",
      eyebrow: "Nachgelagerte Besteuerung vs. Steuerstundung",
      title: "Was bleibt im Ruhestand?",
      intro: "Der Vergleich lässt denselben ETF-Basisplan in beiden Szenarien laufen und lenkt den Haushaltsbeitrag X entweder ins AVD oder zusätzlich in den ETF.",
      taxYear: "Steuermodell 2026",
      incomeAria: "Annahmen für den Ruhestand",
      pensionInput: "Gesetzliche Rente",
      pensionModeAria: "Renteneingabe",
      pensionModeMonthly: "€ / Monat",
      pensionModePoints: "Rentenpunkte",
      pensionMonthly: "Brutto / Monat",
      pensionPoints: "Gesammelte Rentenpunkte",
      pensionPointsUnit: "Punkte",
      pensionPointsConversion: ({ amount } = {}) => `≈ ${amount} brutto / Monat · 42,52 € je Punkt`,
      etfContributionMonthly: "Bestehende ETF-Rate / Monat",
      etfProfileTitle: "Bestehender ETF-Sparplan",
      savingsStartYear: "Sparbeginn",
      savingsEndYear: "Sparende",
      firePhaseTitle: "Phase nach Sparende (FIRE)",
      postSavingsFlow: "ETF-Bewegung / Monat",
      postSavingsFlowHint: "Ab Januar nach Sparende bis zur Rente: positiv = Einzahlung, negativ = Entnahme, 0 € = keine Bewegung.",
      trancheCount: "Anzahl der Tranchen",
      savingsProfileHint: "Dieser Basisplan läuft in beiden Szenarien gleich. Nur der Haushaltsbeitrag X fließt wahlweise ins AVD oder zusätzlich in diesen ETF.",
      etfRetirementValue: "ETF-Basisdepot zum Rentenbeginn",
      etfContributions: "Einzahlungen in den Basisplan",
      etfUnrealizedGain: "Unrealisierter Gewinn",
      etfAdvanceAssessments: "Angesetzte Vorabpauschalen",
      etfTaxPaid: "ETF-Steuern vor Rentenbeginn",
      etfLossCarryforward: "Verbleibender ETF-Verlusttopf",
      fireWithdrawalsPaid: "Ausgezahlte FIRE-Bruttoentnahmen",
      fireWithdrawalShortfall: "Nicht gedeckte FIRE-Bruttoentnahmen",
      fireDepotDepleted: ({ share } = {}) => `Depot vor Rentenbeginn leer in ${share} der historischen Pfade. Nicht gedeckte Entnahmen werden nicht als Einkommen gezählt.`,
      avdLabel: "Altersvorsorgedepot",
      etfLabel: "Gewöhnliches Aktien-ETF-Depot",
      avdExplanation: "Der geförderte Anteil ist voll steuerpflichtig; beim ungeförderten Anteil nur der Ertrag.",
      etfExplanation: "Nur der Gewinnanteil wird nach Teilfreistellung und Pauschbetrag besteuert.",
      favorableTaxApplied: "Günstigerprüfung angewandt",
      flatTaxApplied: "Abgeltungsteuer angewandt",
      deltaAria: "Netto-Unterschied",
      avdAdvantage: "Vorteil für das AVD",
      avdDisadvantage: "Nachteil für das AVD",
      avdNeutral: "Vorteil/Nachteil für das AVD",
      averageAvdAdvantage: ({ paths } = {}) => `Durchschnittlicher Vorteil für das AVD · ${paths} Pfade`,
      averageAvdDisadvantage: ({ paths } = {}) => `Durchschnittlicher Nachteil für das AVD · ${paths} Pfade`,
      averageAvdNeutral: ({ paths } = {}) => `Durchschnittlicher Vorteil/Nachteil für das AVD · ${paths} Pfade`,
      grossWithdrawal: "Konsolidierte Zusatzvorsorge: Bruttoentnahme AVD / ETF",
      avdTax: "Steuer und KV/PV mit AVD",
      etfTax: "Steuer und KV/PV mit ETF",
      taxBridgeAria: "Wirkung von Steuer und KV/PV",
      chartTitle: "Vom Brutto zum Netto",
      chartIntro: "Bruttoeinkünfte werden addiert; Einkommensteuer und die modellierten KVdR-Beiträge werden anschließend gemeinsam abgezogen.",
      chartAria: ({ scenario, gross, pension, baselineEtf, compared, tax, net } = {}) =>
        `${scenario}: ${pension} Bruttorente plus ${baselineEtf} brutto aus dem ETF-Basisplan plus ${compared} brutto aus der Zusatzvorsorge ergeben ${gross} brutto. Abzüglich ${tax} Einkommensteuer sowie Kranken- und Pflegeversicherungsbeiträgen verbleiben ${net} netto pro Monat.`,
      pensionGrossLegend: "Gesetzliche Rente · brutto",
      baselineEtfGrossLegend: "ETF-Basisplan · brutto",
      comparedGrossLegend: "Zusatzvorsorge inkl. Riester · brutto",
      taxLegend: "Steuer + KV/PV · negativ",
      netLegend: "Gesamtnetto",
      grossToNetDetail: ({ gross, net } = {}) => `${gross} brutto → ${net} netto pro Monat`,
      cumulativeValue: "Zwischensumme",
      allocationNote: "Rente, ETF-Basisplan und die Entnahme aus übertragenem Riester-Guthaben werden in beiden Szenarien als gemeinsame Einkommensströme berücksichtigt. Der letzte positive Balken konsolidiert Riester mit der Entnahme aus Betrag X. Der negative Balken umfasst Einkommensteuer und KVdR-Beiträge.",
      distributionTitle: "Verteilung des AVD-Vorteils",
      distributionIntro: "Jeder Balken zählt identische historische Marktpfade nach dem monatlichen Gesamtnetto-Unterschied AVD minus ETF.",
      distributionAvdBetter: "AVD besser",
      distributionMedian: "Medianer Vorteil/Nachteil",
      distributionLogValue: "Logarithmischer Vorteil",
      distributionEtfSide: "ETF besser",
      distributionAvdSide: "AVD besser",
      distributionZero: "0 €",
      distributionAxisTitle: "Monatlicher Netto-Vorteil des AVD",
      distributionRange: ({ lower, upper } = {}) => `Mittlere 80 % der Pfade: ${lower} bis ${upper} pro Monat`,
      distributionReturnSplitTitle: ({ median } = {}) => `Reale Aktienrendite bis Rentenbeginn · Median ${median} p.a.`,
      distributionBelowMedianReturn: "Unter Medianrendite",
      distributionAboveMedianReturn: "Über Medianrendite",
      distributionRegimeWinRate: ({ rate, paths } = {}) => `AVD besser in ${rate} · ${paths} Pfade`,
      distributionAria: ({ paths, winRate, median, lower, upper } = {}) =>
        `Verteilung über ${paths} historische Pfade. Das AVD ist in ${winRate} der Pfade besser. Der mediane gepaarte Unterschied beträgt ${median} pro Monat; 80 Prozent liegen zwischen ${lower} und ${upper}.`,
      distributionBinTitle: ({ lower, upper, count, share } = {}) => `${lower} bis ${upper}: ${count} Pfade (${share})`,
      distributionLowerTailTitle: ({ upper, count, share } = {}) => `Bis ${upper}: ${count} Pfade (${share})`,
      distributionUpperTailTitle: ({ lower, count, share } = {}) => `Ab ${lower}: ${count} Pfade (${share})`,
      scenarioTitle: "Gesamtes Nettoalterseinkommen",
      scenarioIntro: "Jede Zeile zeigt AVD / ETF und summiert Rente, bestehenden ETF-Basisplan und Betrag X nach Einkommensteuer und KVdR-Beiträgen.",
      matrixUnit: "AVD / ETF · netto pro Monat",
      pensionAxis: "Rente / Monat",
      scenarioValues: "AVD / ETF",
      cellAria: ({ pension, avd, ordinaryEtf } = {}) =>
        `${pension} gesetzliche Rente: insgesamt ${avd} netto pro Monat mit Altersvorsorgedepot, ${ordinaryEtf} netto pro Monat mit ETF-Depot.`,
      assumptionsTitle: "So liest du den Vergleich",
      assumptionsBody: "Der bestehende ETF-Basisplan läuft in beiden Szenarien gleich; Betrag X fließt entweder ins AVD oder zusätzlich in den ETF. AVD-Auszahlungen werden nach gefördertem und ungefördertem Kapital aufgeteilt. Beim thesaurierenden ETF werden Verlustverrechnung, Vorabpauschalen im Folgejahr, Teilfreistellung, verfügbarer Pauschbetrag, Abgeltungsteuer und Günstigerprüfung modelliert. Für alle Haushalte wird KVdR unterstellt: Beiträge fallen nur auf die gesetzliche Rente an, werden vom verfügbaren Einkommen abgezogen und als Vorsorgeaufwendungen steuerlich berücksichtigt. Nicht enthalten: Kirchensteuer.",
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
        'Für 1900–1969 werden jährliche Aktienrenditen aus der <a href="https://www.macrohistory.net/database/">JST Macrohistory Database</a> mit historischen Marktkapitalisierungen von <a href="https://dkuvshinov.com/">Kuvshinov/Zimmermann</a> gewichtet. Die weltweite USD-Rendite wird mit US-Inflation in eine reale, währungsneutrale Rendite umgerechnet und anschließend mit deutscher Inflation nominalisiert; historische deutsche Währungsreformen erzeugen dadurch keine künstlichen Sprünge. Synthetische Monatsverläufe werden auf diese Jahresrenditen skaliert; ab 1970 wird die lokale <a href="https://curvo.eu/backtest/en/market-index/msci-world?currency=eur">MSCI-World-EUR-Reihe von Curvo</a> unverändert fortgeführt. Deutsche Inflation wird 1900–1954 aus JST-Jahreswerten monatlich interpoliert, stammt 1955 bis März 2025 von <a href="https://fred.stlouisfed.org/series/DEUCPIALLMINMEI">FRED/OECD</a> und ab April 2025 vom <a href="https://www.destatis.de/DE/Themen/Wirtschaft/Preise/Verbraucherpreisindex/_inhalt.html">Statistischen Bundesamt</a>. <a href="./data-sources/jst-kz-global-equity/README.md">Methodik und Einschränkungen</a>.',
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
        "Info zur konsolidierten Brutto-Zusatzrente, Erfolgsquote und möglichen Entnahmelücken beim gewählten Entnahmesatz",
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
          `Brutto vor Steuern. Der angezeigte Wert ist derselbe arithmetische Durchschnitt der konsolidierten AVD-Bruttoentnahme wie im Nettovergleich: Betrag X plus die Entnahme aus übertragenem Riester-Guthaben. Die anfängliche jährliche Entnahme beträgt ${rate} des jeweiligen Depotwerts zum Ruhestart und wird danach mit der Inflation fortgeschrieben. Im ETF-Szenario bleibt die Riester-Entnahme als identischer, nachgelagert besteuerter Einkommensstrom erhalten; nur Betrag X fließt stattdessen in den ETF.`,
        retirementBand:
          "Ein 95-%-Band beschreibt den Bereich, in dem 95 % der betrachteten Ergebnisse liegen. Es hilft, die Bandbreite möglicher Entwicklungen zu visualisieren.",
        averageSupport:
          "Median der durchschnittlichen Förderung in Jahren mit Einzahlungen. Enthalten sind direkte Förderung und Steuervorteil im vereinfachten Modell; die Darstellung folgt der gewählten Nominal-/Realansicht.",
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
      withdrawalIncome: "Avg. extra income incl. Riester (gross)",
      withdrawalRateCaption: "Withdrawal% (success%)",
      retirementBand: "95% band at retirement",
      averageSupport: "Avg. annual subsidy",
    },
    comparison: {
      modeAria: "Choose view",
      projectionMode: "Projection",
      comparisonMode: "Net comparison",
      eyebrow: "Deferred income tax vs. deferred capital-gains tax",
      title: "What remains in retirement?",
      intro: "The comparison simulates the same baseline ETF plan in both scenarios and directs household contribution X either to the AVD or into the ETF.",
      taxYear: "2026 tax model",
      incomeAria: "Retirement assumptions",
      pensionInput: "Statutory pension",
      pensionModeAria: "Pension input",
      pensionModeMonthly: "€ / month",
      pensionModePoints: "Pension points",
      pensionMonthly: "Gross / month",
      pensionPoints: "Accumulated pension points",
      pensionPointsUnit: "points",
      pensionPointsConversion: ({ amount } = {}) => `≈ ${amount} gross / month · €42.52 per point`,
      etfContributionMonthly: "Existing ETF contribution / month",
      etfProfileTitle: "Existing ETF savings plan",
      savingsStartYear: "Savings start",
      savingsEndYear: "Savings end",
      firePhaseTitle: "Post-savings phase (FIRE)",
      postSavingsFlow: "ETF cash flow / month",
      postSavingsFlowHint: "From January after savings end until retirement: positive = contribution, negative = withdrawal, €0 = no cash flow.",
      trancheCount: "Number of tranches",
      savingsProfileHint: "This baseline plan is identical in both scenarios. Only household contribution X goes either to the AVD or additionally into this ETF.",
      etfRetirementValue: "Baseline ETF at retirement",
      etfContributions: "Baseline-plan contributions",
      etfUnrealizedGain: "Unrealized gain",
      etfAdvanceAssessments: "Advance lump sums recognized",
      etfTaxPaid: "ETF tax before retirement",
      etfLossCarryforward: "Remaining ETF loss carryforward",
      fireWithdrawalsPaid: "Gross FIRE withdrawals paid",
      fireWithdrawalShortfall: "Unfunded gross FIRE withdrawals",
      fireDepotDepleted: ({ share } = {}) => `Portfolio depleted before retirement in ${share} of historical paths. Unfunded withdrawals are not counted as income.`,
      avdLabel: "Retirement savings portfolio",
      etfLabel: "Ordinary equity ETF account",
      avdExplanation: "The funded portion is fully taxable; only earnings are taxed on the non-funded portion.",
      etfExplanation: "Only the gain share is taxed after the partial exemption and saver allowance.",
      favorableTaxApplied: "Lower-tax assessment applied",
      flatTaxApplied: "Flat capital tax applied",
      deltaAria: "Net difference",
      avdAdvantage: "Advantage for the AVD",
      avdDisadvantage: "Disadvantage for the AVD",
      avdNeutral: "Advantage/disadvantage for the AVD",
      averageAvdAdvantage: ({ paths } = {}) => `Average advantage for the AVD · ${paths} paths`,
      averageAvdDisadvantage: ({ paths } = {}) => `Average disadvantage for the AVD · ${paths} paths`,
      averageAvdNeutral: ({ paths } = {}) => `Average AVD advantage/disadvantage · ${paths} paths`,
      grossWithdrawal: "Consolidated additional retirement income: gross withdrawal AVD / ETF",
      avdTax: "Tax and health/care with AVD",
      etfTax: "Tax and health/care with ETF",
      taxBridgeAria: "Tax and health/care effect",
      chartTitle: "From gross to net",
      chartIntro: "Gross income is added first; income tax and modeled KVdR contributions are then deducted together.",
      chartAria: ({ scenario, gross, pension, baselineEtf, compared, tax, net } = {}) =>
        `${scenario}: ${pension} gross statutory pension plus ${baselineEtf} gross from the baseline ETF plus ${compared} gross from additional retirement income equal ${gross} gross. After ${tax} income tax and health and long-term care contributions, ${net} net remains per month.`,
      pensionGrossLegend: "Statutory pension · gross",
      baselineEtfGrossLegend: "Baseline ETF · gross",
      comparedGrossLegend: "Additional retirement income incl. Riester · gross",
      taxLegend: "Tax + health/care · negative",
      netLegend: "Total net",
      grossToNetDetail: ({ gross, net } = {}) => `${gross} gross → ${net} net per month`,
      cumulativeValue: "Running total",
      allocationNote: "Pension, the baseline ETF, and withdrawals from transferred Riester assets are treated as common income streams in both scenarios. The final positive bar consolidates Riester with the withdrawal funded by amount X. The negative bar includes income tax and KVdR contributions.",
      distributionTitle: "Distribution of the AVD advantage",
      distributionIntro: "Each bar counts identical historical market paths by the monthly total-net difference: AVD minus ETF.",
      distributionAvdBetter: "AVD better",
      distributionMedian: "Median advantage/disadvantage",
      distributionLogValue: "Log-utility advantage",
      distributionEtfSide: "ETF better",
      distributionAvdSide: "AVD better",
      distributionZero: "€0",
      distributionAxisTitle: "Monthly net advantage of the AVD",
      distributionRange: ({ lower, upper } = {}) => `Middle 80% of paths: ${lower} to ${upper} per month`,
      distributionReturnSplitTitle: ({ median } = {}) => `Real equity return until retirement · median ${median} p.a.`,
      distributionBelowMedianReturn: "Below median return",
      distributionAboveMedianReturn: "Above median return",
      distributionRegimeWinRate: ({ rate, paths } = {}) => `AVD better in ${rate} · ${paths} paths`,
      distributionAria: ({ paths, winRate, median, lower, upper } = {}) =>
        `Distribution across ${paths} historical paths. The AVD is better in ${winRate} of paths. The median paired difference is ${median} per month; 80 percent lie between ${lower} and ${upper}.`,
      distributionBinTitle: ({ lower, upper, count, share } = {}) => `${lower} to ${upper}: ${count} paths (${share})`,
      distributionLowerTailTitle: ({ upper, count, share } = {}) => `Up to ${upper}: ${count} paths (${share})`,
      distributionUpperTailTitle: ({ lower, count, share } = {}) => `From ${lower}: ${count} paths (${share})`,
      scenarioTitle: "Total net retirement income",
      scenarioIntro: "Each row shows AVD / ETF and adds pension, the existing baseline ETF, and amount X after income tax and KVdR contributions.",
      matrixUnit: "AVD / ETF · net per month",
      pensionAxis: "Pension / month",
      scenarioValues: "AVD / ETF",
      cellAria: ({ pension, avd, ordinaryEtf } = {}) =>
        `${pension} statutory pension: ${avd} total net per month with the retirement portfolio, ${ordinaryEtf} total net per month with the ETF account.`,
      assumptionsTitle: "How to read the comparison",
      assumptionsBody: "The baseline ETF is identical in both scenarios; amount X goes either to the AVD or additionally into the ETF. AVD payments are split into funded and non-funded capital. For the accumulating ETF, loss offsets, next-year advance lump sums, partial exemption, available saver allowance, flat tax, and the retirement tax comparison are modeled. Every household is assumed to use KVdR: contributions apply only to the statutory pension, are deducted from spendable income, and reduce taxable income as pension expenses. Church tax is excluded.",
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
        'For 1900–1969, annual equity returns from the <a href="https://www.macrohistory.net/database/">JST Macrohistory Database</a> are weighted using historical market capitalizations from <a href="https://dkuvshinov.com/">Kuvshinov/Zimmermann</a>. The global USD return is converted into a real, currency-neutral return with US inflation and then reinflated with German inflation, preventing historical German currency reforms from creating artificial jumps. Synthetic monthly paths are scaled to those annual returns; from 1970 onward, the local <a href="https://curvo.eu/backtest/en/market-index/msci-world?currency=eur">Curvo MSCI World EUR series</a> is continued unchanged. German inflation for 1900–1954 is monthly-interpolated from JST annual observations, comes from <a href="https://fred.stlouisfed.org/series/DEUCPIALLMINMEI">FRED/OECD</a> from 1955 through March 2025, and from the <a href="https://www.destatis.de/EN/Themes/Economy/Prices/Consumer-Price-Index/_node.html">German Federal Statistical Office</a> thereafter. See the <a href="./data-sources/jst-kz-global-equity/README.md">methodology and limitations</a>.',
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
        "Information about consolidated gross extra income, success rate, and possible shortfalls at the selected withdrawal rate",
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
          `Gross before tax. The displayed value is the same arithmetic average consolidated AVD gross withdrawal used in the net comparison: amount X plus the withdrawal from transferred Riester assets. The initial annual withdrawal is ${rate} of each portfolio value at retirement and is then increased with inflation. In the ETF scenario, the Riester withdrawal remains as the identical deferred-tax income stream; only amount X is redirected to the ETF.`,
        retirementBand:
          "A 95% band shows the range that contains 95% of the modeled outcomes. It helps visualize the spread of possible paths.",
        averageSupport:
          "Median average subsidy in years with contributions. It includes direct subsidies plus the tax benefit in this calculator's simplified model and follows the selected nominal/real view.",
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
      projectionMode: document.querySelector("#projection-mode"),
      comparisonMode: document.querySelector("#comparison-mode"),
      projectionView: document.querySelector("#projection-view"),
      comparisonView: document.querySelector("#comparison-view"),
      comparisonPension: document.querySelector("#comparison-pension"),
      comparisonPensionPoints: document.querySelector("#comparison-pension-points"),
      pensionModeMonthly: document.querySelector("#pension-mode-monthly"),
      pensionModePoints: document.querySelector("#pension-mode-points"),
      pensionMonthlyField: document.querySelector("#pension-monthly-field"),
      pensionPointsField: document.querySelector("#pension-points-field"),
      pensionPointsConversion: document.querySelector("#pension-points-conversion"),
      comparisonEtfContribution: document.querySelector("#comparison-etf-contribution"),
      comparisonSavingsStart: document.querySelector("#comparison-savings-start"),
      comparisonSavingsEnd: document.querySelector("#comparison-savings-end"),
      comparisonPostSavingsFlow: document.querySelector("#comparison-post-savings-flow"),
      comparisonTrancheCount: document.querySelector("#comparison-tranche-count"),
      comparisonEtfRetirementValue: document.querySelector("#comparison-etf-retirement-value"),
      comparisonEtfContributions: document.querySelector("#comparison-etf-contributions"),
      comparisonEtfGain: document.querySelector("#comparison-etf-gain"),
      comparisonEtfAdvanceAssessments: document.querySelector("#comparison-etf-advance-assessments"),
      comparisonEtfTaxPaid: document.querySelector("#comparison-etf-tax-paid"),
      comparisonEtfLossCarryforward: document.querySelector("#comparison-etf-loss-carryforward"),
      comparisonFireWithdrawals: document.querySelector("#comparison-fire-withdrawals"),
      comparisonFireShortfall: document.querySelector("#comparison-fire-shortfall"),
      comparisonFireStatus: document.querySelector("#comparison-fire-status"),
      comparisonEtfTaxMethod: document.querySelector("#comparison-etf-tax-method"),
      comparisonDelta: document.querySelector("#comparison-delta"),
      comparisonDeltaLabel: document.querySelector("#comparison-delta-label"),
      comparisonBars: document.querySelector("#comparison-bars"),
      comparisonAdvantageDistribution: document.querySelector("#comparison-advantage-distribution"),
      comparisonScenarioHead: document.querySelector("#comparison-scenario-head"),
      comparisonScenarioBody: document.querySelector("#comparison-scenario-body"),
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
  resultMode: "projection",
  pensionInputMode: PENSION_INPUT_MODE_MONTHLY,
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

  const removeButton = row.querySelector(".remove-child");
  if (removeButton) {
    removeButton.setAttribute("aria-label", t("aria.removeChild"));
    removeButton.setAttribute("title", t("controls.removeChild"));
    removeButton.textContent = "×";
  }
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
  syncResultMode();
  syncPensionInputMode();
  setDataStatus();
  if (latestChartState) {
    renderSummary(latestChartState, uiState.adjustInflation);
    renderChart(latestChartState);
    renderTaxComparison(latestChartState);
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
    // All series are required before the first calculation so every historical market path can
    // carry its matching inflation and Basiszins environment into the ETF tax sidecar.
    const [marketCsv, cpiCsv, basisRateCsv] = await Promise.all([
      fetchText(MARKET_DATA_PATH),
      fetchText(CPI_DATA_PATH),
      fetchText(BASIS_RATE_DATA_PATH),
    ]);
    const inflation = parseCpiCsv(cpiCsv);
    const basisRates = parseBasisRateCsv(basisRateCsv);
    const market = parseMarketCsv(marketCsv, inflation, basisRates);
    datasets = {
      market,
      inflation,
      basisRates,
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
  uiState.adjustInflowsForInflation = true;
  uiState.showConfidenceBand = true;
  uiState.hasSpouse = false;
  uiState.language = activeLanguage();
  uiState.expectedRealReturnMode = RETURN_MODE_HISTORICAL;
  uiState.customExpectedRealReturn = 0.03;
  uiState.pensionInputMode = PENSION_INPUT_MODE_MONTHLY;
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
  elements.comparisonPension.value = "1500";
  elements.comparisonPensionPoints.value = (1500 / CURRENT_PENSION_POINT_VALUE).toFixed(1);
  elements.comparisonEtfContribution.value = String(DEFAULT_ETF_MONTHLY_CONTRIBUTION);
  elements.comparisonSavingsStart.value = String(new Date().getFullYear());
  elements.comparisonSavingsEnd.value = "2057";
  elements.comparisonPostSavingsFlow.value = "0";
  elements.comparisonTrancheCount.value = String(DEFAULT_ETF_TRANCHE_COUNT);
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

  elements.projectionMode.addEventListener("click", () => setResultMode("projection"));
  elements.comparisonMode.addEventListener("click", () => setResultMode("comparison"));
  elements.comparisonPension.addEventListener("input", () => {
    saveSession();
    renderTaxComparison(latestChartState);
  });
  elements.comparisonPensionPoints.addEventListener("input", () => {
    syncPensionInputMode();
    saveSession();
    renderTaxComparison(latestChartState);
  });
  elements.pensionModeMonthly.addEventListener("click", () => setPensionInputMode(PENSION_INPUT_MODE_MONTHLY));
  elements.pensionModePoints.addEventListener("click", () => setPensionInputMode(PENSION_INPUT_MODE_POINTS));
  for (const input of [elements.comparisonEtfContribution, elements.comparisonSavingsStart, elements.comparisonSavingsEnd, elements.comparisonPostSavingsFlow, elements.comparisonTrancheCount]) {
    input.addEventListener("input", () => {
      saveSession();
      scheduleCalculation();
    });
    input.addEventListener("change", () => {
      saveSession();
      runCalculation();
    });
  }

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
    if (!parsed || typeof parsed !== "object" || ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(parsed.version)) {
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
  if (session.version < 6) {
    migrated.controls.resultMode = "projection";
    migrated.controls.comparisonPensionMonthly = 1500;
    migrated.controls.comparisonEtfMonthly = 500;
    migrated.controls.comparisonGainShare = 50;
  }
  if (session.version < 7) {
    migrated.controls.comparisonSavingsStartYear = new Date().getFullYear();
    migrated.controls.comparisonSavingsEndYear = 2057;
    migrated.controls.comparisonTrancheCount = DEFAULT_ETF_TRANCHE_COUNT;
    delete migrated.controls.comparisonGainShare;
  }
  if (session.version < 8) {
    migrated.controls.comparisonEtfContributionMonthly = DEFAULT_ETF_MONTHLY_CONTRIBUTION;
    delete migrated.controls.comparisonEtfMonthly;
  }
  if (session.version < 9) {
    const monthlyPension = Number(migrated.controls.comparisonPensionMonthly) || 1500;
    migrated.controls.comparisonPensionInputMode = PENSION_INPUT_MODE_MONTHLY;
    migrated.controls.comparisonPensionPoints = monthlyPension / CURRENT_PENSION_POINT_VALUE;
  }
  if (session.version < 10) {
    migrated.controls.comparisonPostSavingsFlowMonthly = 0;
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
    uiState.resultMode = session.controls.resultMode === "comparison" ? "comparison" : "projection";
    setInputValue(elements.comparisonPension, session.controls.comparisonPensionMonthly);
    setInputValue(elements.comparisonPensionPoints, session.controls.comparisonPensionPoints);
    uiState.pensionInputMode = session.controls.comparisonPensionInputMode === PENSION_INPUT_MODE_POINTS
      ? PENSION_INPUT_MODE_POINTS
      : PENSION_INPUT_MODE_MONTHLY;
    setInputValue(elements.comparisonEtfContribution, session.controls.comparisonEtfContributionMonthly);
    setInputValue(elements.comparisonSavingsStart, session.controls.comparisonSavingsStartYear);
    setInputValue(elements.comparisonSavingsEnd, session.controls.comparisonSavingsEndYear);
    setInputValue(elements.comparisonPostSavingsFlow, session.controls.comparisonPostSavingsFlowMonthly);
    setInputValue(elements.comparisonTrancheCount, session.controls.comparisonTrancheCount);
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
      resultMode: uiState.resultMode,
      comparisonPensionMonthly: elements.comparisonPension.value,
      comparisonPensionPoints: elements.comparisonPensionPoints.value,
      comparisonPensionInputMode: uiState.pensionInputMode,
      comparisonEtfContributionMonthly: elements.comparisonEtfContribution.value,
      comparisonSavingsStartYear: elements.comparisonSavingsStart.value,
      comparisonSavingsEndYear: elements.comparisonSavingsEnd.value,
      comparisonPostSavingsFlowMonthly: elements.comparisonPostSavingsFlow.value,
      comparisonTrancheCount: elements.comparisonTrancheCount.value,
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

function parseMarketCsv(csvText, inflation, basisRates = new Map()) {
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
      basisRate: basisRates.get(Number(entry.key.slice(0, 4))) ?? 0,
    }));

  if (bootstrapSeries.length < BOOTSTRAP_BLOCK_MONTHS + 1) {
    throw new Error(t("errors.insufficientOverlap"));
  }

  return { levels, returns, bootstrapSeries };
}

function parseBasisRateCsv(csvText) {
  const rates = new Map();
  for (const line of csvText.trim().split(/\r?\n/).slice(1)) {
    const [yearText, rateText] = line.split(",");
    const year = Number(yearText);
    const rate = Number(rateText);
    if (Number.isInteger(year) && Number.isFinite(rate)) rates.set(year, rate / 100);
  }
  for (let year = 1900; year <= 2026; year += 1) {
    if (!rates.has(year)) throw new Error(`Missing Basiszins estimate for ${year}.`);
  }
  return rates;
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

function calculatePathRealCagr(observations) {
  if (!Array.isArray(observations) || observations.length === 0) {
    return 0;
  }
  let realLogSum = 0;
  for (const observation of observations) {
    const marketFactor = 1 + Number(observation.marketReturn);
    const inflationRatio = Number(observation.inflationRatio);
    if (!(inflationRatio > 0)) {
      return 0;
    }
    if (!(marketFactor > 0)) {
      return -1;
    }
    realLogSum += Math.log(marketFactor / inflationRatio);
  }
  return Math.expm1((realLogSum / observations.length) * 12);
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
    etfComparison: {
      monthlyContribution: Number(elements.comparisonEtfContribution.value),
      startYear: Number(elements.comparisonSavingsStart.value),
      endYear: Number(elements.comparisonSavingsEnd.value),
      postSavingsMonthlyFlow: Number(elements.comparisonPostSavingsFlow.value),
      trancheCount: Number(elements.comparisonTrancheCount.value),
    },
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

function summarizeEtfPathSet(paths, realTerms) {
  const inflationAdjusted = (path, value) => realTerms
    ? value * Math.max(Number(path.realTermsBaseInflation) || 1, 1e-12) /
      Math.max(path.cumulativeInflation, 1e-12)
    : value;
  return {
    advanceAssessments: summarizeSamples(paths.map((path) => inflationAdjusted(path, path.advanceAssessments))),
    advanceTaxPaid: summarizeSamples(paths.map((path) => inflationAdjusted(path, path.advanceTaxPaid))),
    totalTaxPaid: summarizeSamples(paths.map((path) => inflationAdjusted(path, path.totalTaxPaid))),
    capitalLossCarryforward: summarizeSamples(paths.map((path) => inflationAdjusted(path, path.capitalLossCarryforward))),
    pendingAdvanceAssessment: summarizeSamples(paths.map((path) => inflationAdjusted(path, path.pendingAdvanceAssessment))),
    contributions: summarizeSamples(paths.map((path) => realTerms ? path.realContributions : path.contributions)),
    remainingCostBasis: summarizeSamples(paths.map((path) => inflationAdjusted(path, path.remainingCostBasis))),
    preRetirementWithdrawals: summarizeSamples(paths.map((path) => realTerms
      ? path.realPreRetirementWithdrawals
      : path.preRetirementWithdrawals)),
    preRetirementNetWithdrawals: summarizeSamples(paths.map((path) => realTerms
      ? inflationAdjusted(path, path.preRetirementNetWithdrawals)
      : path.preRetirementNetWithdrawals)),
    preRetirementWithdrawalShortfall: summarizeSamples(paths.map((path) => realTerms
      ? path.realPreRetirementWithdrawalShortfall
      : path.preRetirementWithdrawalShortfall)),
    depletedPathShare: paths.length > 0
      ? paths.filter((path) => path.preRetirementWithdrawalShortfall > 1e-6).length / paths.length
      : 0,
    value: summarizeSamples(paths.map((path) => inflationAdjusted(path, path.value))),
  };
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

  const averageAnnualSupportNominalSamples = [];
  const averageAnnualSupportRealSamples = [];
  const withdrawalOutcomes = [];
  const applicantRetirementDate = retirementDateForPerson(household.applicant.birthdate, household.applicant.retirementAge);
  const spouseRetirementDate = household.spouse
    ? retirementDateForPerson(household.spouse.birthdate, household.spouse.retirementAge)
    : null;
  const comparisonRetirementDate = spouseRetirementDate && spouseRetirementDate > applicantRetirementDate
    ? spouseRetirementDate
    : applicantRetirementDate;
  let comparisonReturnMonthCount = 0;
  while (
    comparisonReturnMonthCount < totalMonths &&
    addMonths(now, comparisonReturnMonthCount) < comparisonRetirementDate
  ) {
    comparisonReturnMonthCount += 1;
  }
  const spouseAgeNow = household.spouse ? preciseAge(household.spouse.birthdate, now) : null;
  const retirementYear = clamp(Math.ceil(household.applicant.retirementAge - applicantAge), 0, years);
  const spouseRetirementYear = spouseAgeNow === null
    ? null
    : clamp(Math.ceil(household.spouse.retirementAge - spouseAgeNow), 0, years);
  const preRetirementYear = Math.max(retirementYear, spouseRetirementYear ?? retirementYear);
  const etfBaselinePaths = [];
  const etfAlternativePaths = [];
  const comparisonPaths = [];
  const withdrawalRateSuccessCounts = new Map(
    withdrawalRateCandidates.map((rate) => [rate, 0]),
  );
  const resolvedEtfConfig = resolveEtfComparisonConfig(household.etfComparison, now);
  const etfHistoricalPrelude = buildEtfHistoricalPrelude(
    sourceBootstrapSeries,
    resolvedEtfConfig.startYear,
    now,
  );
  const etfTimelineStart = etfHistoricalPrelude.length > 0
    ? new Date(resolvedEtfConfig.startYear, 0, 1)
    : now;
  const etfInflationAtDecisionStart = etfHistoricalPrelude.reduce(
    (factor, observation) => factor * observation.inflationRatio,
    1,
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
    const avdDecisionPath = household.applicant.initialBalance > 0
      ? projectPath(
          {
            ...household,
            applicant: { ...household.applicant, initialBalance: 0 },
          },
          monthlyPath,
          now,
          years,
          adjustInflowsForInflation,
          withdrawalRate,
          [withdrawalRate],
        )
      : path;
    const etfMonthlyPath = etfHistoricalPrelude.length > 0
      ? [...etfHistoricalPrelude, ...monthlyPath]
      : monthlyPath;
    const baselineEtfPath = projectOrdinaryEtfPath({
      adjustInflowsForInflation,
      config: resolvedEtfConfig,
      decisionStartDate: now,
      household,
      monthlyPath: etfMonthlyPath,
      now: etfTimelineStart,
      realTermsBaseInflation: etfInflationAtDecisionStart,
      retirementDate: comparisonRetirementDate,
    });
    const alternativeEtfPath = projectOrdinaryEtfPath({
      adjustInflowsForInflation,
      config: resolvedEtfConfig,
      decisionStartDate: now,
      household,
      includeDecisionContribution: true,
      monthlyPath: etfMonthlyPath,
      now: etfTimelineStart,
      realTermsBaseInflation: etfInflationAtDecisionStart,
      retirementDate: comparisonRetirementDate,
    });
    etfBaselinePaths.push(baselineEtfPath);
    etfAlternativePaths.push(alternativeEtfPath);
    const comparisonWithdrawalYear = firstPositivePathValueIndex(
      path.householdWithdrawalNominal,
      preRetirementYear,
    );
    const avdNominalWithdrawal =
      (avdDecisionPath.householdWithdrawalNominal[comparisonWithdrawalYear] ?? 0) * 12;
    const avdNominalTaxableWithdrawal =
      (avdDecisionPath.householdTaxableWithdrawalNominal[comparisonWithdrawalYear] ?? 0) * 12;
    const avdRealWithdrawal =
      (avdDecisionPath.householdWithdrawalReal[comparisonWithdrawalYear] ?? 0) * 12;
    const avdRealTaxableWithdrawal =
      (avdDecisionPath.householdTaxableWithdrawalReal[comparisonWithdrawalYear] ?? 0) * 12;
    comparisonPaths.push({
      pathRealAnnualReturn: comparisonReturnMonthCount > 0
        ? calculatePathRealCagr(monthlyPath.slice(0, comparisonReturnMonthCount))
        : 0,
      avdNominalValue: avdDecisionPath.householdNominal[preRetirementYear] ?? 0,
      avdNominalWithdrawal,
      avdNominalTaxableWithdrawal,
      avdRealValue: avdDecisionPath.householdReal[preRetirementYear] ?? 0,
      avdRealWithdrawal,
      avdRealTaxableWithdrawal,
      commonAvdNominalValue: Math.max(
        (path.householdNominal[preRetirementYear] ?? 0) -
          (avdDecisionPath.householdNominal[preRetirementYear] ?? 0),
        0,
      ),
      commonAvdNominalWithdrawal: Math.max(
        (path.householdWithdrawalNominal[comparisonWithdrawalYear] ?? 0) * 12 - avdNominalWithdrawal,
        0,
      ),
      commonAvdNominalTaxableWithdrawal: Math.max(
        (path.householdTaxableWithdrawalNominal[comparisonWithdrawalYear] ?? 0) * 12 -
          avdNominalTaxableWithdrawal,
        0,
      ),
      commonAvdRealValue: Math.max(
        (path.householdReal[preRetirementYear] ?? 0) -
          (avdDecisionPath.householdReal[preRetirementYear] ?? 0),
        0,
      ),
      commonAvdRealWithdrawal: Math.max(
        (path.householdWithdrawalReal[comparisonWithdrawalYear] ?? 0) * 12 - avdRealWithdrawal,
        0,
      ),
      commonAvdRealTaxableWithdrawal: Math.max(
        (path.householdTaxableWithdrawalReal[comparisonWithdrawalYear] ?? 0) * 12 -
          avdRealTaxableWithdrawal,
        0,
      ),
      baselineEtf: baselineEtfPath,
      alternativeEtf: alternativeEtfPath,
    });
    const supportYearDivisor = Math.max(path.supportPaymentYearCount, 1);
    averageAnnualSupportNominalSamples.push(path.totalSupport / supportYearDivisor);
    averageAnnualSupportRealSamples.push(path.totalSupportReal / supportYearDivisor);
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

  const retirementChartPosition = chartPositionForDate(applicantRetirementDate, chartYearStart, chartYears);
  const spouseRetirementChartPosition = spouseRetirementDate
    ? chartPositionForDate(spouseRetirementDate, chartYearStart, chartYears)
    : null;
  const preRetirementChartIndex = Math.max(
    Math.floor(retirementChartPosition),
    spouseRetirementChartPosition === null ? Math.floor(retirementChartPosition) : Math.floor(spouseRetirementChartPosition),
  );
  const kvdrCareInsuranceRate = kvdrCareInsuranceRateForHousehold(
    household.children,
    comparisonRetirementDate,
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
    comparisonPaths,
    averageAnnualSupport: summarizeSamples(averageAnnualSupportRealSamples).median,
    averageAnnualSupportStats: {
      nominal: summarizeSamples(averageAnnualSupportNominalSamples),
      real: summarizeSamples(averageAnnualSupportRealSamples),
    },
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
    etfComparison: {
      paths: etfBaselinePaths,
      alternativePaths: etfAlternativePaths,
      nominal: summarizeEtfPathSet(etfBaselinePaths, false),
      real: summarizeEtfPathSet(etfBaselinePaths, true),
      alternativeNominal: summarizeEtfPathSet(etfAlternativePaths, false),
      alternativeReal: summarizeEtfPathSet(etfAlternativePaths, true),
      config: resolveEtfComparisonConfig(household.etfComparison, now),
    },
    hasSpouse: Boolean(household.spouse),
    kvdrCareInsuranceRate,
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

function createAvdTaxPool(initialFundedValue = 0) {
  return {
    fundedValue: Math.max(Number(initialFundedValue) || 0, 0),
    unfundedValue: 0,
    unfundedBasis: 0,
  };
}

function avdTaxPoolValue(pool) {
  return pool.fundedValue + pool.unfundedValue;
}

function growAvdTaxPool(pool, monthlyReturn, monthlyFeeFactor) {
  pool.fundedValue *= (1 + monthlyReturn) * monthlyFeeFactor;
  pool.unfundedValue *= (1 + monthlyReturn) * monthlyFeeFactor;
}

function contributeToAvdTaxPool(pool, contribution, fundedAmount, valueFactor = 1) {
  const amount = Math.max(Number(contribution) || 0, 0);
  const funded = clamp(Number(fundedAmount) || 0, 0, amount);
  const unfunded = amount - funded;
  pool.fundedValue += funded * valueFactor;
  pool.unfundedValue += unfunded * valueFactor;
  pool.unfundedBasis += unfunded;
}

function creditAvdSupport(pool, directSupport, reinvestedTaxRefund) {
  pool.fundedValue += Math.max(Number(directSupport) || 0, 0);
  const refund = Math.max(Number(reinvestedTaxRefund) || 0, 0);
  pool.unfundedValue += refund;
  pool.unfundedBasis += refund;
}

function withdrawFromAvdTaxPool(pool, requestedAmount) {
  const totalValue = avdTaxPoolValue(pool);
  const paid = Math.min(Math.max(Number(requestedAmount) || 0, 0), totalValue);
  if (paid <= 0 || totalValue <= 0) {
    return { paid: 0, taxable: 0, funded: 0, unfunded: 0, unfundedGain: 0 };
  }
  const funded = paid * (pool.fundedValue / totalValue);
  const unfunded = paid - funded;
  const unfundedShare = pool.unfundedValue > 0 ? unfunded / pool.unfundedValue : 0;
  const recoveredBasis = Math.min(pool.unfundedBasis * unfundedShare, unfunded);
  const unfundedGain = Math.max(unfunded - recoveredBasis, 0);
  pool.fundedValue = Math.max(pool.fundedValue - funded, 0);
  pool.unfundedValue = Math.max(pool.unfundedValue - unfunded, 0);
  pool.unfundedBasis = Math.max(pool.unfundedBasis - recoveredBasis, 0);
  return { paid, taxable: funded + unfundedGain, funded, unfunded, unfundedGain };
}

function firstPositivePathValueIndex(values, startIndex = 0) {
  for (let index = Math.max(Math.floor(startIndex), 0); index < values.length; index += 1) {
    if ((Number(values[index]) || 0) > 0) {
      return index;
    }
  }
  return Math.max(Math.floor(startIndex), 0);
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
  const applicantTaxPool = createAvdTaxPool(household.applicant.initialBalance);
  const spouseTaxPool = createAvdTaxPool(0);
  let applicantValue = avdTaxPoolValue(applicantTaxPool);
  let spouseValue = 0;
  let totalSupport = 0;
  let totalSupportReal = 0;
  let supportPaymentYearCount = 0;
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
  let latestHouseholdTaxableWithdrawalNominal = 0;
  let latestHouseholdTaxableWithdrawalReal = 0;
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
  const householdTaxableWithdrawalNominal = [0];
  const householdTaxableWithdrawalReal = [0];
  const chartYearStart = now.getFullYear();
  const chartYearEnd = addMonths(now, bootstrap.length - 1).getFullYear();
  const chartBuckets = Array.from({ length: chartYearEnd - chartYearStart + 1 }, (_, index) =>
    createChartYearBucket(chartYearStart + index),
  );

  let applicantAnnualContribution = 0;
  let spouseAnnualContribution = 0;
  let applicantAnnualFundedOwnContribution = 0;
  let spouseAnnualFundedOwnContribution = 0;
  let supportYearCount = 0;

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
    growAvdTaxPool(applicantTaxPool, monthlyReturn, monthlyFeeFactor);
    const applicantFundedContribution = Math.min(
      applicantContribution,
      Math.max(AVD_ELIGIBLE_OWN_CONTRIBUTION_CAP - applicantAnnualFundedOwnContribution, 0),
    );
    contributeToAvdTaxPool(
      applicantTaxPool,
      applicantContribution,
      applicantFundedContribution,
      monthlyFeeFactor,
    );
    applicantAnnualFundedOwnContribution += applicantFundedContribution;
    applicantValue = avdTaxPoolValue(applicantTaxPool);
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
    const applicantWithdrawal = withdrawFromAvdTaxPool(
      applicantTaxPool,
      applicantRequestedWithdrawalNominal,
    );
    const applicantPaidWithdrawalNominal = applicantWithdrawal.paid;
    const applicantWithdrawalShortfallNominal =
      applicantRequestedWithdrawalNominal - applicantPaidWithdrawalNominal;
    applicantValue = avdTaxPoolValue(applicantTaxPool);
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
      growAvdTaxPool(spouseTaxPool, monthlyReturn, monthlyFeeFactor);
      const spouseFundedContribution = Math.min(
        spouseContribution,
        Math.max(AVD_ELIGIBLE_OWN_CONTRIBUTION_CAP - spouseAnnualFundedOwnContribution, 0),
      );
      contributeToAvdTaxPool(
        spouseTaxPool,
        spouseContribution,
        spouseFundedContribution,
        monthlyFeeFactor,
      );
      spouseAnnualFundedOwnContribution += spouseFundedContribution;
      spouseValue = avdTaxPoolValue(spouseTaxPool);
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
    const spouseWithdrawal = withdrawFromAvdTaxPool(
      spouseTaxPool,
      spouseRequestedWithdrawalNominal,
    );
    const spousePaidWithdrawalNominal = spouseWithdrawal.paid;
    const spouseWithdrawalShortfallNominal =
      spouseRequestedWithdrawalNominal - spousePaidWithdrawalNominal;
    spouseValue = avdTaxPoolValue(spouseTaxPool);

    const requestedWithdrawalNominal =
      applicantRequestedWithdrawalNominal + spouseRequestedWithdrawalNominal;
    const paidWithdrawalNominal =
      applicantPaidWithdrawalNominal + spousePaidWithdrawalNominal;
    const taxableWithdrawalNominal = applicantWithdrawal.taxable + spouseWithdrawal.taxable;
    const withdrawalShortfallNominal =
      applicantWithdrawalShortfallNominal + spouseWithdrawalShortfallNominal;
    const requestedWithdrawalReal = requestedWithdrawalNominal / cumulativeInflation;
    const paidWithdrawalReal = paidWithdrawalNominal / cumulativeInflation;
    const taxableWithdrawalReal = taxableWithdrawalNominal / cumulativeInflation;
    const withdrawalShortfallReal = withdrawalShortfallNominal / cumulativeInflation;

    latestHouseholdWithdrawalNominal = paidWithdrawalNominal;
    latestHouseholdWithdrawalReal = paidWithdrawalReal;
    latestHouseholdTaxableWithdrawalNominal = taxableWithdrawalNominal;
    latestHouseholdTaxableWithdrawalReal = taxableWithdrawalReal;
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

    if (monthDate.getMonth() === 11) {
      const yearEndDate = new Date(monthDate.getFullYear(), 11, 31);
      supportYearCount += 1;
      const support = annualSupportForYear(household, {
        applicantAnnualContribution,
        spouseAnnualContribution,
        contractStartDate: now,
        yearEndDate,
        yearIndex: supportYearCount,
      });
      const supportInflationFactor = adjustInflowsForInflation ? cumulativeInflation : 1;
      const applicantSupport = support.applicant * supportInflationFactor;
      const spouseSupport = support.spouse * supportInflationFactor;
      const applicantDirectSupport = support.applicantDirect * supportInflationFactor;
      const spouseDirectSupport = support.spouseDirect * supportInflationFactor;
      const applicantTaxRefund = support.applicantTax * supportInflationFactor;
      const spouseTaxRefund = support.spouseTax * supportInflationFactor;
      const householdSupport = applicantSupport + spouseSupport;

      creditAvdSupport(applicantTaxPool, applicantDirectSupport, applicantTaxRefund);
      creditAvdSupport(spouseTaxPool, spouseDirectSupport, spouseTaxRefund);
      applicantValue = avdTaxPoolValue(applicantTaxPool);
      spouseValue = avdTaxPoolValue(spouseTaxPool);
      creditWithdrawalRateTrackers(
        applicantWithdrawalRateTrackers,
        applicantSupport,
      );
      creditWithdrawalRateTrackers(
        spouseWithdrawalRateTrackers,
        spouseSupport,
      );
      totalSupport += householdSupport;
      totalSupportReal += householdSupport / cumulativeInflation;
      if (householdSupport > 0) {
        supportPaymentYearCount += 1;
      }
      householdInflowValue += householdSupport;
      householdInflowRealValue += householdSupport / cumulativeInflation;

      applicantAnnualContribution = 0;
      spouseAnnualContribution = 0;
      applicantAnnualFundedOwnContribution = 0;
      spouseAnnualFundedOwnContribution = 0;
    }

    if ((monthIndex + 1) % 12 === 0) {

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
      householdTaxableWithdrawalNominal.push(latestHouseholdTaxableWithdrawalNominal);
      householdTaxableWithdrawalReal.push(latestHouseholdTaxableWithdrawalReal);
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
    householdTaxableWithdrawalNominal.push(latestHouseholdTaxableWithdrawalNominal);
    householdTaxableWithdrawalReal.push(latestHouseholdTaxableWithdrawalReal);
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
    householdTaxableWithdrawalNominal,
    householdTaxableWithdrawalReal,
    avdTaxPools: {
      applicant: { ...applicantTaxPool },
      spouse: { ...spouseTaxPool },
    },
    chartStats: chartBuckets.map(finalizeChartYearBucket),
    totalSupport,
    totalSupportReal,
    supportPaymentYearCount,
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
    preciseAge(
      household.applicant.birthdate,
      context.contractStartDate ?? addMonths(context.yearEndDate, -12),
    ) < 25 &&
    context.applicantAnnualContribution > 0
      ? 200
      : 0;

  const spouseStarter =
    household.spouse &&
    context.yearIndex === 1 &&
    preciseAge(
      household.spouse.birthdate,
      context.contractStartDate ?? addMonths(context.yearEndDate, -12),
    ) < 25 &&
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
  // § 10a compares the tax effect of eligible own contributions plus allowances with the
  // allowance already received. The UI supplies a marginal-rate approximation rather than a
  // complete taxable-income return, so we apply that rate to the full deductible amount.
  const applicantDeductible = Math.min(
    context.applicantAnnualContribution,
    AVD_ELIGIBLE_OWN_CONTRIBUTION_CAP,
  ) + applicantDirect;
  const applicantTax = Math.max(applicantDeductible * household.applicant.incomeRate - applicantDirect, 0);
  const spouseTax = household.spouse
    ? Math.max(
        (Math.min(context.spouseAnnualContribution, AVD_ELIGIBLE_OWN_CONTRIBUTION_CAP) + spouseDirect) *
          household.spouse.incomeRate - spouseDirect,
        0,
      )
    : 0;

  return {
    applicant: applicantDirect + applicantTax,
    spouse: spouseDirect + spouseTax,
    applicantDirect,
    spouseDirect,
    applicantTax,
    spouseTax,
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

function resolveEtfComparisonConfig(config = {}, now = new Date()) {
  const currentYear = now.getFullYear();
  const monthlyContribution = clamp(
    config.monthlyContribution === undefined
      ? DEFAULT_ETF_MONTHLY_CONTRIBUTION
      : Number(config.monthlyContribution) || 0,
    0,
    20_000,
  );
  const startYear = clamp(
    Math.round(Number(config.startYear) || currentYear),
    ETF_HISTORY_START_YEAR,
    ETF_HISTORY_END_YEAR,
  );
  const endYear = clamp(
    Math.round(Number(config.endYear) || startYear),
    startYear,
    ETF_HISTORY_END_YEAR,
  );
  const postSavingsMonthlyFlow = clamp(Number(config.postSavingsMonthlyFlow) || 0, -20_000, 20_000);
  const trancheCount = clamp(
    Math.round(Number(config.trancheCount) || DEFAULT_ETF_TRANCHE_COUNT),
    MIN_ETF_TRANCHE_COUNT,
    MAX_ETF_TRANCHE_COUNT,
  );
  return {
    monthlyContribution,
    startYear,
    endYear,
    postSavingsMonthlyFlow,
    trancheCount,
  };
}

function buildEtfHistoricalPrelude(monthlyHistory, startYear, now = new Date()) {
  const startDate = new Date(
    clamp(Math.round(Number(startYear) || now.getFullYear()), ETF_HISTORY_START_YEAR, ETF_HISTORY_END_YEAR),
    0,
    1,
  );
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  if (startDate >= currentMonth) return [];

  const observationsByKey = new Map(monthlyHistory.map((observation) => [observation.key, observation]));
  const basisRateByYear = new Map();
  for (const observation of monthlyHistory) {
    const year = Number(String(observation.key).slice(0, 4));
    if (Number.isInteger(year) && Number.isFinite(observation.basisRate)) {
      basisRateByYear.set(year, observation.basisRate);
    }
  }

  const prelude = [];
  for (let monthDate = startDate; monthDate < currentMonth; monthDate = addMonths(monthDate, 1)) {
    const key = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
    const observation = observationsByKey.get(key);
    prelude.push(observation
      ? { ...observation }
      : {
          key,
          marketReturn: 0,
          inflationRatio: 1,
          basisRate: basisRateByYear.get(monthDate.getFullYear()) ?? 0,
        });
  }
  return prelude;
}

function scaleEtfLots(lots, factor) {
  for (const lot of lots) {
    lot.value *= factor;
    lot.costBasis *= factor;
    lot.advanceCredit *= factor;
    lot.pendingAdvanceCredit = (lot.pendingAdvanceCredit ?? 0) * factor;
    if (lot.yearStartValue !== null) lot.yearStartValue *= factor;
  }
}

function calculateEtfTaxYear({
  grossCapitalIncome,
  grossNonWithdrawalIncome,
  lossCarryforward,
  saverAllowance,
}) {
  const taxableBeforeLoss = (Number(grossCapitalIncome) || 0) * EQUITY_FUND_TAXABLE_SHARE;
  const taxableNonWithdrawalBeforeLoss =
    (Number(grossNonWithdrawalIncome) || 0) * EQUITY_FUND_TAXABLE_SHARE;
  const openingLoss = Math.max(Number(lossCarryforward) || 0, 0);
  const afterLoss = taxableBeforeLoss - openingLoss;
  const remainingLossCarryforward = Math.max(-afterLoss, 0);
  const taxableAfterAllowance = Math.max(afterLoss - saverAllowance, 0);
  const nonWithdrawalAfterLoss = taxableNonWithdrawalBeforeLoss - openingLoss;
  const nonWithdrawalAfterAllowance = Math.max(nonWithdrawalAfterLoss - saverAllowance, 0);
  const flatTaxFactor = CAPITAL_GAINS_TAX_RATE * (1 + SOLIDARITY_SURCHARGE_RATE);
  const totalTax = taxableAfterAllowance * flatTaxFactor;
  const nonWithdrawalTax = Math.min(
    Math.max(nonWithdrawalAfterAllowance * flatTaxFactor, 0),
    totalTax,
  );
  return {
    totalTax,
    withdrawalTax: Math.max(totalTax - nonWithdrawalTax, 0),
    portfolioTax: nonWithdrawalTax,
    remainingLossCarryforward,
  };
}

function projectOrdinaryEtfPath({
  household,
  monthlyPath,
  now,
  retirementDate,
  adjustInflowsForInflation,
  config,
  includeDecisionContribution = false,
  decisionStartDate = now,
  realTermsBaseInflation = 1,
}) {
  const resolvedConfig = resolveEtfComparisonConfig(config, now);
  const cashFlowSchedule = [];
  const baseInflation = Math.max(Number(realTermsBaseInflation) || 1, 1e-12);
  // All UI amounts are expressed in today's euros. Before today this reverses
  // the observed inflation; after today it continues indexing them forward.
  let scheduleInflation = adjustInflowsForInflation ? 1 / baseInflation : 1;
  for (let monthIndex = 0; monthIndex < monthlyPath.length; monthIndex += 1) {
    const monthDate = addMonths(now, monthIndex);
    if (monthDate >= retirementDate) break;
    const inSavingsWindow = monthDate.getFullYear() >= resolvedConfig.startYear && monthDate.getFullYear() <= resolvedConfig.endYear;
    const baselineEtfCashFlow = inSavingsWindow
      ? resolvedConfig.monthlyContribution
      : monthDate.getFullYear() > resolvedConfig.endYear
        ? resolvedConfig.postSavingsMonthlyFlow
        : 0;
    const decisionHasStarted = monthDate >= decisionStartDate;
    const applicantDecisionContribution = includeDecisionContribution && decisionHasStarted &&
      preciseAge(household.applicant.birthdate, monthDate) < household.applicant.retirementAge
      ? household.applicant.monthlyContribution
      : 0;
    const spouseDecisionContribution = includeDecisionContribution && decisionHasStarted && household.spouse &&
      preciseAge(household.spouse.birthdate, monthDate) < household.spouse.retirementAge
      ? household.spouse.monthlyContribution
      : 0;
    // In the no-AVD alternative, X changes the household's net ETF cash flow.
    // In particular, X reduces a negative FIRE withdrawal before any lots are
    // sold instead of being deposited and immediately withdrawn again.
    const monthlyEtfCashFlow = baselineEtfCashFlow + applicantDecisionContribution + spouseDecisionContribution;
    const inflationFactor = adjustInflowsForInflation ? scheduleInflation : 1;
    cashFlowSchedule.push({
      contribution: Math.max(monthlyEtfCashFlow, 0) * inflationFactor,
      withdrawal: Math.max(-monthlyEtfCashFlow, 0) * inflationFactor,
    });
    scheduleInflation *= monthlyPath[monthIndex].inflationRatio;
  }

  const totalScheduledContributions = cashFlowSchedule.reduce((sum, flow) => sum + flow.contribution, 0);
  const contributionPerTranche = totalScheduledContributions / resolvedConfig.trancheCount;
  const tranches = Array.from({ length: resolvedConfig.trancheCount }, () => []);
  let contributed = 0;
  let realContributed = 0;
  let cumulativeInflation = 1;
  let advanceAssessments = 0;
  let advanceTaxPaid = 0;
  let totalTaxPaid = 0;
  let preRetirementWithdrawals = 0;
  let realPreRetirementWithdrawals = 0;
  let preRetirementWithdrawalTax = 0;
  let preRetirementWithdrawalShortfall = 0;
  let realPreRetirementWithdrawalShortfall = 0;
  let annualRealizedGain = 0;
  let annualAdvanceIncome = 0;
  let capitalLossCarryforward = 0;
  let pendingAdvanceAssessment = 0;
  let annualOpeningLossCarryforward = 0;
  let annualAdvanceTaxPrepaid = 0;
  let lotSequence = 0;
  const saverAllowance = Math.max(
    SAVER_ALLOWANCE_SINGLE * (household.spouse ? 2 : 1),
    0,
  );

  const adjustPortfolioForTax = (taxAmount, monthDate) => {
    const valueBeforeTax = tranches.flat().reduce((sum, lot) => sum + lot.value, 0);
    if (taxAmount > 1e-9 && valueBeforeTax > 0) {
      scaleEtfLots(tranches.flat(), Math.max(valueBeforeTax - taxAmount, 0) / valueBeforeTax);
    } else if (taxAmount < -1e-9) {
      const refund = -taxAmount;
      const trancheIndex = Math.max(resolvedConfig.trancheCount - 1, 0);
      tranches[trancheIndex].push({
        acquiredMonth: monthDate.getMonth(),
        acquiredSequence: lotSequence++,
        advanceCredit: 0,
        pendingAdvanceCredit: 0,
        costBasis: refund,
        trancheIndex,
        value: refund,
        yearStartValue: null,
      });
    }
  };

  const settleTaxYear = (monthDate) => {
    const tax = calculateEtfTaxYear({
      grossCapitalIncome: annualRealizedGain + annualAdvanceIncome,
      grossNonWithdrawalIncome: annualAdvanceIncome,
      lossCarryforward: annualOpeningLossCarryforward,
      saverAllowance,
    });
    capitalLossCarryforward = tax.remainingLossCarryforward;
    preRetirementWithdrawalTax += tax.withdrawalTax;
    totalTaxPaid += tax.totalTax - annualAdvanceTaxPrepaid;
    const advanceTaxAdjustment = tax.portfolioTax - annualAdvanceTaxPrepaid;
    adjustPortfolioForTax(advanceTaxAdjustment, monthDate);
    advanceTaxPaid += advanceTaxAdjustment;
    annualRealizedGain = 0;
    annualAdvanceIncome = 0;
    annualAdvanceTaxPrepaid = 0;
    annualOpeningLossCarryforward = capitalLossCarryforward;
  };

  for (let monthIndex = 0; monthIndex < cashFlowSchedule.length; monthIndex += 1) {
    const sample = monthlyPath[monthIndex];
    const monthDate = addMonths(now, monthIndex);
    const allLots = tranches.flat();
    if (monthDate.getMonth() === 0) {
      for (const lot of allLots) {
        lot.advanceCredit += lot.pendingAdvanceCredit ?? 0;
        lot.pendingAdvanceCredit = 0;
        lot.yearStartValue = lot.value;
      }
      annualOpeningLossCarryforward = capitalLossCarryforward;
      annualAdvanceIncome = pendingAdvanceAssessment;
      const advanceTax = calculateEtfTaxYear({
        grossCapitalIncome: annualAdvanceIncome,
        grossNonWithdrawalIncome: annualAdvanceIncome,
        lossCarryforward: annualOpeningLossCarryforward,
        saverAllowance,
      });
      annualAdvanceTaxPrepaid = advanceTax.totalTax;
      adjustPortfolioForTax(annualAdvanceTaxPrepaid, monthDate);
      advanceTaxPaid += annualAdvanceTaxPrepaid;
      totalTaxPaid += annualAdvanceTaxPrepaid;
      pendingAdvanceAssessment = 0;
    }
    for (const lot of allLots) lot.value *= 1 + sample.marketReturn;

    const monthlyContribution = cashFlowSchedule[monthIndex].contribution;
    const contributionStart = contributed;
    const contributionEnd = contributionStart + monthlyContribution;
    for (let trancheIndex = 0; trancheIndex < resolvedConfig.trancheCount; trancheIndex += 1) {
      const trancheStart = contributionPerTranche * trancheIndex;
      const trancheEnd = trancheIndex === resolvedConfig.trancheCount - 1
        ? Number.POSITIVE_INFINITY
        : contributionPerTranche * (trancheIndex + 1);
      const amount = Math.max(
        Math.min(contributionEnd, trancheEnd) - Math.max(contributionStart, trancheStart),
        0,
      );
      if (amount <= 1e-9) continue;
      tranches[trancheIndex].push({
        acquiredMonth: monthDate.getMonth(),
        acquiredSequence: lotSequence++,
        advanceCredit: 0,
        pendingAdvanceCredit: 0,
        costBasis: amount,
        trancheIndex,
        value: amount,
        yearStartValue: null,
      });
      realContributed += amount * baseInflation / Math.max(cumulativeInflation, 1e-12);
    }
    contributed = contributionEnd;

    const withdrawal = withdrawEtfLots(tranches.flat(), cashFlowSchedule[monthIndex].withdrawal);
    preRetirementWithdrawals += withdrawal.proceeds;
    realPreRetirementWithdrawals += withdrawal.proceeds * baseInflation / Math.max(cumulativeInflation, 1e-12);
    preRetirementWithdrawalShortfall += withdrawal.shortfall;
    realPreRetirementWithdrawalShortfall += withdrawal.shortfall * baseInflation / Math.max(cumulativeInflation, 1e-12);
    annualRealizedGain += withdrawal.gain;

    if (monthDate.getMonth() === 11) {
      let annualAdvanceAssessment = 0;
      for (const lot of tranches.flat()) {
        const referenceValue = lot.yearStartValue ?? lot.costBasis;
        const ownershipFraction = lot.yearStartValue === null ? (12 - lot.acquiredMonth) / 12 : 1;
        const baseYield = referenceValue * Math.max(Number(sample.basisRate) || 0, 0) * 0.7 * ownershipFraction;
        const annualAppreciation = Math.max(lot.value - referenceValue, 0);
        const assessment = Math.max(Math.min(baseYield, annualAppreciation), 0);
        lot.pendingAdvanceCredit += assessment;
        annualAdvanceAssessment += assessment;
      }
      advanceAssessments += annualAdvanceAssessment;
      pendingAdvanceAssessment += annualAdvanceAssessment;
      settleTaxYear(monthDate);
    }
    cumulativeInflation *= sample.inflationRatio;
  }

  if (Math.abs(annualRealizedGain) > 1e-9 || annualAdvanceIncome > 1e-9) {
    const lastMonthDate = addMonths(now, Math.max(cashFlowSchedule.length - 1, 0));
    settleTaxYear(lastMonthDate);
  }

  const lots = tranches.flat();
  const remainingCostBasis = lots.reduce((sum, lot) => sum + lot.costBasis, 0);
  return {
    advanceAssessments,
    advanceTaxPaid,
    totalTaxPaid,
    capitalLossCarryforward,
    pendingAdvanceAssessment,
    contributions: contributed,
    realContributions: realContributed,
    cumulativeInflation,
    lots,
    preRetirementWithdrawals,
    realPreRetirementWithdrawals,
    preRetirementWithdrawalTax,
    preRetirementNetWithdrawals: Math.max(preRetirementWithdrawals - preRetirementWithdrawalTax, 0),
    preRetirementWithdrawalShortfall,
    realPreRetirementWithdrawalShortfall,
    remainingCostBasis,
    realTermsBaseInflation: baseInflation,
    value: lots.reduce((sum, lot) => sum + lot.value, 0),
  };
}

function scaledEtfState(state, realTerms) {
  const factor = realTerms
    ? Math.max(Number(state.realTermsBaseInflation) || 1, 1e-12) /
      Math.max(state.cumulativeInflation, 1e-12)
    : 1;
  return {
    advanceAssessments: state.advanceAssessments * factor,
    advanceTaxPaid: state.advanceTaxPaid * factor,
    totalTaxPaid: state.totalTaxPaid * factor,
    capitalLossCarryforward: state.capitalLossCarryforward * factor,
    pendingAdvanceAssessment: state.pendingAdvanceAssessment * factor,
    contributions: realTerms
      ? state.realContributions ?? state.contributions * factor
      : state.contributions,
    lots: state.lots.map((lot) => ({
      ...lot,
      advanceCredit: lot.advanceCredit * factor,
      pendingAdvanceCredit: (lot.pendingAdvanceCredit ?? 0) * factor,
      costBasis: lot.costBasis * factor,
      value: lot.value * factor,
      yearStartValue: lot.yearStartValue === null ? null : lot.yearStartValue * factor,
    })),
    value: state.value * factor,
  };
}

function withdrawEtfLots(lots, requestedAmount) {
  const ordered = lots.filter((lot) => lot.value > 1e-9).sort((a, b) =>
    b.trancheIndex - a.trancheIndex || a.acquiredSequence - b.acquiredSequence,
  );
  let remaining = Math.max(Number(requestedAmount) || 0, 0);
  let proceeds = 0;
  let gain = 0;
  for (const lot of ordered) {
    if (remaining <= 1e-9) break;
    const sold = Math.min(lot.value, remaining);
    const share = sold / lot.value;
    const soldBasis = lot.costBasis * share;
    const soldAdvanceCredit = lot.advanceCredit * share;
    const soldPendingAdvanceCredit = (lot.pendingAdvanceCredit ?? 0) * share;
    proceeds += sold;
    gain += sold - soldBasis - soldAdvanceCredit - soldPendingAdvanceCredit;
    lot.value -= sold;
    lot.costBasis -= soldBasis;
    lot.advanceCredit -= soldAdvanceCredit;
    lot.pendingAdvanceCredit = Math.max((lot.pendingAdvanceCredit ?? 0) - soldPendingAdvanceCredit, 0);
    if (lot.yearStartValue !== null) lot.yearStartValue *= 1 - share;
    remaining -= sold;
  }
  return { gain, proceeds, shortfall: remaining };
}

function realizeEtfWithdrawal(lots, requestedAmount) {
  const amount = Math.max(Number(requestedAmount) || 0, 0);
  const ordered = lots.map((lot) => ({ ...lot })).sort((a, b) =>
    b.trancheIndex - a.trancheIndex || a.acquiredSequence - b.acquiredSequence,
  );
  let remaining = amount;
  let proceeds = 0;
  let gain = 0;
  for (const lot of ordered) {
    if (remaining <= 1e-9 || lot.value <= 0) break;
    const sold = Math.min(lot.value, remaining);
    const share = sold / lot.value;
    proceeds += sold;
    gain += sold - lot.costBasis * share - (lot.advanceCredit + (lot.pendingAdvanceCredit ?? 0)) * share;
    remaining -= sold;
  }
  if (remaining > 1e-9) {
    const totalValue = ordered.reduce((sum, lot) => sum + lot.value, 0);
    const totalDeferredGain = ordered.reduce(
      (sum, lot) => sum + lot.value - lot.costBasis - lot.advanceCredit - (lot.pendingAdvanceCredit ?? 0),
      0,
    );
    const fallbackGainShare = totalValue > 0 ? clamp(totalDeferredGain / totalValue, 0, 1) : 0;
    proceeds += remaining;
    gain += remaining * fallbackGainShare;
  }
  return { gain, proceeds };
}

function incomeTax2026(taxableIncome, jointlyAssessed = false) {
  const divisor = jointlyAssessed ? 2 : 1;
  const x = Math.floor(Math.max(Number(taxableIncome) || 0, 0) / divisor);
  let tax = 0;
  if (x <= 12_348) {
    tax = 0;
  } else if (x <= 17_799) {
    const y = (x - 12_348) / 10_000;
    tax = (914.51 * y + 1_400) * y;
  } else if (x <= 69_878) {
    const z = (x - 17_799) / 10_000;
    tax = (173.1 * z + 2_397) * z + 1_034.87;
  } else if (x <= 277_825) {
    tax = 0.42 * x - 11_135.63;
  } else {
    tax = 0.45 * x - 19_470.38;
  }
  return Math.max(Math.floor(tax) * divisor, 0);
}

function statutoryPensionTaxableShare(retirementYear) {
  const year = Math.round(Number(retirementYear) || 2026);
  if (year <= 2026) {
    return 0.84;
  }
  return Math.min(0.84 + (year - 2026) * 0.005, 1);
}

function kvdrCareInsuranceRateForHousehold(children = [], retirementDate = new Date()) {
  if (!Array.isArray(children) || children.length === 0) {
    return KVDR_CARE_INSURANCE_CHILDLESS_RATE;
  }
  const childrenUnder25 = children.filter(
    (birthdate) => birthdate instanceof Date && preciseAge(birthdate, retirementDate) < 25,
  ).length;
  const discountedChildren = clamp(childrenUnder25 - 1, 0, 4);
  return KVDR_CARE_INSURANCE_PARENT_RATE -
    discountedChildren * KVDR_CARE_INSURANCE_CHILD_DISCOUNT;
}

function calculateKvdrContributions({
  pensionAnnual = 0,
  jointlyAssessed = false,
  careInsuranceRate = KVDR_CARE_INSURANCE_PARENT_RATE,
} = {}) {
  const pensionGross = Math.max(Number(pensionAnnual) || 0, 0);
  const insuredPersonCount = jointlyAssessed ? 2 : 1;
  const contributionBase = Math.min(
    pensionGross,
    KVDR_ANNUAL_CONTRIBUTION_CEILING_2026 * insuredPersonCount,
  );
  const healthInsuranceRate =
    (KVDR_GENERAL_HEALTH_INSURANCE_RATE_2026 + KVDR_AVERAGE_ADDITIONAL_RATE_2026) *
    KVDR_PENSIONER_HEALTH_SHARE;
  const resolvedCareInsuranceRate = clamp(
    Number(careInsuranceRate) || KVDR_CARE_INSURANCE_PARENT_RATE,
    0,
    1,
  );
  const healthInsurance = contributionBase * healthInsuranceRate;
  const careInsurance = contributionBase * resolvedCareInsuranceRate;
  const total = healthInsurance + careInsurance;
  return {
    assumedKvdr: true,
    contributionBase,
    healthInsurance,
    careInsurance,
    total,
    deductible: total,
    healthInsuranceRate,
    careInsuranceRate: resolvedCareInsuranceRate,
    annualContributionCeilingPerPerson: KVDR_ANNUAL_CONTRIBUTION_CEILING_2026,
  };
}

function taxableCapitalIncome(grossEtfWithdrawal, gainShare, saverAllowance) {
  const taxableGains = Math.max(grossEtfWithdrawal, 0) * clamp(gainShare, 0, 1) * EQUITY_FUND_TAXABLE_SHARE;
  return Math.max(taxableGains - saverAllowance, 0);
}

function taxableCapitalGain(capitalGain, saverAllowance, lossCarryforward = 0) {
  return Math.max(
    (Number(capitalGain) || 0) * EQUITY_FUND_TAXABLE_SHARE -
      Math.max(Number(lossCarryforward) || 0, 0) - saverAllowance,
    0,
  );
}

function solidaritySurcharge2026(incomeTax, jointlyAssessed = false) {
  const assessmentBase = Math.max(Number(incomeTax) || 0, 0);
  const exemption = SOLIDARITY_SURCHARGE_EXEMPTION_SINGLE * (jointlyAssessed ? 2 : 1);
  if (assessmentBase <= exemption) {
    return 0;
  }
  return Math.max(
    Math.min(
      assessmentBase * SOLIDARITY_SURCHARGE_RATE,
      (assessmentBase - exemption) * SOLIDARITY_SURCHARGE_MITIGATION_RATE,
    ),
    0,
  );
}

function ordinaryIncomeTaxWithSurcharge(taxableIncome, jointlyAssessed = false) {
  const incomeTax = incomeTax2026(taxableIncome, jointlyAssessed);
  return incomeTax + solidaritySurcharge2026(incomeTax, jointlyAssessed);
}

function favorableCapitalIncomeTax({
  ordinaryTaxableIncome,
  capitalGain,
  grossEtfWithdrawal,
  gainShare,
  saverAllowance,
  capitalLossCarryforward = 0,
  jointlyAssessed = false,
}) {
  const capitalIncome = capitalGain === undefined
    ? taxableCapitalIncome(grossEtfWithdrawal, gainShare, saverAllowance)
    : taxableCapitalGain(capitalGain, saverAllowance, capitalLossCarryforward);
  const ordinaryTax = ordinaryIncomeTaxWithSurcharge(ordinaryTaxableIncome, jointlyAssessed);
  const flatCapitalTax = capitalIncome * CAPITAL_GAINS_TAX_RATE * (1 + SOLIDARITY_SURCHARGE_RATE);
  const flatTotalTax = ordinaryTax + flatCapitalTax;
  const tariffTotalTax = ordinaryIncomeTaxWithSurcharge(
    ordinaryTaxableIncome + capitalIncome,
    jointlyAssessed,
  );
  const useTariff = tariffTotalTax < flatTotalTax;
  return {
    capitalIncome,
    method: useTariff ? "tariff" : "flat",
    totalTax: useTariff ? tariffTotalTax : flatTotalTax,
  };
}

function compareNetWithdrawals({
  grossWithdrawal,
  retirementValue,
  etfGrossWithdrawal,
  etfRetirementValue,
  etfLots,
  pensionAnnual = 0,
  parallelEtfAnnual = 0,
  etfGainShare = 0.5,
  retirementYear = 2026,
  jointlyAssessed = false,
  kvdrCareInsuranceRate = KVDR_CARE_INSURANCE_PARENT_RATE,
} = {}) {
  const gross = Math.max(Number(grossWithdrawal) || 0, 0);
  const portfolio = Math.max(Number(retirementValue) || 0, 0);
  const etfPortfolio = etfRetirementValue === undefined
    ? portfolio
    : Math.max(Number(etfRetirementValue) || 0, 0);
  const etfGross = etfGrossWithdrawal === undefined
    ? gross
    : Math.max(Number(etfGrossWithdrawal) || 0, 0);
  const pensionGross = Math.max(Number(pensionAnnual) || 0, 0);
  const parallelEtfGross = Math.max(Number(parallelEtfAnnual) || 0, 0);
  const kvdr = calculateKvdrContributions({
    pensionAnnual: pensionGross,
    jointlyAssessed,
    careInsuranceRate: kvdrCareInsuranceRate,
  });
  const pensionExpenseAllowance = jointlyAssessed ? PENSION_EXPENSE_ALLOWANCE * 2 : PENSION_EXPENSE_ALLOWANCE;
  const pensionTaxableBeforeKvdr = Math.max(
    pensionGross * statutoryPensionTaxableShare(retirementYear) - pensionExpenseAllowance,
    0,
  );
  const ordinaryTaxableIncome = (additionalOrdinaryIncome = 0) => Math.max(
    pensionTaxableBeforeKvdr + Math.max(Number(additionalOrdinaryIncome) || 0, 0) -
      kvdr.deductible,
    0,
  );
  const pensionTaxable = ordinaryTaxableIncome();
  const allowance = SAVER_ALLOWANCE_SINGLE * (jointlyAssessed ? 2 : 1);
  const parallelGain = Array.isArray(etfLots)
    ? realizeEtfWithdrawal(etfLots, parallelEtfGross).gain
    : parallelEtfGross * clamp(etfGainShare, 0, 1);
  const combinedEtfGain = Array.isArray(etfLots)
    ? realizeEtfWithdrawal(etfLots, parallelEtfGross + etfGross).gain
    : (parallelEtfGross + etfGross) * clamp(etfGainShare, 0, 1);
  const baselineScenario = favorableCapitalIncomeTax({
    ordinaryTaxableIncome: pensionTaxable,
    capitalGain: parallelGain,
    saverAllowance: allowance,
    jointlyAssessed,
  });
  const pensionOnlyScenario = favorableCapitalIncomeTax({
    ordinaryTaxableIncome: pensionTaxable,
    capitalGain: 0,
    saverAllowance: allowance,
    jointlyAssessed,
  });
  const avdScenario = favorableCapitalIncomeTax({
    ordinaryTaxableIncome: ordinaryTaxableIncome(gross),
    capitalGain: parallelGain,
    saverAllowance: allowance,
    jointlyAssessed,
  });
  const etfScenario = favorableCapitalIncomeTax({
    ordinaryTaxableIncome: pensionTaxable,
    capitalGain: combinedEtfGain,
    saverAllowance: allowance,
    jointlyAssessed,
  });
  const avdTax = Math.max(avdScenario.totalTax - baselineScenario.totalTax, 0);
  const etfTax = Math.max(etfScenario.totalTax - baselineScenario.totalTax, 0);
  const avdNet = Math.max(gross - avdTax, 0);
  const etfNet = Math.max(etfGross - etfTax, 0);
  const avdTotalGrossIncome = pensionGross + parallelEtfGross + gross;
  const etfTotalGrossIncome = pensionGross + parallelEtfGross + etfGross;
  const pensionNetIncome = Math.max(
    pensionGross - pensionOnlyScenario.totalTax - kvdr.total,
    0,
  );
  const baselineTotalNetIncome = Math.max(
    pensionGross + parallelEtfGross - baselineScenario.totalTax - kvdr.total,
    0,
  );
  const parallelEtfNetIncome = Math.max(baselineTotalNetIncome - pensionNetIncome, 0);
  const avdTotalNetIncome = Math.max(
    avdTotalGrossIncome - avdScenario.totalTax - kvdr.total,
    0,
  );
  const etfTotalNetIncome = Math.max(
    etfTotalGrossIncome - etfScenario.totalTax - kvdr.total,
    0,
  );

  return {
    avdNet,
    avdTax,
    avdNetRate: portfolio > 0 ? avdNet / portfolio : 0,
    etfNet,
    etfTax,
    etfTaxMethod: etfScenario.method,
    etfNetRate: etfPortfolio > 0 ? etfNet / etfPortfolio : 0,
    avdTotalNetIncome,
    avdTotalTax: avdScenario.totalTax,
    etfTotalNetIncome,
    etfTotalTax: etfScenario.totalTax,
    pensionGross,
    pensionNetIncome,
    baselineEtfGrossWithdrawal: parallelEtfGross,
    parallelEtfNetIncome,
    avdTotalGrossIncome,
    etfTotalGrossIncome,
    totalGrossIncome: avdTotalGrossIncome,
    grossWithdrawal: gross,
    etfGrossWithdrawal: etfGross,
    grossWithdrawalRate: portfolio > 0 ? gross / portfolio : 0,
    etfGrossWithdrawalRate: etfPortfolio > 0 ? etfGross / etfPortfolio : 0,
    parallelCapitalGain: parallelGain,
    combinedEtfCapitalGain: combinedEtfGain,
    pensionTaxable,
    pensionTaxableBeforeKvdr,
    assumedKvdr: true,
    kvdr,
    kvdrContributionBase: kvdr.contributionBase,
    kvdrHealthInsurance: kvdr.healthInsurance,
    kvdrCareInsurance: kvdr.careInsurance,
    kvdrTotalContributions: kvdr.total,
    kvdrDeductibleContributions: kvdr.deductible,
  };
}

function compareDecisionWithdrawals({
  avdGrossWithdrawal,
  avdTaxableWithdrawal,
  avdRetirementValue,
  commonAvdGrossWithdrawal = 0,
  commonAvdTaxableWithdrawal = 0,
  commonAvdRetirementValue = 0,
  baselineEtfGrossWithdrawal,
  baselineEtfLots,
  combinedEtfGrossWithdrawal,
  combinedEtfLots,
  incrementalEtfValue,
  baselineEtfPendingAdvanceAssessment = 0,
  combinedEtfPendingAdvanceAssessment = 0,
  baselineEtfLossCarryforward = 0,
  combinedEtfLossCarryforward = 0,
  pensionAnnual = 0,
  retirementYear = 2026,
  jointlyAssessed = false,
  kvdrCareInsuranceRate = KVDR_CARE_INSURANCE_PARENT_RATE,
} = {}) {
  const avdGross = Math.max(Number(avdGrossWithdrawal) || 0, 0);
  const avdTaxable = avdTaxableWithdrawal === undefined
    ? avdGross
    : clamp(Number(avdTaxableWithdrawal) || 0, 0, avdGross);
  const commonAvdGross = Math.max(Number(commonAvdGrossWithdrawal) || 0, 0);
  const commonAvdTaxable = clamp(
    Number(commonAvdTaxableWithdrawal) || 0,
    0,
    commonAvdGross,
  );
  const avdValue = Math.max(Number(avdRetirementValue) || 0, 0) +
    Math.max(Number(commonAvdRetirementValue) || 0, 0);
  const baselineGross = Math.max(Number(baselineEtfGrossWithdrawal) || 0, 0);
  const combinedGross = Math.max(Number(combinedEtfGrossWithdrawal) || 0, baselineGross);
  const etfDecisionGross = Math.max(combinedGross - baselineGross, 0);
  const etfDecisionValue = Math.max(Number(incrementalEtfValue) || 0, 0);
  const pensionGross = Math.max(Number(pensionAnnual) || 0, 0);
  const kvdr = calculateKvdrContributions({
    pensionAnnual: pensionGross,
    jointlyAssessed,
    careInsuranceRate: kvdrCareInsuranceRate,
  });
  const pensionExpenseAllowance = jointlyAssessed ? PENSION_EXPENSE_ALLOWANCE * 2 : PENSION_EXPENSE_ALLOWANCE;
  const pensionTaxableBeforeKvdr = Math.max(
    pensionGross * statutoryPensionTaxableShare(retirementYear) - pensionExpenseAllowance,
    0,
  );
  const ordinaryTaxableIncome = (additionalOrdinaryIncome = 0) => Math.max(
    pensionTaxableBeforeKvdr + Math.max(Number(additionalOrdinaryIncome) || 0, 0) -
      kvdr.deductible,
    0,
  );
  const pensionTaxable = ordinaryTaxableIncome();
  const allowance = SAVER_ALLOWANCE_SINGLE * (jointlyAssessed ? 2 : 1);
  const baselineOrdinaryTaxableIncome = ordinaryTaxableIncome(commonAvdTaxable);
  const baselineGain = realizeEtfWithdrawal(baselineEtfLots ?? [], baselineGross).gain +
    Math.max(Number(baselineEtfPendingAdvanceAssessment) || 0, 0);
  const combinedGain = realizeEtfWithdrawal(combinedEtfLots ?? [], combinedGross).gain +
    Math.max(Number(combinedEtfPendingAdvanceAssessment) || 0, 0);
  const pensionOnlyScenario = favorableCapitalIncomeTax({
    ordinaryTaxableIncome: pensionTaxable,
    capitalGain: 0,
    saverAllowance: allowance,
    jointlyAssessed,
  });
  const baselineScenario = favorableCapitalIncomeTax({
    ordinaryTaxableIncome: baselineOrdinaryTaxableIncome,
    capitalGain: baselineGain,
    capitalLossCarryforward: baselineEtfLossCarryforward,
    saverAllowance: allowance,
    jointlyAssessed,
  });
  const avdScenario = favorableCapitalIncomeTax({
    ordinaryTaxableIncome: ordinaryTaxableIncome(commonAvdTaxable + avdTaxable),
    capitalGain: baselineGain,
    capitalLossCarryforward: baselineEtfLossCarryforward,
    saverAllowance: allowance,
    jointlyAssessed,
  });
  const etfScenario = favorableCapitalIncomeTax({
    ordinaryTaxableIncome: baselineOrdinaryTaxableIncome,
    capitalGain: combinedGain,
    capitalLossCarryforward: combinedEtfLossCarryforward,
    saverAllowance: allowance,
    jointlyAssessed,
  });
  const pensionNetIncome = Math.max(
    pensionGross - pensionOnlyScenario.totalTax - kvdr.total,
    0,
  );
  const baselineTotalNetIncome = Math.max(
    pensionGross + baselineGross + commonAvdGross - baselineScenario.totalTax - kvdr.total,
    0,
  );
  const baselineEtfNetIncome = Math.max(baselineTotalNetIncome - pensionNetIncome, 0);
  const avdTotalGrossIncome = pensionGross + baselineGross + commonAvdGross + avdGross;
  const etfTotalGrossIncome = pensionGross + combinedGross + commonAvdGross;
  const avdTotalNetIncome = Math.max(
    avdTotalGrossIncome - avdScenario.totalTax - kvdr.total,
    0,
  );
  const etfTotalNetIncome = Math.max(
    etfTotalGrossIncome - etfScenario.totalTax - kvdr.total,
    0,
  );
  const avdNet = avdTotalNetIncome - baselineTotalNetIncome;
  const etfNet = etfTotalNetIncome - baselineTotalNetIncome;

  return {
    avdNet,
    avdTax: avdScenario.totalTax - baselineScenario.totalTax,
    avdNetRate: avdValue > 0 ? avdNet / avdValue : 0,
    etfNet,
    etfTax: etfScenario.totalTax - baselineScenario.totalTax,
    etfTaxMethod: etfScenario.method,
    etfNetRate: etfDecisionValue > 0 ? etfNet / etfDecisionValue : 0,
    avdTotalNetIncome,
    avdTotalTax: avdScenario.totalTax,
    etfTotalNetIncome,
    etfTotalTax: etfScenario.totalTax,
    pensionGross,
    pensionNetIncome,
    baselineEtfNetIncome,
    parallelEtfNetIncome: baselineEtfNetIncome,
    avdTotalGrossIncome,
    etfTotalGrossIncome,
    grossWithdrawal: commonAvdGross + avdGross,
    avdTaxableWithdrawal: commonAvdTaxable + avdTaxable,
    etfGrossWithdrawal: commonAvdGross + etfDecisionGross,
    commonAvdGrossWithdrawal: commonAvdGross,
    commonAvdTaxableWithdrawal: commonAvdTaxable,
    grossWithdrawalRate: avdValue > 0 ? avdGross / avdValue : 0,
    etfGrossWithdrawalRate: etfDecisionValue > 0 ? etfDecisionGross / etfDecisionValue : 0,
    avdAdvantage: avdNet - etfNet,
    baselineEtfGrossWithdrawal: baselineGross,
    combinedEtfGrossWithdrawal: combinedGross,
    baselineCapitalGain: baselineGain,
    combinedEtfCapitalGain: combinedGain,
    pensionTaxable,
    pensionTaxableBeforeKvdr,
    assumedKvdr: true,
    kvdr,
    kvdrContributionBase: kvdr.contributionBase,
    kvdrHealthInsurance: kvdr.healthInsurance,
    kvdrCareInsurance: kvdr.careInsurance,
    kvdrTotalContributions: kvdr.total,
    kvdrDeductibleContributions: kvdr.deductible,
  };
}

function setResultMode(mode) {
  uiState.resultMode = mode === "comparison" ? "comparison" : "projection";
  syncResultMode();
  saveSession();
  if (uiState.resultMode === "comparison") {
    renderTaxComparison(latestChartState);
  }
}

function syncResultMode() {
  const isComparison = uiState.resultMode === "comparison";
  elements.projectionView?.classList.toggle("hidden", isComparison);
  elements.comparisonView?.classList.toggle("hidden", !isComparison);
  elements.projectionMode?.classList.toggle("is-active", !isComparison);
  elements.comparisonMode?.classList.toggle("is-active", isComparison);
  elements.projectionMode?.setAttribute("aria-pressed", String(!isComparison));
  elements.comparisonMode?.setAttribute("aria-pressed", String(isComparison));
}

function resolveMonthlyPension({ mode, monthly, points } = {}) {
  if (mode === PENSION_INPUT_MODE_POINTS) {
    return clamp(Number(points) || 0, 0, 200) * CURRENT_PENSION_POINT_VALUE;
  }
  return clamp(Number(monthly) || 0, 0, 20_000);
}

function syncPensionInputMode() {
  if (!elements.pensionModeMonthly) return;
  const usesPoints = uiState.pensionInputMode === PENSION_INPUT_MODE_POINTS;
  elements.pensionModeMonthly.setAttribute("aria-pressed", String(!usesPoints));
  elements.pensionModePoints.setAttribute("aria-pressed", String(usesPoints));
  elements.pensionMonthlyField.classList.toggle("hidden", usesPoints);
  elements.pensionPointsField.classList.toggle("hidden", !usesPoints);
  elements.pensionPointsConversion.classList.toggle("hidden", !usesPoints);
  const monthlyAmount = resolveMonthlyPension({
    mode: PENSION_INPUT_MODE_POINTS,
    points: elements.comparisonPensionPoints.value,
  });
  elements.pensionPointsConversion.textContent = t("comparison.pensionPointsConversion", {
    amount: formatCurrency(monthlyAmount),
  });
}

function setPensionInputMode(mode) {
  const nextMode = mode === PENSION_INPUT_MODE_POINTS
    ? PENSION_INPUT_MODE_POINTS
    : PENSION_INPUT_MODE_MONTHLY;
  if (nextMode === uiState.pensionInputMode) return;
  if (nextMode === PENSION_INPUT_MODE_POINTS) {
    elements.comparisonPensionPoints.value = (
      clamp(Number(elements.comparisonPension.value) || 0, 0, 20_000) /
      CURRENT_PENSION_POINT_VALUE
    ).toFixed(2);
  } else {
    elements.comparisonPension.value = resolveMonthlyPension({
      mode: PENSION_INPUT_MODE_POINTS,
      points: elements.comparisonPensionPoints.value,
    }).toFixed(2);
  }
  uiState.pensionInputMode = nextMode;
  syncPensionInputMode();
  saveSession();
  renderTaxComparison(latestChartState);
}

function comparisonInputs() {
  return {
    pensionMonthly: resolveMonthlyPension({
      mode: uiState.pensionInputMode,
      monthly: elements.comparisonPension?.value,
      points: elements.comparisonPensionPoints?.value,
    }),
  };
}

function representativeEtfState(result) {
  const realTerms = uiState.adjustInflation;
  const seriesType = realTerms ? "real" : "nominal";
  const targetValue = result.etfComparison?.[seriesType]?.value?.median ?? 0;
  const paths = result.etfComparison?.paths ?? [];
  if (paths.length === 0) {
    return { advanceAssessments: 0, advanceTaxPaid: 0, contributions: 0, lots: [], value: 0 };
  }
  const closest = paths.reduce((best, path) => {
    const value = realTerms
      ? path.value * Math.max(Number(path.realTermsBaseInflation) || 1, 1e-12) /
        Math.max(path.cumulativeInflation, 1e-12)
      : path.value;
    const bestValue = realTerms
      ? best.value * Math.max(Number(best.realTermsBaseInflation) || 1, 1e-12) /
        Math.max(best.cumulativeInflation, 1e-12)
      : best.value;
    return Math.abs(value - targetValue) < Math.abs(bestValue - targetValue) ? path : best;
  });
  return scaledEtfState(closest, realTerms);
}

function compareSimulationResult(result, { pensionMonthly = 0, terms = "real" } = {}) {
  const realTerms = terms !== "nominal";
  const retirementPoint = result.yearlyStats[result.retirementYear] ?? result.yearlyStats[result.preRetirementYear];
  const comparisons = (result.comparisonPaths ?? []).map((path) => {
    const baselineEtf = scaledEtfState(path.baselineEtf, realTerms);
    const alternativeEtf = scaledEtfState(path.alternativeEtf, realTerms);
    const avdValue = realTerms ? path.avdRealValue : path.avdNominalValue;
    const avdWithdrawal = realTerms ? path.avdRealWithdrawal : path.avdNominalWithdrawal;
    const avdTaxableWithdrawal = realTerms
      ? path.avdRealTaxableWithdrawal
      : path.avdNominalTaxableWithdrawal;
    const commonAvdValue = realTerms
      ? path.commonAvdRealValue
      : path.commonAvdNominalValue;
    const commonAvdWithdrawal = realTerms
      ? path.commonAvdRealWithdrawal
      : path.commonAvdNominalWithdrawal;
    const commonAvdTaxableWithdrawal = realTerms
      ? path.commonAvdRealTaxableWithdrawal
      : path.commonAvdNominalTaxableWithdrawal;
    return {
      ...compareDecisionWithdrawals({
        avdGrossWithdrawal: avdWithdrawal,
        avdTaxableWithdrawal,
        avdRetirementValue: avdValue,
        commonAvdGrossWithdrawal: commonAvdWithdrawal,
        commonAvdTaxableWithdrawal,
        commonAvdRetirementValue: commonAvdValue,
        baselineEtfGrossWithdrawal: baselineEtf.value * result.withdrawalRate,
        baselineEtfLots: baselineEtf.lots,
        combinedEtfGrossWithdrawal: alternativeEtf.value * result.withdrawalRate,
        combinedEtfLots: alternativeEtf.lots,
        incrementalEtfValue: Math.max(alternativeEtf.value - baselineEtf.value, 0),
        baselineEtfPendingAdvanceAssessment: baselineEtf.pendingAdvanceAssessment,
        combinedEtfPendingAdvanceAssessment: alternativeEtf.pendingAdvanceAssessment,
        baselineEtfLossCarryforward: baselineEtf.capitalLossCarryforward,
        combinedEtfLossCarryforward: alternativeEtf.capitalLossCarryforward,
        pensionAnnual: pensionMonthly * 12,
        retirementYear: retirementPoint?.pointDate?.getFullYear?.() ?? 2026,
        jointlyAssessed: result.hasSpouse,
        kvdrCareInsuranceRate: result.kvdrCareInsuranceRate,
      }),
      pathRealAnnualReturn: path.pathRealAnnualReturn,
    };
  });
  if (comparisons.length === 0) {
    const comparison = compareDecisionWithdrawals({ pensionAnnual: pensionMonthly * 12 });
    return { ...comparison, advantageDistribution: buildAdvantageDistribution([comparison]) };
  }
  const summarized = averageComparison(comparisons);
  const closestMethodSample = comparisons.reduce((best, comparison) =>
    Math.abs(comparison.etfTotalTax - summarized.etfTotalTax) <
    Math.abs(best.etfTotalTax - summarized.etfTotalTax)
      ? comparison
      : best,
  );
  return {
    ...summarized,
    assumedKvdr: true,
    kvdr: {
      assumedKvdr: true,
      contributionBase: summarized.kvdrContributionBase,
      healthInsurance: summarized.kvdrHealthInsurance,
      careInsurance: summarized.kvdrCareInsurance,
      total: summarized.kvdrTotalContributions,
      deductible: summarized.kvdrDeductibleContributions,
      healthInsuranceRate:
        (KVDR_GENERAL_HEALTH_INSURANCE_RATE_2026 + KVDR_AVERAGE_ADDITIONAL_RATE_2026) *
        KVDR_PENSIONER_HEALTH_SHARE,
      careInsuranceRate: result.kvdrCareInsuranceRate,
      annualContributionCeilingPerPerson: KVDR_ANNUAL_CONTRIBUTION_CEILING_2026,
    },
    advantageDistribution: buildAdvantageDistribution(comparisons),
    etfTaxMethod: closestMethodSample.etfTaxMethod,
  };
}

function averageComparison(comparisons) {
  if (!Array.isArray(comparisons) || comparisons.length === 0) {
    return {};
  }
  const numericKeys = Object.keys(comparisons[0]).filter(
    (key) => comparisons.every((comparison) => typeof comparison[key] === "number"),
  );
  const average = Object.fromEntries(numericKeys.map((key) => [
    key,
    comparisons.reduce((sum, comparison) => sum + comparison[key], 0) / comparisons.length,
  ]));
  average.avdAdvantage = comparisonAdvantageFromTotals(average);
  return average;
}

function buildAdvantageDistribution(comparisons, requestedBinCount = 16) {
  const samples = comparisons.map((comparison) => ({
    advantage: comparisonAdvantageFromTotals(comparison) / 12,
    avdNet: Math.max(Number(comparison.avdTotalNetIncome) || 0, 0) / 12,
    etfNet: Math.max(Number(comparison.etfTotalNetIncome) || 0, 0) / 12,
    pathRealAnnualReturn: Number(comparison.pathRealAnnualReturn),
  }));
  const advantages = samples.map((sample) => sample.advantage);
  const sortedAdvantages = [...advantages].sort((left, right) => left - right);
  const maximumBinCount = Math.max(6, Math.round(Number(requestedBinCount) || 16));
  const binCount = clamp(Math.ceil(Math.sqrt(Math.max(samples.length, 1))), 6, maximumBinCount);
  const evenBinCount = binCount % 2 === 0 ? binCount : binCount + 1;
  const robustLower = percentile(sortedAdvantages, 0.05);
  const robustUpper = percentile(sortedAdvantages, 0.95);
  const rawBound = Math.max(Math.abs(robustLower), Math.abs(robustUpper), 1);
  const magnitude = 10 ** Math.floor(Math.log10(rawBound));
  const scaledBound = rawBound / magnitude;
  const niceFactor = scaledBound <= 1 ? 1 : scaledBound <= 2 ? 2 : scaledBound <= 5 ? 5 : 10;
  const bound = niceFactor * magnitude;
  const binWidth = bound * 2 / evenBinCount;
  const bins = Array.from({ length: evenBinCount }, (_, index) => ({
    min: -bound + index * binWidth,
    max: -bound + (index + 1) * binWidth,
    count: 0,
  }));
  for (const advantage of advantages) {
    const index = clamp(Math.floor((advantage + bound) / binWidth), 0, bins.length - 1);
    bins[index].count += 1;
  }
  const tieTolerance = 0.005;
  const avdWinCount = advantages.filter((value) => value > tieTolerance).length;
  const etfWinCount = advantages.filter((value) => value < -tieTolerance).length;
  const tieCount = advantages.length - avdWinCount - etfWinCount;
  const logSamples = samples
    .filter((sample) => sample.avdNet > 0 && sample.etfNet > 0)
    .map((sample) => Math.log(sample.avdNet / sample.etfNet));
  const meanLogDifference = logSamples.reduce((sum, value) => sum + value, 0) /
    Math.max(logSamples.length, 1);
  const returnSamples = samples.filter((sample) => Number.isFinite(sample.pathRealAnnualReturn));
  const sortedReturns = returnSamples
    .map((sample) => sample.pathRealAnnualReturn)
    .sort((left, right) => left - right);
  const medianRealAnnualReturn = percentile(sortedReturns, 0.5);
  const summarizeReturnRegime = (regimeSamples) => {
    const regimeWinCount = regimeSamples.filter(
      (sample) => sample.advantage > tieTolerance,
    ).length;
    return {
      pathCount: regimeSamples.length,
      avdWinCount: regimeWinCount,
      avdWinRate: regimeWinCount / Math.max(regimeSamples.length, 1),
      meanAdvantage: regimeSamples.reduce((sum, sample) => sum + sample.advantage, 0) /
        Math.max(regimeSamples.length, 1),
    };
  };
  const returnRegimes = returnSamples.length > 1
    ? {
        medianRealAnnualReturn,
        belowMedian: summarizeReturnRegime(
          returnSamples.filter((sample) => sample.pathRealAnnualReturn < medianRealAnnualReturn),
        ),
        aboveMedian: summarizeReturnRegime(
          returnSamples.filter((sample) => sample.pathRealAnnualReturn > medianRealAnnualReturn),
        ),
        atMedianPathCount: returnSamples.filter(
          (sample) => sample.pathRealAnnualReturn === medianRealAnnualReturn,
        ).length,
      }
    : null;
  return {
    pathCount: samples.length,
    avdWinCount,
    etfWinCount,
    tieCount,
    avdWinRate: avdWinCount / Math.max(samples.length, 1),
    etfWinRate: etfWinCount / Math.max(samples.length, 1),
    mean: advantages.reduce((sum, value) => sum + value, 0) / Math.max(advantages.length, 1),
    median: percentile(sortedAdvantages, 0.5),
    p10: percentile(sortedAdvantages, 0.1),
    p90: percentile(sortedAdvantages, 0.9),
    logUtilityPathCount: logSamples.length,
    logCertaintyEquivalentAdvantage: Math.exp(meanLogDifference) - 1,
    returnRegimes,
    bound,
    bins,
  };
}

function comparisonAdvantageFromTotals(comparison) {
  return (Number(comparison?.avdTotalNetIncome) || 0) -
    (Number(comparison?.etfTotalNetIncome) || 0);
}

function comparisonForResult(result, pensionMonthly) {
  return compareSimulationResult(result, {
    pensionMonthly,
    terms: uiState.adjustInflation ? "real" : "nominal",
  });
}

function formatPercentRate(value) {
  return numberFormat({ style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function renderTaxComparison(result) {
  if (!result || !elements.comparisonView) {
    return;
  }
  const { pensionMonthly } = comparisonInputs();
  const comparison = comparisonForResult(result, pensionMonthly);
  const etfState = representativeEtfState(result);
  const etfSummary = result.etfComparison?.[uiState.adjustInflation ? "real" : "nominal"];
  const avdAdvantage = comparisonAdvantageFromTotals(comparison);
  elements.comparisonEtfTaxMethod.textContent = t(
    comparison.etfTaxMethod === "tariff" ? "comparison.favorableTaxApplied" : "comparison.flatTaxApplied",
  );
  elements.comparisonEtfTaxMethod.dataset.method = comparison.etfTaxMethod;
  elements.comparisonDelta.textContent = formatCurrency(Math.abs(avdAdvantage) / 12);
  const comparisonPathCount = comparison.advantageDistribution?.pathCount ?? 0;
  elements.comparisonDeltaLabel.textContent =
    Math.abs(avdAdvantage) < 1
      ? t("comparison.averageAvdNeutral", { paths: comparisonPathCount })
      : avdAdvantage > 0
        ? t("comparison.averageAvdAdvantage", { paths: comparisonPathCount })
        : t("comparison.averageAvdDisadvantage", { paths: comparisonPathCount });
  const etfValue = etfSummary?.value?.median ?? etfState.value;
  const etfContributions = etfSummary?.contributions?.median ?? etfState.contributions;
  const etfAdvanceAssessments = etfSummary?.advanceAssessments?.median ?? etfState.advanceAssessments;
  const etfTaxPaid = etfSummary?.totalTaxPaid?.median ?? etfState.totalTaxPaid;
  const etfLossCarryforward = etfSummary?.capitalLossCarryforward?.median ?? etfState.capitalLossCarryforward;
  const etfRemainingCostBasis = etfSummary?.remainingCostBasis?.median
    ?? etfState.lots.reduce((sum, lot) => sum + lot.costBasis, 0);
  const fireWithdrawals = etfSummary?.preRetirementWithdrawals?.median ?? 0;
  const fireShortfall = etfSummary?.preRetirementWithdrawalShortfall?.median ?? 0;
  const depletedPathShare = etfSummary?.depletedPathShare ?? 0;
  elements.comparisonEtfRetirementValue.textContent = formatCurrency(etfValue);
  elements.comparisonEtfContributions.textContent = formatCurrency(etfContributions);
  elements.comparisonEtfGain.textContent = formatCurrency(etfValue - etfRemainingCostBasis);
  elements.comparisonEtfAdvanceAssessments.textContent = formatCurrency(etfAdvanceAssessments);
  elements.comparisonEtfTaxPaid.textContent = formatCurrency(etfTaxPaid);
  elements.comparisonEtfLossCarryforward.textContent = formatCurrency(etfLossCarryforward);
  elements.comparisonFireWithdrawals.textContent = formatCurrency(fireWithdrawals);
  elements.comparisonFireShortfall.textContent = formatCurrency(fireShortfall);
  elements.comparisonFireStatus.classList.toggle("hidden", depletedPathShare <= 0);
  elements.comparisonFireStatus.textContent = t("comparison.fireDepotDepleted", {
    share: numberFormat({ style: "percent", maximumFractionDigits: 0 }).format(depletedPathShare),
  });
  renderIncomeComparisonBars(comparison);
  renderAdvantageDistribution(comparison.advantageDistribution);
  renderComparisonMatrix(result);
}

function formatSignedCurrency(value) {
  const numeric = Number(value) || 0;
  const sign = numeric > 0 ? "+" : numeric < 0 ? "−" : "";
  return `${sign}${formatCurrency(Math.abs(numeric))}`;
}

function formatSignedPercent(value) {
  const numeric = Number(value) || 0;
  const sign = numeric > 0 ? "+" : numeric < 0 ? "−" : "";
  return `${sign}${numberFormat({ style: "percent", maximumFractionDigits: 1 }).format(Math.abs(numeric))}`;
}

function renderAdvantageDistribution(distribution) {
  if (!elements.comparisonAdvantageDistribution || !distribution) {
    return;
  }
  const maximumCount = Math.max(...distribution.bins.map((bin) => bin.count), 1);
  const winRate = numberFormat({ style: "percent", maximumFractionDigits: 0 }).format(
    distribution.avdWinRate,
  );
  const median = formatSignedCurrency(distribution.median);
  const lower = formatSignedCurrency(distribution.p10);
  const upper = formatSignedCurrency(distribution.p90);
  const ariaLabel = t("comparison.distributionAria", {
    paths: distribution.pathCount,
    winRate,
    median,
    lower,
    upper,
  });
  const bars = distribution.bins.map((bin, index) => {
    const height = bin.count / maximumCount * 100;
    const midpoint = (bin.min + bin.max) / 2;
    const sideClass = midpoint < 0 ? "is-etf-side" : "is-avd-side";
    const share = numberFormat({ style: "percent", maximumFractionDigits: 1 }).format(
      bin.count / Math.max(distribution.pathCount, 1),
    );
    const titleKey = index === 0
      ? "comparison.distributionLowerTailTitle"
      : index === distribution.bins.length - 1
        ? "comparison.distributionUpperTailTitle"
        : "comparison.distributionBinTitle";
    const title = t(titleKey, {
      lower: formatSignedCurrency(bin.min),
      upper: formatSignedCurrency(bin.max),
      count: bin.count,
      share,
    });
    return `<button type="button" class="advantage-histogram-bin ${sideClass}" style="height:${height.toFixed(4)}%" data-histogram-tooltip="${title}" aria-label="${title}"><span>${bin.count}</span></button>`;
  }).join("");
  const tickValues = [
    -distribution.bound,
    -distribution.bound / 2,
    0,
    distribution.bound / 2,
    distribution.bound,
  ];
  const ticks = tickValues.map((value, index) =>
    `<span class="${index === 2 ? "is-zero" : ""}" style="left:${index * 25}%">${formatSignedCurrency(value)}</span>`).join("");
  const gridLines = tickValues.slice(1, -1).map((value, index) =>
    `<i class="advantage-axis-gridline${value === 0 ? " is-zero" : ""}" style="left:${(index + 1) * 25}%"></i>`).join("");
  const returnRegimes = distribution.returnRegimes;
  const returnRegimeHtml = returnRegimes
    ? `<div class="advantage-return-regimes">
        <p>${t("comparison.distributionReturnSplitTitle", {
          median: formatSignedPercent(returnRegimes.medianRealAnnualReturn),
        })}</p>
        <div>
          ${[
            ["belowMedian", "comparison.distributionBelowMedianReturn"],
            ["aboveMedian", "comparison.distributionAboveMedianReturn"],
          ].map(([key, labelKey]) => {
            const regime = returnRegimes[key];
            const rate = numberFormat({ style: "percent", maximumFractionDigits: 0 }).format(
              regime.avdWinRate,
            );
            return `<span><small>${t(labelKey)}</small><strong>${t("comparison.distributionRegimeWinRate", {
              rate,
              paths: regime.pathCount,
            })}</strong></span>`;
          }).join("")}
        </div>
      </div>`
    : "";
  elements.comparisonAdvantageDistribution.innerHTML = `
    <div class="advantage-distribution-body">
      <div class="advantage-distribution-plot">
        <div class="advantage-histogram" role="img" aria-label="${ariaLabel}">
          ${gridLines}
          <div class="advantage-histogram-bars" style="--histogram-bin-count:${distribution.bins.length}">${bars}</div>
        </div>
        <div class="advantage-histogram-ticks" aria-hidden="true">${ticks}</div>
        <div class="advantage-distribution-axis" aria-hidden="true">
          <span>← ${t("comparison.distributionEtfSide")}</span>
          <b>${t("comparison.distributionAxisTitle")}</b>
          <span>${t("comparison.distributionAvdSide")} →</span>
        </div>
        ${returnRegimeHtml}
        <p>${t("comparison.distributionRange", { lower, upper })}</p>
      </div>
      <div class="advantage-distribution-stats">
        <span><small>${t("comparison.distributionAvdBetter")}</small><strong>${winRate}</strong></span>
        <span><small>${t("comparison.distributionMedian")}</small><strong>${formatSignedCurrency(distribution.median)}</strong></span>
        <span><small>${t("comparison.distributionLogValue")}</small><strong>${formatSignedPercent(distribution.logCertaintyEquivalentAdvantage)}</strong></span>
      </div>
    </div>
  `;
}

function incomeWaterfallGeometry({ pension, baselineEtf, decision, netTotal }, maximumGross) {
  const additions = [pension, baselineEtf, decision].map((value) =>
    Math.max(Number(value) || 0, 0));
  const gross = additions.reduce((sum, value) => sum + value, 0);
  const net = clamp(Number(netTotal) || 0, 0, gross);
  const tax = gross - net;
  const scale = Math.max(Number(maximumGross) || 0, gross, 1);
  let runningTotal = 0;
  const positiveSteps = additions.map((value) => {
    const start = runningTotal;
    runningTotal += value;
    return { start, end: runningTotal, value };
  });
  const toGeometry = (step) => ({
    ...step,
    bottomPercent: clamp(Math.min(step.start, step.end) / scale * 100, 0, 100),
    heightPercent: clamp(Math.abs(step.end - step.start) / scale * 100, 0, 100),
  });
  return {
    gross,
    net,
    scale,
    tax,
    steps: [
      ...positiveSteps.map(toGeometry),
      toGeometry({ start: gross, end: net, value: -tax }),
      toGeometry({ start: 0, end: net, value: net }),
    ],
  };
}

function waterfallConnectorPercent(currentStep, nextStep, scale) {
  const currentEndpoints = [currentStep.start, currentStep.end];
  const nextEndpoints = [nextStep.start, nextStep.end];
  let closest = { difference: Number.POSITIVE_INFINITY, level: 0 };
  for (const current of currentEndpoints) {
    for (const next of nextEndpoints) {
      const difference = Math.abs(current - next);
      if (difference < closest.difference) {
        closest = { difference, level: (current + next) / 2 };
      }
    }
  }
  return clamp(closest.level / Math.max(Number(scale) || 0, 1) * 100, 0, 100);
}

function renderIncomeComparisonBars(comparison) {
  if (!elements.comparisonBars) {
    return;
  }
  const pensionGross = Math.max(comparison.pensionGross, 0);
  const baselineEtfGross = Math.max(comparison.baselineEtfGrossWithdrawal, 0);
  const scenarios = [
    {
      className: "avd-bar",
      label: t("comparison.avdLabel"),
      decisionGross: comparison.grossWithdrawal,
      mirrored: false,
      net: comparison.avdTotalNetIncome,
    },
    {
      className: "etf-bar",
      label: t("comparison.etfLabel"),
      decisionGross: comparison.etfGrossWithdrawal,
      mirrored: true,
      net: comparison.etfTotalNetIncome,
    },
  ];
  const maximumGross = Math.max(
    ...scenarios.map((scenario) => pensionGross + baselineEtfGross + scenario.decisionGross),
    1,
  );
  const stepDefinitions = [
    { className: "pension-step", label: t("comparison.pensionGrossLegend"), sign: "+" },
    { className: "baseline-etf-step", label: t("comparison.baselineEtfGrossLegend"), sign: "+" },
    { className: "decision-step", label: t("comparison.comparedGrossLegend"), sign: "+" },
    { className: "tax-step", label: t("comparison.taxLegend"), sign: "−" },
    { className: "net-step", label: t("comparison.netLegend"), sign: "=" },
  ];

  elements.comparisonBars.innerHTML = scenarios.map((scenario) => {
    const geometry = incomeWaterfallGeometry({
      pension: pensionGross,
      baselineEtf: baselineEtfGross,
      decision: scenario.decisionGross,
      netTotal: scenario.net,
    }, maximumGross);
    const ariaLabel = t("comparison.chartAria", {
      scenario: scenario.label,
      gross: formatCurrency(geometry.gross / 12),
      pension: formatCurrency(pensionGross / 12),
      baselineEtf: formatCurrency(baselineEtfGross / 12),
      compared: formatCurrency(scenario.decisionGross / 12),
      tax: formatCurrency(geometry.tax / 12),
      net: formatCurrency(geometry.net / 12),
    });
    const stepOrder = scenario.mirrored ? [4, 3, 2, 1, 0] : [0, 1, 2, 3, 4];
    const stepsHtml = stepOrder.map((stepIndex, displayIndex) => {
      const step = geometry.steps[stepIndex];
      const nextStep = geometry.steps[stepOrder[displayIndex + 1]];
      const index = stepIndex;
      const definition = stepDefinitions[index];
      const absoluteValue = Math.abs(step.value);
      const amount = `${definition.sign} ${formatCurrency(absoluteValue / 12)}`;
      const connectorHtml = nextStep
        ? `<i class="waterfall-connector" style="bottom:${waterfallConnectorPercent(step, nextStep, geometry.scale).toFixed(4)}%"></i>`
        : "";
      return `<div class="waterfall-step ${definition.className}" style="--display-index:${displayIndex}">
        <strong>${amount}</strong>
        <span class="waterfall-track" aria-hidden="true">${connectorHtml}<i class="waterfall-bar" style="bottom:${step.bottomPercent.toFixed(4)}%;height:${step.heightPercent.toFixed(4)}%;--step-delay:${displayIndex * 65}ms"></i></span>
        <span class="waterfall-step-label"><b>${definition.label}</b><small title="${t("comparison.cumulativeValue")}">${formatCurrency(step.end / 12)}</small></span>
      </div>`;
    }).join("");
    const grossToNetDetail = t("comparison.grossToNetDetail", {
      gross: formatCurrency(geometry.gross / 12),
      net: formatCurrency(geometry.net / 12),
    });
    return `<div class="income-bar-row waterfall-scenario ${scenario.className}${scenario.mirrored ? " is-mirrored" : ""}">
      <div class="income-bar-label">
        <div><span>${scenario.label}</span><small>${grossToNetDetail}</small></div>
        <strong>${formatCurrency(geometry.net / 12)}</strong>
      </div>
      <div class="waterfall-steps vertical-waterfall" role="img" aria-label="${ariaLabel}">${stepsHtml}</div>
    </div>`;
  }).join("");
}

function renderComparisonMatrix(result) {
  elements.comparisonScenarioHead.innerHTML = `<tr><th scope="col">${t("comparison.pensionAxis")}</th><th scope="col">${t("comparison.scenarioValues")}</th></tr>`;
  elements.comparisonScenarioBody.innerHTML = COMPARISON_PENSION_LEVELS.map((pension) => {
    const value = comparisonForResult(result, pension);
    const avd = formatCurrency(value.avdTotalNetIncome / 12);
    const ordinaryEtf = formatCurrency(value.etfTotalNetIncome / 12);
    const winner = value.avdTotalNetIncome > value.etfTotalNetIncome ? "avd" : value.etfTotalNetIncome > value.avdTotalNetIncome ? "etf" : "tie";
    const aria = t("comparison.cellAria", {
      pension: formatCurrency(pension),
      avd,
      ordinaryEtf,
    });
    return `<tr><th scope="row">${formatCurrency(pension)}</th><td data-winner="${winner}" aria-label="${aria}"><span>${avd}</span><i aria-hidden="true">/</i><span>${ordinaryEtf}</span></td></tr>`;
  }).join("");
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
  renderTaxComparison(result);
  for (const el of summaryEls) {
    el.classList.remove("value-updated");
    void el.offsetWidth;
    el.classList.add("value-updated");
  }
}

function retirementSummaryValues(result, adjustInflation) {
  const seriesType = adjustInflation ? "real" : "nominal";
  const retirementStats = result.yearlyStats[result.preRetirementYear][seriesType];
  const decisionComparison = compareSimulationResult(result, {
    pensionMonthly: 0,
    terms: seriesType,
  });
  return {
    seriesType,
    retirementValue: retirementStats.household.median,
    withdrawalIncome: decisionComparison.grossWithdrawal / 12,
    finalRangeMin: retirementStats.household.p2_5,
    finalRangeMax: retirementStats.household.p97_5,
    averageSupport:
      result.averageAnnualSupportStats?.[seriesType]?.median ?? result.averageAnnualSupport,
  };
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
  elements.toggleSpouseButton.classList.toggle("icon-remove-button", uiState.hasSpouse);
  elements.toggleSpouseButton.classList.toggle("small-button", !uiState.hasSpouse);
  elements.toggleSpouseButton.textContent = uiState.hasSpouse ? "×" : t("controls.addSpouse");
  if (uiState.hasSpouse) {
    elements.toggleSpouseButton.setAttribute("aria-label", t("controls.removeSpouse"));
    elements.toggleSpouseButton.setAttribute("title", t("controls.removeSpouse"));
  } else {
    elements.toggleSpouseButton.removeAttribute("aria-label");
    elements.toggleSpouseButton.removeAttribute("title");
  }
}

export {
  addMonths,
  annualSupportForYear,
  baseSubsidy,
  buildDataStatusText,
  buildEtfHistoricalPrelude,
  buildHistoricalPaths,
  buildAdvantageDistribution,
  buildWithdrawalTooltipText,
  calculateKvdrContributions,
  calculateBootstrapSamplingRealCagr,
  calculateEtfTaxYear,
  calculateHistoricalRealCagr,
  chartLoadingPatternText,
  compareSimulationResult,
  compareNetWithdrawals,
  comparisonAdvantageFromTotals,
  incomeTax2026,
  formatSuccessPercent,
  incomeWaterfallGeometry,
  waterfallConnectorPercent,
  makeBootstrapPath,
  averageComparison,
  migrateSession,
  parseBasisRateCsv,
  parseCpiCsv,
  parseMarketCsv,
  parseChildBirthYearInput,
  preciseAge,
  projectOrdinaryEtfPath,
  projectPath,
  recenterBootstrapSeries,
  realizeEtfWithdrawal,
  resolveMonthlyPension,
  retirementSummaryValues,
  setLanguage,
  simulateHousehold,
  statutoryPensionTaxableShare,
  kvdrCareInsuranceRateForHousehold,
};
