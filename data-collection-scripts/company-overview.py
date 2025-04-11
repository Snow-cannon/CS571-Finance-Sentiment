from fetch_funcs import fetch_company_overview
from helpers import connect_nordvpn, disconnect_nordvpn
import requests
import sqlite3
import os
import time
from dotenv import load_dotenv


load_dotenv()

api_keys = os.getenv('API_KEY_ALPHAVANTAGE_sbabel_umass_edu', '').split(',')
if not api_keys or api_keys[0] == '':
    raise ValueError("No API keys found in the environment variable 'API_KEYS'.")

current_key_index = 0
def get_current_api_key():
    return api_keys[current_key_index].strip()
def rotate_api_key():
    global current_key_index
    current_key_index = (current_key_index + 1) % len(api_keys)
    print(f"Rotated to new API key: {get_current_api_key()}")

with open('../data/top60tickers.txt', 'r') as f:
    content = f.read().strip()
    tickers = [ticker.strip().strip("'").strip('"') for ticker in content.split(',') if ticker.strip()]

conn = sqlite3.connect('company_overview.db')
cursor = conn.cursor()


cursor.execute('''
    CREATE TABLE IF NOT EXISTS company_overview (
        Symbol TEXT PRIMARY KEY,
        AssetType TEXT,
        Name TEXT,
        Description TEXT,
        CIK TEXT,
        Exchange TEXT,
        Currency TEXT,
        Country TEXT,
        Sector TEXT,
        Industry TEXT,
        Address TEXT,
        OfficialSite TEXT,
        FiscalYearEnd TEXT,
        LatestQuarter TEXT,
        MarketCapitalization TEXT,
        EBITDA TEXT,
        PERatio TEXT,
        PEGRatio TEXT,
        BookValue TEXT,
        DividendPerShare TEXT,
        DividendYield TEXT,
        EPS TEXT,
        RevenuePerShareTTM TEXT,
        ProfitMargin TEXT,
        OperatingMarginTTM TEXT,
        ReturnOnAssetsTTM TEXT,
        ReturnOnEquityTTM TEXT,
        RevenueTTM TEXT,
        GrossProfitTTM TEXT,
        DilutedEPSTTM TEXT,
        QuarterlyEarningsGrowthYOY TEXT,
        QuarterlyRevenueGrowthYOY TEXT,
        AnalystTargetPrice TEXT,
        AnalystRatingStrongBuy TEXT,
        AnalystRatingBuy TEXT,
        AnalystRatingHold TEXT,
        AnalystRatingSell TEXT,
        AnalystRatingStrongSell TEXT,
        TrailingPE TEXT,
        ForwardPE TEXT,
        PriceToSalesRatioTTM TEXT,
        PriceToBookRatio TEXT,
        EVToRevenue TEXT,
        EVToEBITDA TEXT,
        Beta TEXT,
        Week52High TEXT,
        Week52Low TEXT,
        MovingAverage50Day TEXT,
        MovingAverage200Day TEXT,
        SharesOutstanding TEXT,
        DividendDate TEXT,
        ExDividendDate TEXT
    )
''')
conn.commit()


overview_arr = []

for ticker in tickers:
    success = False
    attempts = 0
    max_attempts = len(api_keys)

    while not success and attempts < max_attempts:
        current_key = get_current_api_key()
        overview = fetch_company_overview(ticker, current_key)

        if overview != 'no data':
            overview_arr.append(overview)
            success = True
        else:
            print(f"Failed to fetch overview for {ticker} with API key {current_key}")
            rotate_api_key()
            attempts += 1
            disconnect_nordvpn()
            connect_nordvpn()

    if not success:
        print(f"Skipping {ticker} after trying all API keys.")


for overview in overview_arr:
    cursor.execute('''
    INSERT OR REPLACE INTO company_overview (
        Symbol, AssetType, Name, Description, CIK, Exchange, Currency, Country, Sector,
        Industry, Address, OfficialSite, FiscalYearEnd, LatestQuarter, MarketCapitalization,
        EBITDA, PERatio, PEGRatio, BookValue, DividendPerShare, DividendYield, EPS,
        RevenuePerShareTTM, ProfitMargin, OperatingMarginTTM, ReturnOnAssetsTTM, ReturnOnEquityTTM,
        RevenueTTM, GrossProfitTTM, DilutedEPSTTM, QuarterlyEarningsGrowthYOY, QuarterlyRevenueGrowthYOY,
        AnalystTargetPrice, AnalystRatingStrongBuy, AnalystRatingBuy, AnalystRatingHold,
        AnalystRatingSell, AnalystRatingStrongSell, TrailingPE, ForwardPE, PriceToSalesRatioTTM,
        PriceToBookRatio, EVToRevenue, EVToEBITDA, Beta, Week52High, Week52Low,
        MovingAverage50Day, MovingAverage200Day, SharesOutstanding, DividendDate, ExDividendDate
    ) VALUES (
        :Symbol, :AssetType, :Name, :Description, :CIK, :Exchange, :Currency, :Country, :Sector,
        :Industry, :Address, :OfficialSite, :FiscalYearEnd, :LatestQuarter, :MarketCapitalization,
        :EBITDA, :PERatio, :PEGRatio, :BookValue, :DividendPerShare, :DividendYield, :EPS,
        :RevenuePerShareTTM, :ProfitMargin, :OperatingMarginTTM, :ReturnOnAssetsTTM, :ReturnOnEquityTTM,
        :RevenueTTM, :GrossProfitTTM, :DilutedEPSTTM, :QuarterlyEarningsGrowthYOY, :QuarterlyRevenueGrowthYOY,
        :AnalystTargetPrice, :AnalystRatingStrongBuy, :AnalystRatingBuy, :AnalystRatingHold,
        :AnalystRatingSell, :AnalystRatingStrongSell, :TrailingPE, :ForwardPE, :PriceToSalesRatioTTM,
        :PriceToBookRatio, :EVToRevenue, :EVToEBITDA, :Beta, :Week52High, :Week52Low,
        :MovingAverage50Day, :MovingAverage200Day, :SharesOutstanding, :DividendDate, :ExDividendDate
    )
    ''', overview)

    conn.commit()

conn.close()
print("Data for all tickers has been saved to the database.")