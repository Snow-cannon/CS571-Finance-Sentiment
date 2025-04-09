import { PageState } from "./globalState.js";
import { state } from "./index.js";
import queryData from "./makeQuery.js";
import * as d3 from "d3";

/**
 * Creates a line chart for intraday data
 *
 * @param {String} containerID - ID of the div container
 */
export async function makeIntraday(containerID) {
  // Get container by specified ID
  const container = d3.select(`#${containerID}`);

  // Set overview data
  const data = await queryData("intraday", { symbol: state.symbol });

  container.selectAll("svg").remove();
  container.selectAll("p").remove();
  

  if (!Array.isArray(data) || !data.length) {
    // Display no info exists

    container.append("p").text(`No intraday data available for ${state.symbol}`);
  } else {
  
  // Parse the data
  const parsedData = data.map((d) => ({
    datetime: new Date(d.datetime),
    close: +d.close,
  }));

   // Set dimensions and margins for the chart
   const margin = { top: 20, right: 30, bottom: 30, left: 50 };
   const width = 800 - margin.left - margin.right;
   const height = 400 - margin.top - margin.bottom;
 
   // Create SVG element
   const svg = container
     .append("svg")
     .attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom)
     .append("g")
     .attr("transform", `translate(${margin.left},${margin.top})`);
 
   // Set up scales
   const x = d3
     .scaleTime()
     .domain(d3.extent(parsedData, (d) => d.datetime))
     .range([0, width]);
 
   const y = d3
     .scaleLinear()
     .domain([d3.min(parsedData, (d) => d.close), d3.max(parsedData, (d) => d.close)])
     .nice()
     .range([height, 0]);
 
   // Add X axis
   svg
     .append("g")
     .attr("transform", `translate(0,${height})`)
     .call(d3.axisBottom(x).ticks(10).tickFormat(d3.timeFormat("%H:%M")));
 
   // Add Y axis
   svg.append("g").call(d3.axisLeft(y));
 
   // Add the line
   svg
     .append("path")
     .datum(parsedData)
     .attr("fill", "none")
     .attr("stroke", "steelblue")
     .attr("stroke-width", 1.5)
     .attr(
       "d",
       d3
         .line()
         .x((d) => x(d.datetime))
         .y((d) => y(d.close))
     );
    }
  // Add listeners for symbol updates
  const update = () => {
    state.removeListener(PageState.Events.SYMBOL, update);
    makeIntraday(containerID);
  };

  state.addListener(PageState.Events.SYMBOL, update);
}