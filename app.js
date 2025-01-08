const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const mongo_url = "mongodb://127.0.0.1:27017/wanderlust";
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
//using express router
const reviews = require("./routes/review.js");
const listings = require("./routes/listing.js");

async function main() {
  await mongoose.connect(mongo_url);
}
main()
  .then(() => {
    console.log("connected to db!");
  })
  .catch((err) => {
    console.log(err);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsmate);
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // making the date and time of 1 week in milliseconds
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

//Root route
app.get("/", (req, res) => {
  res.send("Hi i am root ");
});

app.use(session(sessionOptions));
app.use(flash()); //use it before routes cuz we gonna use flash through routes :-/

app.use((req, res, next) => {
  res.locals.success = req.flash("success"); //middleware
  res.locals.error = req.flash("error");
  // console.log(res.locals.success);
  next();
});

//calling the routes :-)
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews); // issue : the :id param in the param stays in the app.js and doesnt go forward to the review.js
// this is due to being common in the url address above

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong!" } = err;
  res.render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("server is listening to port 8080 ");
});
