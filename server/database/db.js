const mongoose = require("mongoose");

const MONGODB_URL = process.env.MONGODB_URL;

const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("Connection to MongoDB database was successfull");
  } catch (error) {
    console.error("Connection to MongoDB database was unsuccessfull: ", error);
    process.exit(1);
  }
};

module.exports = connectToDatabase;
