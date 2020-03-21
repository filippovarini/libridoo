const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

// setup database
const db_secret = require("./config/keys").MONGO_URI;

// connect
mongoose
  .connect(db_secret, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("MongoDB connected...");
  })
  .catch(error => {
    console.log(error);
  });

// initialize
const app = express();

// rendering static assets
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    // res.sendFile(path.resolve(__dirname, "client", "public", "index.html"));
    res.sendFile(path.resolve(__dirname, "shit", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
