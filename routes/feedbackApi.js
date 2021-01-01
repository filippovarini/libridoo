const express = require("express");
const router = express.Router();

const User = require("../models/Users");
const Rating = require("../models/Ratings");
const Comment = require("../models/Comments");
const Error = require("../models/Errors");
const Spam = require("../models/Spam");

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
// rating / _id
router.post("/rating", (req, res) => {
  const newRating = new Rating({
    rating: req.body.rating
  });
  //   save to DB
  newRating
    .save()
    .then(rating => {
      // update user
      User.findByIdAndUpdate(req.body._id, { vote: req.body.rating })
        .then(user => {
          if (!user) {
            res.json({
              code: 1.5,
              message: "Nessun utente trovato con questo id",
              place: ".findByIdAndUpdate(), feedbackApi:36"
            });
          } else {
            res.json({ code: 0 });
          }
        })
        .catch(error => {
          res.json({
            code: 1,
            place: ".findByIdAndUpdate(), feedbackApi:36",
            message: "Qualcosa è andato storto nel salvataggio del giudizio",
            error
          });
        });
    })
    .catch(error => {
      res.json({
        code: 1,
        place: ".save(), feedbackApi:33",
        message: "Qualcosa è andato storto nel salvataggio del giudizio",
        error
      });
    });
});

// post Comment
// _id / comment
router.post("/comment", (req, res) => {
  const newComment = new Comment({
    comment: req.body.comment,
    userId: req.body.userId
  });
  // save to DB
  newComment
    .save()
    .then(comment => {
      User.findByIdAndUpdate(req.body._id, { hasJudged: true })
        .then(user => {
          if (!user) {
            res.json({
              code: 1.5,
              message: "Nessun utente trovato con questo id",
              place: ".findByIdAndUpdate(), feedbackApi:78"
            });
          } else {
            res.json({ code: 0 });
          }
        })
        .catch(error => {
          res.json({
            code: 1,
            place: ".findByIdAndUpdate(), feedbackApi:78",
            message: "Qualcosa è andato storto nel salvataggio del giudizio",
            error
          });
        });
    })
    .catch(error => {
      res.json({
        code: 1,
        place: ".save(), feedbackApi:76",
        message: "Qualcosa è andato storto nel salvataggio del giudizio",
        error
      });
    });
});

// post error
router.post("/error", (req, res) => {
  const newError = new Error({ error: req.body });
  newError
    .save()
    .then(() => {
      res.json({ code: 0 });
    })
    .catch(error => res.json({ code: 1, place: ".save()", error }));
});

// delete all errors
router.delete("/error", (req, res) => {
  Error.deleteMany({})
    .then(() => {
      res.json({ code: 0 });
    })
    .catch(error => {
      res.json({ code: 1, error });
    });
});

// delete all comments
router.delete("/comments", (req, res) => {
  Comment.deleteMany({})
    .then(() => {
      res.json({ code: 0 });
    })
    .catch(error => {
      res.json({ code: 1, error });
    });
});

// delete all rating
router.delete("/rating", (req, res) => {
  Rating.deleteMany({})
    .then(() => {
      res.json({ code: 0 });
    })
    .catch(error => {
      res.json({ code: 1, error });
    });
});

// delete all spam insertions
router.delete("/spam", (req, res) => {
  Spam.deleteMany({})
    .then(() => {
      res.json({ code: 0 });
    })
    .catch(error => {
      res.json({ code: 1, error });
    });
});

module.exports = router;
