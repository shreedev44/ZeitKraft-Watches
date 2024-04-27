//checking if logged in or not
const isLogin = async (req, res, next) => {
  try {
    if (req.session.admin) {
      next();
    } else {
      res.redirect("/admin/login");
    }
  } catch (err) {
    console.log(err.message);
  }
};

//checking if logged out or not
const isLogout = async (req, res, next) => {
  try {
    if (!req.session.admin) {
      next();
    } else {
      res.redirect("/admin/dashboard");
    }
  } catch (err) {
    console.log(err.message);
  }
};

//checking if the file is supported or not
const isFileSupported = async (req, res, next) => {
  try {
    if (req.fileValidationError) {
      return res.status(500).json({ error: req.fileValidationError.message });
    }
    next();
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  isLogin,
  isLogout,
  isFileSupported,
};
