WITH bs AS (
  SELECT
    symbol,
    fiscalDateEnding,
    reportType,
    reportedCurrency,
    COALESCE(totalAssets, 0) AS totalAssets,
    COALESCE(totalCurrentAssets, 0) AS totalCurrentAssets,
    COALESCE(cashAndCashEquivalentsAtCarryingValue, 0) AS cashAndCashEquivalentsAtCarryingValue,
    COALESCE(shortTermInvestments, 0) AS shortTermInvestments, 
    COALESCE(inventory, 0) AS inventory,
    COALESCE(currentNetReceivables, 0) AS currentNetReceivables,
    COALESCE(otherCurrentAssets, 0) AS otherCurrentAssets,
    COALESCE(totalNonCurrentAssets, 0) AS totalNonCurrentAssets,
    COALESCE(propertyPlantEquipment, 0) AS propertyPlantEquipment,
    COALESCE(goodwill, 0) AS goodwill,
    COALESCE(intangibleAssetsExcludingGoodwill, 0) AS intangibleAssetsExcludingGoodwill,
    COALESCE(longTermInvestments, 0) AS longTermInvestments,
    COALESCE(otherNonCurrentAssets, 0) AS otherNonCurrentAssets,
    COALESCE(totalLiabilities, 0) AS totalLiabilities,
    COALESCE(totalCurrentLiabilities, 0) AS totalCurrentLiabilities,
    COALESCE(currentAccountsPayable, 0) AS currentAccountsPayable,
    COALESCE(deferredRevenue, 0) AS deferredRevenue,
    COALESCE(shortTermDebt, 0) AS shortTermDebt,
    COALESCE(currentLongTermDebt, 0) AS currentLongTermDebt,
    COALESCE(otherCurrentLiabilities, 0) AS otherCurrentLiabilities,
    COALESCE(totalNonCurrentLiabilities, 0) AS totalNonCurrentLiabilities,
    COALESCE(longTermDebtNoncurrent, 0) AS longTermDebtNoncurrent,
    COALESCE(capitalLeaseObligations, 0) AS capitalLeaseObligations,
    COALESCE(otherNonCurrentLiabilities, 0) AS otherNonCurrentLiabilities,
    COALESCE(totalShareholderEquity, 0) AS totalShareholderEquity,
    COALESCE(commonStock, 0) AS commonStock,
    COALESCE(retainedEarnings, 0) AS retainedEarnings,
    COALESCE(treasuryStock, 0) AS treasuryStock
  FROM balance_sheet
  WHERE symbol = ?
    AND fiscalDateEnding BETWEEN ? AND ?
    AND reportType = ?
    AND reportedCurrency = 'USD'
  LIMIT 1
)
SELECT
  'Cash & Cash Equivalents' AS source,
  'Current Assets' AS target,
  cashAndCashEquivalentsAtCarryingValue AS value
FROM bs
UNION ALL
SELECT
  'Short Term Investments' AS source,
  'Current Assets' AS target,
  shortTermInvestments AS value
FROM bs
UNION ALL
SELECT
  'Inventory' AS source,
  'Current Assets' AS target,
  inventory AS value
FROM bs
UNION ALL
SELECT
  'Current Net Receivables' AS source,
  'Current Assets' AS target,
  currentNetReceivables AS value
FROM bs
UNION ALL
SELECT
  'Other Current Assets' AS source,
  'Current Assets' AS target,
  otherCurrentAssets AS value
FROM bs
UNION ALL
SELECT
  'Current Assets' AS source,
  'Total Assets' AS target,
  totalCurrentAssets AS value
FROM bs
UNION ALL
SELECT
  'Property, Plant & Equipment' AS source,
  'Non-Current Assets' AS target,
  propertyPlantEquipment AS value
FROM bs
UNION ALL
SELECT
  'Goodwill' AS source,
  'Non-Current Assets' AS target,
  goodwill AS value
FROM bs
UNION ALL
SELECT
  'Intangible Assets Excluding Goodwill' AS source,
  'Non-Current Assets' AS target,
  intangibleAssetsExcludingGoodwill AS value
FROM bs
UNION ALL
SELECT
  'Long Term Investments' AS source,
  'Non-Current Assets' AS target,
  longTermInvestments AS value
FROM bs
UNION ALL
SELECT
  'Other Non-Current Assets' AS source,
  'Non-Current Assets' AS target,
  otherNonCurrentAssets AS value
FROM bs
UNION ALL
SELECT
  'Non-Current Assets' AS source,
  'Total Assets' AS target,
  totalNonCurrentAssets AS value
FROM bs
UNION ALL
SELECT
  'Total Assets' AS source,
  'Total Liabilities' AS target,
  totalLiabilities AS value
FROM bs
UNION ALL
SELECT
  'Total Assets' AS source,
  'Total Shareholder Equity' AS target,
  totalShareholderEquity AS value
FROM bs
UNION ALL
SELECT
  'Total Liabilities' AS source,
  'Current Liabilities' AS target,
  totalCurrentLiabilities AS value
FROM bs
UNION ALL
SELECT
  'Total Liabilities' AS source,
  'Non-Current Liabilities' AS target,
  totalNonCurrentLiabilities AS value
FROM bs
UNION ALL
SELECT
  'Current Liabilities' AS source,
  'Current Accounts Payable' AS target,
  currentAccountsPayable AS value
FROM bs
UNION ALL
SELECT
  'Current Liabilities' AS source,
  'Deferred Revenue (Current)' AS target,
  deferredRevenue AS value
FROM bs
UNION ALL
SELECT
  'Current Liabilities' AS source,
  'Short Term Debt' AS target,
  shortTermDebt AS value
FROM bs
UNION ALL
SELECT
  'Current Liabilities' AS source,
  'Current Portion of Long Term Debt' AS target,
  currentLongTermDebt AS value
FROM bs
UNION ALL
SELECT
  'Current Liabilities' AS source,
  'Other Current Liabilities' AS target,
  otherCurrentLiabilities AS value
FROM bs
UNION ALL
SELECT
  'Non-Current Liabilities' AS source,
  'Long Term Debt (Noncurrent)' AS target,
  longTermDebtNoncurrent AS value
FROM bs
UNION ALL
SELECT
  'Non-Current Liabilities' AS source,
  'Capital Lease Obligations (Noncurrent)' AS target,
  capitalLeaseObligations AS value
FROM bs
UNION ALL
SELECT
  'Non-Current Liabilities' AS source,
  'Other Non-Current Liabilities' AS target,
  otherNonCurrentLiabilities AS value
FROM bs
UNION ALL
SELECT
  'Total Shareholder Equity' AS source,
  'Common Stock' AS target,
  commonStock AS value
FROM bs
UNION ALL
SELECT
  'Total Shareholder Equity' AS source,
  'Retained Earnings' AS target,
  retainedEarnings AS value
FROM bs
UNION ALL
SELECT
  'Total Shareholder Equity' AS source,
  'Treasury Stock' AS target,
  ABS(treasuryStock) AS value
FROM bs;