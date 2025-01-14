const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

const mongo_url = "mongodb://127.0.0.1:27017/wanderlust";
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

const initDB = async () => {
  await Listing.deleteMany({});
  initdata.data = initdata.data.map((obj) => ({
    ...obj,
    owner: "678648b30418021f7c098849",
  }));
  await Listing.insertMany(initdata.data);
  console.log("Data was initialised");
};
initDB();
