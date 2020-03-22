const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.set("useFindAndModify", false);

const UserSchema = new Schema({
  avatarImgURL: {
    type: String,
    default: null
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: Number,
    default: null
  },
  city: {
    type: String,
    default: null
  },
  school: {
    type: String,
    default: null
  },
  schoolLogoURL: {
    type: String,
    default: null
  },
  password: {
    type: String,
    required: true
  },
  passwordLength: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    default: null
  },
  bonusPoints: {
    type: Number,
    default: 0
  },
  DeliveryInfo: {
    range: {
      type: String,
      default: null
    },
    cost: {
      type: Number,
      default: null
    },
    timeToMeet: {
      type: Number,
      default: null
    }
  },
  registerDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = User = mongoose.model("Users", UserSchema);