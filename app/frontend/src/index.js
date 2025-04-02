import queryData from "./makeQuery.js";

const testBtn = document.getElementById("testBtn");

testBtn.onclick = async (e) => {
  const symbols = await queryData("symbols");
  console.log(symbols);
  const data = await queryData("table_schema", { table: "company_overview" });
  console.log(data);
};
