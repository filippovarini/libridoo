const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.set("useFindAndModify", false);

const DealSchema = new Schema({
  buyerId: {
    type: String,
    required: true
  },
  sellerIds: {
    type: [String],
    required: true
  },
  bill: {
    delivery: {
      type: Number
    },
    books: {
      type: Number,
      required: true
    },
    commission: {
      type: Number
    },
    discount: {
      type: Number
    },
    total: {
      type: Number,
      required: true
    }
  },
  checkoutDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = Deal = mongoose.model("Deals", DealSchema);
