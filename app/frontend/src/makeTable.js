import * as d3 from "d3";

/**
 * Puts a table object into the div and populates it
 * with the given data objects
 * @param {String} div - Table container
 * @param {Object[]} data - Data to populate the table
 */
export function makeTable(containerID, data) {
  // Get top container
  const container = d3.select(`#${containerID}`);

  // Create empty table
  const table = container.append("table");

  // Do nothing if there are no entries
  if (!data.length) {
    return;
  }

  // Get names of the table cols
  const colNames = Object.keys(data[0]);

  // Generate header row
  const headerRow = table.append("thead").append("tr");

  // Populate header row
  colNames.forEach((col) => {
    headerRow.append("th").text(col);
  });

  // Create table body
  const dataRows = table.append("tbody");

  // Append each data object to the table
  data.forEach((obj) => {
    const row = dataRows.append("tr");
    colNames.forEach((col) => {
      row.append("td").text(obj[col]);
    });
  });
}
