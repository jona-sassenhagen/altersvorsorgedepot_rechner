# Angenommene Altersvorsorgedepot-Regeln für diesen Rechner

Diese Datei ist die fachliche Grundlage für die v1-Implementierung in diesem Repository.

Sie dokumentiert die angenommenen Regeln, die bewussten Vereinfachungen und die Modellierungsentscheidungen des Rechners. Wenn sich das Verhalten des Rechners ändert, sollte diese Datei zuerst aktualisiert werden.

## Status und Zweck

- Der Rechner bildet den Reformvorschlag des Bundesministeriums der Finanzen (BMF) zur privaten Altersvorsorge nach, wie er Ende 2025 und Anfang 2026 kommuniziert wurde.
- Er bildet keinen verabschiedeten Rechtsstand ab.
- Er ist ein Lern- und Projektionswerkzeug, keine Steuer- oder Rechtsberatung.

## Quellenbasis

Primäre Quellen für die Annahmen in dieser Datei:

- BMF Monatsbericht Januar 2026: "Neustart für die private Altersvorsorge: Früh beginnen und Renditechancen nutzen"
- BMF Pressemitteilung vom 17. Dezember 2025: "Private Altersvorsorge für alle Einkommen und alle Generationen"
- BMF FAQ zur Frühstart-Rente vom 27. Januar 2026

Wesentliche Punkte aus diesen Quellen:

- Das neue Produktuniversum enthält ein `Altersvorsorgedepot` ohne Garantieanforderung.
- Für jährliche Eigenbeiträge bis EUR 360 beträgt die Grundförderung künftig EUR 0,50 je EUR 1 Eigenbeitrag.
- Für die nächsten EUR 1.440 jährlichen Eigenbeitrag beträgt die Grundförderung künftig EUR 0,25 je EUR 1.
- Der maximal geförderte Eigenbeitrag für diese proportionale Förderung liegt bei EUR 1.800 pro Jahr.
- Die volle Kinderzulage von EUR 300 pro Kind und Jahr soll bereits ab EUR 300 Jahresbeitrag bzw. EUR 25 pro Monat erreicht werden.
- Der `Sonderausgabenabzug` bleibt erhalten.
- Beiträge zwischen EUR 1.800 und EUR 6.840 erhalten weder die proportionale Förderung noch den `Sonderausgabenabzug`, bleiben in der Ansparphase aber steuerfrei.
- Ein einmaliger `Berufseinsteigerbonus` von EUR 200 bleibt für Vertragsabschlüsse vor dem 25. Lebensjahr vorgesehen.
- Die `Frühstart-Rente` ist ein separates Programm mit EUR 10 pro Monat für Kinder von 6 bis 18 Jahren; dieses separate Kinderdepot ist nicht Teil dieser App.

## Produktumfang in der App

Der Rechner modelliert einen Haushalt mit:

- einer antragstellenden Person
- optional einer Partnerin oder einem Partner
- null oder mehr Kindern
- genau einer Kapitalanlage: eine rekonstruierte globale Developed-Markets-Aktienreihe in historischer deutscher Anlegerwährung bzw. EUR

Die App projiziert die Ansparphase und anschließend ein vereinfachtes Brutto-Entnahmeszenario mit einem wählbaren anfänglichen jährlichen Entnahmesatz von 3 bis 5 Prozent (Standard: 4 Prozent). Tatsächliche Entnahmen sind auf das im jeweiligen persönlichen Depot verfügbare Vermögen begrenzt. Auszahlungsprodukte, Steuern in der Auszahlungsphase und alternative Entnahmestrategien werden nicht modelliert.

## Simulationsannahmen

- Historische Datenquelle: die lokale JST/Kuvshinov–Zimmermann-Rekonstruktion in `jst_kz_global_equity_monthly.csv`.
- Von 1900 bis 1969 werden marktkapitalisierungsgewichtete jährliche Aktienrenditen synthetisch auf Monatsverläufe verteilt; ab 1970 wird die lokale MSCI-World-EUR-Reihe von Curvo unverändert fortgeführt.
- Renditefrequenz: monatlich.
- Szenariomethode: überlappende historische Pfade ohne Bootstrap. Jeder Pfad beginnt im gleichen Kalendermonat eines anderen historischen Jahres und folgt danach der vollständigen tatsächlichen Monatsreihenfolge von Markt und Inflation ohne Neuanordnung, Wiederholung oder zirkulären Übergang.
- Anzahl Pfade: alle vollständigen historischen Startjahre, für die genügend Folgemonate bis zum persönlichen Modellende im Alter 90 vorhanden sind. Die Anzahl hängt deshalb vom Alter der antragstellenden Person und vom Projektionshorizont ab.
- Projektionshorizont: ab heute bis zum 90. Lebensjahr der antragstellenden Person.
- Beiträge enden mit dem Renteneintrittsalter.
- Standard-Renteneintrittsalter: 67.
- Das Renteneintrittsalter ist editierbar und gilt in v1 für beide Erwachsenen.
- Das Vermögen wächst nach Rentenbeginn bis Alter 90 abzüglich der tatsächlich bezahlbaren modellierten Entnahmen weiter.
- Die zentrale Projektion ist der Median, nicht der arithmetische Erwartungswert: 50 Prozent der modellierten Ergebnisse liegen darunter und 50 Prozent darüber.
- Die Grafik zeigt jährliche Stichtage, den Medianpfad und ein 95-Prozent-Modellband aus den simulierten Ergebnissen.
- Ein Entnahmepfad gilt bis zum Modellende als erfolgreich, wenn jedes persönliche Depot alle mit dem gewählten Entnahmesatz geplanten Entnahmen vollständig leisten kann. Andernfalls werden das Alter der antragstellenden Person beim ersten Haushalts-Einkommensfehlbetrag und die kumulierte Entnahmelücke erfasst.

## Haushalts- und Alterslogik

- Alter wird im Browser aus dem Geburtsdatum und dem aktuellen Datum berechnet.
- Die Hauptgrafik ist in Jahren ab heute indiziert.
- Der Tooltip zeigt für jedes Jahr das Alter der antragstellenden Person und gegebenenfalls der Partnerperson.
- Bei verheirateten Haushalten wird standardmäßig die Summe beider Depots dargestellt.
- Im Tooltip bleiben die Werte der beiden Personen getrennt sichtbar.

## Beitragslogik

- Eigenbeiträge werden als monatliche EUR-Beträge eingegeben.
- Die App wandelt monatliche Eingaben in monatliche Sparraten um.
- Beitragspresets sind nur Komfortfunktionen. Exakte Werte können weiterhin frei eingegeben werden.
- Die v1-Presets sind:
  - EUR 10 pro Monat als niedriger Mindestwert
  - EUR 30 pro Monat als "volle erste Förderstufe"
  - EUR 150 pro Monat als "maximal geförderter Beitrag"
  - EUR 570 pro Monat als hoher individueller Wert aus dem ursprünglichen Produktsketch

## In v1 modellierte Förderregeln

Für jeden Erwachsenenvertrag:

- Jährliche Eigenbeiträge bis EUR 360 erhalten 50 Prozent Förderung.
- Die nächsten EUR 1.440 erhalten 25 Prozent Förderung.
- Beiträge oberhalb von EUR 1.800 erhalten keine proportionale Förderung.
- Der einmalige EUR-200-`Berufseinsteigerbonus` wird in v1 im ersten Simulationsjahr berücksichtigt, wenn die Person zu Beginn der Simulation jünger als 25 ist und positiv einzahlt.

### Behandlung der Kinderförderung

Kinder-Geburtsdaten sind Teil der Eingabe, weil Familienförderung im Umfang der App liegt.

Die App trifft dazu folgende bewusste Vereinfachung:

- Die Dauer des modellierten Kindergeldbezugs ist im Rechner zwischen 16 und 25 Jahren einstellbar und beträgt standardmäßig 18 Jahre.
- Jedes eingetragene Kind gilt bis zum Ende der eingestellten Dauer als förderrelevant.
- In verheirateten Haushalten wird die Kinderförderung proportional zu den förderfähigen Jahresbeiträgen beider Partner bis jeweils EUR 300 aufgeteilt.
- In Ein-Personen-Haushalten wird die gesamte Kinderförderung der antragstellenden Person zugerechnet.
- Unterhalb von EUR 300 Jahresbeitrag modelliert die App die Kinderzulage proportional ansteigend; ab EUR 300 wird pro Kind die volle EUR-300-Zulage angesetzt.
- Dadurch ist in v1 kein zusätzliches Eingabefeld nötig, welcher Elternteil die Förderung formal erhält.

## Steuerwirkung in v1

Die App verwendet ein vereinfachtes Grenzsteuersatz-Modell.

- Nutzende wählen eine Einkommensklasse statt eines exakten zu versteuernden Einkommens.
- Jede Einkommensklasse wird auf einen repräsentativen Grenzsteuersatz abgebildet.
- Der geschätzte jährliche Steuervorteil je erwachsener Person ist:
  - `max(förderfähiger Jahresbeitrag * Grenzsteuersatz - direkte Förderung dieser Person, 0)`
- Die App nimmt ausdrücklich an, dass die gesamte modellierte Steuererstattung am Jahresende wieder in das jeweilige Altersvorsorgedepot eingezahlt und weiter investiert wird. Das geschieht in der Realität nicht automatisch.
- In v1 ist der förderfähige Jahresbeitrag für den vereinfachten `Sonderausgabenabzug` auf EUR 1.800 gedeckelt, also auf die im BMF-Entwurf beschriebene Fördergrenze der neuen proportionalen Förderung.
- Beiträge oberhalb von EUR 1.800 werden investiert, erhöhen aber nicht die modellierte Förderung oder den modellierten Steuervorteil.

Das ist eine bewusste Vereinfachung. Die reale Steuerwirkung kann wegen Veranlagung, weiterer Einkünfte, Kirchensteuer, Solidaritätszuschlag, exakter Bemessungsgrundlage und späterem Gesetzestext abweichen.

## Einkommensklassen in v1

Diese Klassen sind Modellannahmen, keine gesetzlichen Tarifzonen:

- `Kein oder sehr niedriges Einkommen`: 0 Prozent
- `Niedrig`: 20 Prozent
- `Mittel`: 30 Prozent
- `Hoch`: 42 Prozent
- `Sehr hoch`: 45 Prozent

## Inflationsbehandlung

- Die App verwendet eine lokale monatliche deutsche CPI-Zeitreihe aus `inflation.csv`.
- Für 1900 bis 1954 werden die jährlichen deutschen CPI-Veränderungen aus der JST Macrohistory Database gleichmäßig in logarithmischen Monatsraten verteilt. Diese Monatsverläufe sind synthetisch; insbesondere bilden sie den tatsächlichen Monatsverlauf der Hyperinflation 1923 nicht ab.
- Die beobachtete monatliche Reihe stammt von Januar 1955 bis März 2025 von FRED/OECD (`DEUCPIALLMINMEI`) und wird ab April 2025 mit dem deutschen Verbraucherpreisindex von Destatis fortgeführt.
- Die Aktienreihe von 1900 bis 1969 ist eine JST/Kuvshinov–Zimmermann-Approximation und keine Reproduktion des proprietären DMS-Index. Monatsrenditen vor 1970 sind synthetisch; ab 1970 wird die MSCI-World-EUR-Reihe von Curvo verwendet. Der MSCI World wurde erst 1986 aufgelegt, sodass auch Curvo-Werte von 1970 bis 1985 rückgerechnete Backtest-Daten sind.
- Wenn die Inflationsoption aktiviert ist, werden Ergebnisse in Preisen des letzten verfügbaren CPI-Monats ausgewiesen.
- Für jeden historischen Pfad werden die monatlichen Inflationsverhältnisse gemeinsam mit den Renditen desselben historischen Monats in unveränderter Reihenfolge verwendet.
- Historische Kapitalmarktdaten und CPI-Daten werden monatlich zusammengeführt, damit nominale und reale Ergebnisse aus demselben Simulationspfad entstehen.

## Explizite Ausschlüsse

Folgende Punkte sind in v1 bewusst nicht enthalten:

- Live-Datenabruf von JST, Kuvshinov/Zimmermann, Curvo oder anderen Diensten
- das separate kindeigene `Frühstart-Rente`-Depot
- Anbietergebühren, Handelskosten, Steuern in der Auszahlungsphase oder alternative Entnahmestrategien
- andere Fonds oder Aktienreihen als die aktive JST/KZ-MSCI-Weltaktienreihe
- alte Riester-Bestandsregeln außer den wenigen hier explizit genannten Entwurfsübernahmen
- rechtliche Detailprüfungen der Förderberechtigung
- Optimierung, welchem Ehepartner die Kinderförderung formal zugeordnet werden sollte
