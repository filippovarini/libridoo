const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.set("useFindAndModify", false);

const BookSchema = new Schema({
  imageURL: {
    type: String,
    default: null
  },
  title: {
    type: String,
    required: true
  },
  isbn: {
    type: Number,
    default: null
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
    type: Date,
    default: Date.now
  },
  sellerId: {
    type: String,
    required: true
  },
  place: {
    country: {
      type: String,
      required: true
    },
    region: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    }
  }
});

module.exports = Book = mongoose.model("Books", BookSchema);
