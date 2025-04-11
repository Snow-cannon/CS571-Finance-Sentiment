# Process Book

Below is the index for the process book and each visual in it.

- [Data Serving](#data-serving)
- [Global State](#global-state)
- [Data Collection](#data-collection)
- [Date Slider](#date-slider)
- [Company Selection Table](#company-selection-table)
- [Company Overview](#company-overview)

## Data Serving

The backend uses a `node.js` and `express.js` backend. We went with this method due to having prior experience on the team, as well as being able to serve from SQL queries, improving the speed of data collection, aggregation, and use. We also used a compiler to allow use of ES6 and multi-file frontend for ease of development and code readability.

## Global State

After initializing the selection table, we realized we needed a way to update all the visuals interactively and efficiently. We developed a cusom event bus that could accept listeners for custom events, such as updating quarters and the selected company, and would dispatch events when the global state it stored was updated. This allowed us to make the visuals more dynamic and based on a current global state controlled by multiple visual elements.

## Data Collection

### Data Sources and Collection

We collected our financial data primarily from the [Alpha Vantage API](https://www.alphavantage.co/). The website provided us with a diverse range of financial information including company overviews, financial statements -income statements, cash flows, balance sheets-, stock prices, news articles and sentiments attached to the company. We developed a data collection pipeline in python to fetch, process and store the collected data.

### Collection Infrastructure

We implemented several strategies to overcome the API rate limitations of 25 calls per day potentially by adding waits between api calls, and automating generation of new api keys when needed.
1. **API Key Management** : We have a key management python class that can generate, store, rotate and use API keys when needed.
2. **Retry Logic** : We have implemented retry mechnasims by waiting / rotating to new key / generating another key in our fetch data functions.

### Data Types Collected

We have collected several types of financial data.

1. **Symbols** : We created a list of top 60 companies based on Market Cap that we are doing all the data collection for.
1. **Company Overview** : Basic company information that includes symbol, name, description, sector, industry, market cap, etc.

2. **Financial Statements** : We collected the below in quarterly and annualy basis 
    - Income Statements
    - Balance Sheets
    - Cash Flow 
3. **Stock Price** : Intraday prices at 60 minute intervals, collected for years 2016 to 2025

4. **News Articles** : We collected news articles with the market sentiment scores for the 60 companies. 

### Data Processing and Storage

The steps for data collection were:

1. Check to see if the data for that symbol already exists.
1. If the data does not exist, fetch the data by calling the api with correct parameters.
1. Store the data in the corresponding sql table in a SQLite database called `finance_data.db`.
1. For analysis and backup, we also exported our tables as csv files. 

Our `finance_data.db` contains tables : 
`company_overview`, `company_intraday_data`, `balance_sheet`, , `income_statement`, `cash_flow`, `news_articles`, `news_ticker_sentiment`

### Data Cleaning

Before we store the data in the database, we perform certain preprocessing on it:
- Handling missing values by puting them as `null` 
- Ensuring proper data formatting for time series data
- Have correct primary and foreign for our sql tables.


This comprehensive dataset provides the foundation for our project, enabling the analysis across multiple features including financial performance, market sentiment, and stock price movement.

## Date Slider

This is the visual for selecting the quarter and year, as well as whether to look at a quarter or an entire year of data.

### Initial Design

First iteration was to allow functionality only. We went with a raw html look, and used D3 to generate a table where each cell represented a ticker. The border of the selected cell would be highlighted as the slider was moved, simulating highlighted text tickers at each step.

![Initial Slider @ 18](./screenshots/slider/slider-initial-a.png)
![Initial Slider @ 9](./screenshots/slider/slider-initial-b.png)

This step does not account for actual dates, but sets the groundwork for adding quarters and years under each ticker for future selection. Additionally, the slider text tickers are not properly centered on all ticker counts or screen widths. This needs to be updated to accomadate more screen sizes.

### CSS Upgrade

We updated the slider to add a more modern and easy to read view. A rounded highlight of the selected tick plus a desaturated text color on un-selected ticks makes it much easier to identify the current selection. We also made it putple to go with the overall color scheme we are aiming towards.

![Slider Update 1](./screenshots/slider/slider-update-1.png)

<!-- Page Break in PDF -->
<!-- <div style="page-break-after: always;"></div> -->

## Company Selection Table

This visual displays all the companies we have data for, and allows users to sort by the displayed columns, and select a company. When a compay is selected, it updates the global state which causes all other visuals to represent data for that company instead.

### Initial Design

First iteration of the table only relies on the Symbol data to exist. the creation function will add headers for any columns in the result, but `Symbol` is used to update the global state. We used d3 to generate the headers from the object keys, and to genreate all following rows from the data each object had of those keys. This table can also be sorted by clicking the header cells, sorting by the column and changing the direction (ascending / descending).

![Initial Selection Table](./screenshots/company-select-table/cst-initial.png)

We also have the ability to display which row is hovered over

![Initial Selection Table - Hover](./screenshots/company-select-table/cst-initial-hover.png)

And the ability to click a box and highlight the selected entry with a different color

![Initial Selection Table - Selected](./screenshots/company-select-table/cst-initial-select.png)

### CSS Upgrades

The next iteration involved upgrading the CSS to make it feel more interactive. We added arrows to display the direction the user was sorting the companies, and by which column. We also added a darker shade of purple to show which header the user would be clicking. On top of that, we also shrunk the table to be only 200px tall, and made it scrollable. This allows us to fit more visuals on the page, while still letting users select from the entire set of provided companies.

![Selection Table CSS Upgrade](./screenshots/company-select-table/cst-css-upgrade.png)

## Company Overview

This displays textual information about the currently selected company.

### Initial Design

We will add more information as we go, but it displays all entries from the SQL query made. This means that by changing the query, we will automatically add that data to the overview. The current design is as shown:

![Company Overview](./screenshots/company-overview/co-initial.png)

We will also aim for a better, more defined color scheme in the future, but for now we have a functional prototype.

## Speedometer

This visual represents a key metric of the selected company, by using a semi-circular dial to show the sentiment of the particular company based on news articles.

### Initial Design

We created a dynamic gauge using D3, where the needle rotates to point to the value corresponding to the current company’s sentiment. The value range is divided into five color-coded sections to indicate performance zones: red (low), orange (moderate low), yellow(neutral), light green (moderate high), and green (high).

![Speedometer ](ProcessBook/screenshots/speedometer/speedometer-initial.png)

## Bubble chart

This visual shows multiple company sectors as bubbles, where the size and color of each bubble indicate the magnitude and category of the sector.

### Initial Design

We used d3.pack() to generate non-overlapping bubbles. Each bubble represents a metric (like Revenue, Profit, etc.), with its size scaled based on the value of that metric. We categorized each value into one of four groups and assigned them colors: Green for high values, Light green for moderately high values, Light red for moderately low values & Red for low values

![bubbleChart ](ProcessBook/screenshots/bubbleChart/bc-initial.png)

## Word Cloud (optional feature)

This visual displays prominent keywords associated with the selected company in a cloud layout from the news articles published for each company.

### Initial Design

We created a word cloud using D3, with font sizes mapped to the importance or frequency of each term. The more significant the word, the larger and bolder it appears.

This chart listens to the global symbol state and updates accordingly. For the prototype, we are currently using static/mock data, but it is set up to integrate with dynamic keyword generation based on backend values.

![wordCloud ](ProcessBook/screenshots/wordCloud/wc-initial.png)

## Radar Chart (optional feature)

This visual compares sector-wise cash flow distribution for the selected company.

### Initial Design

We implemented the radar chart using radial lines and concentric circles to represent six key sectors. Each axis represents a sector, and the values (normalized between 0 and 1) form a closed polygon representing the distribution of cash flow across those sectors.

![radarChart ](ProcessBook/screenshots/radarChart/rc-initial.png)
