const express = require("express");

// router
const router = express.Router();

const Book = require("../models/Books");
const User = require("../models/Users");
const Error = require("../models/Errors");
const SoldBooksCluster = require("../models/SoldBooksClusters");
const Spam = require("../models/Spam");
const notFound = require("../models/notFound");

// get total transfered, total books, total delivery
router.get("/paypal/payout/mean", (req, res) => {
  SoldBooksCluster.find()
    .then(clusters => {})
    .catch(error => {
      console.log(error);
    });
});
