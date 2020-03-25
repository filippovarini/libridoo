const express = require("express");

// router
const router = express.Router();

const Book = require("../models/Books");
const User = require("../models/Users");
const Deal = require("../models/Deals");
const SoldBooksCluster = require("../models/SoldBooksClusters");

// multer upload
const upload = require("../services/file-upload");
const singleUpload = upload.single("image");

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
      res.json({ code: 0, place: ".find()", error });
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
      res.json({ code: 0, place: ".find()", error });
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
      res.json({ code: 0, place: ".find()", error });
    });
});

// get book with search ui
// call it also when changing filter
// searchParams: {ui / place: {type / value} / school / quality}
// if first time to type, pass default filters ({quality: null, place: {type: city, value: ''}, school: ''})and save them to Session
router.post("/fetch/buy", async (req, res) => {
  // reject messages
  let placeMessage = "",
    code = null;
  // books
  let frozenBooks = [];
  let pointer = "";
  if (parseInt(req.body.searchParams.ui)) {
    // isbn
    pointer = "codice isbn";
    frozenBooks = await Book.find({ isbn: req.body.searchParams.ui });
  } else {
    // title
    pointer = "titolo";
    const TitleRegExp = new RegExp(req.body.searchParams.ui, "i");
    frozenBooks = await Book.find({ title: TitleRegExp });
  }
  let booksFetched = frozenBooks.map(book => {
    return book.toObject();
  });
  if (booksFetched.length == 0) {
    res.json({
      code: 2,
      message: `Nessun libro trovato. Controlla che il ${pointer} sia corretto`
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
        code: 2,
        message: "Nessun libro in vendita della qualità selezionata"
      });
    }
    // filter place
    switch (req.body.searchParams.place.type) {
      case "country":
        filterResult = filterResult.filter(
          book =>
            book.place.country.toLowerCase() ===
            req.body.searchParams.place.value.toLowerCase()
        );
        break;
      case "region":
        filterResult = filterResult.filter(
          book =>
            book.place.region.toLowerCase() ===
            req.body.searchParams.place.value.toLowerCase()
        );
        break;
      case "city":
        filterResult = filterResult.filter(
          book =>
            book.place.city.toLowerCase() ===
            req.body.searchParams.place.value.toLowerCase()
        );
        break;
    }
    if (filterResult.length === 0) {
      res.json({
        code: 2,
        message: "Nessun libro in vendita nel luogo selezionato"
      });
    }
    // attach user
    const forEachPromise = new Promise((resolve, reject) => {
      filterResult.forEach(book => {
        User.findById(book.sellerId)
          .then(user => {
            if (!user) {
              placeMessage =
                "Nessun utente trovato con questo id, probabilmente l'utente ha appena eliminato il suo account";
              code = 1.5;
              reject();
            } else {
              const sellerUser = {
                name: user.name,
                rating: user.rating.average,
                school: user.school,
                email: user.email,
                phone: user.phone,
                avatarImgURL: user.avatarImgURL,
                schoolLogoURL: user.schoolLogoURL,
                deliveryInfo: user.DeliveryInfo
              };
              book.sellerUser = sellerUser;
              if (filterResult.indexOf(book) == filterResult.length - 1)
                resolve();
            }
          })
          .catch(error => {
            code = 1;
            placeMessage = ".findById()";
            reject(error);
          });
      });
    });
    // end promise
    forEachPromise.then(() => {
      // filter school
      if (req.body.searchParams.school) {
        filterResult = filterResult.filter(
          book =>
            book.sellerUser.school.toLowerCase() ===
            req.body.searchParams.school.toLowerCase()
        );
      }
      if (filterResult.length === 0) {
        res.json({
          code: 2,
          message: "Nessun libro in vendità all'Università selezionata"
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
      res.json({ error, code, placeMessage });
    });
  }
});

// general get
// searchParams : [{ui / place: {type / value} / school / quality}]
router.post("/generalFetch/UI", async (req, res) => {
  // reject messages
  let placeMessage = "",
    code = null;
  let results = [];
  let addedItems = 0;
  // async here or above?
  const generalPromise = new Promise((resolve, reject) => {
    req.body.searchParams.forEach(async param => {
      let message = "";
      let isEmpty = false;
      let frozenBooks = [];
      let pointer = "";
      if (parseInt(param.ui)) {
        // isbn
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
        isEmpty = true;
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
          message = "Nessun libro in vendita della qualità selezionata";
        }
      }
      // filter place
      if (!isEmpty) {
        switch (param.place.type) {
          case "country":
            filterResult = filterResult.filter(
              book =>
                book.place.country.toLowerCase() ===
                param.place.value.toLowerCase()
            );
            break;
          case "region":
            filterResult = filterResult.filter(
              book =>
                book.place.region.toLowerCase() ===
                param.place.value.toLowerCase()
            );
            break;
          case "city":
            filterResult = filterResult.filter(
              book =>
                book.place.city.toLowerCase() ===
                param.place.value.toLowerCase()
            );
            break;
        }
        if (filterResult.length === 0) {
          isEmpty = true;
          message = "Nessun libro in vendita nel luogo selezionato";
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
                  placeMessage = "Nessun utente trovato con questo id";
                  code = 1.5;
                  reject();
                } else {
                  const sellerUser = {
                    name: user.name,
                    rating: user.rating.average,
                    school: user.school,
                    email: user.email,
                    phone: user.phone,
                    avatarImgURL: user.avatarImgURL,
                    schoolLogoURL: user.schoolLogoURL,
                    deliveryInfo: user.DeliveryInfo
                  };
                  book.sellerUser = sellerUser;
                  if (filterResult.indexOf(book) == filterResult.length - 1) {
                    resolve(false);
                  }
                }
              })
              .catch(error => {
                placeMessage = ".findById()";
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
            filterResult = filterResult.filter(
              book =>
                book.sellerUser.school.toLowerCase() ===
                param.school.toLowerCase()
            );
            if (filterResult.length === 0) {
              isEmpty = true;
              message = "Nessun libro in vendita all'Università selezionata";
            }
          }
          results.push({
            searchParams: param,
            filterResult,
            index: req.body.searchParams.indexOf(param)
          });
        } else {
          results.push({
            searchParams: param,
            filterResult,
            code: 2,
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
        reject({ error, placeMessage, code });
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
        reject(1.5, "Nessun utente registrato con questo id");
      } else {
        const sellerUser = {
          name: user.name,
          rating: user.rating.average,
          school: user.school,
          email: user.email,
          phone: user.phone,
          avatarImgURL: user.avatarImgURL,
          schoolLogoURL: user.schoolLogoURL,
          deliveryInfo: user.deliveryInfo
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
  generalPromise.catch((code, message) => {
    res.json({ code, message });
  });
});

// post image to s3 and return url to display on front end and later pass to request body
router.post("/image", (req, res) => {
  singleUpload(req, res, error => {
    if (error) {
      return res.json({ code: 1, place: "singleUpload()", error });
    } else {
      return res.json({ code: 0, imageURL: req.file.location });
    }
  });
});

// post new book
// imageURL / title / isbn / quality / price / sellerId / place: {country / region / city}
router.post("/insert", (req, res) => {
  const newBook = new Book(req.body);
  newBook
    .save()
    .then(book => {
      res.json({ code: 0, book });
    })
    .catch(error => {
      res.json({ code: 1, place: ".save()", error });
    });
});

// post deal (first deal, then to SoldBooksCluster with deal id)
// send to general problem if code !== 0
/* {
[_ids (stored in session)]
deal: {buyerId / [sellerIds] / bill: {delivery / books / commissions / total} },
buyerInfo: {name / rating / place: {country / region /  city} / school / email / phone / avatarImgURL / schoolLogoURL
soldBooksClusters: [
  {
    sellerId / delivery: {choosen (if not choosen, still pass null for cost and range) / cost / range / timeToMeet},
    sellerInfo: {name / rating / place: {country / region /  city} / school / email / phone / avatarImgURL / schoolLogoURL (got in frontend from book.sellerUser in cluster)
    Books:[{bookId / imageURL / title / isbn / price / quality / insertionDate}]  }]
} */
// no input mistake
router.post("/checkedOut", (req, res) => {
  // post deal
  const newDeal = new Deal(req.body.deal);
  newDeal
    .save()
    .then(deal => {
      const clusterPromise = new Promise((resolve, reject) => {
        // post soldbooks cluster
        req.body.soldBooksClusters.forEach(cluster => {
          const newCluster = new SoldBooksCluster({
            dealId: deal._id,
            checkoutDate: deal.checkoutDate,
            buyerId: deal.buyerId,
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
              // if error, call reject with cluster identifier
              reject({
                code: 1,
                place: ".save() cluster",
                clusterProblem: cluster.sellerId,
                error
              });
            });
        });
      });
      clusterPromise.then(() => {
        // successfully posted all clusters, now delete sold books
        req.body._ids.forEach(_id => {
          Book.findByIdAndDelete(_id)
            .then(book => {
              if (!book) {
                res.json({
                  code: 1.5,
                  devmessage: "clusters successfully posted",
                  message: "Nessun libro trovato con questo id",
                  _id
                });
              } else {
                if (req.body._ids.indexOf(_id) === req.body._ids.length - 1) {
                  res.json({
                    code: 0,
                    devmessage: "clusters successfully posted",
                    message: "Operazione effettuata con successo"
                  });
                }
              }
            })
            .catch(error => {
              res.json({ code: 1, place: ".findByIdAndDelete()", _id, error });
            });
        });
      });
      clusterPromise.catch(errorObj => {
        res.json(errorObj);
      });
    })
    .catch(error => {
      res.json({ code: 1, error });
    });
});

// edit book
// bookInfo type edit, already fetched url
// _id / newInfo: {imageURL / title / isbn / price / quality}
router.put("/edit", (req, res) => {
  Book.findByIdAndUpdate(req.body._id, req.body.newInfo, { new: true })
    .then(book => {
      if (!book) {
        res.json({ code: 1.5, message: "Nessun libro trovato con questo id" });
      } else {
        res.json({ code: 0, book });
      }
    })
    .catch(error => {
      res.json({ code: 1, place: ".findByIdAndUpdate()", error });
    });
});

// confirm (SKRILL and confirm in the same request)
// clusterID
router.put("/confirm", (req, res) => {
  // SKRILL
  SoldBooksCluster.findByIdAndUpdate(
    req.body.clusterID,
    { confirmed: true },
    { new: true }
  )
    .then(cluster => {
      if (!cluster) {
        res.json({
          code: 1.5,
          message: "Nessun cluster trovato con questo id"
        });
      } else {
        res.json({ code: 0, cluster });
      }
    })
    .catch(error => {
      res.json({ code: 1, place: ".findByIdAndUpdate()", error });
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
          message: "Libro non trovato. Forse lo hai già eliminato"
        });
      } else {
        res.json({ code: 0, message: "Libro eliminato con successo" });
      }
    })
    .catch(error => {
      res.json({ code: 1, place: ".findByIdAndDelete()", error });
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

module.exports = router;
