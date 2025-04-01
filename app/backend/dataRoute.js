import express from "express";
import path from "path";
import { DB } from "./databaseFunctions.js";

const router = express.Router();

const db = new DB();
await db.connect(path.resolve("data", "finance_data.db"));

// Test CSV
router.get("/test", async (req, res) => {
  try {
    // Execute the query and get the result
    const result = await db.query("SELECT * FROM cash_flow LIMIT 2");

    // Send the result as JSON
    res.json(result); // Send the result as a JSON response
  } catch (err) {
    // Handle any errors
    console.error("Error executing query:", err);
    res.status(500).json({ error: "An error occurred while querying the database." });
  }
});

export default router;
