import * as d3 from "d3";

/**
 * Creates a set of overview cards at the top of the screen
 *
 * @param {String} containerID - ID of the container div
 */
export async function makeWebsiteOverview(containerID) {
  // Select the container element by its ID and clear any existing content.
  const container = d3.select(`#${containerID}`);
  container.selectAll("div").remove();

  const cards = [
    {
      icon: "📌",
      title: "Company Overview",
      text: "Displays a list of text information for the company, including the name, description, and abbreviation.",
    },
    {
      icon: "📊",
      title: "Table",
      text: "Select and sort companies by provided metrics. Updates all dashboard components based on selected company.",
    },
    {
      icon: "🎚️",
      title: "Slider",
      text: "Filters data by time. Selecting a year shows annual data; Selecting Q1~Q4 will select quarterly data.",
    },
    {
      icon: "📈",
      title: "Sankey Graph",
      text: "Switch between Cash Flow, Income Statement, and Balance Sheet to view the companies expenditures, revenue, and debt.",
    },
    {
      icon: "📟",
      title: "Speedometer",
      text: "Shows average sentiment from news sources as a dynamic gauge value. Red is Bearish, Blue is Bullish",
    },
    {
      icon: "☁️",
      title: "Word Cloud",
      text: "Top 10 keywords from financial news. Bigger numbers are more frequent, and color average sentiment of related articles.",
    },
    {
      icon: "📉",
      title: "Line Chart",
      text: "Stock price over time with price on the Y-axis and date on X-axis. Hovering provides a more detailed view.",
    },
  ];

  container
    .selectAll(".desc-card")
    .data(cards)
    .enter()
    .append("div")
    .attr("class", "desc-card")
    .html(
      (d) => `
      <div class="desc-title">
        <span class="desc-icon">${d.icon}</span>${d.title}
      </div>
      <div>${d.text}</div>
    `
    );
}
