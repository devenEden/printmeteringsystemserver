const multer = require("multer");
const path = require("path");
const ErrorResponse = require("../../utils/errors/errorResponse");

const extentions = [".xlsx", ".xls"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // eslint-disable-next-line no-undef
    cb(null, `./public/import`);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}--${file.originalname}`);
  },
});

const fileUploader = multer({
  storage,
  fileFilter: (req, file, callback) => {
    const ext = path.extname(file.originalname);
    if (!extentions.includes(ext))
      return callback(new ErrorResponse("Only excel files are allowed", 400));

    callback(null, true);
  },
});

module.exports = fileUploader;
