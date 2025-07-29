const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId, // Post creator
    author: { type: String, required: true }, // Post creator's name
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
        ref: "User",
      },
    ],
    comments: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        author: { type: String, required: true },  // ✅ Add this line
        text: String,
        createdAt: { type: Date, default: Date.now }
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
