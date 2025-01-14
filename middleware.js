module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirecturl = req.originalUrl;
    req.flash("error", "You must be logged in for this");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveredirtecturl = (req, res, next) => {
  if (req.session.redirecturl) {
    res.locals.redirecturl = req.session.redirecturl;
  }
  next();
};
