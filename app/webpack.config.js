// ES6 JS required
import path from "path";

// Standard webpack export object
const webpackOptions = {
  // Runs relative to webpack location
  entry: "./frontend/src/index.js",
  output: {
    filename: "frontend.js",
    // Runs relative to webpack location
    path: path.resolve("./", "frontend", "public", "dist"),
  },
  resolve: {
    extensions: [".js"],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  mode: "development",
};

// Export webpack options
export default webpackOptions;
