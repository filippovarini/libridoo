const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.set("useFindAndModify", false);

const RatingSchema = new Schema({
  rating: {
    type: Number,
    required: true
  },
  insertionDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = Rating = mongoose.model("Ratings", RatingSchema);
