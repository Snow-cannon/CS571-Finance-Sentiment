import requests
from datetime import datetime
import sqlite3
import pandas as pd

from io import StringIO

def fetch_company_overview(ticker, api_key):

    print(f"Fetching data for {ticker} using API key {api_key}...")
    url = f'https://www.alphavantage.co/query?function=OVERVIEW&symbol={ticker}&apikey={api_key}'
    
    r = requests.get(url)
    data = r.json()
    if not data or 'Symbol' not in data:
        print(f"Skipped {ticker} (no data returned)")
        return 'no data'
    
    # Prepare the overview data (defaulting missing fields to empty strings)
    overview = {
        'Symbol': data.get("Symbol", ""),
        'AssetType': data.get("AssetType", ""),
        'Name': data.get("Name", ""),
        'Description': data.get("Description", ""),
        'CIK': data.get("CIK", ""),
        'Exchange': data.get("Exchange", ""),
        'Currency': data.get("Currency", ""),
        'Country': data.get("Country", ""),
        'Sector': data.get("Sector", ""),
        'Industry': data.get("Industry", ""),
        'Address': data.get("Address", ""),
        'OfficialSite': data.get("OfficialSite", ""),
        'FiscalYearEnd': data.get("FiscalYearEnd", ""),
        'LatestQuarter': data.get("LatestQuarter", ""),
        'MarketCapitalization': data.get("MarketCapitalization", ""),
        'EBITDA': data.get("EBITDA", ""),
        'PERatio': data.get("PERatio", ""),
        'PEGRatio': data.get("PEGRatio", ""),
        'BookValue': data.get("BookValue", ""),
        'DividendPerShare': data.get("DividendPerShare", ""),
        'DividendYield': data.get("DividendYield", ""),
        'EPS': data.get("EPS", ""),
        'RevenuePerShareTTM': data.get("RevenuePerShareTTM", ""),
        'ProfitMargin': data.get("ProfitMargin", ""),
        'OperatingMarginTTM': data.get("OperatingMarginTTM", ""),
        'ReturnOnAssetsTTM': data.get("ReturnOnAssetsTTM", ""),
        'ReturnOnEquityTTM': data.get("ReturnOnEquityTTM", ""),
        'RevenueTTM': data.get("RevenueTTM", ""),
        'GrossProfitTTM': data.get("GrossProfitTTM", ""),
        'DilutedEPSTTM': data.get("DilutedEPSTTM", ""),
        'QuarterlyEarningsGrowthYOY': data.get("QuarterlyEarningsGrowthYOY", ""),
        'QuarterlyRevenueGrowthYOY': data.get("QuarterlyRevenueGrowthYOY", ""),
        'AnalystTargetPrice': data.get("AnalystTargetPrice", ""),
        'AnalystRatingStrongBuy': data.get("AnalystRatingStrongBuy", ""),
        'AnalystRatingBuy': data.get("AnalystRatingBuy", ""),
        'AnalystRatingHold': data.get("AnalystRatingHold", ""),
        'AnalystRatingSell': data.get("AnalystRatingSell", ""),
        'AnalystRatingStrongSell': data.get("AnalystRatingStrongSell", ""),
        'TrailingPE': data.get("TrailingPE", ""),
        'ForwardPE': data.get("ForwardPE", ""),
        'PriceToSalesRatioTTM': data.get("PriceToSalesRatioTTM", ""),
        'PriceToBookRatio': data.get("PriceToBookRatio", ""),
        'EVToRevenue': data.get("EVToRevenue", ""),
        'EVToEBITDA': data.get("EVToEBITDA", ""),
        'Beta': data.get("Beta", ""),
        'Week52High': data.get("52WeekHigh", ""),
        'Week52Low': data.get("52WeekLow", ""),
        'MovingAverage50Day': data.get("50DayMovingAverage", ""),
        'MovingAverage200Day': data.get("200DayMovingAverage", ""),
        'SharesOutstanding': data.get("SharesOutstanding", ""),
        'DividendDate': data.get("DividendDate", ""),
        'ExDividendDate': data.get("ExDividendDate", "")
    }
    return overview



def fetch_intraday_data(ticker, api_key, interval='60min', year=2016, month=12):
    base_url = f"https://www.alphavantage.co/query"
    company_data = []

    # Check if data already exists in the database
    conn = sqlite3.connect('finance_data.db')
    cursor = conn.cursor()

    cursor.execute('''
    SELECT COUNT(*) FROM company_intraday_data
    WHERE symbol = ? AND strftime('%Y-%m', datetime) = ?
    ''', (ticker, f"{year}-{month:02d}"))
    exists = cursor.fetchone()[0] > 0

    conn.close()

    if exists:
        print(f"Data for {ticker} for {year}-{month:02d} already exists. Skipping fetch.")
        return 'data exists'

    url = f"{base_url}?function=TIME_SERIES_INTRADAY&symbol={ticker}&interval={interval}&month={year}-{month:02d}&apikey={api_key}"
    print(f"Fetching data for {ticker} for {year}-{month:02d}...")
    response = requests.get(url)
    data = response.json()

    

    if 'Time Series (60min)' not in data:
        return 'no data'

    # Parse the data
    for timestamp, values in data['Time Series (60min)'].items():
        timestamp = datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S')
        company_data.append({
            'symbol': ticker,
            'datetime': timestamp,
            'open': values['1. open'],
            'high': values['2. high'],
            'low': values['3. low'],
            'close': values['4. close'],
            'volume': values['5. volume']
        })
    
    month += 1


    return company_data


# Function to fetch intraday data for a single ticker
def fetch_intraday_data_bulk_csv(ticker, api_key, interval='60min'):
    url = f"https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol={ticker}&interval={interval}&apikey={api_key}&datatype=csv&outputsize=full"
    
    response = requests.get(url)
    
    if response.status_code == 200:
        # Read the CSV response into a DataFrame
        try:
            df = pd.read_csv(StringIO(response.text))
            
            # Check if the expected column is in the DataFrame
            if 'timestamp' not in df.columns:
                print(f"Timestamp column not found in the response for {ticker}.")
                print("Columns found:", df.columns)
                return pd.DataFrame()  # Return an empty DataFrame if the structure is unexpected
            
            # Convert timestamp to datetime
            df["timestamp"] = pd.to_datetime(df["timestamp"])
            return df
        except Exception as e:
            print(f"Error processing data for {ticker}: {e}")
            return pd.DataFrame()  # Return an empty DataFrame on failure
    else:
        print(f"Failed to fetch data for {ticker}. Status code: {response.status_code}")
        return pd.DataFrame()  # Return an empty DataFrame on failure



# Function to store data in the database
def store_intraday_data(company_data):
    conn = sqlite3.connect('finance_data.db')  # Connect to your database
    cursor = conn.cursor()

    # Create the table if it doesn't exist
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS company_intraday_data (
        symbol TEXT,
        datetime DATETIME,
        open REAL,
        high REAL,
        low REAL,
        close REAL,
        volume INTEGER
    )
    ''')

    # Insert the data
    cursor.executemany('''
    INSERT INTO company_intraday_data (symbol, datetime, open, high, low, close, volume)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', [(data['symbol'], data['datetime'], data['open'], data['high'], data['low'], data['close'], data['volume']) for data in company_data])

    conn.commit()
    conn.close()


def base_function_fetch_call(function, ticker, api_key):
    base_url = f'https://www.alphavantage.co/query?function={function}&symbol={ticker}&apikey={api_key}'

    # Check if data already exists in the database
    conn = sqlite3.connect('finance_data.db')
    cursor = conn.cursor()

    cursor.execute(f'''
    SELECT COUNT(*) FROM {function.lower()}
    WHERE symbol = ? 
    ''', (ticker,))
    exists = cursor.fetchone()[0] > 0

    conn.close()

    if exists:
        print(f"{function} Data for {ticker} already exists. Skipping fetch.")
        return 'data exists'


    print(f"Fetching data for {ticker} for function {function}...")
    response = requests.get(base_url)
    data = response.json()
    if response.status_code == 200:
        if not data or 'symbol' not in data:
            return 'no data'
        else:
            return data
    else:
        print(f"Failed to fetch data for {ticker}. Status code: {response.status_code}")


def fetch_income_statement(ticker, api_key):
    """
    Fetches the income statement data for a given ticker from Alpha Vantage.
    Returns the JSON data if successful, otherwise returns 'no data'.
    """
    print(f"Fetching income statement for {ticker} using API key {api_key}...")
    data = base_function_fetch_call('INCOME_STATEMENT', ticker, api_key)
    
    # Check if the data contains the expected key
    if data == 'data exists':
        return 'data exists'
    if not data or 'annualReports' not in data:
        print(f"Skipped {ticker} (no income statement data returned)")
        return 'no data'
    
    return data

def fetch_balance_sheet(ticker, api_key):
    """
    Fetches the balance sheet data for a given ticker from Alpha Vantage.
    Returns the JSON data if successful, otherwise returns 'no data'.
    """
    print(f"Fetching balance sheet for {ticker} using API key {api_key}...")
    data = base_function_fetch_call('BALANCE_SHEET', ticker, api_key)
    
    # Check if the data contains the expected key
    if data == 'data exists':
        return 'data exists'
    if not data or 'annualReports' not in data:
        print(f"Skipped {ticker} (no balance sheet data returned)")
        return 'no data'
    
    return data

def fetch_cash_flow(ticker, api_key):
    """
    Fetches the cash flow data for a given ticker from Alpha Vantage.
    Returns the JSON data if successful, otherwise returns 'no data'.
    """
    print(f"Fetching cash flow for {ticker} using API key {api_key}...")
    data = base_function_fetch_call('CASH_FLOW', ticker, api_key)
    
    # Check if the data contains the expected key
    if data == 'data exists':
        return 'data exists'
    if not data or 'annualReports' not in data:
        print(f"Skipped {ticker} (no cash flow data returned)")
        return 'no data'
    
    return data


def store_income_statement(income_data):
    """
    Stores income statement reports (both annual and quarterly) into the finance_db.
    Expects income_data to be the JSON result from the income statement API.
    """
    import sqlite3

    # Connect to the finance database
    conn = sqlite3.connect('finance_data.db')
    cursor = conn.cursor()

    # Create table with a composite primary key (symbol, fiscalDateEnding, reportType)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS income_statement (
        symbol TEXT,
        fiscalDateEnding TEXT,
        reportType TEXT,
        reportedCurrency TEXT,
        operatingCashflow TEXT,
        paymentsForOperatingActivities TEXT,
        proceedsFromOperatingActivities TEXT,
        changeInOperatingLiabilities TEXT,
        changeInOperatingAssets TEXT,
        depreciationDepletionAndAmortization TEXT,
        capitalExpenditures TEXT,
        changeInReceivables TEXT,
        changeInInventory TEXT,
        profitLoss TEXT,
        cashflowFromInvestment TEXT,
        cashflowFromFinancing TEXT,
        proceedsFromRepaymentsOfShortTermDebt TEXT,
        paymentsForRepurchaseOfCommonStock TEXT,
        paymentsForRepurchaseOfEquity TEXT,
        paymentsForRepurchaseOfPreferredStock TEXT,
        dividendPayout TEXT,
        dividendPayoutCommonStock TEXT,
        dividendPayoutPreferredStock TEXT,
        proceedsFromIssuanceOfCommonStock TEXT,
        proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet TEXT,
        proceedsFromIssuanceOfPreferredStock TEXT,
        proceedsFromRepurchaseOfEquity TEXT,
        proceedsFromSaleOfTreasuryStock TEXT,
        changeInCashAndCashEquivalents TEXT,
        changeInExchangeRate TEXT,
        netIncome TEXT,
        PRIMARY KEY (symbol, fiscalDateEnding, reportType)
    )
    ''')

    symbol = income_data.get('symbol', '')

    # Process both annual and quarterly reports
    for report_type, reports in [('annual', income_data.get('annualReports', [])), 
                                 ('quarterly', income_data.get('quarterlyReports', []))]:
        rows_to_insert = []
        for report in reports:
            fiscal_date = report.get("fiscalDateEnding", "")
            # Check if the record already exists
            cursor.execute('''
                SELECT COUNT(*) FROM income_statement
                WHERE symbol = ? AND fiscalDateEnding = ? AND reportType = ?
            ''', (symbol, fiscal_date, report_type))
            exists = cursor.fetchone()[0] > 0

            if exists:
                print(f"Income statement ({report_type}) for {symbol} on {fiscal_date} already exists. Skipping insert.")
                continue

            # Prepare a tuple of values, defaulting missing fields to empty strings
            row = (
                symbol,
                fiscal_date,
                report_type,
                report.get("reportedCurrency", ""),
                report.get("operatingCashflow", ""),
                report.get("paymentsForOperatingActivities", ""),
                report.get("proceedsFromOperatingActivities", ""),
                report.get("changeInOperatingLiabilities", ""),
                report.get("changeInOperatingAssets", ""),
                report.get("depreciationDepletionAndAmortization", ""),
                report.get("capitalExpenditures", ""),
                report.get("changeInReceivables", ""),
                report.get("changeInInventory", ""),
                report.get("profitLoss", ""),
                report.get("cashflowFromInvestment", ""),
                report.get("cashflowFromFinancing", ""),
                report.get("proceedsFromRepaymentsOfShortTermDebt", ""),
                report.get("paymentsForRepurchaseOfCommonStock", ""),
                report.get("paymentsForRepurchaseOfEquity", ""),
                report.get("paymentsForRepurchaseOfPreferredStock", ""),
                report.get("dividendPayout", ""),
                report.get("dividendPayoutCommonStock", ""),
                report.get("dividendPayoutPreferredStock", ""),
                report.get("proceedsFromIssuanceOfCommonStock", ""),
                report.get("proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet", ""),
                report.get("proceedsFromIssuanceOfPreferredStock", ""),
                report.get("proceedsFromRepurchaseOfEquity", ""),
                report.get("proceedsFromSaleOfTreasuryStock", ""),
                report.get("changeInCashAndCashEquivalents", ""),
                report.get("changeInExchangeRate", ""),
                report.get("netIncome", "")
            )
            rows_to_insert.append(row)

        if rows_to_insert:
            try:
                cursor.executemany('''
                    INSERT INTO income_statement (
                        symbol, fiscalDateEnding, reportType, reportedCurrency, operatingCashflow,
                        paymentsForOperatingActivities, proceedsFromOperatingActivities,
                        changeInOperatingLiabilities, changeInOperatingAssets,
                        depreciationDepletionAndAmortization, capitalExpenditures,
                        changeInReceivables, changeInInventory, profitLoss,
                        cashflowFromInvestment, cashflowFromFinancing,
                        proceedsFromRepaymentsOfShortTermDebt,
                        paymentsForRepurchaseOfCommonStock, paymentsForRepurchaseOfEquity,
                        paymentsForRepurchaseOfPreferredStock, dividendPayout,
                        dividendPayoutCommonStock, dividendPayoutPreferredStock,
                        proceedsFromIssuanceOfCommonStock,
                        proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet,
                        proceedsFromIssuanceOfPreferredStock, proceedsFromRepurchaseOfEquity,
                        proceedsFromSaleOfTreasuryStock, changeInCashAndCashEquivalents,
                        changeInExchangeRate, netIncome
                    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                ''', rows_to_insert)
                conn.commit()
                print(f"Inserted {len(rows_to_insert)} new income statement ({report_type}) records for {symbol}.")
            except sqlite3.IntegrityError:
                print(f"Some income statement records for {symbol} ({report_type}) already exist. Skipping duplicates.")
                conn.rollback()
        else:
            print(f"No new income statement ({report_type}) records to insert.")
    
    conn.close()


def store_balance_sheet(balance_data):
    """
    Stores balance sheet reports (both annual and quarterly) into the finance_db.
    Expects balance_data to be the JSON result from the balance sheet API.
    """
    import sqlite3

    conn = sqlite3.connect('finance_data.db')
    cursor = conn.cursor()

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS balance_sheet (
        symbol TEXT,
        fiscalDateEnding TEXT,
        reportType TEXT,
        reportedCurrency TEXT,
        totalAssets TEXT,
        totalCurrentAssets TEXT,
        cashAndCashEquivalentsAtCarryingValue TEXT,
        cashAndShortTermInvestments TEXT,
        inventory TEXT,
        currentNetReceivables TEXT,
        totalNonCurrentAssets TEXT,
        propertyPlantEquipment TEXT,
        accumulatedDepreciationAmortizationPPE TEXT,
        intangibleAssets TEXT,
        intangibleAssetsExcludingGoodwill TEXT,
        goodwill TEXT,
        investments TEXT,
        longTermInvestments TEXT,
        shortTermInvestments TEXT,
        otherCurrentAssets TEXT,
        otherNonCurrentAssets TEXT,
        totalLiabilities TEXT,
        totalCurrentLiabilities TEXT,
        currentAccountsPayable TEXT,
        deferredRevenue TEXT,
        currentDebt TEXT,
        shortTermDebt TEXT,
        totalNonCurrentLiabilities TEXT,
        capitalLeaseObligations TEXT,
        longTermDebt TEXT,
        currentLongTermDebt TEXT,
        longTermDebtNoncurrent TEXT,
        shortLongTermDebtTotal TEXT,
        otherCurrentLiabilities TEXT,
        otherNonCurrentLiabilities TEXT,
        totalShareholderEquity TEXT,
        treasuryStock TEXT,
        retainedEarnings TEXT,
        commonStock TEXT,
        commonStockSharesOutstanding TEXT,
        PRIMARY KEY (symbol, fiscalDateEnding, reportType)
    )
    ''')

    symbol = balance_data.get('symbol', '')

    # Process both annual and quarterly reports
    for report_type, reports in [('annual', balance_data.get('annualReports', [])), 
                                    ('quarterly', balance_data.get('quarterlyReports', []))]:
        rows_to_insert = []
        for report in reports:
            fiscal_date = report.get("fiscalDateEnding", "")
            cursor.execute('''
                SELECT COUNT(*) FROM balance_sheet
                WHERE symbol = ? AND fiscalDateEnding = ? AND reportType = ?
            ''', (symbol, fiscal_date, report_type))
            exists = cursor.fetchone()[0] > 0

            if exists:
                print(f"Balance sheet ({report_type}) for {symbol} on {fiscal_date} already exists. Skipping insert.")
                continue

            row = (
                symbol,
                fiscal_date,
                report_type,
                report.get("reportedCurrency", ""),
                report.get("totalAssets", ""),
                report.get("totalCurrentAssets", ""),
                report.get("cashAndCashEquivalentsAtCarryingValue", ""),
                report.get("cashAndShortTermInvestments", ""),
                report.get("inventory", ""),
                report.get("currentNetReceivables", ""),
                report.get("totalNonCurrentAssets", ""),
                report.get("propertyPlantEquipment", ""),
                report.get("accumulatedDepreciationAmortizationPPE", ""),
                report.get("intangibleAssets", ""),
                report.get("intangibleAssetsExcludingGoodwill", ""),
                report.get("goodwill", ""),
                report.get("investments", ""),
                report.get("longTermInvestments", ""),
                report.get("shortTermInvestments", ""),
                report.get("otherCurrentAssets", ""),
                report.get("otherNonCurrentAssets", ""),
                report.get("totalLiabilities", ""),
                report.get("totalCurrentLiabilities", ""),
                report.get("currentAccountsPayable", ""),
                report.get("deferredRevenue", ""),
                report.get("currentDebt", ""),
                report.get("shortTermDebt", ""),
                report.get("totalNonCurrentLiabilities", ""),
                report.get("capitalLeaseObligations", ""),
                report.get("longTermDebt", ""),
                report.get("currentLongTermDebt", ""),
                report.get("longTermDebtNoncurrent", ""),
                report.get("shortLongTermDebtTotal", ""),
                report.get("otherCurrentLiabilities", ""),
                report.get("otherNonCurrentLiabilities", ""),
                report.get("totalShareholderEquity", ""),
                report.get("treasuryStock", ""),
                report.get("retainedEarnings", ""),
                report.get("commonStock", ""),
                report.get("commonStockSharesOutstanding", "")
            )
            rows_to_insert.append(row)

        if rows_to_insert:
            try:
                cursor.executemany('''
                    INSERT INTO balance_sheet (
                        symbol, fiscalDateEnding, reportType, reportedCurrency, totalAssets, totalCurrentAssets,
                        cashAndCashEquivalentsAtCarryingValue, cashAndShortTermInvestments, inventory,
                        currentNetReceivables, totalNonCurrentAssets, propertyPlantEquipment,
                        accumulatedDepreciationAmortizationPPE, intangibleAssets,
                        intangibleAssetsExcludingGoodwill, goodwill, investments, longTermInvestments,
                        shortTermInvestments, otherCurrentAssets, otherNonCurrentAssets, totalLiabilities,
                        totalCurrentLiabilities, currentAccountsPayable, deferredRevenue, currentDebt,
                        shortTermDebt, totalNonCurrentLiabilities, capitalLeaseObligations, longTermDebt,
                        currentLongTermDebt, longTermDebtNoncurrent, shortLongTermDebtTotal,
                        otherCurrentLiabilities, otherNonCurrentLiabilities, totalShareholderEquity,
                        treasuryStock, retainedEarnings, commonStock, commonStockSharesOutstanding
                    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                ''', rows_to_insert)
                conn.commit()
                print(f"Inserted {len(rows_to_insert)} new balance sheet ({report_type}) records for {symbol}.")
            except sqlite3.IntegrityError:
                print(f"Some balance sheet records for {symbol} ({report_type}) already exist. Skipping duplicates.")
                conn.rollback()
        else:
            print(f"No new balance sheet ({report_type}) records to insert.")

    conn.close()


def store_cash_flow(cash_flow_data):
    """
    Stores cash flow reports (both annual and quarterly) into the finance_db.
    Expects cash_flow_data to be the JSON result from the cash flow API.
    """
    import sqlite3

    conn = sqlite3.connect('finance_data.db')
    cursor = conn.cursor()

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS cash_flow (
        symbol TEXT,
        fiscalDateEnding TEXT,
        reportType TEXT,
        reportedCurrency TEXT,
        operatingCashflow TEXT,
        paymentsForOperatingActivities TEXT,
        proceedsFromOperatingActivities TEXT,
        changeInOperatingLiabilities TEXT,
        changeInOperatingAssets TEXT,
        depreciationDepletionAndAmortization TEXT,
        capitalExpenditures TEXT,
        changeInReceivables TEXT,
        changeInInventory TEXT,
        profitLoss TEXT,
        cashflowFromInvestment TEXT,
        cashflowFromFinancing TEXT,
        proceedsFromRepaymentsOfShortTermDebt TEXT,
        paymentsForRepurchaseOfCommonStock TEXT,
        paymentsForRepurchaseOfEquity TEXT,
        paymentsForRepurchaseOfPreferredStock TEXT,
        dividendPayout TEXT,
        dividendPayoutCommonStock TEXT,
        dividendPayoutPreferredStock TEXT,
        proceedsFromIssuanceOfCommonStock TEXT,
        proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet TEXT,
        proceedsFromIssuanceOfPreferredStock TEXT,
        proceedsFromRepurchaseOfEquity TEXT,
        proceedsFromSaleOfTreasuryStock TEXT,
        changeInCashAndCashEquivalents TEXT,
        changeInExchangeRate TEXT,
        netIncome TEXT,
        PRIMARY KEY (symbol, fiscalDateEnding, reportType)
    )
    ''')

    symbol = cash_flow_data.get('symbol', '')

    # Process both annual and quarterly reports
    for report_type, reports in [('annual', cash_flow_data.get('annualReports', [])), 
                                    ('quarterly', cash_flow_data.get('quarterlyReports', []))]:
        rows_to_insert = []
        for report in reports:
            fiscal_date = report.get("fiscalDateEnding", "")
            cursor.execute('''
                SELECT COUNT(*) FROM cash_flow
                WHERE symbol = ? AND fiscalDateEnding = ? AND reportType = ?
            ''', (symbol, fiscal_date, report_type))
            exists = cursor.fetchone()[0] > 0

            if exists:
                print(f"Cash flow statement ({report_type}) for {symbol} on {fiscal_date} already exists. Skipping insert.")
                continue

            row = (
                symbol,
                fiscal_date,
                report_type,
                report.get("reportedCurrency", ""),
                report.get("operatingCashflow", ""),
                report.get("paymentsForOperatingActivities", ""),
                report.get("proceedsFromOperatingActivities", ""),
                report.get("changeInOperatingLiabilities", ""),
                report.get("changeInOperatingAssets", ""),
                report.get("depreciationDepletionAndAmortization", ""),
                report.get("capitalExpenditures", ""),
                report.get("changeInReceivables", ""),
                report.get("changeInInventory", ""),
                report.get("profitLoss", ""),
                report.get("cashflowFromInvestment", ""),
                report.get("cashflowFromFinancing", ""),
                report.get("proceedsFromRepaymentsOfShortTermDebt", ""),
                report.get("paymentsForRepurchaseOfCommonStock", ""),
                report.get("paymentsForRepurchaseOfEquity", ""),
                report.get("paymentsForRepurchaseOfPreferredStock", ""),
                report.get("dividendPayout", ""),
                report.get("dividendPayoutCommonStock", ""),
                report.get("dividendPayoutPreferredStock", ""),
                report.get("proceedsFromIssuanceOfCommonStock", ""),
                report.get("proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet", ""),
                report.get("proceedsFromIssuanceOfPreferredStock", ""),
                report.get("proceedsFromRepurchaseOfEquity", ""),
                report.get("proceedsFromSaleOfTreasuryStock", ""),
                report.get("changeInCashAndCashEquivalents", ""),
                report.get("changeInExchangeRate", ""),
                report.get("netIncome", "")
            )
            rows_to_insert.append(row)

        if rows_to_insert:
            try:
                cursor.executemany('''
                    INSERT INTO cash_flow (
                        symbol, fiscalDateEnding, reportType, reportedCurrency, operatingCashflow,
                        paymentsForOperatingActivities, proceedsFromOperatingActivities,
                        changeInOperatingLiabilities, changeInOperatingAssets,
                        depreciationDepletionAndAmortization, capitalExpenditures,
                        changeInReceivables, changeInInventory, profitLoss,
                        cashflowFromInvestment, cashflowFromFinancing,
                        proceedsFromRepaymentsOfShortTermDebt,
                        paymentsForRepurchaseOfCommonStock, paymentsForRepurchaseOfEquity,
                        paymentsForRepurchaseOfPreferredStock, dividendPayout,
                        dividendPayoutCommonStock, dividendPayoutPreferredStock,
                        proceedsFromIssuanceOfCommonStock,
                        proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet,
                        proceedsFromIssuanceOfPreferredStock, proceedsFromRepurchaseOfEquity,
                        proceedsFromSaleOfTreasuryStock, changeInCashAndCashEquivalents,
                        changeInExchangeRate, netIncome
                    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                ''', rows_to_insert)
                conn.commit()
                print(f"Inserted {len(rows_to_insert)} new cash flow ({report_type}) records for {symbol}.")
            except sqlite3.IntegrityError:
                print(f"Some cash flow records for {symbol} ({report_type}) already exist. Skipping duplicates.")
                conn.rollback()
        else:
            print(f"No new cash flow ({report_type}) records to insert.")
    
    conn.close()

def store_financial_data(ticker, income_statement, balance_sheet, cash_flow):
    print("Storing all financial data for", ticker)
    # Check if data already exists in the database
    if income_statement == 'data exists' and balance_sheet == 'data exists' and cash_flow == 'data exists':
        return 'data exists'
    if income_statement == 'no data' or balance_sheet == 'no data' or cash_flow == 'no data':
        return 'no data'
    if income_statement != 'data exists':
        store_income_statement(income_statement)
    if balance_sheet != 'data exists':
        store_balance_sheet(balance_sheet)
    if cash_flow != 'data exists':
        store_cash_flow(cash_flow)

# Function to fetch news sentiment data from Alpha Vantage
def fetch_news_sentiment(ticker, time_from, time_to, api_key):
    """
    Fetch news sentiment data from Alpha Vantage API
    """
    url = "https://www.alphavantage.co/query"
    
    # Build parameters
    params = {
        "function": "NEWS_SENTIMENT",
        "tickers": ticker,
        "time_from": time_from,
        "time_to": time_to,
        "sort": "RELEVANCE",
        "limit": 1000,  # Maximum allowed by API
        "apikey": api_key
    }
    
    try:
        built_url = f"{url}?{'&'.join([f'{key}={value}' for key, value in params.items()])}"
        # print(f"Making request to URL: {built_url}")
        response = requests.get(url, params=params)
        data = response.json()
        
        # Check if response contains error message
        if "Error Message" in data:
            print(f"API Error: {data['Error Message']}")
            return "no data"
        if "Information" in data:
            print(f"API Information: {data['Information']}")
            # Check if data is actually present
            if "feed" not in data or len(data["feed"]) == 0:
                return "no data"
        if "Note" in data:
            print(f"API Note: {data['Note']}")
            return "limit reached"
            
        if "feed" in data and len(data["feed"]) > 0:
            # Check if we have valid data
            return data
        else:
            print(f"No news data found for {ticker} in specified time range")
            return "no data"
            
    except Exception as e:
        print(f"Error fetching news sentiment data: {str(e)}")
        return "error"
    
# Function to check if data already exists
def check_existing_news(ticker, start_date, end_date, conn):
    cursor = conn.cursor()
    
    # Convert dates to match the format stored in database
    start_date_obj = datetime.strptime(start_date, "%Y%m%dT%H%M")
    end_date_obj = datetime.strptime(end_date, "%Y%m%dT%H%M")
    
    # Format for SQL query
    start_date_str = start_date_obj.strftime("%Y%m%d")
    end_date_str = end_date_obj.strftime("%Y%m%d")
    
    # Check if we already have news articles for this ticker and date range
    query = """
    SELECT COUNT(*) 
    FROM news_articles a
    JOIN news_ticker_sentiment s ON a.id = s.article_id
    WHERE s.ticker_symbol = ?
    AND SUBSTR(a.time_published, 1, 8) BETWEEN ? AND ?
    """
    
    cursor.execute(query, (ticker, start_date_str, end_date_str))
    count = cursor.fetchone()[0]
    
    # If we have a significant number of articles for this period, consider it covered
    if count > 20:
        return "data exists"
    return "needs data"
    
# Function to store news sentiment data in the database
def store_news_sentiment(ticker, data, conn):
    """
    Store news sentiment data in the SQLite database
    """
    if not data or "feed" not in data:
        print("No valid data to store")
        return False
    
    cursor = conn.cursor()
    articles_stored = 0
    articles_already_exist = 0
    
    try:
        fetch_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        for article in data["feed"]:
            # Prepare article data
            title = article.get("title")
            url = article.get("url")
            time_published = article.get("time_published")
            
            # Handle authors - can be a list or already a string
            authors_data = article.get("authors", [])
            if isinstance(authors_data, list):
                authors = ",".join(authors_data)
            else:
                authors = str(authors_data)
                
            summary = article.get("summary")
            banner_image = article.get("banner_image")
            source = article.get("source")
            category_within_source = article.get("category_within_source")
            source_domain = article.get("source_domain")
            
            # Handle topics properly - extract just the topic names from the objects
            topics_data = article.get("topics", [])
            if isinstance(topics_data, list):
                # Extract just the topic name from each dictionary
                topic_names = []
                for topic_item in topics_data:
                    if isinstance(topic_item, dict) and "topic" in topic_item:
                        topic_names.append(topic_item["topic"])
                topics = ",".join(topic_names)
            else:
                topics = str(topics_data)
                
            overall_sentiment_score = article.get("overall_sentiment_score")
            overall_sentiment_label = article.get("overall_sentiment_label")
            
            # Insert article data and get the article_id
            try:
                cursor.execute('''
                INSERT INTO news_articles (
                    title, url, time_published, authors, summary, banner_image, source, 
                    category_within_source, source_domain, topics, 
                    overall_sentiment_score, overall_sentiment_label, fetch_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    title, url, time_published, authors, summary, banner_image, source,
                    category_within_source, source_domain, topics,
                    overall_sentiment_score, overall_sentiment_label, fetch_date
                ))
                
                article_id = cursor.lastrowid
                articles_stored += 1
                
                # Insert ticker sentiment data if available
                if "ticker_sentiment" in article:
                    for ticker_data in article["ticker_sentiment"]:
                        ticker_symbol = ticker_data.get("ticker")
                        relevance_score = ticker_data.get("relevance_score")
                        ticker_sentiment_score = ticker_data.get("ticker_sentiment_score")
                        ticker_sentiment_label = ticker_data.get("ticker_sentiment_label")
                        
                        cursor.execute('''
                        INSERT INTO news_ticker_sentiment (
                            article_id, ticker_symbol, relevance_score, 
                            ticker_sentiment_score, ticker_sentiment_label
                        ) VALUES (?, ?, ?, ?, ?)
                        ''', (
                            article_id, ticker_symbol, relevance_score,
                            ticker_sentiment_score, ticker_sentiment_label
                        ))
                
            except sqlite3.IntegrityError:
                # URL already exists in database
                articles_already_exist += 1
                continue
                
        conn.commit()
        print(f"Stored {articles_stored} new articles, {articles_already_exist} already existed for {ticker}")
        return articles_stored > 0 or articles_already_exist > 0
        
    except Exception as e:
        print(f"Error storing news sentiment data: {str(e)}")
        conn.rollback()
        return False
# Get all tickers from database
def get_tickers_from_db(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT symbol FROM company_overview ORDER BY symbol")
    tickers = [row[0] for row in cursor.fetchall()]
    return tickers