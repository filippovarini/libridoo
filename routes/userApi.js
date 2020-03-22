const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const User = require("../models/Users");

const router = express.Router();

// secret
const JWT_SECRET = require("../config/keys").JWT_SECRET;

// get user from JWT refresh
router.get("/refresh", (req, res) => {
  const token = req.body.token;
  const user = jwt.verify(token, JWT_SECRET);
  User.findById(user._id)
    .then(user => {
      if (user) {
        const activeUser = user.toJSON();
        const JWT = jwt.sign(activeUser, JWT_SECRET);
        res.json({ code: 0, activeUser, JWT });
      } else {
        res.json({ code: 2, message: "Nessun account con id del jwt fornito" });
      }
    })
    .catch(error => {
      res.json({ code: 1, message: "Errore inaspettato", error });
    });
});

// login
router.get("/login", (req, res) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        bcrypt
          .compare(req.body.password, user.password)
          .then(response => {
            if (response) {
              const activeUser = user.toJSON();
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
// bonus updatein here
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
                const activeUser = user.toJSON();
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
              const activeUser = user.toJSON();
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

// update delivery
router.put("/delivery", (req, res) => {
  User.findByIdAndUpdate(req.body._id, req.body.deliveryUpdate, { new: true })
    .then(user => {
      const activeUser = user.toJSON();
      const JWT = jwt.sign(activeUser, JWT_SECRET);
      res.json({ code: 0, activeUser, JWT });
    })
    .catch(error => {
      res.json({ code: 1, place: ".findByIdAndUpdate()", error });
    });
});

// reset password
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
router.delete("/delete", (req, res) => {
  User.findByIdAndDelete(req.body._id)
    .then(user => {
      if (!user) {
        res.json({ code: 2, message: "Account già eliminato" });
      } else {
        res.json({ code: 0, message: "Account eliminato con successo" });
      }
    })
    .catch(error => {
      res.json({ code: 1, place: ".findByIdAndDelete()", error });
    });
});

module.exports = router;
