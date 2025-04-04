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

***Section for describing data collection***

## Date Slider

This is the visual for selecting the quarter and year, as well as whether to look at a quarter or an entire year of data.

### Initial Design

First iteration was to allow functionality only. We went with a raw html look, and used D3 to generate a table where each cell represented a ticker. The border of the selected cell would be highlighted as the slider was moved, simulating highlighted text tickers at each step.

![Initial Slider @ 18](./screenshots/slider/slider-initial-a.png)
![Initial Slider @ 9](./screenshots/slider/slider-initial-b.png)

This step does not account for actual dates, but sets the groundwork for adding quarters and years under each ticker for future selection. Additionally, the slider text tickers are not properly centered on all ticker counts or screen widths. This needs to be updated to accomadate more screen sizes.

<!-- Page Break in PDF -->
<div style="page-break-after: always;"></div>

## Company Selection Table

This visual displays all the companies we have data for, and allows users to sort by the displayed columns, and select a company. When a compay is selected, it updates the global state which causes all other visuals to represent data for that company instead.

### Initial Design

First iteration of the table only relies on the Symbol data to exist. the creation function will add headers for any columns in the result, but `Symbol` is used to update the global state. We used d3 to generate the headers from the object keys, and to genreate all following rows from the data each object had of those keys. This table can also be sorted by clicking the header cells, sorting by the column and changing the direction (ascending / descending).

![Initial Selection Table](./screenshots/company-select-table/cst-initial.png)

We also have the ability to display which row is hovered over

![Initial Selection Table - Hover](./screenshots/company-select-table/cst-initial-hover.png)

And the ability to click a box and highlight the selected entry with a different color

![Initial Selection Table - Selected](./screenshots/company-select-table/cst-initial-select.png)

## Company Overview

This displays textual information about the currently selected company.

### Initial Design

We will add more information as we go, but it displays all entries from the SQL query made. This means that by changing the query, we will automatically add that data to the overview. The current design is as shown:

![Company Overview](./screenshots/company-overview/co-initial.png)

We will also aim for a better, more defined color scheme in the future, but for now we have a functional prototype. 

