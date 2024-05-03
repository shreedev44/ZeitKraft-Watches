const { file } = require("googleapis/build/src/apis/file");
const multer = require("multer");

const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "C:/Users/shree/website/ZeitKraft Watches/public/uploads/categories/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const brandStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "C:/Users/shree/website/ZeitKraft Watches/public/uploads/brands/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'C:/Users/shree/website/ZeitKraft Watches/public/uploads/products/')
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'C:/Users/shree/website/ZeitKraft Watches/public/uploads/profile/')
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadCategory = multer({
  storage: categoryStorage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
      return cb(
        new Error("Please upload only jpg, jpeg, png, or webp files."),
        false
      );
    }
    cb(undefined, true);
  },
});

const uploadBrand = multer({
  storage: brandStorage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
      return cb(
        new Error("Please upload only jpg, jpeg, png, or webp files."),
        false
      );
    }
    cb(undefined, true);
  },
});

const uploadProduct = multer({
  storage: productStorage,
  fileFilter: (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
      return cb(
        new Error('Please upload only jpg, jpeg, png, or webp files.'),
        false
      );
    }
    cb(undefined, true);
  },
});

const uploadProfile = multer({
  storage: profileStorage,
  fileFilter: (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(
        new Error('Please upload only jpg, jpeg, png'),
        false
      );
    }
    cb(undefined, true);
  },
});

module.exports = {
  uploadCategory,
  uploadBrand,
  uploadProduct,
  uploadProfile
};
