import express from "express";
import cors from "cors";
import path from "path";
import dataRouter from "./dataRoute.js";

// Create server
const app = express();

// Set up path information
const staticRoot = path.join("frontend", "public");

// Allow static file serving (serves all static files in the "frontend" directory)
app.use(express.static(staticRoot));

const corsOptions = {
  origin: "https://cs571-finance-sentiment.onrender.com",
  methods: ["GET", "POST"],
  credentials: true,
};

// Attach the data serving routes
app.use("/data", dataRouter);

// Enable CORS
app.use(cors());

// Homepage (serves the HTML page)
app.get("/", (req, res) => {
  const options = {
    root: staticRoot,
  };

  res.sendFile(path.join("html", "index.html"), options);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
