const Listing = require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");
const Review = require("./models/review.js");

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

module.exports.isowner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "Only the owners can perform this action!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error);
  } else next();
};

module.exports.isRevieweAuthor = async (req, res, next) => {
  let { reviewId, id } = req.params;

  let review = await Review.findById(reviewId);
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "Only the Author can perform this action!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
