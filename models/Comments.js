const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.set("useFindAndModify", false);

const CommentSchema = new Schema({
  comment: {
    type: String,
    required: true
  },
  userId: {
    type: String
  },
  postDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = Comment = mongoose.model("Comments", CommentSchema);
