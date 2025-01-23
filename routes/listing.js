const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isowner, validateListing } = require("../middleware.js");
const multer = require("multer");
const { cloudinary } = require("../cloudConfig.js");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAP_KEY;
router
  .route("/")
  .get(
    wrapAsync(async (req, res) => {
      const alllisting = await Listing.find({});
      res.render("listings/index.ejs", { alllisting });
    })
  )
  .post(
    isLoggedIn,
    upload.single("list[image]"),
    validateListing,
    // cloudUpload,
    wrapAsync(async (req, res, next) => {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "wanderlust_Dev",
        allowed_formats: ["png", "jpg", "jpeg"],
      });
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error("Failed to delete the local file:", err);
        } else {
          console.log("Local file deleted successfully.");
        }
      });
      let url = result.secure_url;
      let filename = result.original_filename;

      const newlisting = new Listing(req.body.list);
      const GeoResult = await maptilerClient.geocoding.forward(
        newlisting.location,
        {
          limit: "1",
        }
      );
      let coords = GeoResult.features[0].geometry;
      newlisting.owner = req.user._id;
      newlisting.image = { url, filename };
      newlisting.geometry = coords;
      let test = await newlisting.save();
      console.log(test);
      req.flash("success", "New Listing Created!");
      res.redirect("/listings");
    })
  );

// New route
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

router
  .route("/:id")
  .get(
    wrapAsync(async (req, res) => {
      let { id } = req.params;
      const listing = await Listing.findById(id)
        .populate({
          path: "reviews",
          populate: {
            path: "author",
          },
        })
        .populate("owner");
      if (!listing) {
        req.flash("error", "Listing Doesn't Exist!");
        res.redirect("/listings");
      }

      res.render("listings/show.ejs", { listing });
    })
  )
  .put(
    isLoggedIn,
    isowner,
    upload.single("list[image]"),
    validateListing,
    wrapAsync(async (req, res) => {
      let { id } = req.params;
      let listing = await Listing.findByIdAndUpdate(id, { ...req.body.list });
      if (typeof req.file !== "undefined") {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "wanderlust_Dev",
          allowed_formats: ["png", "jpg", "jpeg"],
        });
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error("Failed to delete the local file:", err);
          } else {
            console.log("Local file deleted successfully.");
          }
        });
        let url = result.secure_url;
        let filename = result.original_filename;

        listing.image = { url, filename };
        await listing.save();
      }

      req.flash("success", "Listing Updated!");
      res.redirect(`/listings/${id}`);
    })
  )
  .delete(
    isLoggedIn,
    isowner,
    wrapAsync(async (req, res) => {
      let { id } = req.params;
      await Listing.findByIdAndDelete(id);
      req.flash("success", "Lisitng Deleted!");
      res.redirect("/listings");
    })
  );

router.get(
  "/:id/edit",
  isLoggedIn,
  isowner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing Doesn't Exist!");
      res.redirect("/listings");
    }
    let originalimageurl = listing.image.url;
    originalimageurl = originalimageurl.replace(
      "/upload",
      "/upload/h_300,w_250"
    );
    res.render("listings/edit.ejs", { listing, originalimageurl });
  })
);

module.exports = router;
