# Finance Data Database Documentation

This document provides an overview of the SQLite database structure.

## Table: company_intraday_data

| Column Name | Data Type | Example |
|-------------|-----------|---------|
| symbol | TEXT | AAPL |
| datetime | DATETIME | 2016-01-29 19:00:00 |
| open | REAL | 21.9817 |
| high | REAL | 21.9998 |
| low | REAL | 21.9794 |
| close | REAL | 21.9862 |
| volume | INTEGER | 48084 |

Distinct Tickers : 59 (Everything Except PLTR)

---






## Table: income_statement



---

## Table: balance_sheet

| Column Name | Data Type | Example |
|-------------|-----------|---------|
| symbol | TEXT | AAPL |
| fiscalDateEnding | TEXT | 2024-09-30 |
| reportType | TEXT | annual |
| reportedCurrency | TEXT | USD |
| totalAssets | TEXT | 364980000000 |
| totalCurrentAssets | TEXT | 152987000000 |
| cashAndCashEquivalentsAtCarryingValue | TEXT | 29943000000 |
| cashAndShortTermInvestments | TEXT | 65171000000 |
| inventory | TEXT | 7286000000 |
| currentNetReceivables | TEXT | 66243000000 |
| totalNonCurrentAssets | TEXT | 211993000000 |
| propertyPlantEquipment | TEXT | 45680000000 |
| accumulatedDepreciationAmortizationPPE | TEXT | 73448000000 |
| intangibleAssets | TEXT | None |
| intangibleAssetsExcludingGoodwill | TEXT | None |
| goodwill | TEXT | None |
| investments | TEXT | 254763000000 |
| longTermInvestments | TEXT | 91479000000 |
| shortTermInvestments | TEXT | 35228000000 |
| otherCurrentAssets | TEXT | 14287000000 |
| otherNonCurrentAssets | TEXT | 74834000000 |
| totalLiabilities | TEXT | 308030000000 |
| totalCurrentLiabilities | TEXT | 176392000000 |
| currentAccountsPayable | TEXT | 68960000000 |
| deferredRevenue | TEXT | 21049000000 |
| currentDebt | TEXT | 21023000000 |
| shortTermDebt | TEXT | 9967000000 |
| totalNonCurrentLiabilities | TEXT | 131638000000 |
| capitalLeaseObligations | TEXT | 752000000 |
| longTermDebt | TEXT | 96700000000 |
| currentLongTermDebt | TEXT | 10912000000 |
| longTermDebtNoncurrent | TEXT | 85750000000 |
| shortLongTermDebtTotal | TEXT | 106629000000 |
| otherCurrentLiabilities | TEXT | 78304000000 |
| otherNonCurrentLiabilities | TEXT | 45888000000 |
| totalShareholderEquity | TEXT | 56950000000 |
| treasuryStock | TEXT | None |
| retainedEarnings | TEXT | None |
| commonStock | TEXT | None |
| commonStockSharesOutstanding | TEXT | 15116786000 |

Distinct Tickers : 59 (Everything Except PLTR)

---



## Table: cash_flow

| Column Name | Data Type | Example |
|-------------|-----------|---------|
| symbol | TEXT | AAPL |
| fiscalDateEnding | TEXT | 2024-09-30 |
| reportType | TEXT | annual |
| reportedCurrency | TEXT | USD |
| operatingCashflow | TEXT | 118254000000 |
| paymentsForOperatingActivities | TEXT | 1900000000 |
| proceedsFromOperatingActivities | TEXT | None |
| changeInOperatingLiabilities | TEXT | 21572000000 |
| changeInOperatingAssets | TEXT | 17921000000 |
| depreciationDepletionAndAmortization | TEXT | 11445000000 |
| capitalExpenditures | TEXT | 9447000000 |
| changeInReceivables | TEXT | 5144000000 |
| changeInInventory | TEXT | 1046000000 |
| profitLoss | TEXT | 93736000000 |
| cashflowFromInvestment | TEXT | 2935000000 |
| cashflowFromFinancing | TEXT | -121983000000 |
| proceedsFromRepaymentsOfShortTermDebt | TEXT | 7920000000 |
| paymentsForRepurchaseOfCommonStock | TEXT | 94949000000 |
| paymentsForRepurchaseOfEquity | TEXT | 94949000000 |
| paymentsForRepurchaseOfPreferredStock | TEXT | None |
| dividendPayout | TEXT | 15234000000 |
| dividendPayoutCommonStock | TEXT | None |
| dividendPayoutPreferredStock | TEXT | None |
| proceedsFromIssuanceOfCommonStock | TEXT | None |
| proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet | TEXT | 0 |
| proceedsFromIssuanceOfPreferredStock | TEXT | None |
| proceedsFromRepurchaseOfEquity | TEXT | -94949000000 |
| proceedsFromSaleOfTreasuryStock | TEXT | None |
| changeInCashAndCashEquivalents | TEXT | None |
| changeInExchangeRate | TEXT | None |
| netIncome | TEXT | 93736000000 |

---

## Table: news_articles

| Column Name | Data Type | Example |
|-------------|-----------|---------|
| id | INTEGER | 1 |
| title | TEXT | US Warns China Against Helping Russia In Ukrain... |
| url | TEXT | https://www.benzinga.com/government/22/03/26119... |
| time_published | TEXT | 20220314T122305 |
| authors | TEXT |  |
| summary | TEXT | Russia sought China's military equipment to sup... |
| banner_image | TEXT | https://cdn.benzinga.com/files/imagecache/og_im... |
| source | TEXT | Benzinga |
| category_within_source | TEXT | News |
| source_domain | TEXT | www.benzinga.com |
| topics | TEXT | Technology |
| overall_sentiment_score | REAL | -0.057713 |
| overall_sentiment_label | TEXT | Neutral |
| fetch_date | TEXT | 2025-03-26 14:27:25 |

Total Count : 68,636
---

## Table: sqlite_sequence

| Column Name | Data Type | Example |
|-------------|-----------|---------|
| name |  | news_articles |
| seq |  | 68636 |

---

## Table: news_ticker_sentiment

| Column Name | Data Type | Example |
|-------------|-----------|---------|
| id | INTEGER | 1 |
| article_id | INTEGER | 1 |
| ticker_symbol | TEXT | MSFT |
| relevance_score | REAL | 0.926285 |
| ticker_sentiment_score | REAL | -0.001084 |
| ticker_sentiment_label | TEXT | Neutral |

7064 distinct symbols
---

## Table: company_overview

| Column Name | Data Type | Example |
|-------------|-----------|---------|
| Symbol | TEXT | AAPL |
| AssetType | TEXT | Common Stock |
| Name | TEXT | Apple Inc |
| Description | TEXT | Apple Inc. is an American multinational technol... |
| CIK | TEXT | 320193 |
| Exchange | TEXT | NASDAQ |
| Currency | TEXT | USD |
| Country | TEXT | USA |
| Sector | TEXT | TECHNOLOGY |
| Industry | TEXT | ELECTRONIC COMPUTERS |
| Address | TEXT | ONE INFINITE LOOP, CUPERTINO, CA, US |
| OfficialSite | TEXT | https://www.apple.com |
| FiscalYearEnd | TEXT | September |
| LatestQuarter | TEXT | 2024-12-31 |
| MarketCapitalization | TEXT | 3278873821000 |
| EBITDA | TEXT | 137352004000 |
| PERatio | TEXT | 34.59 |
| PEGRatio | TEXT | 2.026 |
| BookValue | TEXT | 4.438 |
| DividendPerShare | TEXT | 0.99 |
| DividendYield | TEXT | 0.0046 |
| EPS | TEXT | 6.31 |
| RevenuePerShareTTM | TEXT | 25.97 |
| ProfitMargin | TEXT | 0.243 |
| OperatingMarginTTM | TEXT | 0.345 |
| ReturnOnAssetsTTM | TEXT | 0.225 |
| ReturnOnEquityTTM | TEXT | 1.365 |
| RevenueTTM | TEXT | 395760009000 |
| GrossProfitTTM | TEXT | 184102994000 |
| DilutedEPSTTM | TEXT | 6.31 |
| QuarterlyEarningsGrowthYOY | TEXT | 0.101 |
| QuarterlyRevenueGrowthYOY | TEXT | 0.04 |
| AnalystTargetPrice | TEXT | 252.59 |
| AnalystRatingStrongBuy | TEXT | 7 |
| AnalystRatingBuy | TEXT | 21 |
| AnalystRatingHold | TEXT | 13 |
| AnalystRatingSell | TEXT | 2 |
| AnalystRatingStrongSell | TEXT | 2 |
| TrailingPE | TEXT | 34.59 |
| ForwardPE | TEXT | 29.76 |
| PriceToSalesRatioTTM | TEXT | 8.29 |
| PriceToBookRatio | TEXT | 49.12 |
| EVToRevenue | TEXT | 8.39 |
| EVToEBITDA | TEXT | 24.19 |
| Beta | TEXT | 1.178 |
| Week52High | TEXT | 259.81 |
| Week52Low | TEXT | 163.31 |
| MovingAverage50Day | TEXT | 231.92 |
| MovingAverage200Day | TEXT | 228.35 |
| SharesOutstanding | TEXT | 15022100000 |
| DividendDate | TEXT | 2025-02-13 |
| ExDividendDate | TEXT | 2025-02-10 |

---

60 tickers