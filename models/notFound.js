const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.set("useFindAndModify", false);

const NotFoundSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  email: {
    type: "String",
    required: true
  },
  reportDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = Spam = mongoose.model("NotFound", NotFoundSchema);
