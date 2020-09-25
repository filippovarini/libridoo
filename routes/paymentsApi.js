const express = require("express");
const nodemailer = require("nodemailer");
const paypal = require("paypal-rest-sdk");

// stripe
// secret
const stripe_secret = require("../config/keys").STRIPE_SECRET;
const stripe = require("stripe")(stripe_secret);

// paypal
paypal.configure({
  mode: "live", //sandbox or live
  client_id: require("../config/keys").PAYPAL_ID,
  client_secret: require("../config/keys").PAYPAL_SECRET
});

// nodemailer
const EMAIL_PASS = require("../config/keys").EMAIL_PASS;

// models
const Deal = require("../models/Deals");
const Error = require("../models/Errors");
const User = require("../models/Users");
const SoldBooksClusters = require("../models/SoldBooksClusters");
const Book = require("../models/Books");

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

// get login link
router.get("/dashboard/:id", async (req, res) => {
  const connectedAccount = req.params.id;
  const redirect_url =
    process.env.NODE_ENV === "production"
      ? "https://www.libridoo.it"
      : "http://localhost:3000";
  stripe.accounts
    .createLoginLink(connectedAccount, {
      redirect_url
    })
    .then(link => {
      res.json({ code: 0, link });
    })
    .catch(error => {
      console.log("error", error);
      res.json({ code: 1, place: ".loginLink/catch", error });
    });

  // if (link.error) res.json({ code: 1, error });
  // else res.json({ code: 0, link });
});

// savePayPal Purchase
router.get("/savePayPal/:dealId/:total", (req, res) => {
  const return_url =
    process.env.NODE_ENV === "production"
      ? `https://www.libridoo.it/paymentConfirm/${req.params.dealId}`
      : `http://localhost:3000/paymentConfirm/${req.params.dealId}`;

  const cancel_url =
    process.env.NODE_ENV === "production"
      ? `https://www.libridoo.it/paymentConfirm/cancel/${req.params.dealId}`
      : `http://localhost:3000/paymentConfirm/cancel/${req.params.dealId}`;

  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "EUR",
          total: req.params.total
        }
      }
    ]
  };

  paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
    if (error) {
      console.log(error);
      res.redirect(cancel_url);
    } else {
      // res.json({ code: 7, payment });

      res.redirect(return_url);
    }
  });
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
  const return_url =
    process.env.NODE_ENV === "production"
      ? `https://www.libridoo.it/paymentConfirm/${req.body.dealId}/${req.body.total}`
      : `http://localhost:5050/api/payment/savePayPal/${req.body.dealId}/${req.body.total}`;

  const cancel_url =
    process.env.NODE_ENV === "production"
      ? `https://www.libridoo.it/paymentConfirm/cancel/${req.body.dealId}`
      : `http://localhost:3000/paymentConfirm/cancel/${req.body.dealId}`;

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

          if (!approval_url) {
            res.json({ code: 1, error: "no approval url", payment });
          } else {
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
          $inc: { bonusPoints: -10 }
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
router.post("/connect", (req, res) => {
  stripe.accounts
    .create({
      type: "express",
      business_type: "individual",
      country: "IT",
      default_currency: "EUR",
      business_profile: {
        product_description: "libri usati",
        mcc: 5192,
        url: null
      }
    })
    .then(account => {
      // successful
      if (!account.id) {
        res.json({
          code: 1,
          message: "no account id",
          place: "/paymentApi:133"
        });
      } else {
        const refresh_url =
          process.env.NODE_ENV === "production"
            ? `https://www.libridoo.it/${req.body.pathname}/refreshed`
            : `http://localhost:3000/${req.body.pathname}/refreshed`;

        const return_url =
          process.env.NODE_ENV === "production"
            ? `https://www.libridoo.it/${req.body.pathname}/confirmed/${account.id}`
            : `http://localhost:3000/${req.body.pathname}/confirmed/${account.id}`;

        stripe.accountLinks
          .create({
            account: account.id,
            refresh_url,
            return_url,
            type: "account_onboarding"
          })
          .then(accountLinks => {
            if (!accountLinks.url)
              res.json({
                code: 1,
                message: "no account link",
                place: "/paymentApi:153"
              });
            else res.json({ code: 0, url: accountLinks.url });
          })
          .catch(error => res.json({ code: 1, error }));
      }
    })
    .catch(error => {
      // error in account
      res.json({ code: 1, place: "stripe.accounts.create/catch", error });
    });
});

router.post("/transfer", async (req, res) => {
  // hold 10% commission
  // set total
  let amount = req.body.total * 100 - req.body.total * 10;

  // set date for confirmmonth
  const date = new Date();
  const month = `${date.getMonth() + 1}/${date.getFullYear()}`;

  // fetch clusters sold by that user
  const clusters = await SoldBooksClusters.find({
    sellerId: req.body.sellerId,
    monthConfirmation: month
  });

  if (clusters.length === 0) {
    // no transaction in that month, hold 1euro

    amount -= 200;
  }

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
        console.log(error);
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
        // // verify connection configuration

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
        res.json({
          code: 1,
          insufficient: true,
          message:
            "Qualcosa è andato storto nel pagamento del venditore. Controlla di avere una connessione stabile e riprova più tardi. Se il problema persiste, non esitare a conttatarci."
        });
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

// send transfer
// {email, total sellerId}
router.post("/paypalTransfer", async (req, res) => {
  const date = new Date();
  const month = `${date.getMonth() + 1}/${date.getFullYear()}`;

  // total price
  const total = Number(req.body.total);
  // hold 10% transactions
  let amount = (total * 100 - total * 10) / 100;

  // fetch clusters sold by that user
  const clusters = await SoldBooksClusters.find({
    sellerId: req.body.sellerId,
    monthConfirmation: month
  });

  if (clusters.length === 0) {
    // no transaction in that month, hold 1euro

    amount -= 1;
  }

  const sender_batch_id = new Date().getTime();

  const create_payout_json = {
    sender_batch_header: {
      sender_batch_id: sender_batch_id,
      email_subject: "Pagamento da Libridoo",
      email_message: "Buone notizie, abbiamo grana per te!"
    },
    items: [
      {
        recipient_type: "EMAIL",
        amount: { value: amount, currency: "EUR" },
        receiver: req.body.email,

        note: `Pagamento per l'ordine ${req.body.clusterId}`,
        sender_item_id: new Date().getTime(),
        notification_language: "it-IT"
      }
    ]
  };

  // const sync_mode = "true";

  paypal.payout.create(create_payout_json, function(error, payout) {
    if (error) {
      if (error.response.name === "INSUFFICIENT_FUNDS") {
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
        // // verify connection configuration

        transporter.sendMail(
          {
            from: '"Libridoo" <info@libridoo.it>',
            to: "errors.libridoo@gmail.com",
            subject: "Critical Error",
            text: "Balance insufficiennt PayPal",
            html: `Happened on the: ${date} at ${date.getHours()}: ${date.getMinutes()},
          <br /><br />
          Ammount due: ${amount}, seller connected email  = ${req.body.email}`
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
        res.json({
          code: 1,
          insufficient: true,
          message:
            "Qualcosa è andato storto nel pagamento del venditore. Controlla di avere una connessione stabile e riprova più tardi. Se il problema persiste, non esitare a conttatarci."
        });
      } else
        res.json({
          code: 1,
          insufficient: false,
          place: "paymentApi:471",
          message:
            "Qualcosa è andato storto nel pagamento del venditore. Controlla di avere una connessione stabile e riprova più tardi. Se il problema persiste, non esitare a conttatarci.",
          error
        });
      // throw error;
    } else {
      // success
      res.json({
        code: 0,
        transfered: amount
      });
    }
  });
});

// delete deals and checkout
// {dealId}
router.delete("/failure", (req, res) => {
  const dealId = req.body.dealId;
  Deal.findByIdAndDelete(dealId)
    .then(() => {
      SoldBooksClusters.find({ dealId })
        .then(clusters => {
          clusters.forEach(cluster => {
            SoldBooksClusters.findByIdAndDelete(cluster._id)
              .then(deletedCluster => {
                if (clusters.indexOf(cluster) === clusters.length - 1) {
                  // success
                  res.json({ code: 0 });
                }
              })
              .catch(error => {
                console.log(error);
                res.json({ code: 1, place: ".find...Delete:357" });
              });
          });
        })
        .catch(error => {
          console.log(error);
          res.json({ code: 1, place: ".find() 353" });
        });
    })
    .catch(error => {
      console.log(error);
      res.json({ code: 1, place: "find..Update:350" });
    });
});

// delete books upon success
// dealId
router.delete("/success", (req, res) => {
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

  SoldBooksClusters.find({ dealId: req.body.dealId })
    .then(clusters => {
      console.log(clusters);
      clusters.forEach(async cluster => {
        console.log(clusters.indexOf(cluster));
        // send email
        // calculate total price
        let clusterPrice = 0;
        cluster.Books.forEach(book => (clusterPrice += book.price));
        // send email to seller
        const transporter = nodemailer.createTransport(options);

        // // send mail with defined transport object
        transporter.sendMail(
          {
            from: '"Libridoo" <sales@libridoo.it>',
            to: cluster.sellerInfo.email,
            subject: "Libri Venduti",
            // text: "Ciao!",
            html: `Caro ${cluster.sellerInfo.name.split(" ")[0] || "utente"},
                      <br /><br />
                      Abbiamo buone notizie!!
                      <br />
                      Hai appena venduto ${cluster.Books.length} libr<span>${
              cluster.Books.length === 1 ? "o" : "i"
            }</span> a ${
              cluster.buyerInfo.name
            }, per un totale di ${clusterPrice}
                      euro.<br />
                      ${
                        cluster.delivery.choosen
                          ? `<span>${cluster.buyerInfo.name} vive in zona ${
                              cluster.buyerInfo.place.city
                            }, ${
                              cluster.buyerInfo.place.region
                            }, ed ha chiesto di riceverli via spedizione,
                      pagandoti un extra di ${
                        cluster.delivery.cost
                      } euro, come da te specificato.<br />
                      Il totale, dunque, ammonta a € ${clusterPrice +
                        cluster.delivery
                          .cost}<br/>Per supportare spese di gestione, Libridoo chiede il 10% ai venditori. Dunque incasserai <b>€ ${clusterPrice +
                              cluster.delivery.cost -
                              Math.round(
                                (clusterPrice + cluster.delivery.cost) * 100
                              ) /
                                1000}</b></span>`
                          : `
                          Il totale, dunque, ammonta a € ${clusterPrice}<br/>Per supportare spese di gestione, Libridoo chiede il 10% ai venditori. Dunque incasserai <b>€ ${clusterPrice -
                              Math.round(clusterPrice * 100) / 1000}</b></span>`
                      }
                      </b><br/><br />
                      Adesso,<br />
                      tutto quello che devi fare per <b>ricevere i soldi</b>, è consegnare i libri al
                      compratore. Una volta fatto, ricordagli di confermare la consegna per ricevere il pagamento.
                      <br/><br/>
                      ${
                        cluster.sellerInfo.payOut.type === "stripe"
                          ? `Hai scelto di ricevere i soldi via bonifico. Quando il venditore conferma la consegna, ti arrivarà una email da stripe.com con un link per ricevere i soldi. Per trasferirli sul tuo conto in banca, <b>verifica il tuo conto stripe</b> direttamente su www.stripe.com oppure accedendo da Libridoo e cliccando su "PAGAMENTI".<br/>L'oridne viene confermato quando il compratore conferma la consegna. Se questo è il primo ordine confermato del mese, verrai accreditato due euro in meno, per coprire i costi di pagamento via bonifico.`
                          : `Hai scelto di ricevere i soldi su PayPal. Quando il venditore conferma la consegna, ti arriverà una email da PayPal.com con il link per riceverli. <b>Assicurati di controllare la tua casella email connessa all'account Libridoo.</b><br/>L'ordnie viene confermato quando il compratore conferma la consegna. Se questo è il primo ordine confermato del mese, verrai accreditato un euro in meno, per coprire i costi di PayPal.`
                      }
                        Ecco le informazioni di ${
                          cluster.buyerInfo.name
                        }, accordati con lui per
                        l'incontro o spedizione.
                      </p>
                      <div style="margin-top: 30px">
                        <p
                          style="margin: 0px; margin-left: 10px; margin-bottom: 5px; font-size: 1.4rem;"
                        >
                          ${cluster.buyerInfo.name}${
              cluster.delivery.choosen
                ? `<span style="font-size: 1.2rem">, da spedire (già pagata)</span>`
                : ""
            }
                        </p>
                        <div
                          style="border: 1px solid black; display: flex; justify-content: space-between;"
                        >
                          <div style="border: 1px solid black; width: 50%;">
                            <p
                              style="border-bottom: 1px solid black; text-align: center; margin: 5px; font-size: 1.2rem;"
                            >
                              Libri Comprati
                            </p>
                            <ul>
                              ${cluster.Books.map(book => {
                                return `<li key=${book._id}>${book.title}</li>`;
                              }).join("")}
                            </ul>
                          </div>
                          <div style="border: 1px solid black; width: 50%; min-width: 50%;">
                            <p
                              style="border-bottom: 1px solid black; text-align: center; margin: 5px; font-size: 1.2rem;"
                            >
                              Contatti
                            </p>
                            <ul>
                              <li>
                                ${cluster.buyerInfo.email}
                              </li>
                              <li>
                              ${cluster.buyerInfo.phone}
                              </li>
                              <li>
                              ${cluster.buyerInfo.place.city}, ${
              cluster.buyerInfo.school
            }
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>       
                      <br/><br/><br/>
                      Cordiali Saluti,<br/>Il team di <i>Libridoo</i>`
          },
          async (error, info) => {
            if (error) {
              console.log(error);
              const newError = new Error({
                error: {
                  message: "EMAIL NOT SENT, checkout, email al compratore",
                  error
                }
              });
              await newError.save();
            } else {
              console.log("emailsent", info);
            }
          }
        );

        // delete books
        cluster.Books.forEach(async book => {
          await Book.findByIdAndDelete(book._id);
        });

        // end
        if (clusters.indexOf(cluster) === clusters.length - 1) {
          // finish, just send email to seller
          console.log("end");
          const transporter = nodemailer.createTransport(options);

          // // send mail with defined transport object
          await transporter.sendMail(
            {
              from: '"Libridoo" <sales@libridoo.it>',
              to: req.body.buyerInfo.email,
              subject: "Ordine completato!",
              // text: "Ciao!", OK WITHOUT TEXT??
              html: `Caro ${req.body.buyerInfo.name.split(" ")[0] || "utente"},
            <br /><br />
            Ti ringraziamo per aver scelto <i>Libridoo</i> per comprare i libri di cui
            avevi bisogno, speriamo ti sia trovato bene con noi.
            <br />
            Il codice del tuo ordine è <b>${req.body.dealId}</b>.
            <br /><br />
            Per ricevere i libri, adesso, contatta i venditori per farti consegnare i
            libri.
            Non ti preoccupare, i venditori sono stati informati e seguiranno le
            istruzioni fino a quando il libro sarà nelle tue mani.
            <br />
            Una volta ricevuti i libri da un venditore, ricordati di <b>confermare la
            consegna</b>, così da permettere al venditore di ricevere i soldi.
            <br />
            Per farlo vai su: <span style="font-weight: bold; color: gray">Libridoo > Ordini</span> e clicca il pulsante "CONFERMA" in basso a destra
            <br/>
            <p style="font-size: 1.2rem">
              Ecco i contatti dei venditori:
            </p>
            ${req.body.soldBooksClusters.map(cluster => {
              return `<div style="margin-top: 30px" key=${cluster.sellerId}>
              <p
                style="margin: 0px; margin-left: 10px; margin-bottom: 5px; font-size: 1.4rem;"
              >
               ${cluster.sellerInfo.name}${
                cluster.delivery.choosen
                  ? "<span style='font-size: 1.2rem'>, con spedizione</span>"
                  : ""
              }
              </p>
              <div
                style="border: 1px solid black; display: flex; justify-content: space-between;"
              >
                <div style="border: 1px solid black; width: 50%;">
                  <p
                    style="border-bottom: 1px solid black; text-align: center; margin: 5px; font-size: 1.2rem;"
                  >
                    Libri selezionati
                  </p>
                  <ul>
                  ${cluster.Books.map(book => {
                    return `<li key=${book._id}>${book.title}</li>`;
                  }).join("")}
                  </ul>
                </div>
                <div style="border: 1px solid black; width: 50%;">
                  <p
                    style="border-bottom: 1px solid black; text-align: center; margin: 5px; font-size: 1.2rem;"
                  >
                    Contatti
                  </p>
                  <ul>
                    <li>
                      ${cluster.sellerInfo.email}
                    </li>
                    <li>
                      ${cluster.sellerInfo.phone}
                    </li>
                    <li>
                      ${cluster.sellerInfo.place.city}, ${
                cluster.sellerInfo.school
              }
                    </li>
                  </ul>
                </div>
              </div>
            </div>`;
            })}
            <br/><br/><br/><br/>
            Saluti,
            <br />
            Il team di <i>Libridoo</i>`
            },
            async (error, info) => {
              if (error) {
                console.log(error);
                const newError = new Error({
                  error: {
                    message: "EMAIL NOT SENT, checkout, email al compratore",
                    error
                  }
                });
                await newError.save();
              } else {
                console.log("emailsent", info);
              }
            }
          );
          res.json({ code: 0 });
        }
      });
    })
    .catch(error => {
      console.log(error);
      res.json({ code: 1, place: "/.find(), paymentAP:385", error });
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
