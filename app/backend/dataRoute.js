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
      `SELECT Symbol, Name, Description, Country, Sector, Industry FROM company_overview WHERE Symbol = ?`,
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
    // Get table parameter
    const { symbol } = req.body;

    // Execute the query and get the result
    const result = await db.query(
      `SELECT datetime, close
      FROM company_intraday_data
      WHERE symbol = ?
      order by datetime ASC`,
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

router.post("/balance_sheet_senkey", async (req, res) => {
  try {
    const { symbol } = req.body;

    // Read the SQL query from the file
    const queryPath = path.resolve("backend/sql_queries", "balance_sheet_senkey2.sql");
    const query = fs.readFileSync(queryPath, "utf-8");

    // Execute the query
    const result = await db.query(query, [symbol]);

    // Send the result as JSON
    res.json(result);
  } catch (err) {
    console.error("Error executing query:", err, { body: req.body });
    res.status(500).json({ error: "An error occurred while querying the database." });
  }
});

router.post("/cash_flow_senkey", async (req, res) => {
  try {
    const { symbol } = req.body;

    // Read the SQL query from the file
    const queryPath = path.resolve("backend/sql_queries", "cash_flow_senkey.sql");
    const query = fs.readFileSync(queryPath, "utf-8");

    // Execute the query
    const result = await db.query(query, [symbol]);

    // Send the result as JSON
    res.json(result);
  } catch (err) {
    console.error("Error executing query:", err, { body: req.body });
    res.status(500).json({ error: "An error occurred while querying the database." });
  }
});

router.post("/income_statement_senkey", async (req, res) => {
  try {
    const { symbol } = req.body;

    // Read the SQL query from the file
    const queryPath = path.resolve("backend/sql_queries", "income_statement_senkey.sql");
    const query = fs.readFileSync(queryPath, "utf-8");

    // Execute the query
    const result = await db.query(query, [symbol]);

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
    console.log(start, end);
    // const start = "20220101T000000";
    // const end = "20221231T235959";

    // Read the SQL query from the file
    const queryPath = path.resolve("backend/sql_queries", "symbol_sentiment_speedometer.sql");
    const query = fs.readFileSync(queryPath, "utf-8");

    // Execute the query with hardcoded params
    const result = await db.query(query, [symbol, start, end]);
    console.log("Speedometer data in dataroute:", result);
    // Send the result as JSON
    res.json(result);
  } catch (err) {
    console.error("Error executing query:", err, { body: req.body });
    res.status(500).json({ error: "An error occurred while querying the database." });
  }
});

router.post("/wordcloud", async (req, res) => {
  try {
    const { symbol } = req.body;
    const start = "20220101T000000";
    const end = "20221231T235959";
    const limit_words = 10;
    // Read the SQL query from the file
    const queryPath = path.resolve("backend/sql_queries", "wordcloud.sql");
    const query = fs.readFileSync(queryPath, "utf-8");

    // Execute the query with hardcoded params
    const result = await db.query(query, [symbol, start, end, limit_words]);
    console.log("Speedometer data in dataroute:", result);
    res.json({ result });
    // Send the result as JSON
    // res.json(result);
  } catch (err) {
    console.error("Error executing query:", err, { body: req.body });
    res.status(500).json({ error: "An error occurred while querying the database." });
  }
});

export default router;
