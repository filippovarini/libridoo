const express = require("express");

// models
const Deal = require("../models/Deals");

// router
const router = express.Router();

router.get("/check/:_id", (req, res) => {
  Deal.findById(req.params._id)
    .then(deal => {
      if (deal) {
        res.json({ code: 0, deal });
      } else {
        res.json({ code: 2, message: "no deal found" });
      }
    })
    .catch(error => res.json({ code: 1, error, place: ".findById()" }));
});

// buyerId / [sellerIds] / bill: {delivery / books / count }
router.post("/buy", (req, res) => {
  const totalCommission = 1.5 * req.body.bill.count;
  const total = req.body.bill.books + req.body.bill.delivery + totalCommission;
  const NewDeal = new Deal({
    buyerId: req.body.buyerId,
    sellerIds: req.body.sellerIds,
    bill: {
      delivery: req.body.bill.delivery,
      books: req.body.bill.books,
      total,
      commissions: totalCommission
    }
  });
  NewDeal.save()
    .then(deal => {
      res.json({ code: 0, deal });
    })
    .catch(error => {
      res.json({ code: 1, place: ".save()", error });
    });
});

// delete all deals
router.delete("/", (req, res) => {
  Deal.deleteMany()
    .then(() => {
      res.json({ code: 0, message: "Deals eliminati con successo" });
    })
    .catch(erorr => res.json({ code: 1, error }));
});

module.exports = router;
