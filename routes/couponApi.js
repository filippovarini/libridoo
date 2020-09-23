const express = require("express");
const router = express.Router();

const Coupon = require("../models/Coupons");
const User = require("../models/Users");

// get coupon
router.get("/:university", (req, res) => {
  Coupon.find({ university: req.params.university })
    .then(coupon => {
      if (coupon.length !== 0) res.json({ code: 0, coupon });
      else res.json({ code: 1, message: "coupon not found" });
    })
    .catch(error => res.json({ code: 1, place: ".find()", error }));
});

// get coupon code
router.get("/code/:code", (req, res) => {
  Coupon.find({ code: req.params.code })
    .then(coupon => {
      if (coupon.length !== 0) res.json({ code: 0, coupon });
      else res.json({ code: 1, message: "coupon not found" });
    })
    .catch(error => res.json({ code: 1, place: ".find()", error }));
});

// post coupon
// {code, university}
router.post("/save", (req, res) => {
  const coupon = new Coupon(req.body);
  coupon
    .save()
    .then(coupon => {
      if (coupon) res.json({ code: 0, coupon });
      else res.json({ code: 1, message: "error in saving" });
    })
    .catch(error => res.json({ code: 1, place: ".save()", error }));
});

// update coupon
// {code, total}
router.post("/update", async (req, res) => {
  console.log(req.body.userId);
  Coupon.find({ code: req.body.code })
    .then(async coupon => {
      if (coupon.length !== 0) {
        // correct
        // check if user has already inputted coupon
        const user = await User.findById(req.body.userId);

        if (user.error) {
          // error
          res.json({ code: 1, message: "Nessun utente trovato" });
        } else {
          let coupons = user.coupons;
          if (coupons.includes(req.body.code)) {
            // already used
            res.json({ code: 1, message: "Codice già utilizzato" });
          } else {
            // not used
            coupons.push(req.body.code);
            const counter = coupon[0].counter + 1;
            const average =
              (coupon[0].average * coupon[0].counter + req.body.total) /
              counter;
            Coupon.findByIdAndUpdate(
              coupon[0]._id,
              { average, counter },
              { new: true }
            )
              .then(coupon => {
                // retreive user and update the list of coupons
                // update user
                if (coupon) {
                  console.log(coupons);
                  User.findByIdAndUpdate(
                    req.body.userId,
                    { coupons },
                    { new: true }
                  ).then(user => {
                    console.log(user);
                    res.json({ code: 0, coupon });
                  });
                } else res.json({ code: 1, place: ".findByIdAndUpdate()" });
              })
              .catch(error =>
                res.json({
                  code: 1,
                  place: ".findByIdAndUpdate()",
                  message: "Nessun coupon trovato",
                  error
                })
              );
          }
        }
      } else res.json({ code: 1, message: "Nessun coupon trovato" });
    })
    .catch(error => res.json({ code: 1, place: ".find()", error }));
});

// delete coupon
// {university}
router.delete("/", (req, res) => {
  Coupon.deleteOne(req.body)
    .then(coupon => {
      if (coupon) res.json({ code: 0, coupon });
      else res.json({ code: 1 });
    })
    .catch(e => res.json({ code: 1, e }));
});

router.delete("/many", (req, res) => {
  Coupon.deleteMany({})
    .then(() => {
      res.json({ code: 0 });
    })
    .catch(error => {
      res.json({ code: 1, error });
    });
});

module.exports = router;
