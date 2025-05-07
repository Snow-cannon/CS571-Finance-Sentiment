/* Citation: 
"Now help me do something similar for the cash flow statement. I have a cash flow statement with the following columns: symbol,
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
help me prepare data in a sql query that I can use for this graph"
prompt. ChatGPT, 9 April version, OpenAI, 9 April 2025, chat.openai.com.
*/

/*
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
    AND fiscalDateEnding BETWEEN ? AND ?
    AND reportType = ?
    AND reportedCurrency = 'USD'
  LIMIT 1
)



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

*/

WITH cf AS (
  SELECT
    symbol,
    fiscalDateEnding,
    reportType,
    reportedCurrency,
    COALESCE(netIncome, 0) AS netIncome,
    COALESCE(depreciationDepletionAndAmortization, 0) AS depreciationDepletionAndAmortization,
    COALESCE(changeInOperatingLiabilities, 0) AS changeInOperatingLiabilities,
    COALESCE(changeInOperatingAssets, 0) AS changeInOperatingAssets,
    COALESCE(operatingCashflow, 0) AS operatingCashflow, 
    COALESCE(cashflowFromInvestment, 0) AS cashflowFromInvestment,
    COALESCE(capitalExpenditures, 0) AS capitalExpenditures,
    COALESCE(cashflowFromFinancing, 0) AS cashflowFromFinancing,
    COALESCE(paymentsForRepurchaseOfCommonStock, 0) AS paymentsForRepurchaseOfCommonStock,
    COALESCE(dividendPayout, 0) AS dividendPayout,
    (COALESCE(operatingCashflow, 0) + COALESCE(cashflowFromInvestment, 0) + COALESCE(cashflowFromFinancing, 0)) AS calculatedNetCashFlow,
    COALESCE(changeInReceivables, 0) AS changeInReceivables, -
    COALESCE(changeInInventory, 0) AS changeInInventory   
  FROM cash_flow
  WHERE symbol = ? 
    AND fiscalDateEnding BETWEEN ? AND ?  
    AND reportType = ? 
    AND reportedCurrency = 'USD'
  LIMIT 1
)
-- 1. Net income -> Cash from operations
SELECT
  'Net Income' AS source,
  'Cash from Operations' AS target,
  netIncome AS value -- netIncome can be negative
FROM cf
UNION ALL
-- 2. Depreciation & amortization -> Non-cash charges
SELECT
  'Depreciation & Amortization' AS source,
  'Non-cash Charges' AS target,
  ABS(depreciationDepletionAndAmortization) AS value 
FROM cf
UNION ALL
SELECT
  'Stock-based Compensation' AS source,
  'Non-cash Charges' AS target,
  0 AS value 
FROM cf
UNION ALL

SELECT
  'Non-cash Charges' AS source,
  'Cash from Operations' AS target,
  (ABS(COALESCE(cf.depreciationDepletionAndAmortization, 0)) + 0 /* + ABS(COALESCE(cf.stock_based_compensation_if_any, 0)) */) AS value
FROM cf
UNION ALL
-- 5. Changes in Working Capital -> Cash from operations
SELECT
  'Changes in Working Capital' AS source,
  'Cash from Operations' AS target,
  (changeInOperatingLiabilities - changeInOperatingAssets) AS value
FROM cf
UNION ALL


SELECT
  'Cash from Operations' AS source,
  'Cash from Investing' AS target,
  ABS(cashflowFromInvestment) AS value 
FROM cf
UNION ALL
SELECT
  'Cash from Operations' AS source,
  'Cash from Financing' AS target,
  ABS(cashflowFromFinancing) AS value 
FROM cf
UNION ALL
SELECT
  'Cash from Operations' AS source,
  'Calculated Net Cash Flow' AS target,
  calculatedNetCashFlow AS value 
FROM cf

UNION ALL
SELECT
  'Cash from Investing' AS source,
  'Capital Expenditure' AS target,
  ABS(capitalExpenditures) AS value 
FROM cf
UNION ALL
SELECT
  'Cash from Investing' AS source,
  'Purchase of Securities' AS target,
  0 AS value
FROM cf
UNION ALL
SELECT
  'Proceeds from Securities' AS source, 
  'Cash from Investing' AS target,
  0 AS value
FROM cf
UNION ALL
SELECT
  'Cash from Investing' AS source,
  'Other Cash from Investing' AS target,
  CASE
    WHEN (ABS(cashflowFromInvestment) - ABS(capitalExpenditures) - 0 /*ABS(Purchase of Sec)*/ + 0 /*ABS(Proceeds from Sec)*/) > 0
    THEN (ABS(cashflowFromInvestment) - ABS(capitalExpenditures) - 0 /*ABS(Purchase of Sec)*/ + 0 /*ABS(Proceeds from Sec)*/)
    ELSE 0
  END AS value
FROM cf

UNION ALL
SELECT
  'Cash from Financing' AS source,
  'Stock Buybacks' AS target,
  ABS(paymentsForRepurchaseOfCommonStock) AS value 
FROM cf
UNION ALL
SELECT
  'Cash from Financing' AS source,
  'Dividends' AS target,
  ABS(dividendPayout) AS value
FROM cf
UNION ALL
-- 15. Cash from Financing -> Repayment of Commercial Paper (Placeholder)
SELECT
  'Cash from Financing' AS source,
  'Repayment of Commercial Paper' AS target,
  0 AS value
FROM cf
UNION ALL
-- 16. Cash from Financing -> Tax (Placeholder, as per Apple example under CFF)
SELECT
  'Cash from Financing' AS source,
  'Tax (under Financing)' AS target,
  0 AS value
FROM cf
UNION ALL
-- 17. Cash from Financing -> Repayment of Term Debt (Placeholder)
SELECT
  'Cash from Financing' AS source,
  'Repayment of Term Debt' AS target,
  0 AS value
FROM cf
UNION ALL
-- 18. Cash from Financing -> Other Cash from Financing (Residual)
SELECT
  'Cash from Financing' AS source,
  'Other Cash from Financing' AS target,
  CASE
    WHEN (ABS(cashflowFromFinancing) - ABS(paymentsForRepurchaseOfCommonStock) - ABS(dividendPayout) /* - Other known CFF outflows shown + Other known CFF inflows shown */) > 0
    THEN (ABS(cashflowFromFinancing) - ABS(paymentsForRepurchaseOfCommonStock) - ABS(dividendPayout) /* - Other known CFF outflows shown + Other known CFF inflows shown */)
    ELSE 0
  END AS value
FROM cf;