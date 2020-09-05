const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.set("useFindAndModify", false);

const CouponSchema = new Schema({
  code: {
    type: String,
    required: true
  },
  university: {
    type: String,
    required: true
  },
  counter: {
    type: Number,
    default: 0
  },
  average: {
    type: Number,
    default: 0
  }
});

module.exports = CouponModel = mongoose.model("Coupons", CouponSchema);
