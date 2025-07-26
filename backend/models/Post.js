const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId, // can link to user if needed
    author: { type: String, required: true }, // store author's name
    text: String,
    media: [
      {
        data: Buffer,
        contentType: String,
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Each like is by a user
      },
    ],
    comments: [
  {
    userId: mongoose.Schema.Types.ObjectId,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }
],
  },
  { timestamps: true } // ✅ Automatically adds createdAt and updatedAt
);

module.exports = mongoose.model("Post", postSchema);
