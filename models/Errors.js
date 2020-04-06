const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.set("useFindAndModify", false);

const ErrorSchema = new Schema({
  error: Schema.Types.Mixed,
  accuranceDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = ErrorModel = mongoose.model("Errors", ErrorSchema);
