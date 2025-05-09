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
      title: "Company Selection",
      text: "Select and sort companies by provided metrics using the table. Updates all dashboard components based on selected company.",
    },
    {
      icon: "🎚️",
      title: "Date Selection",
      text: "Filter selected data by time with the slider. Selecting a year shows annual data; Selecting Q1~Q4 will select quarterly data.",
    },
    {
      icon: "📈",
      title: "Financial Statements",
      text: "Switch between Cash Flow, Income Statement, and Balance Sheet to view the companies expenditures, revenue, and debt.",
    },
    {
      icon: "📟",
      title: "News Sentiment",
      text: "Shows average sentiment from news sources as a dynamic gauge value. Red is Bearish, Blue is Bullish",
    },
    {
      icon: "☁️",
      title: "Top Word Analysis",
      text: "View top 15 keywords from financial news. Bigger numbers are more frequent, and color represents average sentiment of related articles.",
    },
    {
      icon: "📉",
      title: "Stock Analysis",
      text: "View company stock price over time. Hovering provides details of the specific time.",
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
