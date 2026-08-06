# Basiszins series used by the ETF tax model

`basiszins.csv` covers every return year from 1900 through 2026.

- **1998–2026:** the first available trading-day observation from the Deutsche
  Bundesbank series for yields derived from the German government-bond term
  structure, with annual coupon payments and a 15-year residual maturity.
- **1900–1997:** an estimate based on the German `ltrate` field in the JST
  Macrohistory Database. Because `ltrate` is a broader long-term government
  yield rather than the statutory 15-year par yield, it is transformed by an
  affine calibration fitted over the 1998–2020 overlap with the Bundesbank
  series. Missing German observations for 1922–1923 and 1944–1947 are linearly
  interpolated between the nearest available annual yields before calibration.

The resulting pre-1998 values are explicitly a proxy, not historical values
published under § 18(4) InvStG. The statutory Basiszins did not exist over most
of this period. The series exists to pair each historical equity/CPI path with
a historically plausible interest-rate environment when estimating the
Vorabpauschale.

Generation:

```sh
node data-sources/basiszins/generate.mjs \
  --jst /path/to/JSTdatasetR6.xlsx \
  --bundesbank /path/to/bundesbank-15y-par-yield.csv \
  --output basiszins.csv
```

Sources:

- Deutsche Bundesbank, “Yields, derived from the term structure of interest
  rates, on listed Federal securities with annual coupon payments / residual
  maturity of 15 years / daily data”.
- JST Macrohistory Database, Release 6, `DEU.ltrate`.
