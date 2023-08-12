const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  username: { type: String, requires: true },
  email: { type: String, requires: true },
  password: { type: String, requires: true },
});

const UserModel = mongoose.model("user", UserSchema);

module.exports = { UserModel };
