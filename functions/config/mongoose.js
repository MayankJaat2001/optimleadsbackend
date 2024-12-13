const mongoose = require("mongoose");

const connection_url = process.env.MONGODB_CONNECTION_URL;

const connectToMongoDB = () => {
  console.log("URL -" , connection_url)
  mongoose
    .connect(connection_url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("DB connection successful"))
    .catch((e) => console.log("failed", e))
    .finally(() => console.log("DB Running"));
};

module.exports = connectToMongoDB;