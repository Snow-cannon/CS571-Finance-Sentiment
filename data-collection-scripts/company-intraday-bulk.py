from fetch_funcs import fetch_intraday_data_bulk_csv
from helpers import connect_nordvpn, disconnect_nordvpn
import sqlite3
import pandas as pd
from api_key_manager import APIKeyManager

# Initialize API key manager
key_manager = APIKeyManager()

# Connect to SQLite database and fetch tickers
conn = sqlite3.connect('company_overview.db')
cursor = conn.cursor()
cursor.execute('SELECT DISTINCT Symbol FROM company_overview')
tickers = [row[0] for row in cursor.fetchall()]

# Define the cutoff date
cutoff_date = "2016-01-01"

# Initialize an empty DataFrame to hold all the data
all_data = pd.DataFrame()

# Loop through each ticker
for ticker in tickers:
    success = False
    attempts = 0
    max_attempts = len(key_manager.api_keys)

    while not success and attempts < max_attempts:
        api_key = key_manager.get_current_key()
        print(f"Fetching data for {ticker} - using key: {api_key}")
        
        # Connect to VPN for each attempt (if needed)
        # connect_nordvpn()
        
        # Fetch data for the ticker
        intraday_data = fetch_intraday_data_bulk_csv(ticker, api_key)
        
        # Check if API limit exceeded
        if 'Information' in intraday_data and 'rate limit' in intraday_data['Information']:
            print(f"Rate limit exceeded for {ticker}. Rotating API key.")
            key_manager.handle_failure_and_continue()
            attempts += 1
            disconnect_nordvpn()  # Disconnect the VPN after each attempt
            continue

        # If data is valid (not empty), proceed
        if not intraday_data.empty:
            success = True
            print(f"Successfully fetched data for {ticker}")
            
            # Convert timestamp to datetime and filter based on cutoff date
            intraday_data["timestamp"] = pd.to_datetime(intraday_data["timestamp"])
            intraday_data = intraday_data[intraday_data["timestamp"] >= cutoff_date]
            
            # Add the ticker symbol to the data
            intraday_data["ticker"] = ticker

            # Append the data to the all_data DataFrame
            all_data = pd.concat([all_data, intraday_data], ignore_index=True)

        else:
            # If no data is returned, rotate the API key and disconnect VPN
            print(f"No data returned for {ticker}. Rotating key and changing VPN.")
            key_manager.handle_failure_and_continue()
            attempts += 1
            disconnect_nordvpn()  # Disconnect the VPN after each attempt

    if not success:
        print(f"All keys failed for {ticker}, generating a new key...")
        new_key = key_manager.fallback_to_new_key()
        if new_key:
            print("Retrying with new key...")
            # Retry fetching the data with the new API key
            intraday_data = fetch_intraday_data_bulk_csv(ticker, new_key)

            if not intraday_data.empty:
                print("Success with new key.")
                # Convert timestamp to datetime and filter based on cutoff date
                intraday_data["timestamp"] = pd.to_datetime(intraday_data["timestamp"])
                intraday_data = intraday_data[intraday_data["timestamp"] >= cutoff_date]
                
                # Add the ticker symbol to the data
                intraday_data["ticker"] = ticker

                # Append the data to the all_data DataFrame
                all_data = pd.concat([all_data, intraday_data], ignore_index=True)
            else:
                print(f"Skipping {ticker} after exhausting all options.")
        else:
            print(f"Unable to generate new key. Skipping {ticker}.")

# Save the combined data to a CSV file
output_file = "all_tickers_data.csv"
all_data.to_csv(output_file, index=False)
print(f"Filtered data saved to {output_file}")
