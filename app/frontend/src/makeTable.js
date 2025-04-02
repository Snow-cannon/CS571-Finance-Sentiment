import * as d3 from "d3";

/**
 * Puts a table object into the div and populates it
 * with the given data objects
 * @param {String} div - Table container
 * @param {Object[]} data - Data to populate the table
 * @param {String} sortCol - Column to sort by
 * @param {boolean} ascending - Sort direction
 */
export function makeTable(containerID, data, sortCol, ascending = true) {
  // Get top container
  const container = d3.select(`#${containerID}`);

  // Skip sorting if nothing is there
  if (sortCol) {
    // Sort based on input reqs
    // Will not sort if column does not exist
    data.sort((a, b) => {
      if (a[sortCol] < b[sortCol]) {
        return ascending ? 1 : -1;
      }

      if (a[sortCol] > b[sortCol]) {
        return ascending ? -1 : 1;
      }

      return 0;
    });
  }

  // Remove all existing tables
  container.selectAll("table").remove();

  // Create empty table
  const table = container.append("table");

  // Do nothing if there are no entries
  if (!data.length) {
    return;
  }

  // Get names of the table cols
  const colNames = Object.keys(data[0]);

  // Generate header row
  table
    .append("thead")
    .append("tr")
    .selectAll("th")
    .data(colNames)
    .enter()
    .append("th")
    .text((col) => col)

    // Add event listener for sorting cols based on the column
    .on("click", (evt, col) => {
      // Auto-sort to ascending
      let newSortDir = true;

      // Flip direction if column is clicked twice
      if (sortCol === col) {
        newSortDir = !ascending;
      }

      // Generate a new table with specified sorting reqs
      makeTable(containerID, data, col, newSortDir);
    });

  // Generate set of rows
  const rows = table.append("tbody").selectAll("tr").data(data).enter().append("tr");

  // Set of cell entries
  const cells = rows
    .selectAll("td")
    .data((obj) => Object.entries(obj))
    .enter()
    .append("td")
    .text((entry) => entry[1]);

  return table;
}
