
import sqlite3
import time
import os
from datetime import datetime, timedelta
from api_key_manager import APIKeyManager
from fetch_funcs import check_existing_news, fetch_news_sentiment, store_news_sentiment

key_manager = APIKeyManager()

conn = sqlite3.connect('finance_data.db')


cursor = conn.cursor()
cursor.execute('SELECT DISTINCT Symbol FROM company_overview')
tickers = [row[0] for row in cursor.fetchall()]

start_year = 2016
end_year = 2024

checkpoint_file = "news_sentiment_checkpoint.txt"
last_ticker = None
last_year = None
last_month = None

if os.path.exists(checkpoint_file):
    with open(checkpoint_file, "r") as f:
        checkpoint = f.read().strip().split(",")
        if len(checkpoint) >= 3:
            last_ticker = checkpoint[0]
            last_year = int(checkpoint[1])
            last_month = int(checkpoint[2])
            print(f"Resuming from checkpoint: {last_ticker}, {last_year}-{last_month}")

skip_until_checkpoint = last_ticker is not None

for ticker in tickers:
    if skip_until_checkpoint and ticker != last_ticker:
        continue
    elif skip_until_checkpoint and ticker == last_ticker:
        skip_until_checkpoint = False
    
    print(f"Processing news for ticker: {ticker}")
    
    for year in range(start_year, end_year + 1):
        if last_ticker == ticker and year < last_year:
            continue
            
        for month in range(1, 13):
            current_date = datetime.now()
            if year > current_date.year or (year == current_date.year and month > current_date.month):
                continue
            
            if last_ticker == ticker and year == last_year and month < last_month:
                continue
            
            start_date = datetime(year, month, 1)
            if month == 12:
                end_date = datetime(year + 1, 1, 1) - timedelta(days=1)
            else:
                end_date = datetime(year, month + 1, 1) - timedelta(days=1)
            
            time_from = start_date.strftime("%Y%m%dT0000")
            time_to = end_date.strftime("%Y%m%dT2359")
            
            existing_data = check_existing_news(ticker, time_from, time_to, conn)
            if existing_data == "data exists":
                print(f"News data already exists for {ticker} for {year}-{month:02d}. Skipping.")
                continue
            
            print(f"Fetching news for {ticker} for {year}-{month:02d}")
            
            success = False
            attempts = 0
            max_attempts = len(key_manager.api_keys)
            
            while not success and attempts < max_attempts:
                api_key = key_manager.get_current_key()
                print(f"Using API key: {api_key[:10]}...")
                
                news_data = fetch_news_sentiment(ticker, time_from, time_to, api_key)
                
                if news_data == "data exists":
                    print(f"News data already exists for {ticker} for {year}-{month:02d}. Skipping.")
                    success = True
                elif news_data == "limit reached" or news_data == "error":
                    print(f"API limit reached or error for {ticker}. Rotating key.")
                    key_manager.handle_failure_and_continue()
                    attempts += 1
                elif news_data == "no data":
                    print(f"No news data available for {ticker} for {year}-{month:02d}. Moving to next period.")
                    success = True  
                elif isinstance(news_data, dict):
                    if store_news_sentiment(ticker, news_data, conn):
                        success = True
                        print(f"Successfully stored news data for {ticker} for {year}-{month:02d}")
                    else:
                        print(f"Failed to store data for {ticker} for {year}-{month:02d}")
                        attempts += 1
                
                with open(checkpoint_file, "w") as f:
                    f.write(f"{ticker},{year},{month}")
                
                
            
            if not success:
                print(f"All keys failed for {ticker} for {year}-{month:02d}")
                new_key = key_manager.fallback_to_new_key()
                if new_key:
                    print("Retrying with new key...")
                    news_data = fetch_news_sentiment(ticker, time_from, time_to, new_key)
                    if isinstance(news_data, dict):
                        store_news_sentiment(ticker, news_data, conn)
                        print(f"Success with new key for {ticker} for {year}-{month:02d}")
                else:
                    print(f"Skipping {ticker} for {year}-{month:02d} after exhausting all options.")

conn.close()
print("News sentiment collection completed.")

if os.path.exists(checkpoint_file):
    os.remove(checkpoint_file)