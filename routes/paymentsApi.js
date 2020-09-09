const express = require("express");

// stripe
const stripe = require("stripe")("sk_test_ATOs31AJKZnuM1ijWJHdyYak00PdSpKYBJ");

// models
const Deal = require("../models/Deals");
const User = require("../models/Users");
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

router.post("/paymentIntent", (req, res) => {
  amount = req.body.total * 100;
  stripe.paymentIntents
    .create({
      amount,
      currency: "EUR",
      payment_method_types: ["card"],
      transfer_group: Date.now()
    })
    .then(paymentIntent => {
      if (paymentIntent.client_secret)
        res.json({
          code: 0,
          client_secret: paymentIntent.client_secret,
          transfer_group: paymentIntent.transfer_group
        });
      else
        res.json({ code: 1, place: "paymentIntents.create(), paymentApi.47" });
    })
    .catch(error =>
      res.json({
        code: 1,
        place: "paymentIntents.create(), paymentApi.50",
        error
      })
    );
});

// buyerId / [sellerIds] / bill: {delivery / books / commission / discount, total}
// sent from checkout. 1) Do transition 2) Post newDeal 3) PaymentConfirm
router.post("/buy", (req, res) => {
  // save this payment only after payment successful!!!!
  console.log("post buy");
  console.log(req.body);
  const NewDeal = new Deal({
    buyerId: req.body.buyerId,
    sellerIds: req.body.sellerIds,
    bill: req.body.bill
  });
  NewDeal.save()
    .then(deal => {
      if (req.body.bill.discount) {
        // lessen user bonuspoints
        User.findByIdAndUpdate(req.body.buyerId, {
          $inc: { bonusPoints: -req.body.bill.discount }
        })
          .then(user => {
            if (user) {
              res.json({ code: 0, deal });
            } else {
              res.json({
                code: 1,
                place: ".findByIdAndUpdate()",
                message:
                  "Qualcosa è andato storto nel salvataggio del tuo pagamento"
              });
            }
          })
          .catch(erorr =>
            res.json({
              code: 1,
              place: ".findByIdAndUpdate()",
              message:
                "Qualcosa è andato storto nel salvataggio del tuo pagamento",
              error
            })
          );
      } else {
        res.json({ code: 0, deal });
      }
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
