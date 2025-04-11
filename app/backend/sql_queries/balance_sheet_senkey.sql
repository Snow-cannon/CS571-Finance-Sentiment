/* Citation: 
"I have a sql table that

when I run

select * from balance_sheet bs limit 10; I get

AAPL 2024-09-30 annual USD 364980000000 152987000000 29943000000 65171000000 7286000000 66243000000 211993000000 45680000000 73448000000 None None None 254763000000 91479000000 35228000000 14287000000 74834000000 308030000000 176392000000 68960000000 21049000000 21023000000 9967000000 131638000000 752000000 96700000000 10912000000 85750000000 106629000000 78304000000 45888000000 56950000000 None None None 15116786000 AAPL 2023-09-30 annual USD 352583000000 143566000000 29965000000 61555000000 6331000000 60985000000 209017000000 43715000000 70884000000 None None None 264965000000 100544000000 31590000000 14695000000 64758000000 290437000000 145308000000 62611000000 20161000000 15972000000 5985000000 145129000000 859000000 105103000000 9822000000 95281000000 111088000000 58829000000 49848000000 62146000000 None None None 15550061000

now I want to create a senkey graph out of it that looks like the attached img:

help me prepare data in a sql query that I can use for this graph"
prompt. ChatGPT, 9 April version, OpenAI, 9 April 2025, chat.openai.com.
*/



WITH bs AS (
  SELECT 
    symbol,
    fiscalDateEnding,
    reportType,
    reportedCurrency,
    totalAssets,
    totalCurrentAssets,
    totalNonCurrentAssets,
    totalLiabilities,
    totalCurrentLiabilities,
    totalNonCurrentLiabilities,
    totalShareholderEquity,
    cashAndCashEquivalentsAtCarryingValue,
    cashAndShortTermInvestments,
    inventory,
    currentNetReceivables,
    otherCurrentAssets,
    propertyPlantEquipment,
    intangibleAssets,
    intangibleAssetsExcludingGoodwill,
    goodwill,
    investments,
    longTermInvestments,
    shortTermInvestments,
    otherNonCurrentAssets,
    currentAccountsPayable,
    deferredRevenue,
    currentDebt,
    shortTermDebt,
    capitalLeaseObligations,
    longTermDebt,
    currentLongTermDebt,
    longTermDebtNoncurrent,
    shortLongTermDebtTotal,
    otherCurrentLiabilities,
    otherNonCurrentLiabilities,
    treasuryStock,
    retainedEarnings,
    commonStock,
    commonStockSharesOutstanding
  FROM balance_sheet
  WHERE symbol = 'AAPL'
    AND fiscalDateEnding = '2024-09-30'
    AND reportType = 'annual'
    AND reportedCurrency = 'USD'
  LIMIT 1
)

-----------------------------
-- ASSETS BREAKDOWN
-----------------------------

-- Breakdown of Current Assets
SELECT 
  'Cash & Cash Equivalents' AS source, 
  'Current Assets' AS target, 
  COALESCE(cashAndCashEquivalentsAtCarryingValue, 0) AS value
FROM bs
UNION ALL
SELECT 
  'Cash & Short Term Investments', 
  'Current Assets', 
  COALESCE(cashAndShortTermInvestments, 0) 
FROM bs
UNION ALL
SELECT 
  'Inventory', 
  'Current Assets', 
  COALESCE(inventory, 0) 
FROM bs
UNION ALL
SELECT 
  'Current Net Receivables', 
  'Current Assets', 
  COALESCE(currentNetReceivables, 0) 
FROM bs
UNION ALL
SELECT 
  'Other Current Assets', 
  'Current Assets', 
  COALESCE(otherCurrentAssets, 0) 
FROM bs
-- Link the sum of Current Assets to the overall Assets node:
UNION ALL
SELECT 
  'Current Assets', 
  'Assets', 
  COALESCE(totalCurrentAssets, 0) 
FROM bs

-- Breakdown of Non-Current Assets
UNION ALL
SELECT 
  'Property, Plant & Equipment', 
  'Non-Current Assets', 
  COALESCE(propertyPlantEquipment, 0) 
FROM bs
UNION ALL
SELECT 
  'Intangible Assets', 
  'Non-Current Assets', 
  COALESCE(intangibleAssets, 0) 
FROM bs
-- If you want to break out details of intangibles further, you could add:
-- SELECT 'Intangible Assets (Excluding Goodwill)', 'Non-Current Assets', COALESCE(intangibleAssetsExcludingGoodwill, 0) FROM bs
-- UNION ALL
-- SELECT 'Goodwill', 'Non-Current Assets', COALESCE(goodwill, 0) FROM bs
UNION ALL
SELECT 
  'Investments', 
  'Non-Current Assets', 
  COALESCE(investments, 0) 
FROM bs
UNION ALL
SELECT 
  'Long Term Investments', 
  'Non-Current Assets', 
  COALESCE(longTermInvestments, 0) 
FROM bs
UNION ALL
SELECT 
  'Short Term Investments', 
  'Non-Current Assets', 
  COALESCE(shortTermInvestments, 0) 
FROM bs
UNION ALL
SELECT 
  'Other Non-Current Assets', 
  'Non-Current Assets', 
  COALESCE(otherNonCurrentAssets, 0) 
FROM bs
-- Link the sum of Non-Current Assets to the overall Assets node:
UNION ALL
SELECT 
  'Non-Current Assets', 
  'Assets', 
  COALESCE(totalNonCurrentAssets, 0) 
FROM bs

-----------------------------
-- LIABILITIES & SHAREHOLDER EQUITY BREAKDOWN
-----------------------------

-- From Assets, the flows break into Liabilities and Shareholder Equity.
UNION ALL
SELECT 
  'Assets', 
  'Liabilities', 
  COALESCE(totalLiabilities, 0) 
FROM bs
UNION ALL
SELECT 
  'Assets', 
  'Shareholder Equity', 
  COALESCE(totalShareholderEquity, 0) 
FROM bs

-- BREAKDOWN: CURRENT LIABILITIES
UNION ALL
SELECT 
  'Current Accounts Payable', 
  'Current Liabilities', 
  COALESCE(currentAccountsPayable, 0) 
FROM bs
UNION ALL
SELECT 
  'Deferred Revenue', 
  'Current Liabilities', 
  COALESCE(deferredRevenue, 0) 
FROM bs
UNION ALL
SELECT 
  'Current Debt', 
  'Current Liabilities', 
  COALESCE(currentDebt, 0) 
FROM bs
UNION ALL
SELECT 
  'Short Term Debt', 
  'Current Liabilities', 
  COALESCE(shortTermDebt, 0) 
FROM bs
UNION ALL
SELECT 
  'Other Current Liabilities', 
  'Current Liabilities', 
  COALESCE(otherCurrentLiabilities, 0) 
FROM bs
-- Link of the current liabilities total into Liabilities:
UNION ALL
SELECT 
  'Current Liabilities', 
  'Liabilities', 
  COALESCE(totalCurrentLiabilities, 0) 
FROM bs

-- BREAKDOWN: NON-CURRENT LIABILITIES
UNION ALL
SELECT 
  'Capital Lease Obligations', 
  'Non-Current Liabilities', 
  COALESCE(capitalLeaseObligations, 0) 
FROM bs
UNION ALL
SELECT 
  'Long Term Debt', 
  'Non-Current Liabilities', 
  COALESCE(longTermDebt, 0) 
FROM bs
UNION ALL
SELECT 
  'Current Long Term Debt', 
  'Non-Current Liabilities', 
  COALESCE(currentLongTermDebt, 0) 
FROM bs
UNION ALL
SELECT 
  'Long Term Debt (Noncurrent)', 
  'Non-Current Liabilities', 
  COALESCE(longTermDebtNoncurrent, 0) 
FROM bs
UNION ALL
SELECT 
  'Short-Long Term Debt Total', 
  'Non-Current Liabilities', 
  COALESCE(shortLongTermDebtTotal, 0) 
FROM bs
UNION ALL
SELECT 
  'Other Non-Current Liabilities', 
  'Non-Current Liabilities', 
  COALESCE(otherNonCurrentLiabilities, 0) 
FROM bs
-- Link of the non-current liabilities total into Liabilities:
UNION ALL
SELECT 
  'Non-Current Liabilities', 
  'Liabilities', 
  COALESCE(totalNonCurrentLiabilities, 0) 
FROM bs

-- (Optional) A further breakdown of Shareholder Equity
UNION ALL
SELECT 
  'Retained Earnings', 
  'Shareholder Equity', 
  COALESCE(retainedEarnings, 0) 
FROM bs
UNION ALL
SELECT 
  'Common Stock', 
  'Shareholder Equity', 
  COALESCE(commonStock, 0) 
FROM bs
UNION ALL
SELECT 
  'Treasury Stock', 
  'Shareholder Equity', 
  COALESCE(treasuryStock, 0) 
FROM bs;
