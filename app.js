if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const mongo_url = "mongodb://127.0.0.1:27017/wanderlust";
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

//using express router
const reviewsRouter = require("./routes/review.js");
const listingsRouter = require("./routes/listing.js");
const userRouter = require("./routes/user.js");
const dburl = process.env.ATLASDBURL;
async function main() {
  await mongoose.connect(dburl);
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

const store = MongoStore.create({
  mongoUrl: dburl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR in mongo session store!");
});
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // making the date and time of 1 week in milliseconds
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

//Root route

app.use(session(sessionOptions));
app.use(flash()); //use it before routes cuz we gonna use flash through routes :-/

// Use passport after session cuz we need the session for it to know that session is of individul user
app.use(passport.initialize());
app.use(passport.session()); // to identify user from page to page . Their req and res for each user is known as session :-)
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success"); //middleware
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// app.get("/demouser", async (req, res) => {
//   let fakeuser = new User({
//     email: "fakefun@gmail.com",
//     username: "fake-man", // passport local mongoose added username on its own
//   });

//   let registereduser = await User.register(fakeuser, "fake@123"); // new user "fakeuser" with password "fake@123"
//   res.send(registereduser);
// });

//calling the routes :-)
app.get("/", (req, res) => {
  res.redirect("/listings");
});
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter); // issue : the :id param in the param stays in the app.js and doesnt go forward to the review.js
// this is due to being common in the url address above
app.use("/", userRouter);

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
