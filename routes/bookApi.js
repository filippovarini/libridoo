const express = require("express");
const nodemailer = require("nodemailer");

// router
const router = express.Router();

const Book = require("../models/Books");
const User = require("../models/Users");
const Error = require("../models/Errors");
const SoldBooksCluster = require("../models/SoldBooksClusters");
const Spam = require("../models/Spam");
const notFound = require("../models/notFound");

// multer upload
const upload = require("../services/file-upload");
const singleUpload = upload.single("image");

// email pass
const EMAIL_PASS = require("../config/keys").EMAIL_PASS;

// !!! CHECK BOOKS ARE AUTHOMATICALLY SORTED FOR DATE (I THINK SO) --> YES

// get my selling books
router.get("/fetch/selling/:_id", (req, res) => {
  Book.find({ sellerId: req.params._id })
    .then(books => {
      if (books.length == 0) {
        res.json({
          code: 2,
          message: "Nessun libro in vendita. Inizia subito"
        });
      } else {
        res.json({ code: 0, books });
      }
    })
    .catch(error => {
      res.json({
        code: 1,
        place: ".find(), bookApi:20",
        error,
        message:
          "Qualcosa è andato storto nella ricerca dei tuoi libri in vendita"
      });
    });
});

// get my sold books
router.get("/fetch/sold/:_id", (req, res) => {
  SoldBooksCluster.find({ sellerId: req.params._id })
    .then(clusters => {
      if (clusters.length == 0) {
        res.json({ code: 2, message: "Nessun libro venduto" });
      } else {
        res.json({ code: 0, clusters });
      }
    })
    .catch(error => {
      res.json({
        code: 1,
        place: ".find(), bookApi:44",
        error,
        message:
          "Qualcosa è andato storto nella ricerca dei tuoi libri venduti "
      });
    });
});

// get my bought books
router.get("/fetch/bought/:_id", (req, res) => {
  SoldBooksCluster.find({ buyerId: req.params._id })
    .then(clusters => {
      if (clusters.length == 0) {
        res.json({ code: 2, message: "Nessun libro comprato. Inizia subito" });
      } else {
        res.json({ code: 0, clusters });
      }
    })
    .catch(error => {
      res.json({
        code: 1,
        place: ".find(), bookApi:65",
        error,
        message:
          "Qualcosa è andato storto nella ricerca dei tuoi libri comprati"
      });
    });
});

// get book with search ui
// call it also when changing filter
// searchParams: {ui / city / school / quality}
// if first time to type, pass default filters ({quality: null, place: {type: city, value: ''}, school: ''})and save them to Session
router.post("/fetch/buy", async (req, res) => {
  // reject messages
  let place = "",
    message = "";
  code = null;
  // books
  let frozenBooks = [];
  if (parseInt(req.body.searchParams.ui)) {
    // isbn (useless because no isbn)
    pointer = "codice isbn";
    frozenBooks = await Book.find({ isbn: req.body.searchParams.ui });
  } else {
    // title
    pointer = "titolo";
    const TitleRegExp = new RegExp(req.body.searchParams.ui, "i");
    frozenBooks = req.body.limit
      ? (frozenBooks = await Book.find({ title: TitleRegExp }).limit(10))
      : (frozenBooks = await Book.find({ title: TitleRegExp }));
  }
  let booksFetched = frozenBooks.map(book => {
    return book.toObject();
  });
  if (booksFetched.length == 0) {
    res.json({
      code: 2,
      message: `Nessun libro trovato`,
      results: { searchParams: req.body.searchParams }
    });
  } else {
    //   filter quality
    let filterResult = req.body.searchParams.quality
      ? booksFetched.filter(book => {
          return book.quality === req.body.searchParams.quality;
        })
      : booksFetched;
    if (filterResult.length === 0) {
      res.json({
        code: 2.5,
        wrongFilter: "quality",
        message: "Nessun libro in vendita della qualità selezionata",
        results: { searchParams: req.body.searchParams }
      });
    }
    // filter place
    filterResult = req.body.searchParams.city
      ? filterResult.filter(
          book =>
            book.place.city.toLowerCase() ===
            req.body.searchParams.city.toLowerCase()
        )
      : filterResult;
    if (filterResult.length === 0) {
      res.json({
        code: 2.5,
        wrongFilter: "place",
        message: "Nessun libro in vendita nel tuo luogo",
        results: { searchParams: req.body.searchParams }
      });
    }

    // attach user
    const forEachPromise = new Promise((resolve, reject) => {
      filterResult.forEach(book => {
        User.findById(book.sellerId)
          .then(user => {
            if (!user) {
              message =
                "Nessun utente trovato con questo id, probabilmente l'utente ha appena eliminato il suo account";
              place = ".findById(), bookApi:146";
              code = 1.5;
              reject();
            } else {
              const sellerUser = {
                name: user.name,
                rating: {
                  deliveryAverage: user.rating.deliveryAverage,
                  qualityAverage: user.rating.qualityAverage
                },
                school: user.school,
                email: user.email,
                phone: user.phone,
                avatarImgURL: user.avatarImgURL,
                deliveryInfo: user.DeliveryInfo,
                payOut: user.payOut
              };
              book.sellerUser = sellerUser;
              if (filterResult.indexOf(book) == filterResult.length - 1)
                resolve();
            }
          })
          .catch(error => {
            code = 1;
            message = "Qualcosa è andato storto nella tua ricerca";
            place = ".findById(), bookApi:146";
            reject(error);
          });
      });
    });
    // end promise
    forEachPromise.then(() => {
      // filter school
      if (req.body.searchParams.school) {
        filterResult = filterResult.filter(book => {
          return (
            book.sellerUser.school.toLowerCase() ===
            req.body.searchParams.school.toLowerCase()
          );
        });
      }
      if (filterResult.length === 0) {
        res.json({
          code: 2.5,
          wrongFilter: "school",
          message: "Nessun libro in vendità nella tua Scuola o Università",
          results: { searchParams: req.body.searchParams }
        });
      } else {
        res.json({
          code: 0,
          results: {
            searchParams: req.body.searchParams,
            filterResult
          }
        });
      }
    });
    forEachPromise.catch(error => {
      res.json({
        error,
        code,
        results: { searchParams: req.body.searchParams },
        place,
        message
      });
    });
  }
});

// general get
// searchParams : [{ui / city / school / quality}]
// !! if no filter, don't send it!!
router.post("/generalFetch/UI", async (req, res) => {
  // reject messages
  let message = "",
    place = "";
  code = null;
  let results = [];
  let addedItems = 0;
  // async here or above?
  const generalPromise = new Promise((resolve, reject) => {
    req.body.searchParams.forEach(async param => {
      let message = "";
      let wrongFilter = "";
      let wrongCode = null;
      let isEmpty = false;
      let frozenBooks = [];
      let pointer = "";
      if (parseInt(param.ui)) {
        // isbn (useless because no isbn)
        pointer = "codice isbn";
        frozenBooks = await Book.find({ isbn: param.ui });
      } else {
        // title
        pointer = "titolo";
        const TitleRegExp = new RegExp(param.ui, "i");
        frozenBooks = await Book.find({ title: TitleRegExp });
      }
      let filterResult = frozenBooks.map(book => {
        return book.toObject();
      });
      // could be HERE??Q!!!
      if (filterResult.length == 0) {
        // impossible, because this happens when refresh, and if you refresh with results, already got jsonRes.code!==2
        isEmpty = true;
        wrongCode = 2;
        wrongFilter = "pointer";
        message = `Nessun libro trovato. Controlla che il ${pointer} sia corretto`;
      }
      //   filter quality
      if (!isEmpty) {
        filterResult = param.quality
          ? filterResult.filter(book => {
              return book.quality === param.quality;
            })
          : filterResult;
        if (filterResult.length === 0) {
          isEmpty = true;
          wrongCode = 2.5;
          wrongFilter = "quality";
          message = "Nessun libro in vendita della qualità selezionata";
        }
      }
      // filter place
      if (!isEmpty) {
        filterResult = param.city
          ? filterResult.filter(
              book => book.place.city.toLowerCase() === param.city.toLowerCase()
            )
          : filterResult;
        if (filterResult.length === 0) {
          isEmpty = true;
          wrongCode = 2.5;
          wrongFilter = "place";
          message = "Nessun libro in vendita nel tuo luogo";
        }
      }

      // attach user and filter by school
      const forEachPromise = new Promise((resolve, reject) => {
        if (isEmpty) {
          resolve(true);
        } else {
          filterResult.forEach(book => {
            User.findById(book.sellerId)
              .then(user => {
                if (!user) {
                  message = "Nessun utente trovato con questo id";
                  place = ".findById, BookApi:285";
                  code = 1.5;
                  reject();
                } else {
                  const sellerUser = {
                    name: user.name,
                    rating: {
                      deliveryAverage: user.rating.deliveryAverage,
                      qualityAverage: user.rating.qualityAverage
                    },
                    school: user.school,
                    email: user.email,
                    phone: user.phone,
                    avatarImgURL: user.avatarImgURL,
                    deliveryInfo: user.DeliveryInfo,
                    payOut: user.payOut
                  };
                  book.sellerUser = sellerUser;
                  if (filterResult.indexOf(book) == filterResult.length - 1) {
                    resolve(false);
                  }
                }
              })
              .catch(error => {
                place = ".findById(), bookApi:285";
                message: "Qualcosa è andato storto nella tua ricerca";
                code = 1;
                reject(error);
              });
          });
        }
      });
      // promise end
      forEachPromise.then(skipped => {
        if (!skipped) {
          if (param.school) {
            filterResult = filterResult.filter(book => {
              return (
                book.sellerUser.school.toLowerCase() ===
                param.school.toLowerCase()
              );
            });
            if (filterResult.length === 0) {
              isEmpty = true;
              wrongFilter = "school";
              wrongCode = 2.5;
              message = "Nessun libro in vendita nella tua Scuola o Università";
            }
          }
          if (!wrongCode) {
            results.push({
              searchParams: param,
              filterResult,
              index: req.body.searchParams.indexOf(param)
            });
          } else {
            results.push({
              searchParams: param,
              filterResult,
              wrongCode,
              wrongFilter,
              message,
              index: req.body.searchParams.indexOf(param)
            });
          }
        } else {
          results.push({
            searchParams: param,
            filterResult,
            wrongCode,
            wrongFilter,
            message,
            index: req.body.searchParams.indexOf(param)
          });
        }
        addedItems += 1;
        if (addedItems === req.body.searchParams.length) {
          resolve();
        }
      });
      forEachPromise.catch(error => {
        reject({ error, place, message, code });
      });
    });
  });
  generalPromise.then(() => {
    results.sort((a, b) => (a.index > b.index ? 1 : -1));
    res.json({ code: 0, results });
  });
  generalPromise.catch(errorObj => {
    res.json(errorObj);
  });
});

// general SB get
// [_ids]
router.post("/generalFetch/ID", async (req, res) => {
  let results = [];
  const generalPromise = new Promise((resolve, reject) => {
    req.body._ids.forEach(async _id => {
      let frozenBook = await Book.findById(_id);
      const book = frozenBook.toObject();
      const user = await User.findById(book.sellerId);
      if (!user) {
        reject(
          1.5,
          "Nessun utente registrato con questo id",
          ".findById(), bookApi:385"
        );
      } else {
        const sellerUser = {
          name: user.name,
          rating: {
            deliveryAverage: user.rating.deliveryAverage,
            qualityAverage: user.rating.qualityAverage
          },
          school: user.school,
          email: user.email,
          phone: user.phone,
          avatarImgURL: user.avatarImgURL,
          deliveryInfo: user.DeliveryInfo,
          payOut: user.payOut
        };
        book.sellerUser = sellerUser;
      }
      results.push(book);
      if (req.body._ids.indexOf(_id) === req.body._ids.length - 1) {
        resolve();
      }
    });
  });
  generalPromise.then(() => {
    res.json({ code: 0, results });
  });
  generalPromise.catch((code, message, place) => {
    res.json({ code, message, place });
  });
});

// post image to s3 and return url to display on front end and later pass to request body
router.post("/image", (req, res) => {
  singleUpload(req, res, error => {
    if (error) {
      console.log(error);
      return res.json({
        code: 1,
        place: "singleUpload(), bookApi:423",
        error,
        message:
          "Qualcosa è  andato storto nel caricare la tua immagine di copertina"
      });
    } else {
      return res.json({ code: 0, imageURL: req.file.location });
    }
  });
});

// post spam book
// book
router.post("/spam", (req, res) => {
  const newSpam = new Spam({ book: req.body.book, shit: "fsfmo" });
  newSpam
    .save()
    .then(book => res.json(book))
    .catch(error => res.json(error));
});

// post new book
// imageURL / title / no isbn / quality / price / sellerId / place: {country / region / city}
router.post("/insert", (req, res) => {
  const newBook = new Book(req.body);
  newBook
    .save()
    .then(async book => {
      // send mail to everyone who requested
      const TitleRegExp = new RegExp(req.body.title, "i");
      const notFounds = await notFound.find({ title: TitleRegExp });
      console.log(notFounds);
      if (notFounds.length !== 0) {
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
        notFounds.forEach(async nFd => {
          // found books
          const transporter = nodemailer.createTransport(options);

          // send mail with defined transport object
          transporter.sendMail(
            {
              from: '"Libridoo" <info@libridoo.it>',
              to: nFd.email,
              subject: `${nFd.title} disponibile`,
              text: "Ciao!",
              html: `Il libro da te cercato,
            <br /><br />
            <b>${nFd.title}</b>
            è appena diventato disponibile. Compralo subito prima che qualcuno te lo rubi!
            <br /><br /><br />
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
          // delete not fount
          await notFound.findByIdAndDelete(nFd._id);

          if (notFounds.indexOf(nFd) === notFounds.length - 1) {
            // completed
            res.json({ code: 0, book });
          }
        });
      } else {
        console.log("notfound");
        res.json({ code: 0, book });
      }
    })
    .catch(error => {
      res.json({
        code: 1,
        place: ".save(), bookApi:443",
        error,
        message: "Qualcosa è andato storto nella pubblicazione dell'annuncio"
      });
    });
});

// send to general problem if code !== 0
/* {
  dealId / buyerId / checkoutDate (gotten from posting in deal)
[_ids (stored in session)]
buyerInfo: { / name / place: {country / region /  city} / school / email / phone / avatarImgURL / schoolLogoURL
soldBooksClusters: [
  {
    sellerId / delivery: {choosen (if not choosen, still pass null for cost and range) / cost / range / timeToMeet},
    sellerInfo: { / name / / place: {country / region /  city} / school / email / phone / avatarImgURL / payOut: {type, accountId}}
    Books:[{bookId / imageURL / title  / price / quality / insertionDate}]  }]
}] */
// no input mistake
router.post("/checkedOut", (req, res) => {
  // post deal
  // const newDeal = new Deal(req.body.deal);
  // newDeal
  //   .save()
  //   .then(deal => {
  const clusterPromise = new Promise((resolve, reject) => {
    req.body.soldBooksClusters.forEach(cluster => {
      // post soldbooks cluster
      const newCluster = new SoldBooksCluster({
        dealId: req.body.dealId,
        checkoutDate: req.body.checkoutDate,
        buyerId: req.body.buyerId,
        sellerId: cluster.sellerId,
        delivery: cluster.delivery,
        buyerInfo: req.body.buyerInfo,
        sellerInfo: cluster.sellerInfo,
        Books: cluster.Books
      });
      newCluster
        .save()
        .then(() => {
          // if everything goes well, check if it was the last cluster
          if (
            req.body.soldBooksClusters.indexOf(cluster) ===
            req.body.soldBooksClusters.length - 1
          ) {
            resolve();
          }
        })
        .catch(error => {
          // if error, call reject with cluster identifier\
          console.log(".save cluster", error);
          reject({
            code: 1,
            place: ".save() cluster bookApi:593",
            clusterProblem: cluster.sellerId,
            error
          });
        });
    });
  });
  clusterPromise.then(() => {
    // success

    res.json({
      code: 0,
      devmessage: "clusters successfully posted",
      message: "Operazione effettuata con successo",
      paymentId: req.body.dealId
    });
  });
  clusterPromise.catch(error => {
    console.log(error);
    res.json({
      code: 1,
      place: "clusterPromise.catch()",
      message: "Qualcosa è andato storto nel completamento dell'acquisto"
    });
  });
});

// post not found book
// email / title
router.post("/notFound", (req, res) => {
  const newNotFound = new notFound({
    title: req.body.title,
    email: req.body.email
  });

  newNotFound
    .save()
    .then(notFound => {
      res.json({ code: 0 });
    })
    .catch(error => {
      console.log(error);
      res.json({ code: 1, error });
    });
});

// edit book
// bookInfo type edit, already fetched url
// _id / newInfo: {imageURL / title / price / quality}
router.put("/edit", (req, res) => {
  Book.findByIdAndUpdate(req.body._id, req.body.newInfo, { new: true })
    .then(book => {
      if (!book) {
        res.json({
          code: 1.5,
          message: "Nessun libro trovato con questo id",
          place: ".findByIdAndUpdate(), bookApi:759"
        });
      } else {
        res.json({ code: 0, book });
      }
    })
    .catch(error => {
      res.json({
        code: 1,
        place: ".findByIdAndUpdate(), bookApi:759",
        error,
        message:
          "Qualcosa è andato storto nel salvataggio delle modifiche apportate"
      });
    });
});

// confirm (SKRILL and confirm in the same request) and save date
// clusterID
router.put("/confirm", (req, res) => {
  // month confirmation
  const date = new Date();
  const month = `${date.getMonth() + 1}/${date.getFullYear()}`;

  SoldBooksCluster.findByIdAndUpdate(
    req.body.clusterID,
    { confirmed: true, monthConfirmation: month, confirmationDate: Date.now() },
    { new: true }
  )
    .then(cluster => {
      if (!cluster) {
        res.json({
          code: 1.5,
          message: "Nessun cluster trovato con questo id",
          place: ".findByIdAndUpdate(), bookApi:786"
        });
      } else {
        // payment transition
        let totalPrice = 0;
        cluster.Books.forEach(book => {
          totalPrice += book.price;
        });
        if (cluster.delivery.choosen) totalPrice += cluster.delivery.cost;
        // from here, payment trnsition, holding 10%
        totalPrice -= totalPrice / 10;
        res.json({ code: 0, cluster });
      }
    })
    .catch(error => {
      res.json({
        code: 1,
        place: ".findByIdAndUpdate(), bookApi:786",
        message: "Qualcosa è andato storto nella conferma dell'ordine",
        error
      });
    });
});

// delete book
// _id
router.delete("/delete", (req, res) => {
  Book.findByIdAndDelete(req.body._id)
    .then(book => {
      if (!book) {
        res.json({
          code: 1.5,
          message: "Libro non trovato. Forse lo hai già eliminato",
          place: ".findByIdAndDelete(), bookApi:815"
        });
      } else {
        res.json({ code: 0, message: "Libro eliminato con successo" });
      }
    })
    .catch(error => {
      res.json({
        code: 1,
        place: ".findByIdAndDelete(), bookApi:815",
        message: "Qualcosa è andato storto nell'eliminazione del libro",
        error
      });
    });
});

// !!! JUST FOR DEV --> Delete all books
router.delete("/delete/all", (req, res) => {
  Book.deleteMany({})
    .then(books => {
      if (!books) {
        res.json({ code: 2, message: "Nessun libro trovato" });
      } else {
        res.json({ code: 0, message: "Libri eliminati con successo" });
      }
    })
    .catch(error => {
      res.json({ code: 1, error });
    });
});

// delete every book
router.delete("/books", (req, res) => {
  Book.deleteMany()
    .then(() => {
      res.json({ code: 0, message: "Libri eliminati con successo" });
    })
    .catch(erorr => res.json({ code: 1, error }));
});

// delete every soldbookscluster
router.delete("/clusters", (req, res) => {
  SoldBooksCluster.deleteMany()
    .then(() => {
      res.json({ code: 0, message: "Clusters eliminati con successo" });
    })
    .catch(erorr => res.json({ code: 1, error }));
});

// delete all contacts for books not found
router.delete("/notFound", (req, res) => {
  notFound
    .deleteMany()
    .then(() => res.jsom({ code: 0 }))
    .catch(error => res.json({ code: 1, error }));
});

module.exports = router;
