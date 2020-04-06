const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.set("useFindAndModify", false);

const SoldBook = new Schema({
  bookId: {
    type: String,
    required: true
  },
  imageURL: {
    type: String
  },
  title: {
    type: String,
    required: true
  },
  // isbn: Number,
  // price: {
  //   type: Number,
  //   required: true
  // },
  quality: {
    type: String,
    required: true
  },
  insertionDate: {
    type: Date
  }
});

module.exports = SoldBook;
