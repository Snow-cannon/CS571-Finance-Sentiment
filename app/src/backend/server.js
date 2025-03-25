import express from "express";
import cors from "cors";
import path from "path";

// Create server
const app = express();

// Set up path information
const staticRoot = path.join("src", "frontend");
const dataRoot = path.join("src", "data");

// Allow static file serving (serves all static files in the "frontend" directory)
app.use(express.static(staticRoot));
app.use(express.static(dataRoot));

// Enable CORS
app.use(cors());

// Homepage (serves the HTML page)
app.get("/", (req, res) => {
  const options = {
    root: staticRoot,
  };

  res.sendFile("index.html", options);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
