const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

// authentication credentials
const S3_SECRET = require("../config/keys").S3_SECRET_KEY;
const S3_ID = require("../config/keys").S3_KEY_ID;

aws.config.update({
  secretAccessKey: S3_SECRET,
  accessKeyId: S3_ID,
  region: "eu-west-3"
});

var s3 = new aws.S3({});

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
    cb(new Error("Type not allowed, post only jpeg and png"), false);
  } else if (file.size > 3000000) {
    cb(new Error("Too big, less than 3mb!"));
  } else {
    cb(null, true);
  }
};

var upload = multer({
  fileFilter,
  storage: multerS3({
    s3: s3,
    acl: "public-read",
    bucket: "book-cover-images.libridoo",
    metadata: function(req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function(req, file, cb) {
      cb(null, Date.now().toString());
    }
  })
});

module.exports = upload;
