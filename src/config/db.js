// const dns = require("node:dns");
// const mongoose = require("mongoose");

// // Force Node to use Google DNS instead of 127.0.0.1
// // dns.setServers(["8.8.8.8", "8.8.4.4"]);
// console.log("Connecting to MongoDB...", process.env.DB_URL);

// mongoose
//   .connect(process.env.DB_URL)
//   .then(() => {
//     console.log("✅ Connected to MongoDB");
//   })
//   .catch((err) => {
//     console.error(err);
//   });

const mongoose = require("mongoose");

const mongoUri = process.env.MONGODB_URI_DIRECT || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("No MongoDB URI found. Set MONGODB_URI_DIRECT or MONGODB_URI in .env");
  process.exit(1);
}

// console.log("Attempting MongoDB connection...");

mongoose
  .connect(mongoUri, {
    serverSelectionTimeoutMS: 20000,
    connectTimeoutMS: 20000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    maxPoolSize: 10,
  })
  .then(() => console.log("Database connected"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    if (err.reason && err.reason.servers) {
      console.error("Atlas server list:", Array.from(err.reason.servers.keys()));
    }
    console.error(err);
  });

mongoose.connection.on("error", (err) => {
  console.error("MongoDB runtime error:", err.message);
});

module.exports = mongoose;