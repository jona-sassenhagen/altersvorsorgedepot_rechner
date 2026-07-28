 Build an app for computing the value of a portfolio according to the new German Altersvorsorgedepot.

  Research how the Altersvorsorgedepot works.

  For now offer only to use an MSCI World as the fond. You can fetch Eur values from here:
  https://curvo.eu/backtest/en/market-index/msci-world?currency=eur

Use 15 year sequential bootstraps.

User should be able to give the following options:
- birthdate
- married and if yes, DoB of partner
- children and birth dates - make sure entering children's DoB is simple and intuitive!
- contributions, also for spouse
	- give options for min (10 Euros?), max Förderquote (150?), max total (570?)
- income (for tax expensing), also for spouse
	- simplify to brackets, because I think we only need Grenzsteuersatz?
- adjust for inflation checkbox

The app should be able to run from github pages.

Make sure it has a decent mobile and desktop experience and dark mode.

Show the final value as well as a time series with 95% CI over 1000 bootstraps.
