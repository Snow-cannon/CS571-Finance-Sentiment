import requests
from datetime import datetime
import sqlite3

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


# def fetch_intraday_data(ticker, api_key, interval='60min', start_year=2016, end_year=2024):
#     base_url = f"https://www.alphavantage.co/query"
#     company_data = []

#     for year in range(start_year, end_year + 1):
#         month = 1
#         while month <= 12:
#             # Fetch data for a specific year-month
#             url = f"{base_url}?function=TIME_SERIES_INTRADAY&symbol={ticker}&interval={interval}&month={year}-{month:02d}&apikey={api_key}"
#             print(f"Fetching data for {ticker} for {year}-{month:02d}...")
#             response = requests.get(url)
#             data = response.json()

#             if 'Time Series (60min)' not in data:
#                 print(f"Error: {data.get('Error Message', 'Unknown error')} for {ticker} in {year}-{month:02d}")
#                 break

#             # Parse the data
#             for timestamp, values in data['Time Series (60min)'].items():
#                 timestamp = datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S')
#                 company_data.append({
#                     'symbol': ticker,
#                     'datetime': timestamp,
#                     'open': values['1. open'],
#                     'high': values['2. high'],
#                     'low': values['3. low'],
#                     'close': values['4. close'],
#                     'volume': values['5. volume']
#                 })
            
#             month += 1

#     return company_data

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
