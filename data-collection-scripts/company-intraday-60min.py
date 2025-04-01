from fetch_funcs import fetch_intraday_data, store_intraday_data
from helpers import connect_nordvpn, disconnect_nordvpn
import sqlite3
from api_key_manager import APIKeyManager

# Initialize API key manager
key_manager = APIKeyManager()

# Connect to SQLite database and fetch tickers
conn = sqlite3.connect('company_overview.db')
cursor = conn.cursor()
cursor.execute('SELECT DISTINCT Symbol FROM company_overview')
tickers = [row[0] for row in cursor.fetchall()]
for ticker in tickers:
    if ticker == 'PLTR':
        continue
    for year in range(2016, 2025):
        for month in range(1, 13):
            success = False
            attempts = 0
            max_attempts = len(key_manager.api_keys)

            while not success and attempts < max_attempts:
                api_key = key_manager.get_current_key()
                print(f"Fetching data for {ticker} - {year}-{month:02d} using key: {api_key}")
                intraday_data = fetch_intraday_data(ticker, api_key, year=year, month=month)

                if intraday_data == 'data exists':
                    print(f"Data already exists for {ticker} - {year}-{month:02d}. Skipping.")
                    success = True  # Mark as success to skip further attempts
                elif intraday_data != 'no data':
                    store_intraday_data(intraday_data)
                    success = True
                else:
                    print(f"No data returned. Rotating key and changing VPN.")
                    key_manager.handle_failure_and_continue()
                    attempts += 1

            if not success:
                print(f"All keys failed for {ticker} {year}-{month:02d}, generating a new key...")
                new_key = key_manager.fallback_to_new_key()
                if new_key:
                    print("Retrying with new key...")
                    intraday_data = fetch_intraday_data(ticker, new_key, year=year, month=month)
                    if intraday_data == 'data exists':
                        print(f"Data already exists for {ticker} - {year}-{month:02d}. Skipping.")
                        continue
                    elif intraday_data != 'no data':
                        store_intraday_data(intraday_data)
                        print("Success with new key.")
                        continue
                print(f"Skipping {ticker} for {year}-{month:02d} after exhausting all options.")
