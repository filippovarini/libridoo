const express = require("express");
const router = express.Router();

const Rating = require("../models/Ratings");
const Comment = require("../models/Comments");

// get Avg Rating
router.get("/rating", (req, res) => {
  Rating.find()
    .then(ratings => {
      let sum = 0;
      ratings.forEach(rating => {
        sum += rating.rating;
      });
      const avg = sum / ratings.length;
      res.json({ code: 0, avgRating: avg });
    })
    .catch(error => {
      res.json({ code: 1, error });
    });
});

// post Rating
router.post("/rating", (req, res) => {
  const newRating = new Rating({
    rating: req.body.rating
  });
  //   save to DB
  newRating
    .save()
    .then(rating => {
      res.json({ code: 0, rating });
    })
    .catch(error => {
      res.json({ code: 1, error });
    });
});

// post Comment
router.post("/comment", (req, res) => {
  const newComment = new Comment({
    comment: req.body.comment,
    userId: req.body.userId
  });
  // save to DB
  newComment
    .save()
    .then(comment => {
      res.json({ code: 0, comment });
    })
    .catch(error => {
      res.json({ code: 1, error });
    });
});

module.exports = router;
