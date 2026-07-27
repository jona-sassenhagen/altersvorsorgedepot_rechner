# JST/KZ global developed-equity reconstruction

## Status

This is the app’s **active default market and inflation data source**. The
original `msci_world.csv` remains the observed donor and post-1970 continuation
input, but simulations load `jst_kz_global_equity_monthly.csv`.

The simulator does not bootstrap this combined series. It evaluates every
complete overlapping historical window that starts in the projection’s
calendar month and is long enough to reach the applicant’s model end at age
90. Each scenario therefore follows one uninterrupted monthly market-and-CPI
sequence; the number of available paths varies with the projection horizon.

The generated `jst_kz_global_equity_monthly.csv` extends the existing monthly
MSCI World EUR series backwards:

- December 1899 is a baseline index level.
- January 1900 through December 1969 is synthetic monthly data.
- January 1970 onward is copied unchanged from `msci_world.csv`.
- December 1969 is the join point and retains the existing level of 10,000.

The companion `inflation.csv` now has the same December 1899 baseline:

- January 1900 through December 1954 is a monthly backcast from JST German
  annual CPI.
- January 1955 onward is the previously observed monthly series, unchanged.

## What the source represents

This is a transparent **JST/Kuvshinov–Zimmermann (KZ) developed-market
approximation**, not a reproduction of the proprietary DMS world index.

The DMS Yearbook motivates the historically changing, market-cap-weighted
opportunity set and provides useful composition snapshots. Its complete annual
country-weight series is not published as redistributable machine-readable
data, so this implementation does not copy or digitize it. Instead, executable
annual weights come from the public KZ stock-market-capitalization panel. That
panel covers 17 advanced economies and was built to align with the long-run
equity-return data used in the JST research.

This distinction matters: the result reduces the distortions of equal weights
and current weights, but it does not eliminate survivorship or look-ahead bias
in the way a complete historical DMS universe could. Countries outside the KZ
panel—such as Austria, Russia, South Africa, and historical emerging
markets—are absent.

## Inputs and attribution

1. **JST Macrohistory Database, Release 6**

   - Download page:
     <https://www.macrohistory.net/database/>
   - Workbook:
     <https://www.macrohistory.net/app/download/9834512569/JSTdatasetR6.xlsx?t=1763503850>
   - Fields used: `year`, `iso`, `cpi`, `xrusd`, `eq_tr`, and
     `eq_tr_interp`.
   - Citation: Òscar Jordà, Katharina Knoll, Dmitry Kuvshinov, Moritz
     Schularick, and Alan M. Taylor (2019), “The Rate of Return on Everything,
     1870–2015,” *Quarterly Journal of Economics* 134(3), 1225–1298.

2. **Kuvshinov–Zimmermann stock-market database, Release 1**

   - Author page: <https://dkuvshinov.com/>
   - Workbook:
     <https://dkuvshinov.com/wp-content/uploads/BBdatasetR1.xlsx>
   - Fields used: `year`, `iso`, `mcap`, `unit`, and—only when JST has no
     return—its aligned `eq_tr`.
   - Citation: Dmitry Kuvshinov and Kaspar Zimmermann (2022), “The Big Bang:
     Stock Market Capitalization in the Long Run,” *Journal of Financial
     Economics* 145(2), 527–552.

3. **Local monthly MSCI World EUR series**

   - `msci_world.csv`
   - Complete calendar years 1970–2025 provide donor paths.
   - The observed continuation through June 2026 is copied byte-for-byte at
     the value level.

The two research workbooks state the Creative Commons
Attribution–NonCommercial–ShareAlike 4.0 license. The derived annual, audit,
provenance, and pre-1970 monthly data in this directory should therefore be
treated as CC BY-NC-SA 4.0, separately from the repository’s MIT-licensed
software. Attribution and share-alike obligations apply; commercial use is
not granted by that license.

The exact input SHA-256 checksums are recorded in `source.json`.

## Annual reconstruction

All annual weights are beginning-of-year weights. For return year \(t\), the
generator uses the market capitalization observed for \(t-1\). This prevents
the end-of-year return from influencing its own weight.

The KZ capitalization is nominal local currency. With `xrusd` defined as local
currency units per US dollar, beginning market capitalization in US dollars is

\[
C^{USD}_{i,t-1}
  = \frac{mcap_{i,t-1}\,unit_{i,t-1}}{x_{i,t-1}}.
\]

Eligible countries are normalized to weights

\[
w_{i,t-1}
  = \frac{C^{USD}_{i,t-1}}{\sum_j C^{USD}_{j,t-1}}.
\]

The local nominal total-return factor is converted to US dollars by

\[
F^{USD}_{i,t}
  = (1+r^{local}_{i,t})\frac{x_{i,t-1}}{x_{i,t}}.
\]

The annual world return is the return on a buy-and-hold, beginning-of-year
market-cap-weighted basket:

\[
F^{USD}_{world,t} = \sum_i w_{i,t-1}F^{USD}_{i,t}.
\]

Because the app’s observed series is in EUR, the pre-1970 target is expressed
for a German-currency investor:

\[
F^{DE}_{world,t}
  = F^{USD}_{world,t}\frac{x_{DEU,t}}{x_{DEU,t-1}}.
\]

“German currency” means the historically applicable German nominal unit
represented by the JST exchange-rate series, not a claim that euros existed
before 1999. This produces a compatible nominal German-investor perspective
for the splice to the later EUR series.

### Missing observations

The return precedence is deterministic:

1. JST R6 `eq_tr`;
2. JST R6 `eq_tr_interp` where the workbook explicitly supplies it;
3. KZ R1 aligned `eq_tr` as a fallback (currently Canada).

A country-year is excluded and the remaining beginning weights are
renormalized if its beginning market cap, beginning/end exchange rate, or
return remains unavailable. Every inclusion, exclusion, fallback, weight, and
contribution is written to `country-audit.csv`.

Germany’s 1945 exchange-rate observation is missing. The reference-currency
conversion uses geometric interpolation between the positive 1944 and 1946
observations for the 1945 reference rate. The annual audit flags 1945 and 1946
with `reference_fx_interpolated=true`. No country exchange rate used for
country-level weighting or returns is otherwise filled.

## Synthetic monthly reconstruction

For each target year, a complete calendar-year path of 12 MSCI World EUR
monthly gross-return factors is sampled with replacement from 1970–2025. The
selection is deterministic and stable by target year using the versioned seed
`jst-kz-msci-world-eur-v1`.

For donor factors \(g_1,\ldots,g_{12}\), donor annual factor
\(G=\prod_m g_m\), and target annual factor \(T=1+R_t\), each monthly factor is
shifted equally in log space:

\[
h_m
  = g_m\exp\left(\frac{\log T-\log G}{12}\right).
\]

The twelfth factor is calculated as the residual
\(T/\prod_{m=1}^{11}h_m\) to remove floating-point compounding drift. Thus
\(\prod_m h_m=T\) to machine precision.

This preserves the donor year’s month ordering and centered log-return
deviations. It does **not** preserve simple-return volatility exactly, nor does
it claim that the sampled monthly path actually occurred in the target year.
Donor years are sampled independently, so cross-year monthly dependence is
not reconstructed.

## Inflation extension

JST’s German CPI observations are annual. They are used to backcast monthly
CPI from January 1900 through December 1954. For each historical year \(t\),
the annual factor is

\[
A_t = \frac{CPI^{JST}_t}{CPI^{JST}_{t-1}},
\]

and the constant within-year monthly factor is

\[
q_t = A_t^{1/12}.
\]

Consequently, every synthetic December-to-December change exactly matches the
corresponding JST annual CPI change. December 1954 is anchored to the observed
January 1955 level by applying one twelfth of the JST 1955 annual inflation
factor across the splice:

\[
CPI_{1954-12}
  = \frac{CPI_{1955-01}^{observed}}
          {(CPI^{JST}_{1955}/CPI^{JST}_{1954})^{1/12}}.
\]

The scale is therefore the existing 2015=100 scale, while the pre-1955 growth
rates come from JST. All original lines from January 1955 through June 2026
are retained exactly; their SHA-256 checksum is recorded in `source.json`.

This interpolation preserves annual inflation, not the actual historical
month-by-month path. That limitation is especially important for the 1923
German hyperinflation: the very large annual increase is spread evenly in log
space over twelve synthetic months. The result is suitable for annual
real-return consistency and long-horizon simulation, but not for studying the
timing of monthly inflation shocks.

## Outputs

- `../../jst_kz_global_equity_monthly.csv` — app-shaped monthly index series.
- `../../inflation.csv` — German monthly CPI with a synthetic 1900–1954
  extension and unchanged observations from 1955 onward.
- `annual-reconstruction.csv` — target annual returns and coverage.
- `country-audit.csv` — country eligibility, weights, sources, and
  contributions.
- `monthly-provenance.csv` — target-to-donor-year mapping and log shifts.
- `inflation-annual-backcast.csv` — JST annual CPI factors and the monthly
  factors used for the extension.
- `source.json` — source identity, status, seed, paths, and checksums.

## Reproduction

From the repository root:

```sh
curl -L 'https://www.macrohistory.net/app/download/9834512569/JSTdatasetR6.xlsx?t=1763503850' -o /tmp/JSTdatasetR6.xlsx
curl -L 'https://dkuvshinov.com/wp-content/uploads/BBdatasetR1.xlsx' -o /tmp/BBdatasetR1.xlsx
node data-sources/jst-kz-global-equity/generate.mjs \
  --jst /tmp/JSTdatasetR6.xlsx \
  --market-caps /tmp/BBdatasetR1.xlsx
node data-sources/jst-kz-global-equity/extend-inflation.mjs \
  --jst /tmp/JSTdatasetR6.xlsx
node --test jst-kz-global-equity.test.mjs
```

The generator has no package dependency. It uses Node.js standard-library
modules and the system `unzip` command to read the two XLSX workbooks.

## Interpretation limits

- This is a research approximation, not an investable index and not DMS data.
- The 17-country panel is a historically changing weighted basket within a
  country set selected by modern data availability.
- Missing/closed markets are omitted and remaining weights renormalized; this
  cannot fully reproduce the experience of trapped or expropriated investors.
- Taxes, fees, capital controls, withholding taxes, investability, and
  transaction costs are absent.
- The nominal German-currency history contains monetary disruptions,
  especially the 1923 hyperinflation. It must be paired with appropriate
  historical German inflation for real-return analysis.
- Pre-1955 CPI has observed annual growth but synthetic, log-uniform monthly
  growth.
- Synthetic within-year volatility is plausible by construction, not observed
  historical evidence.
