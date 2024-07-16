const mongoose = require("mongoose");

function connectDB() {
  return new Promise((resolve, reject) => {
    mongoose.connect(process.env.DATABASE);
    const db = mongoose.connection;

    // Connection events
    db.on("error", (error) => {
      console.error("🔴 connection error:", error);
      reject(error);
    }); // Connection error

    db.once("open", () => {
      console.log("🟢 connected to database");
      resolve(db);
    }); // Connection successful
  });
}

module.exports = { connectDB };
