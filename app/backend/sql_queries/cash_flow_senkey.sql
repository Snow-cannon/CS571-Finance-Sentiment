WITH cf AS (
  SELECT 
    symbol,
    fiscalDateEnding,
    reportType,
    reportedCurrency,
    operatingCashflow,
    paymentsForOperatingActivities,
    proceedsFromOperatingActivities,
    changeInOperatingLiabilities,
    changeInOperatingAssets,
    depreciationDepletionAndAmortization,
    capitalExpenditures,
    changeInReceivables,
    changeInInventory,
    profitLoss,
    cashflowFromInvestment,
    cashflowFromFinancing,
    proceedsFromRepaymentsOfShortTermDebt,
    paymentsForRepurchaseOfCommonStock,
    paymentsForRepurchaseOfEquity,
    paymentsForRepurchaseOfPreferredStock,
    dividendPayout,
    dividendPayoutCommonStock,
    dividendPayoutPreferredStock,
    proceedsFromIssuanceOfCommonStock,
    proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet,
    proceedsFromIssuanceOfPreferredStock,
    proceedsFromRepurchaseOfEquity,
    proceedsFromSaleOfTreasuryStock,
    changeInCashAndCashEquivalents,
    changeInExchangeRate,
    netIncome,
    -- Compute net cash flow as the sum of operating, investing, and financing cash flows.
    (COALESCE(operatingCashflow,0) 
      + COALESCE(cashflowFromInvestment,0) 
      + COALESCE(cashflowFromFinancing,0)) AS netCashFlow
  FROM cash_flow
  WHERE symbol = ?
    AND fiscalDateEnding like '2024%'
    AND reportType = 'annual'
  LIMIT 1
)

-------------------------------
-- Create Sankey flows per template
-------------------------------

-- 1. Net income -> Cash from operations
SELECT 
  'Net income' AS source, 
  'Cash from operations' AS target, 
  COALESCE(netIncome, 0) AS value
FROM cf

UNION ALL
-- 2. Depreciation & amortization -> Non-cash charges
SELECT 
  'Depreciation & amortization' AS source, 
  'Non-cash charges' AS target, 
  COALESCE(depreciationDepletionAndAmortization, 0) AS value
FROM cf

UNION ALL
-- 3. Stock-based compensation -> Non-cash charges
-- (No column available; using 0 as placeholder)
SELECT 
  'Stock-based compensation' AS source, 
  'Non-cash charges' AS target, 
  0 AS value
FROM cf

UNION ALL
-- 4. Non-cash charges -> Other non-cash charges
-- (Placeholder value; adjust as needed.)
SELECT 
  'Non-cash charges' AS source, 
  'Other non-cash charges' AS target, 
  0 AS value
FROM cf

UNION ALL
-- 5. Non-cash charges -> Cash from operations
-- (Assuming non-cash charges—here, solely depreciation & amortization—are added back.)
SELECT 
  'Non-cash charges' AS source, 
  'Cash from operations' AS target, 
  COALESCE(depreciationDepletionAndAmortization, 0) AS value
FROM cf

UNION ALL
-- 6. Cash from operations -> Working capital
-- (We define working capital as the sum of change in operating assets and liabilities.)
SELECT 
  'Cash from operations' AS source, 
  'Working capital' AS target, 
  (COALESCE(changeInOperatingAssets, 0) + COALESCE(changeInOperatingLiabilities, 0)) AS value
FROM cf

UNION ALL
-- 7. Cash from operations -> Cash from investing
-- (Using the cash flow from investing directly.)
SELECT 
  'Cash from operations' AS source, 
  'Cash from investing' AS target, 
  COALESCE(cashflowFromInvestment, 0) AS value
FROM cf

UNION ALL
-- 8. Cash from investing -> Capital expenditure
SELECT 
  'Cash from investing' AS source, 
  'Capital expenditure' AS target, 
  COALESCE(capitalExpenditures, 0) AS value
FROM cf

UNION ALL
-- 9. Cash from investing -> Purchase of securities
-- (No column provided; using 0 as placeholder.)
SELECT 
  'Cash from investing' AS source, 
  'Purchase of securities' AS target, 
  0 AS value
FROM cf

UNION ALL
-- 10. Proceeds from securities -> Cash from investing
-- (No column provided; using 0 as placeholder.)
SELECT 
  'Proceeds from securities' AS source, 
  'Cash from investing' AS target, 
  0 AS value
FROM cf

UNION ALL
-- 11. Cash from investing -> Other cash from investing
-- (Residual: cashflow from investing less capital expenditure.)
SELECT 
  'Cash from investing' AS source, 
  'Other cash from investing' AS target, 
  (COALESCE(cashflowFromInvestment, 0) - COALESCE(capitalExpenditures, 0)) AS value
FROM cf

UNION ALL
-- 12. Cash from operations -> Cash from financing
-- (No direct mapping; using 0 as placeholder.)
SELECT 
  'Cash from operations' AS source, 
  'Cash from financing' AS target, 
  0 AS value
FROM cf

UNION ALL
-- 13. Net cash flow -> Cash from financing
-- (Using the computed net cash flow value.)
SELECT 
  'Net cash flow' AS source, 
  'Cash from financing' AS target, 
  COALESCE(netCashFlow, 0) AS value
FROM cf

UNION ALL
-- 14. Cash from financing -> Stock buybacks
SELECT 
  'Cash from financing' AS source, 
  'Stock buybacks' AS target, 
  COALESCE(paymentsForRepurchaseOfCommonStock, 0) AS value
FROM cf

UNION ALL
-- 15. Cash from financing -> Repayment of commercial paper
-- (No column provided; using 0 as placeholder.)
SELECT 
  'Cash from financing' AS source, 
  'Repayment of commercial paper' AS target, 
  0 AS value
FROM cf

UNION ALL
-- 16. Cash from financing -> Dividends
SELECT 
  'Cash from financing' AS source, 
  'Dividends' AS target, 
  COALESCE(dividendPayout, 0) AS value
FROM cf

UNION ALL
-- 17. Cash from financing -> Tax
-- (No column provided; using 0 as placeholder.)
SELECT 
  'Cash from financing' AS source, 
  'Tax' AS target, 
  0 AS value
FROM cf

UNION ALL
-- 18. Cash from financing -> Repayment of term debt
-- (No column provided; using 0 as placeholder.)
SELECT 
  'Cash from financing' AS source, 
  'Repayment of term debt' AS target, 
  0 AS value
FROM cf

UNION ALL
-- 19. Cash from financing -> Other cash from financing
-- (Residual: financing cash flow less stock buybacks and dividends.)
SELECT 
  'Cash from financing' AS source, 
  'Other cash from financing' AS target, 
  (COALESCE(cashflowFromFinancing, 0) - COALESCE(paymentsForRepurchaseOfCommonStock, 0) - COALESCE(dividendPayout, 0)) AS value
FROM cf;
