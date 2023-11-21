const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema({
  reactionBody: { type: String, required: true, maxLength: 280 },
  createdAt: { type: Date, default: Date.now },
  username: { type: String, required: true },
  reactionId: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new Types.ObjectId(),
  },
});

const reaction = mongoose.model("reaction", reactionSchema);

const handleError = (err) => console.error(err);

// Will add data only if collection is empty to prevent duplicates
// More than one document can have the same name value
reaction
  .find({})
  .exec()
  .then((collection) => {
    if (collection.length === 0) {
      reaction
        .insertMany([
          { reactionBody: "oh wow", username: "testing" },
          { reactionBody: "holy moly", username: "Stevio" },
          { reactionBody: "sheesh", username: "Watsoin" },
          { reactionBody: "woooooow", username: "Swagger" },
          { reactionBody: "meh", username: "PeterParker" },
          { reactionBody: "boyoing", username: "HulkHogan" },
          { reactionBody: "what", username: "idk" },
        ])
        .catch((err) => handleError(err));
    }
  });
