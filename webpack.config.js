const path = require("path");


module.exports = {
  entry: {
    app: "./src/server.js"
  },
  mode: "production",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "server.js"
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".js"]
  },
  target: "node"
};
