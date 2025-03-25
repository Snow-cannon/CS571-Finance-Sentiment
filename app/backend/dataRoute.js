import express from "express";
import path from "path";

const router = express.Router();

// Route for data files
const dataRoot = path.join("data");

// For serving static data files
router.use(express.static(dataRoot));

// Test CSV
router.get("/test", (req, res) => {
  const options = {
    root: dataRoot,
  };

  res.sendFile("test.csv", options);
});

export default router;
