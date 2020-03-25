const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const User = require("../models/Users");

const router = express.Router();

// secret
const JWT_SECRET = require("../config/keys").JWT_SECRET;

// get user from JWT refresh
// token
router.post("/refresh", (req, res) => {
  const token = req.body.token;
  const user = jwt.verify(token, JWT_SECRET);
  User.findById(user._id)
    .then(user => {
      if (user) {
        const activeUser = user.toObject();
        delete activeUser.password;
        const JWT = jwt.sign(activeUser, JWT_SECRET);
        res.json({ code: 0, activeUser, JWT });
      } else {
        res.json({
          code: 1.5,
          message: "Nessun account con id del jwt fornito"
        });
      }
    })
    .catch(error => {
      res.json({ code: 1, message: "Errore inaspettato", error });
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
              const JWT = jwt.sign(activeUser, JWT_SECRET);
              res.json({ code: 0, activeUser, JWT });
            } else {
              res.json({ code: 2, message: "Password errata" });
            }
          })
          .catch(error => {
            res.json({ code: 1, place: ".compare()", error });
          });
      } else {
        res.json({ code: 2, message: "Email errata" });
      }
    })
    .catch(error => {
      res.json({ code: 1, message: "Errore inaspettato", error });
    });
});

// register
// bonus update in here
// email / password / name / avatarImgURL / invitingUserId
router.post("/register", (req, res) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        res.json({
          code: 2,
          message: "Email già registrata con un altro account"
        });
      } else {
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
                const JWT = jwt.sign(activeUser, JWT_SECRET);
                if (req.body.invitingUserId) {
                  // update bonus points if invited
                  // !!!AAA!!! for now, bonusPoints increment is 5, need to specify
                  User.findByIdAndUpdate(req.body.invitingUserId, {
                    $inc: { bonusPoints: 5 }
                  })
                    .then(() => {
                      res.json({ code: 0, activeUser, JWT });
                    })
                    .catch(error => {
                      res.json({
                        code: 3,
                        activeUser,
                        JWT,
                        place: ".findByIdAndUpdate()",
                        error
                      });
                    });
                } else {
                  res.json({ code: 0, activeUser, JWT });
                }
              })
              .catch(error => {
                res.json({ code: 1, place: ".save()", error });
              });
          })
          .catch(error => {
            res.json({ code: 1, place: ".hash()", error });
          });
      }
    })
    .catch(error => {
      res.json({ code: 1, place: ".findOne()", error });
    });
});

// update bodyInfo
// _id / defaultEmail / newBodyInfo : { email / school / phone / schoolLogoUrl } (even if you don't have it, pass default)
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
              const JWT = jwt.sign(activeUser, JWT_SECRET);
              res.json({ code: 0, activeUser, JWT });
            })
            .catch(error => {
              res.json({ code: 1, place: ".findByIdAndUpdate()", error });
            });
        }
      })
      .catch(error => {
        res.json({ code: 1, place: ".find()", error });
      });
  } else {
    User.findByIdAndUpdate(req.body._id, req.body.newBodyInfo, { new: true })
      .then(user => {
        const activeUser = user.toJSON();
        const JWT = jwt.sign(activeUser, JWT_SECRET);
        res.json({ code: 0, activeUser, JWT });
      })
      .catch(error => {
        res.json({ code: 1, place: ".findByIdAndUpdate()", error });
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
      const JWT = jwt.sign(activeUser, JWT_SECRET);
      res.json({ code: 0, activeUser, JWT });
    })
    .catch(error => {
      res.json({ code: 1, place: ".findByIdAndUpdate()", error });
    });
});

// update delivery
// _id / deliveryUpdate : {DeliveryInfo: {range / cost / timeToMeet}}
router.put("/delivery", (req, res) => {
  User.findByIdAndUpdate(req.body._id, req.body.deliveryUpdate, { new: true })
    .then(user => {
      const activeUser = user.toObject();
      delete activeUser.password;
      const JWT = jwt.sign(activeUser, JWT_SECRET);
      res.json({ code: 0, activeUser, JWT });
    })
    .catch(error => {
      res.json({ code: 1, place: ".findByIdAndUpdate()", error });
    });
});

// update rating
// _id (the seller's one)/ rating
router.put("/ratingUpdate", (req, res) => {
  User.findById(req.body._id)
    .then(user => {
      if (!user) {
        res.json({ code: 1.5, message: "Nessun account con questo id" });
      } else {
        count = user.rating.count + 1;
        rawAverage =
          (user.rating.count * user.rating.rawAverage + req.body.rating) /
          count;
        average = Math.round(rawAverage);
        newRating = {
          average,
          count,
          rawAverage
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
                message: "nessun account trovato nell'update con questo id"
              });
            } else {
              res.json({
                code: 0,
                message: "Valutazione effettuata con successo"
              });
            }
          })
          .catch(error => {
            res.json({ code: 1, place: ".findByIdAndUpdate()", error });
          });
      }
    })
    .catch(error => {
      res.json({ code: 1, place: ".findById()", error });
    });
});

// update password
// _id / oldPassword / newPassword
router.put("/passwordUpdate", (req, res) => {
  if (req.body.oldPassword === req.body.newPassword) {
    res.json({ code: 2, message: "Password già salvata su questo account" });
  } else {
    User.findById(req.body._id)
      .then(user => {
        if (!user) {
          res.json({ code: 1.5, message: "nessun utente con questo id" });
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
                        const JWT = jwt.sign(activeUser, JWT_SECRET);
                        res.json({ code: 0, activeUser, JWT });
                      })
                      .catch(error => {
                        res.json({
                          code: 1,
                          place: ".findByIdAndUpdate()",
                          error
                        });
                      });
                  })
                  .catch(error => {
                    res.json({ code: 1, place: ".hash()", error });
                  });
              }
            })
            .catch(error => {
              res.json({ code: 1, place: ".compare()", error });
            });
        }
      })
      .catch(error => {
        res.json({ code: 1, place: ".findById()", error });
      });
  }
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
                const transporter = nodemailer.createTransport({
                  host: "smtp.gmail.com",
                  port: 587,
                  secure: false,
                  auth: {
                    user: "libridoo.contacts@gmail.com",
                    pass: "scoby-doo"
                  },
                  tls: { rejectUnauthorized: false }
                });

                // send mail with defined transport object
                transporter.sendMail({
                  from: '"Libridoo" <libridoo.contacts@gmail.com>',
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
                });
                res.json({
                  code: 0,
                  message: "Password resettata con successo!"
                });
              })
              .catch(error => {
                res.json({ code: 1, place: "findOneAndUpdate()", error });
              });
          })
          .catch(error => {
            res.json({ code: 1, place: ".hash()", error });
          });
      }
    })
    .catch(error => {
      res.json({ code: 1, place: ".findOne()", error });
    });
});

// delete account
// _id
router.delete("/delete", (req, res) => {
  User.findByIdAndDelete(req.body._id)
    .then(user => {
      if (!user) {
        res.json({ code: 1.5, message: "Account già eliminato" });
      } else {
        res.json({ code: 0, message: "Account eliminato con successo" });
      }
    })
    .catch(error => {
      res.json({ code: 1, place: ".findByIdAndDelete()", error });
    });
});

module.exports = router;
