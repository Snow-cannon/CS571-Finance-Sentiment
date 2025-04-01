from fetch_funcs import fetch_income_statement, fetch_balance_sheet, fetch_cash_flow, store_financial_data
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
    
    success = False
    attempts = 0
    max_attempts = len(key_manager.api_keys)
    
    while not success and attempts < max_attempts:
        api_key = key_manager.get_current_key()
        print(f"Fetching financial statements for {ticker} using key: {api_key}")
        
        income_statement = fetch_income_statement(ticker, api_key)
        balance_sheet = fetch_balance_sheet(ticker, api_key)
        cash_flow = fetch_cash_flow(ticker, api_key)
        
        if income_statement == 'data exists' and balance_sheet == 'data exists' and cash_flow == 'data exists':
            print(f"Financial data already exists for {ticker}. Skipping.")
            success = True  # Mark as success to skip further attempts
        elif income_statement != 'no data' and balance_sheet != 'no data' and cash_flow != 'no data':
            store_financial_data(ticker, income_statement, balance_sheet, cash_flow)
            success = True
        else:
            print(f"No financial data returned for {ticker}. Rotating key and changing VPN.")
            key_manager.handle_failure_and_continue()
            attempts += 1
    
    if not success:
        print(f"All keys failed for {ticker}, generating a new key...")
        new_key = key_manager.fallback_to_new_key()
        if new_key:
            print("Retrying with new key...")
            income_statement = fetch_income_statement(ticker, new_key)
            balance_sheet = fetch_balance_sheet(ticker, new_key)
            cash_flow = fetch_cash_flow(ticker, new_key)
            if income_statement == 'data exists' and balance_sheet == 'data exists' and cash_flow == 'data exists':
                print(f"Financial data already exists for {ticker}. Skipping.")
                continue
            elif income_statement != 'no data' and balance_sheet != 'no data' and cash_flow != 'no data':
                store_financial_data(ticker, income_statement, balance_sheet, cash_flow)
                print("Success with new key.")
                continue
        print(f"Skipping {ticker} after exhausting all options.")
