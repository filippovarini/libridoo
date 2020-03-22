const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.set("useFindAndModify", false);
const SoldBook = require("./propedeutic/soldBook");

const SoldBooksClusterSchema = new Schema({
  dealId: {
    type: String,
    required: true
  },
  checkoutDate: {
    type: String,
    required: true
  },
  confirmed: {
    type: Boolean,
    required: true
  },
  sellerId: {
    type: String,
    required: true
  },
  buyerId: {
    type: String,
    required: true
  },
  commonDelivery: {
    choosen: {
      type: Boolean
    },
    price: {
      type: Number
    },
    range: {
      type: String
    },
    timeToMeet: {
      type: Number
    }
  },
  buyerInfo: {
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
      type: String,
      required: true
    },
    schoolLogoURL: {
      type: String,
      required: true
    }
  },
  sellerInfo: {
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
    }
  },
  Books: {
    type: [SoldBook],
    required: true
  }
});

module.exports = SoldBooksCluster = mongoose.model(
  "SoldBooksClusters",
  SoldBooksClusterSchema
);
