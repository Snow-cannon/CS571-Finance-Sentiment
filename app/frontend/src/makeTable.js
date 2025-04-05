import * as d3 from "d3";
import { state } from "./index.js";

/**
 * Option list for the make table function
 *
 * @typedef {Object} MakeTableOptions
 * @property {function(any): void} selectRow - A function to call when a row is selected
 * @property {String} sortby - Column to sort by
 * @property {boolean} asc - Sort direction
 */

/**
 * Puts a table object into the div and populates it with the given data objects.
 *
 * Makes the header row sort the table and clicking the rows select the related obj
 *
 * Assumes input has a 'Symbol' field. Updates selected symbol on line selection
 *
 * @param {String} containerID - Table container
 * @param {Object[]} data - Data to populate the table
 * @param {MakeTableOptions} options - Options for generating the table
 */
export function makeSelectionTable(containerID, data, options) {
  const { sortby, asc, selectRow } = options;

  // Get top container
  const container = d3.select(`#${containerID}`);

  // Skip sorting if nothing is there
  if (sortby) {
    // Sort based on input reqs
    // Will not sort if column does not exist
    data.sort((a, b) => {
      if (a[sortby] < b[sortby]) {
        return asc ? 1 : -1;
      }

      if (a[sortby] > b[sortby]) {
        return asc ? -1 : 1;
      }

      return 0;
    });
  }

  // Remove all existing tables
  container.selectAll("table").remove();

  // Create empty table
  const table = container.append("table").classed("symbol-selection-table", true);

  // Do nothing if there are no entries
  if (!data.length) {
    return;
  }

  // Get names of the table cols
  const colNames = Object.keys(data[0]);

  const getArrow = (col) => {
    if (col !== sortby) {
      return "";
    }

    if (asc) {
      return "▲";
    } else {
      return "▼";
    }
  };

  // Generate header row
  table
    .append("thead")
    .append("tr")
    .selectAll("th")
    .data(colNames)
    .enter()
    .append("th")
    .text((col) => `${col} ${getArrow(col)}`)

    // Add event listener for sorting cols based on the column
    .on("click", (evt, col) => {
      // Auto-sort to ascending
      let newSortDir = false;

      // Flip direction if column is clicked twice
      if (sortby === col) {
        newSortDir = !asc;
      }

      /**
       * Updated options with new sorting rules
       * @type {MakeTableOptions}
       */
      const newOptions = {
        selectRow,
        sortby: col,
        asc: newSortDir,
      };

      // Generate a new table with specified sorting reqs
      makeSelectionTable(containerID, data, newOptions);
    });

  // Generate set of rows
  const rows = table
    .append("tbody")
    .selectAll("tr")
    .data(data)
    .enter()
    .append("tr")
    .classed("selected", (obj) => {
      return obj.Symbol === state.symbol;
    })
    .on("click", (evt, obj) => {
      // Run the 'onselect' callback
      selectRow(obj);

      // Deselect
      table.select("tbody").selectAll("tr").classed("selected", false);

      // Reselect
      d3.select(evt.currentTarget).classed("selected", true);
    });

  // Set of cell entries
  const cells = rows
    .selectAll("td")
    .data((obj) => Object.entries(obj))
    .enter()
    .append("td")
    .text((entry) => entry[1]);

  return table;
}
