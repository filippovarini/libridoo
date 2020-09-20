const express = require("express");
const nodemailer = require("nodemailer");
const paypal = require("paypal-rest-sdk");

// stripe
const stripe = require("stripe")(
  "sk_test_51HT5a3Bfsl1QGy9mM3Mch4AqaKnx3bBzAzoZreRmU7L5YJwAKBzusvsUI7c1HBAe2YtEAEA4V19JXFhI4CIG4B8T00aDxrpJv1"
);

// paypal
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AQ0Ml0BUMXNaPb7XCAo-Jq-3PzmFm5W_NDp4h3VM64NZcMrlEjywGlMs17Lw1hdbLiJkzpz9j4yZyQzw",
  client_secret:
    "EDcIti9g8G3TRgiDbaHFGZ3SQpdockudgkDC0vI6K4-1u-1V6XrHaDmXL-XghZ563OBXjgj8JLEW_j4r"
});

// nodemailer
const EMAIL_PASS = require("../config/keys").EMAIL_PASS;

// models
const Deal = require("../models/Deals");
const Error = require("../models/Errors");
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

// paypal link
// {total, dealId}
router.post("/paypal", (req, res) => {
  console.log("route");
  const return_url =
    process.env.NODE_ENV === "production"
      ? `https://www.libridoo.it/paymentConfirm/${req.body.dealId}`
      : `http://localhost:3000/paymentConfirm/${req.body.dealId}`;

  const cancel_url =
    process.env.NODE_ENV === "production"
      ? `https://www.libridoo.it/paymentConfirm/cancel/${req.body.dealId}`
      : `http://localhost:3000/paymentConfirm/cancel/${req.body.dealId}`;

  console.log(return_url, cancel_url);

  let create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal"
    },
    redirect_urls: {
      return_url,
      cancel_url
    },
    transactions: [
      {
        amount: {
          currency: "EUR",
          total: req.body.total
        },

        description: "Acquisto di libri su Libridoo"
      }
    ]
  };

  const profile_name = new Date().getTime();

  const create_web_profile_json = {
    name: profile_name,
    presentation: {
      brand_name: "Libridoo",
      logo_image:
        "https://libridoocovers.s3.us-west-1.amazonaws.com/1600526996557",
      locale_code: "IT"
    },
    input_fields: {
      allow_note: true,
      no_shipping: 1,
      address_override: 1
    },
    flow_config: {
      landing_page_type: "billing",
      bank_txn_pending_url: "http://www.yeowza.com"
    }
  };

  paypal.webProfile.create(create_web_profile_json, function(
    error,
    web_profile
  ) {
    if (error) {
      console.log(error);
    } else {
      console.log("webprofile success");
      //Set the id of the created payment experience in payment json
      var experience_profile_id = web_profile.id;
      create_payment_json.experience_profile_id = experience_profile_id;

      paypal.payment.create(create_payment_json, function(error, payment) {
        if (error) {
          console.log(error);
          res.json({ code: 1, error });
        } else {
          let approval_url = null;
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === "approval_url") {
              approval_url = payment.links[i].href;
            }
          }
          console.log(approval_url);
          if (!approval_url) {
            console.log("faliure");
            res.json({ code: 1, error: "no approval url", payment });
          } else {
            console.log("success");
            res.json({ code: 0, approval_url });
          }
        }
      });
    }
  });
});

// buyerId / [sellerIds] / bill: {delivery / books / commission / discount, total}
// sent from checkout. 1) Do transition 2) Post newDeal 3) PaymentConfirm
router.post("/buy", (req, res) => {
  // save this payment only after payment successful!!!

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

// create connected account
// {_id}
router.post("/connect", async (req, res) => {
  const account = await stripe.accounts.create({
    type: "express",
    business_type: "individual",
    country: "IT",
    default_currency: "EUR",
    business_profile: {
      product_description: "libri usati",
      mcc: 5192,
      url: null
    }
  });

  if (!account.id) {
    res.json({ code: 1, message: "no account id", place: "/paymentApi:133" });
  }

  const refresh_url =
    process.env.NODE_ENV === "production"
      ? `https://www.libridoo.it/${req.body.pathname}/refreshed`
      : `http://localhost:3000/${req.body.pathname}/refreshed`;

  const return_url =
    process.env.NODE_ENV === "production"
      ? `https://www.libridoo.it/${req.body.pathname}/confirmed/${account.id}`
      : `http://localhost:3000/${req.body.pathname}/confirmed/${account.id}`;

  const accountLinks = await stripe.accountLinks.create({
    account: account.id,
    refresh_url,
    return_url,
    type: "account_onboarding"
  });

  if (!accountLinks.url)
    res.json({ code: 1, message: "no account link", place: "/paymentApi:153" });
  else res.json({ code: 0, url: accountLinks.url });
});

router.post("/transfer", async (req, res) => {
  console.log("sendingf");
  const amount = req.body.total * 100 - req.body.total * 10;
  console.log(amount);
  stripe.transfers
    .create({
      amount,
      currency: "EUR",
      destination: req.body.accountId
    })
    .then(transfer => {
      console.log(transfer);
      // assume then means success
      res.json({
        code: 0,
        accountId: req.body.accountId,
        transfered: amount
      });
    })
    .catch(error => {
      if (error.raw.code === "balance_insufficient") {
        const date = new Date();
        // balance insufficient
        const options = {
          service: "Godaddy",
          auth: {
            user: "info@libridoo.it",
            pass: EMAIL_PASS
          },
          tls: {
            ciphers: "SSLv3",
            rejectUnauthorized: false
          }
        };
        const transporter = nodemailer.createTransport(options);
        // verify connection configuration

        transporter.sendMail(
          {
            from: '"Libridoo" <info@libridoo.it>',
            to: "errors.libridoo@gmail.com",
            subject: "Critical Error",
            text: "Balance insufficiennt",
            html: `Happened on the: ${date} at ${date.getHours()}: ${date.getMinutes()},
          <br /><br />
          Ammount due: ${amount}, seller connected account id = ${
              req.body.accountId
            }`
          },
          async (error, info) => {
            if (error) {
              console.log("error", error);
              const newError = new Error({
                error: { message: "EMAIL NOT SENT, confirmEmail", error }
              });
              await newError.save();
            } else {
              console.log("emailsent", info);
            }
          }
        );
        res.json({ code: 1, insufficient: true });
      } else
        res.json({
          code: 1,
          insufficient: false,
          place: "paymentApi:214",
          message:
            "Qualcosa è andato storto nel pagamento del venditore. Controlla di avere una connessione stabile e riprova più tardi. Se il problema persiste, non esitare a conttatarci.",
          error
        });
    });
});

// delete deals and checkout
// {dealId, [clusterIds]}
router.delete("/failure", async (req, res) => {
  Deal.findByIdAndDelete(req.body.dealId);
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
