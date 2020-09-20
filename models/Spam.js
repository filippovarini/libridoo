const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.set("useFindAndModify", false);

const SpamSchema = new Schema({
  book: Schema.Types.Mixed,
  reportDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = Spam = mongoose.model("Spam", SpamSchema);
