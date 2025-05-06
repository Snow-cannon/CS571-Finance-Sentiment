import express from "express";
import path from "path";
import { DB } from "./databaseFunctions.js";
import fs from "fs";

const router = express.Router();

// Set body data to be JSON
router.use(express.json());

const db = new DB();
await db.connect(path.resolve("data", "finance_data.db"));

// Test CSV
router.get("/tables", async (req, res) => {
  try {
    // Execute the query and get the result
    const result = await db.query("SELECT * FROM sqlite_master WHERE type='table'");

    // Send the result as JSON
    res.json(result); // Send the result as a JSON response
  } catch (err) {
    // Handle any errors
    console.error("Error executing query:", err);
    res.status(500).json({ error: "An error occurred while querying the database." });
  }
});

// Return the table schema
router.post("/table_schema", async (req, res) => {
  try {
    // Get table parameter
    const { table } = req.body;

    // Execute the query and get the result
    const result = await db.query(`PRAGMA table_info(${table});`);

    // Send JSON result
    res.json(result);
  } catch (err) {
    // Handle any errors
    console.error("Error executing query:", err);
    res.status(500).json({ error: "An error occurred while querying the database." });
  }
});

// Return the table schema
router.get("/symbols", async (req, res) => {
  try {
    // Execute the query and get the result
    const result = await db.query(`SELECT Symbol, Name, Sector, Industry FROM company_overview`);

    // Send JSON result
    res.json(result);
  } catch (err) {
    // Handle any errors
    console.error("Error executing query:", err);
    res.status(500).json({ error: "An error occurred while querying the database." });
  }
});

// Return the table schema
router.post("/overview", async (req, res) => {
  try {
    // Get table parameter
    const { symbol } = req.body;

    // Execute the query and get the result
    const result = await db.query(
      `SELECT Symbol, Name, Sector, Industry, Country, Description FROM company_overview WHERE Symbol = ?`,
      // `SELECT Symbol, Name, Sector FROM company_overview WHERE Symbol = ?`,
      [symbol]
    );

    // Send JSON result
    res.json(result);
  } catch (err) {
    // Handle any errors
    console.error("Error executing query:", err);
    res.status(500).json({ error: "An error occurred while querying the database." });
  }
});

// Return the table schema
router.post("/intraday", async (req, res) => {
  try {
    const { symbol, start, end } = req.body;

    // Read the SQL query from the file
    const queryPath = path.resolve("backend/sql_queries", "intraday.sql");
    const query = fs.readFileSync(queryPath, "utf-8");

    // Execute the query
    const result = await db.query(query, [symbol, start, end]);

    // Send JSON result
    res.json(result);
  } catch (err) {
    // Handle any errors
    console.error("Error executing query:", err);
    res.status(500).json({ error: "An error occurred while querying the database." });
  }
});

router.post("/balance_sheet_senkey", async (req, res) => {
  try {
    const { symbol, start, end, report_type } = req.body;
    // let report_type = "annual"; // Change to "quarterly" for quarterly data
    // let start_date = "2024-01-01";
    // let end_date = "2024-12-31";

    // Read the SQL query from the file
    const queryPath = path.resolve("backend/sql_queries", "balance_sheet_senkey2.sql");
    const query = fs.readFileSync(queryPath, "utf-8");

    // Execute the query
    const result = await db.query(query, [symbol, start, end, report_type]);

    // Send the result as JSON
    res.json(result);
  } catch (err) {
    console.error("Error executing query:", err, { body: req.body });
    res.status(500).json({ error: "An error occurred while querying the database." });
  }
});

router.post("/cash_flow_senkey", async (req, res) => {
  try {
    const { symbol, start, end, report_type } = req.body;

    // Read the SQL query from the file
    const queryPath = path.resolve("backend/sql_queries", "cash_flow_senkey.sql");
    const query = fs.readFileSync(queryPath, "utf-8");

    // Execute the query
    const result = await db.query(query, [symbol, start, end, report_type]);

    // Send the result as JSON
    res.json(result);
  } catch (err) {
    console.error("Error executing query:", err, { body: req.body });
    res.status(500).json({ error: "An error occurred while querying the database." });
  }
});

router.post("/income_statement_senkey", async (req, res) => {
  try {
    const { symbol, start, end, report_type } = req.body;
    console.log(symbol, start, end, report_type);

    // Read the SQL query from the file
    const queryPath = path.resolve("backend/sql_queries", "income_statement_senkey.sql");
    const query = fs.readFileSync(queryPath, "utf-8");

    // Execute the query
    const result = await db.query(query, [symbol, start, end, report_type]);

    // Send the result as JSON
    res.json(result);
  } catch (err) {
    console.error("Error executing query:", err, { body: req.body });
    res.status(500).json({ error: "An error occurred while querying the database." });
  }
});

router.post("/symbol_sentiment_speedometer", async (req, res) => {
  try {
    const { symbol, start, end } = req.body;

    // Read the SQL query from the file
    const queryPath = path.resolve("backend/sql_queries", "symbol_sentiment_speedometer.sql");
    const query = fs.readFileSync(queryPath, "utf-8");

    // Execute the query with hardcoded params
    const result = await db.query(query, [symbol, start, end]);
    // Send the result as JSON
    res.json(result);
  } catch (err) {
    console.error("Error executing query:", err, { body: req.body });
    res.status(500).json({ error: "An error occurred while querying the database." });
  }
});

router.post("/wordcloud", async (req, res) => {
  try {
    const { symbol, start, end } = req.body;
    const limit_words = 10;

    // Read the SQL query from the file
    const queryPath = path.resolve("backend/sql_queries", "wordcloud.sql");
    const query = fs.readFileSync(queryPath, "utf-8");

    // Execute the query with hardcoded params
    const result = await db.query(query, [symbol, start, end, limit_words]);

    // Send the result as JSON
    res.json({ result });
  } catch (err) {
    console.error("Error executing query:", err, { body: req.body });
    res.status(500).json({ error: "An error occurred while querying the database." });
  }
});

export default router;
