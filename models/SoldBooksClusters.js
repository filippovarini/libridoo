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
    type: Date,
    required: true
  },
  confirmationDate: {
    type: Date
  },
  confirmed: {
    type: Boolean,
    default: false
  },
  sellerId: {
    type: String,
    required: true
  },
  buyerId: {
    type: String,
    required: true
  },
  delivery: {
    choosen: {
      type: Boolean
    },
    cost: {
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
  sellerInfo: {
    name: {
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
