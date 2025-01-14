const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn } = require("../middleware.js");
const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);

  if (error) {
    throw new ExpressError(400, error);
  } else next();
};

// Index route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const alllisting = await Listing.find({});
    res.render("listings/index.ejs", { alllisting });
  })
);

// New route
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

//Show route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate("reviews")
      .populate("owner");
    if (!listing) {
      req.flash("error", "Listing Doesn't Exist!");
      res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
  })
);

// create route
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res, next) => {
    const newlisting = new Listing(req.body.list);
    newlisting.owner = req.user._id;
    await newlisting.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  })
);

//Edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing Doesn't Exist!");
      res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
  })
);

//Update route
router.put(
  "/:id",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.list });
    res.redirect(`/listings/${id}`);
  })
);

router.delete(
  "/:id",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Lisitng Deleted!");
    res.redirect("/listings");
  })
);

module.exports = router;
