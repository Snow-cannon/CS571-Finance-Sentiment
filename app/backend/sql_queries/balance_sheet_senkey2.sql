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
-- ASSETS BREAKDOWN (Aggregation)
-----------------------------

-- Detailed Current Asset items flow into the "Current Assets" node:
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
-- Aggregate all Current Assets into the overall Assets node:
UNION ALL
SELECT 
  'Current Assets', 
  'Assets', 
  COALESCE(totalCurrentAssets, 0) 
FROM bs

-- Detailed Non-Current Asset items flow into "Non-Current Assets":
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
-- (Optional breakdown details for intangibles could be added here)
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
-- Aggregate Non-Current Assets into the overall Assets node:
UNION ALL
SELECT 
  'Non-Current Assets', 
  'Assets', 
  COALESCE(totalNonCurrentAssets, 0) 
FROM bs

-----------------------------
-- LIABILITIES & SHAREHOLDER EQUITY BREAKDOWN (Split from Aggregates)
-----------------------------

-- From Assets, the overall flow splits into Liabilities and Shareholder Equity:
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

-- BREAKDOWN: LIABILITIES

-- First, split the overall Liabilities node into "Current Liabilities" and "Non-Current Liabilities":
UNION ALL
SELECT 
  'Liabilities', 
  'Current Liabilities', 
  COALESCE(totalCurrentLiabilities, 0) 
FROM bs
UNION ALL
SELECT 
  'Liabilities', 
  'Non-Current Liabilities', 
  COALESCE(totalNonCurrentLiabilities, 0) 
FROM bs

-- Now have each liability aggregate split into its detailed components:
-- Current Liabilities breakdown:
UNION ALL
SELECT 
  'Current Liabilities', 
  'Current Accounts Payable', 
  COALESCE(currentAccountsPayable, 0) 
FROM bs
UNION ALL
SELECT 
  'Current Liabilities', 
  'Deferred Revenue', 
  COALESCE(deferredRevenue, 0) 
FROM bs
UNION ALL
SELECT 
  'Current Liabilities', 
  'Current Debt', 
  COALESCE(currentDebt, 0) 
FROM bs
UNION ALL
SELECT 
  'Current Liabilities', 
  'Short Term Debt', 
  COALESCE(shortTermDebt, 0) 
FROM bs
UNION ALL
SELECT 
  'Current Liabilities', 
  'Other Current Liabilities', 
  COALESCE(otherCurrentLiabilities, 0) 
FROM bs

-- Non-Current Liabilities breakdown:
UNION ALL
SELECT 
  'Non-Current Liabilities', 
  'Capital Lease Obligations', 
  COALESCE(capitalLeaseObligations, 0) 
FROM bs
UNION ALL
SELECT 
  'Non-Current Liabilities', 
  'Long Term Debt', 
  COALESCE(longTermDebt, 0) 
FROM bs
UNION ALL
SELECT 
  'Non-Current Liabilities', 
  'Current Long Term Debt', 
  COALESCE(currentLongTermDebt, 0) 
FROM bs
UNION ALL
SELECT 
  'Non-Current Liabilities', 
  'Long Term Debt (Noncurrent)', 
  COALESCE(longTermDebtNoncurrent, 0) 
FROM bs
UNION ALL
SELECT 
  'Non-Current Liabilities', 
  'Short-Long Term Debt Total', 
  COALESCE(shortLongTermDebtTotal, 0) 
FROM bs
UNION ALL
SELECT 
  'Non-Current Liabilities', 
  'Other Non-Current Liabilities', 
  COALESCE(otherNonCurrentLiabilities, 0) 
FROM bs

-- BREAKDOWN: SHAREHOLDER EQUITY

-- The overall Shareholder Equity node splits into its detailed items:
UNION ALL
SELECT 
  'Shareholder Equity', 
  'Retained Earnings', 
  COALESCE(retainedEarnings, 0) 
FROM bs
UNION ALL
SELECT 
  'Shareholder Equity', 
  'Common Stock', 
  COALESCE(commonStock, 0) 
FROM bs
UNION ALL
SELECT 
  'Shareholder Equity', 
  'Treasury Stock', 
  COALESCE(treasuryStock, 0) 
FROM bs;
