# from fetch_funcs import fetch_intraday_data, store_intraday_data
# from helpers import connect_nordvpn, disconnect_nordvpn
# import sqlite3
# import os
# from dotenv import load_dotenv
# from alpha_vantage_keygen import generate_api_key


# # Load environment variables from .env file
# load_dotenv()

# # Get API keys from environment variable and split into a list
# api_keys = os.getenv('API_KEY_ALPHAVANTAGE_sbabel_umass_edu', '').split(',')
# if not api_keys or api_keys[0] == '':
#     raise ValueError("No API keys found in the environment variable 'API_KEYS'.")

# # Function to get the current API key based on index
# current_key_index = 0
# def get_current_api_key():
#     return api_keys[current_key_index].strip()

# # Function to rotate to the next API key
# def rotate_api_key():
#     global current_key_index
#     current_key_index = (current_key_index + 1) % len(api_keys)
#     print(f"Rotated to new API key: {get_current_api_key()}")


# # Connect to SQLite database and create a table for company overviews
# conn = sqlite3.connect('company_overview.db')
# cursor = conn.cursor()

# current_key = get_current_api_key()

# cursor.execute('SELECT distinct Symbol FROM company_overview')
# tickers = list(cursor.fetchall()) 

# for ticker in tickers:
#     ticker = ticker[0]
#     for year in range(2016, 2025):  # Loop through years 2016 to 2024
#         for month in range(1, 13):  # Loop through months 1 to 12
#             success = False
#             attempts = 0
#             max_attempts = len(api_keys)

#             while not success and attempts < max_attempts:
#                 current_key = get_current_api_key()  # Get the current API key
#                 print(f"Fetching and storing data for {ticker} for {year}-{month:02d} with key {current_key}...")

#                 intraday_data = fetch_intraday_data(ticker, current_key, year=year, month=month)

#                 if intraday_data != 'no data':  # Check if data was fetched
#                     store_intraday_data(intraday_data)  # Store data in the database
#                     success = True  # Mark as success to stop retrying
#                 else:
#                     print(f"Failed to fetch data for {ticker} for {year}-{month:02d} as no data was returned.")
#                     # Rotate API key if data is not fetched
#                     rotate_api_key()  
#                     attempts += 1
#                     disconnect_nordvpn()  # Disconnect from VPN
#                     connect_nordvpn()  # Reconnect to VPN
                    
              

#             if not success:
#                 print(f"Skipping {ticker} for {year}-{month:02d} after trying all API keys and VPN reconnections.")

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
