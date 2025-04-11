/* Citation: 
"Now help me do something similar for the income statement. I have a income statement with the following columns: 
  symbol,
  fiscalDateEnding,
  reportType,
  reportedCurrency,
  totalRevenue,
  grossProfit,
  costOfRevenue,
  costofGoodsAndServicesSold,
  operatingIncome,
  sellingGeneralAndAdministrative,
  researchAndDevelopment,
  operatingExpenses,
  investmentIncomeNet,
  netInterestIncome,
  interestIncome,
  interestExpense,
  nonInterestIncome,
  otherNonOperatingIncome,
  depreciation,
  depreciationAndAmortization,
  incomeBeforeTax,
  incomeTaxExpense,
  interestAndDebtExpense,
  netIncomeFromContinuingOperations,
  comprehensiveIncomeNetOfTax,
  ebit,
  ebitda,
  netIncome
help me prepare data in a sql query that I can use for this graph"
prompt. ChatGPT, 9 April version, OpenAI, 9 April 2025, chat.openai.com.
*/


WITH inc AS (
  SELECT
    symbol,
    fiscalDateEnding,
    reportType,
    reportedCurrency,
    totalRevenue,
    grossProfit,
    costOfRevenue,
    costofGoodsAndServicesSold,
    operatingIncome,
    sellingGeneralAndAdministrative,
    researchAndDevelopment,
    operatingExpenses,
    investmentIncomeNet,
    netInterestIncome,
    interestIncome,
    interestExpense,
    nonInterestIncome,
    otherNonOperatingIncome,
    depreciation,
    depreciationAndAmortization,
    incomeBeforeTax,
    incomeTaxExpense,
    interestAndDebtExpense,
    netIncomeFromContinuingOperations,
    comprehensiveIncomeNetOfTax,
    ebit,
    ebitda,
    netIncome
  FROM income_statement
  WHERE symbol = ?
    AND fiscalDateEnding LIKE '2024%'
    AND reportType = 'annual'
  LIMIT 1
)

-- 0. Income Statement -> Total Revenue
SELECT 
  'Income Statement' AS source,
  'Total Revenue' AS target,
  COALESCE(totalRevenue, 0) AS value
FROM inc

UNION ALL
-- 1. Total Revenue -> Cost of Revenue
SELECT 
  'Total Revenue' AS source,
  'Cost of Revenue' AS target,
  COALESCE(costOfRevenue, 0) AS value
FROM inc

UNION ALL
-- 2. Total Revenue -> Cost of Goods And Services Sold
SELECT 
  'Total Revenue' AS source,
  'Cost of Goods And Services Sold' AS target,
  COALESCE(costofGoodsAndServicesSold, 0) AS value
FROM inc

UNION ALL
-- 3. Total Revenue -> Gross Profit
SELECT 
  'Total Revenue' AS source,
  'Gross Profit' AS target,
  COALESCE(grossProfit, 0) AS value
FROM inc

UNION ALL
-- 4. Gross Profit -> Operating Income
SELECT 
  'Gross Profit' AS source,
  'Operating Income' AS target,
  COALESCE(operatingIncome, 0) AS value
FROM inc

UNION ALL
-- 5. Gross Profit -> Selling, General and Administrative
SELECT 
  'Gross Profit' AS source,
  'Selling, General and Administrative' AS target,
  COALESCE(sellingGeneralAndAdministrative, 0) AS value
FROM inc

UNION ALL
-- 6. Gross Profit -> Research And Development
SELECT 
  'Gross Profit' AS source,
  'Research And Development' AS target,
  COALESCE(researchAndDevelopment, 0) AS value
FROM inc

UNION ALL
-- 7. Gross Profit -> Operating Expenses
SELECT 
  'Gross Profit' AS source,
  'Operating Expenses' AS target,
  COALESCE(operatingExpenses, 0) AS value
FROM inc

UNION ALL
-- 8. Operating Income -> Investment Income Net
SELECT 
  'Operating Income' AS source,
  'Investment Income Net' AS target,
  COALESCE(investmentIncomeNet, 0) AS value
FROM inc

UNION ALL
-- 9. Operating Income -> Net Interest Income
SELECT 
  'Operating Income' AS source,
  'Net Interest Income' AS target,
  COALESCE(netInterestIncome, 0) AS value
FROM inc

UNION ALL
-- 10. Operating Income -> Interest Income
SELECT 
  'Operating Income' AS source,
  'Interest Income' AS target,
  COALESCE(interestIncome, 0) AS value
FROM inc

UNION ALL
-- 11. Operating Income -> Interest Expense
SELECT 
  'Operating Income' AS source,
  'Interest Expense' AS target,
  COALESCE(interestExpense, 0) AS value
FROM inc

UNION ALL
-- 12. Operating Income -> Non Interest Income
SELECT 
  'Operating Income' AS source,
  'Non Interest Income' AS target,
  COALESCE(nonInterestIncome, 0) AS value
FROM inc

UNION ALL
-- 13. Operating Income -> Other Non Operating Income
SELECT 
  'Operating Income' AS source,
  'Other Non Operating Income' AS target,
  COALESCE(otherNonOperatingIncome, 0) AS value
FROM inc

UNION ALL
-- 14. Operating Income -> Depreciation
SELECT 
  'Operating Income' AS source,
  'Depreciation' AS target,
  COALESCE(depreciation, 0) AS value
FROM inc

UNION ALL
-- 15. Operating Income -> Depreciation and Amortization
SELECT 
  'Operating Income' AS source,
  'Depreciation and Amortization' AS target,
  COALESCE(depreciationAndAmortization, 0) AS value
FROM inc

UNION ALL
-- 16. Operating Income -> Income Before Tax
SELECT 
  'Operating Income' AS source,
  'Income Before Tax' AS target,
  COALESCE(incomeBeforeTax, 0) AS value
FROM inc

UNION ALL
-- 17. Income Before Tax -> Income Tax Expense
SELECT 
  'Income Before Tax' AS source,
  'Income Tax Expense' AS target,
  COALESCE(incomeTaxExpense, 0) AS value
FROM inc

UNION ALL
-- 18. Income Before Tax -> Interest and Debt Expense
SELECT 
  'Income Before Tax' AS source,
  'Interest and Debt Expense' AS target,
  COALESCE(interestAndDebtExpense, 0) AS value
FROM inc

UNION ALL
-- 19. Income Before Tax -> Net Income from Continuing Operations
SELECT 
  'Income Before Tax' AS source,
  'Net Income from Continuing Operations' AS target,
  COALESCE(netIncomeFromContinuingOperations, 0) AS value
FROM inc

UNION ALL
-- 20. Income Before Tax -> Comprehensive Income Net Of Tax
SELECT 
  'Income Before Tax' AS source,
  'Comprehensive Income Net Of Tax' AS target,
  COALESCE(comprehensiveIncomeNetOfTax, 0) AS value
FROM inc

UNION ALL
-- 21. Income Before Tax -> Net Income
SELECT 
  'Income Before Tax' AS source,
  'Net Income' AS target,
  COALESCE(netIncome, 0) AS value
FROM inc

UNION ALL
-- 22. Gross Profit -> EBIT
SELECT 
  'Gross Profit' AS source,
  'EBIT' AS target,
  COALESCE(ebit, 0) AS value
FROM inc

UNION ALL
-- 23. Gross Profit -> EBITDA
SELECT 
  'Gross Profit' AS source,
  'EBITDA' AS target,
  COALESCE(ebitda, 0) AS value
FROM inc;
