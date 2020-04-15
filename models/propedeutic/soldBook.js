const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.set("useFindAndModify", false);

const SoldBook = new Schema({
  _id: {
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
  price: {
    type: Number,
    required: true
  },
  quality: {
    type: String,
    required: true
  },
  insertionDate: {
    type: Date
  }
});

module.exports = SoldBook;
