const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const User = require("../models/Users");
const Book = require("../models/Books");
const Error = require("../models/Errors");
const Rating = require("../models/Ratings");

// email pass
const EMAIL_PASS = require("../config/keys").EMAIL_PASS;

const router = express.Router();

// secret
const JWT_SECRET = require("../config/keys").JWT_SECRET;

// get average rating
router.get("/rating/:_id", (req, res) => {
  User.findById(req.params._id)
    .then(user => {
      if (!user) {
        // has deleted account
        res.json({
          code: 1.5,
          message: "Nessun utente trovato con questo id",
          place: ".findById(), userApi:16"
        });
      } else {
        res.json({ code: 0, rating: user.rating });
      }
    })
    .catch(error => {
      console.log(error);
      res.json({
        code: 1,
        place: ".findById(), userApi:16",
        message: "Qualcosa è andato storto nel download del tuo rating",
        error
      });
    });
});

// send email to user with emailConfirm code
router.get("/emailConfirm/:email", (req, res) => {
  let confirmCode = Math.floor(Math.random() * 1000000);
  confirmCode = confirmCode.toString();

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
      from: '"Libridoo" <noReply@libridoo.it>',
      to: req.params.email,
      subject: "Conferma la tua Email",
      text: "Ciao!",
      html: `Gentile Utente,
    <br /><br />
    Il suo codice per confermare l'email è ${confirmCode}
    <br /><br /><br />
    Saluti,
    <br />
    <i>Il team di Libridoo</i>`
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
  bcrypt
    .hash(confirmCode, 10)
    .then(confirmCode => {
      res.json({ code: 0, hashedCode: confirmCode });
    })
    .catch(error => {
      res.json({
        code: 1,
        place: ".hash(), userApi:70",
        message:
          "Qualcosa è andato storto nella creazione di una nuova password",
        error
      });
    });
});

// check hashed code
// hashed / code
router.post("/emailConfirm/check", (req, res) => {
  bcrypt
    .compare(req.body.code, req.body.hashed)
    .then(response => res.json({ response }))
    .catch(error => {
      res.json({ code: 1, place: ".compeare(), userApi:89", error });
    });
});

// get user from JWT refresh
// token
router.post("/refresh", (req, res) => {
  const token = req.body.token;
  let user = {};
  try {
    user = jwt.verify(token, JWT_SECRET);
  } catch {
    res.json({
      code: 4,
      message: "La sessione di login è scaduta",
      place: ".verify(), userApi:102"
    });
  }

  User.findById(user._id)
    .then(user => {
      if (user) {
        const activeUser = user.toObject();
        delete activeUser.password;
        const JWT = jwt.sign(activeUser, JWT_SECRET, { expiresIn: "7d" });
        res.json({ code: 0, activeUser, JWT });
      } else {
        res.json({
          code: 1.5,
          message: "Nessun account registrato nella sessione fornita",
          devMessage: "No account in this jwt",
          place: ".findById(), userApi:111"
        });
      }
    })
    .catch(error => {
      console.log(error);
      res.json({
        code: 1,
        message: "Qualcosa è andato storto nella ricarica della pagina",
        place: ".findById(), userApi:111",
        error
      });
    });
});

// !!! always PASS EMAIL.toLowerCase() in REQ.BODY

// login
// email / password
router.post("/login", (req, res) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        bcrypt
          .compare(req.body.password, user.password)
          .then(response => {
            if (response) {
              const activeUser = user.toObject();
              delete activeUser.password;
              const JWT = jwt.sign(activeUser, JWT_SECRET, { expiresIn: "7d" });
              res.json({ code: 0, activeUser, JWT });
            } else {
              res.json({ code: 2, incorrect: "password" });
            }
          })
          .catch(error => {
            res.json({
              code: 1,
              place: ".compare(), userApi:147",
              message: "Qualcosa è andato storto nel login",
              error: "hashing"
            });
          });
      } else {
        res.json({ code: 2, incorrect: "email" });
      }
    })
    .catch(error => {
      res.json({
        code: 1,
        message: "Qualcosa è andato storto nel login",
        place: ".findOne(), userApi:143",
        error
      });
    });
});

// check email
// email
router.post("/register/check", (req, res) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        res.json({
          code: 2,
          message: "Email già registrata con un altro account"
        });
      } else {
        res.json({ code: 0 });
      }
    })
    .catch(error => {
      res.json({
        code: 1,
        place: ".findOne(), userApi:183",
        message: "Qualcosa è andato storto nel controllo dell'email",
        error
      });
    });
});

// register
// bonus update in here
// email / password / name / avatarImgURL / invitingUserId /
router.post("/register", (req, res) => {
  // User.findOne({ email: req.body.email })
  //   .then(user => {
  //     if (user) {
  //       res.json({
  //         code: 2,
  //         message: "Email già registrata con un altro account"
  //       });
  //     } else {
  bcrypt
    .hash(req.body.password, 10)
    .then(hashed => {
      const NewUser = new User({
        avatarImgURL: req.body.avatarImgURL,
        name: req.body.name,
        email: req.body.email,
        password: hashed,
        passwordLength: req.body.password.length
      });
      NewUser.save()
        .then(user => {
          const activeUser = user.toObject();
          delete activeUser.password;
          const JWT = jwt.sign(activeUser, JWT_SECRET, {
            expiresIn: "7d"
          });
          if (req.body.invitingUserId) {
            // update bonus points if invited
            // !!!AAA!!! for now, bonusPoints increment is 5, need to specify
            User.findByIdAndUpdate(req.body.invitingUserId, {
              $inc: { bonusPoints: 1 }
            })
              .then(() => {
                res.json({ code: 0, activeUser, JWT });
              })
              .catch(error => {
                res.json({
                  code: 3,
                  activeUser,
                  JWT,
                  place: ".findByIdAndUpdate(), userApi:236",
                  error
                });
              });
          } else {
            res.json({ code: 0, activeUser, JWT });
          }
        })
        .catch(error => {
          res.json({
            code: 1,
            place: ".save(), userApi:226",
            message: "Qualcosa è andato storto nella registrazione",
            error
          });
        });
    })
    .catch(error => {
      res.json({
        code: 1,
        place: ".hash(), userApi:217",
        message:
          "Qualcosa è andato storto nel salvataggio della password nella registrazione",
        error
      });
    });
  // }
  // })
  // .catch(error => {
  //   res.json({ code: 1, place: ".findOne()", error });
  // });
});

// update bodyInfo
// _id / defaultEmail / newBodyInfo : { email  / phone / school / schoolLogoUrl } (even if you don't have it, pass default)
router.put("/bodyInfo", (req, res) => {
  if (req.body.defaultEmail !== req.body.newBodyInfo.email) {
    User.find({ email: req.body.newBodyInfo.email })
      .then(users => {
        if (users.length >= 1) {
          res.json({
            code: 2,
            message: "Email già registrata con un altro account"
          });
        } else {
          User.findByIdAndUpdate(req.body._id, req.body.newBodyInfo, {
            new: true
          })
            .then(user => {
              const activeUser = user.toObject();
              delete activeUser.password;
              const JWT = jwt.sign(activeUser, JWT_SECRET, { expiresIn: "7d" });
              res.json({ code: 0, activeUser, JWT });
            })
            .catch(error => {
              res.json({
                code: 1,
                place: ".findByIdAndUpdate(), userApi:292",
                message:
                  "Qualcosa è andato storto nel salvataggio delle modifiche",
                error
              });
            });
        }
      })
      .catch(error => {
        res.json({
          code: 1,
          place: ".find(), userApi:284",
          message: "Qualcosaee è andato storto nel salvataggio delle modifiche",
          error
        });
      });
  } else {
    User.findByIdAndUpdate(req.body._id, req.body.newBodyInfo, { new: true })
      .then(user => {
        const activeUser = user.toJSON();
        const JWT = jwt.sign(activeUser, JWT_SECRET, { expiresIn: "7d" });
        res.json({ code: 0, activeUser, JWT });
      })
      .catch(error => {
        res.json({
          code: 1,
          place: ".findByIdAndUpdate(), userApi:321",
          message: "Qualcosa è andato storto nel salvataggio delle modifiche",
          error
        });
      });
  }
});

// update place
// _id / placeUpdate: {place: {country / region / city}}
router.put("/place", (req, res) => {
  User.findByIdAndUpdate(req.body._id, req.body.placeUpdate, { new: true })
    .then(user => {
      const activeUser = user.toObject();
      delete activeUser.password;
      const JWT = jwt.sign(activeUser, JWT_SECRET, { expiresIn: "7d" });
      res.json({ code: 0, activeUser, JWT });
    })
    .catch(error => {
      res.json({
        code: 1,
        place: ".findByIdAndUpdate(), userApi:341",
        message: "Qualcosa è andato storto nel salvataggio della luogo",
        error
      });
    });
});

// update delivery
// _id / deliveryUpdate : {DeliveryInfo: {range / cost / timeToMeet}}
router.put("/delivery", (req, res) => {
  User.findByIdAndUpdate(req.body._id, req.body.deliveryUpdate, { new: true })
    .then(user => {
      const activeUser = user.toObject();
      delete activeUser.password;
      const JWT = jwt.sign(activeUser, JWT_SECRET, { expiresIn: "7d" });
      res.json({ code: 0, activeUser, JWT });
    })
    .catch(error => {
      res.json({
        code: 1,
        place: ".findByIdAndUpdate(), userApi:361",
        message:
          "Qualcosa è andato storto nel salvataggio delle informazioni sulla spedizione",
        error
      });
    });
});

// update rating
// _id (the seller's one)/ qualityRating / deliveryRating
// if one not given, just pass it
router.put("/ratingUpdate", (req, res) => {
  console.log(req.body);
  User.findById(req.body._id)
    .then(user => {
      if (!user) {
        res.json({
          code: 1.5,
          devMessage: "Nessun account con questo id",
          message: "Nessun account trovato da valutare",
          place: ".findById(), userApi:382"
        });
      } else {
        count = user.rating.count + 1;
        qualityAverage = req.body.qualityRating
          ? (user.rating.count * user.rating.qualityAverage +
              req.body.qualityRating) /
            count
          : user.rating.qualityAverage;
        deliveryAverage = req.body.deliveryRating
          ? (user.rating.count * user.rating.deliveryAverage +
              req.body.deliveryRating) /
            count
          : user.rating.deliveryAverage;
        newRating = {
          deliveryAverage,
          count,
          qualityAverage
        };
        User.findByIdAndUpdate(
          req.body._id,
          {
            rating: newRating
          },
          { new: true }
        )
          .then(user => {
            if (!user) {
              res.json({
                code: 1.5,
                devMessage: "nessun account trovato nell'update con questo id",
                message: "Nessun account trovato da valutare",
                place: ".findByIdAndUpdate(), userApi: 402"
              });
            } else {
              console.log("okmokok");
              // post libridoo feedback
              const newRating = new Rating({
                value: req.body.libridoo
              });

              newRating
                .save()
                .then(() => {
                  res.json({
                    code: 0,
                    message: "Valutazione effettuata con successo"
                  });
                  console.log("dou");
                })
                .catch(error => {
                  console.log(error);
                  res.json({
                    code: 0.5,
                    message: "Valutazione effettuata con successo",
                    error: "Errore nel salvataggio rating",
                    error
                  });
                });
            }
          })
          .catch(error => {
            res.json({
              code: 1,
              place: ".findByIdAndUpdate(), userApi:402",
              message:
                "Qualcosa è andato storto nel salvataggio della tua valutazione",
              error
            });
          });
      }
    })
    .catch(error => {
      res.json({
        code: 1,
        place: ".findById(), userApi:382",
        message:
          "Qualcosa è andato storto nel salvataggio della tua valutazione",
        error
      });
    });
});

// update password
// _id / oldPassword / newPassword
router.put("/passwordUpdate", (req, res) => {
  User.findById(req.body._id)
    .then(user => {
      if (!user) {
        res.json({
          code: 1.5,
          devMessage: "nessun utente con questo id",
          message: "Nessun utente trovato",
          place: ".findById(), userApi:449"
        });
      } else {
        bcrypt
          .compare(req.body.oldPassword, user.password)
          .then(response => {
            if (!response) {
              res.json({ code: 2, message: "Vecchia password errata" });
            } else {
              bcrypt
                .hash(req.body.newPassword, 10)
                .then(hashed => {
                  User.findByIdAndUpdate(
                    req.body._id,
                    {
                      password: hashed,
                      passwordLength: req.body.newPassword.length
                    },
                    { new: true }
                  )
                    .then(user => {
                      const activeUser = user.toObject();
                      delete activeUser.password;
                      const JWT = jwt.sign(activeUser, JWT_SECRET, {
                        expiresIn: "7d"
                      });
                      res.json({ code: 0, activeUser, JWT });
                    })
                    .catch(error => {
                      res.json({
                        code: 1,
                        place: ".findByIdAndUpdate(), userApi:468",
                        message:
                          "Qualcosa è andato storto nel salvataggio della nuova password",
                        error
                      });
                    });
                })
                .catch(error => {
                  res.json({
                    code: 1,
                    place: ".hash(), userApi:466",
                    message:
                      "Qualcosa è andato storto nel salvataggio della nuova password",
                    error
                  });
                });
            }
          })
          .catch(error => {
            res.json({
              code: 1,
              place: ".compare(), userAPi:460",
              message:
                "Qualcosa è andato storto nel salvataggio della nuova password",
              error
            });
          });
      }
    })
    .catch(error => {
      res.json({
        code: 1,
        place: ".findById(), userApi:449",
        message:
          "Qualcosa è andato storto nel salvataggio della nuova password",
        error
      });
    });
});

// reset password
// email
router.put("/recover", (req, res) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        res.json({
          code: 2,
          message: "Non esiste account registrato con questa email"
        });
      } else {
        const newPassword = `recover${Math.floor(Math.random() * 1000000)}`;
        bcrypt
          .hash(newPassword, 10)
          .then(hashed => {
            User.findOneAndUpdate(
              { email: req.body.email },
              {
                password: hashed,
                passwordLength: newPassword.length
              }
            )
              .then(user => {
                // send mail
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

                // send mail with defined transport object
                transporter.sendMail(
                  {
                    from: '"Libridoo" <noReply@libridoo.it>',
                    to: req.body.email,
                    subject: "Recupero Password",
                    text: "Ciao!",
                    html: `Gentile Utente,
                  <br /><br />
                  Confermiamo che ha appena resettato con successo la password per
                  accedere a:
                   <br /><br />
                  <a href="www.libridoo.it">www.libridoo.it</a>
                  <br /><br /><br />
                  La sua nuova password e': <b>${newPassword}</b>.
                  <br /><br /><br />
                  Può ora effettuare il login con la sua solita mail e questa nuova password per poi
                  reimpostarla nelle impostazioni dell'account.
                  <br /><br /><br /><br />
                  Saluti,
                  <br />
                  <i>Il team di Libridoo</i>`
                  },
                  async (error, info) => {
                    if (error) {
                      console.log(error);
                      const newError = new Error({
                        error: { message: "EMAIL NOT SENT, recover", error }
                      });
                      await newError.save();
                    } else {
                      console.log("emailsent", info);
                    }
                  }
                );
                res.json({
                  code: 0,
                  message: "Password resettata con successo!"
                });
              })
              .catch(error => {
                res.json({
                  code: 1,
                  place: "findOneAndUpdate(), userApi:542",
                  message:
                    "Qualcosa è andato storto nel recupero della password dimenticata",
                  error
                });
              });
          })
          .catch(error => {
            res.json({
              code: 1,
              place: ".hash(), userApi:530",
              message:
                "Qualcosa è andato storto nel recupero della password dimenticata",
              error
            });
          });
      }
    })
    .catch(error => {
      res.json({
        code: 1,
        place: ".findOne(), userApi:530",
        message:
          "Qualcosa è andato storto nel recupero della password dimenticata",
        error
      });
    });
});

// update stripe id
// _id, payOut: {type / accountId}
router.put("/connectedAccount", (req, res) => {
  const user = jwt.verify(req.body.JWT, JWT_SECRET);
  console.log(user);
  User.findByIdAndUpdate(user._id, { payOut: req.body.payOut }, { new: true })
    .then(user => {
      if (user._id) {
        const activeUser = user.toObject();
        delete activeUser.password;
        const JWT = jwt.sign(activeUser, JWT_SECRET, { expiresIn: "7d" });
        res.json({ code: 0, activeUser, JWT });
      } else res.json({ code: 1, place: "userApi/666", user });
    })
    .catch(e => res.json({ code: 1, place: "userApi/668" }));
});

// delete account
// _id
router.delete("/delete", (req, res) => {
  User.findByIdAndDelete(req.body._id)
    .then(user => {
      if (!user) {
        res.json({
          code: 1.5,
          message: "Il tuo account è stato già eliminato"
        });
      } else {
        // delete all books sold by user
        Book.deleteMany({ sellerId: req.body._id })
          .then(() => {
            res.json({ code: 0, message: "Account eliminato con successo" });
          })
          .catch(error => {
            res.json({
              code: 1,
              place: ".deleteMany(), userApi:633",
              message: "Qualcosa è andato storto nella rimozione dell'account",
              error
            });
          });
      }
    })
    .catch(error => {
      res.json({
        code: 1,
        place: ".findByIdAndDelete(), userApi:624",
        message: "Qualcosa è andato storto nella rimozione dell'account",
        error
      });
    });
});

router.post("/ciao", (req, res) => {
  if (process.env.NODE_ENV === "production") {
    res.json({ shit: "prod" });
  } else res.json({ shit: "DEV" });
});

module.exports = router;
