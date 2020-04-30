const express = require("express");

// models
const Deal = require("../models/Deals");

// router
const router = express.Router();

// look for deals
router.get("/check/:_id", (req, res) => {
  Deal.findById(req.params._id)
    .then(deal => {
      if (deal) {
        res.json({ code: 0, deal });
      } else {
        res.json({
          code: 2,
          message: "Nessun pagamento trovato",
          place: ".findById(), paymentApi:11"
        });
      }
    })
    .catch(error =>
      res.json({
        code: 1,
        error,
        place: ".findById(), paymentApi:11",
        message: "Qualcosa è andato storto nel salvataggio del tuo pagamento"
      })
    );
});

// buyerId / [sellerIds] / bill: {delivery / books / count }
router.post("/buy", (req, res) => {
  const totalCommission = 1.5 * Number(req.body.bill.count);
  const total =
    Number(req.body.bill.books) +
    Number(req.body.bill.delivery) +
    totalCommission;
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
      res.json({
        code: 1,
        place: ".save(), paymentApi:50",
        error,
        message: "Qualcosa è andato storto nel slvataggio del tuo pagamento"
      });
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
