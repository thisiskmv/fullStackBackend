const mongoose = require("mongoose");

const AdSchema = mongoose.Schema({
  name: { type: String, require: true },
  description: { type: String, require: true },
  category: { type: String, require: true },
  image: { type: String, require: true },
  location: { type: String, require: true },
  postedAt: { type: String, require: true },
  price: { type: Number, require: true },
});

// Index the description field for text search
AdSchema.index({ category: "text" });

const AdModel = mongoose.model("Ad", AdSchema);

module.exports = { AdModel };
