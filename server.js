const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// routers
const FeedbackRouter = require("./routes/feedbackApi");
const UserRouter = require("./routes/userApi");
const BookRouter = require("./routes/bookApi");
const PaymentsRouter = require("./routes/paymentsApi");
const CouponRouter = require("./routes/couponApi");
var redirectToHTTPS = require("express-http-to-https").redirectToHTTPS;

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
    console.log("error", error);
  });

// initialize
const app = express();

// middlewares
app.use(redirectToHTTPS([/localhost:(\d{4})/], [/\/insecure/]));
app.use(bodyParser.json());
app.use("/api/feedback", FeedbackRouter);
app.use("/api/user", UserRouter);
app.use("/api/book", BookRouter);
app.use("/api/payment", PaymentsRouter);
app.use("/api/coupon", CouponRouter);

// rendering static assets
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
