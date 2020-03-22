const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.set("useFindAndModify", false);

const BookSchema = new Schema({
  imageURL: {
    type: String
  },
  title: {
    type: String,
    required: true
  },
  isbn: {
    type: Number
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
  SellerInfo: {
    SellerId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    rating: {
      type: Number
    },
    city: {
      type: String,
      required: true
    },
    school: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: Number,
      required: true
    },
    avatarImgURL: {
      type: String
    },
    schoolLogoURL: {
      type: String
    },
    DeliveryInfo: {
      range: {
        type: String
      },
      cost: {
        type: Number
      },
      timeToMeet: {
        type: Number
      }
    }
  }
});

module.exports = Book = mongoose.model("Books", BookSchema);
