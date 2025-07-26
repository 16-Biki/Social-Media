const express = require("express");
const multer = require("multer");
const Post = require("../models/Post");
const User = require("../models/User");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create new post
router.post("/create", upload.array("media"), async (req, res) => {
  try {
    const { text, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const media = req.files?.map((file) => ({
      data: file.buffer,
      contentType: file.mimetype,
    })) || [];

    const newPost = new Post({
      userId: user._id,
      author: user.name, // author name stored, profile pic fetched dynamically
      text,
      media,
    });

    await newPost.save();
    res.status(201).json({ message: "Post created", post: newPost });
  } catch (err) {
    console.error("Post creation error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve specific media
router.get("/media/:postId/:index", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).send("Post not found");

    const media = post.media[req.params.index];
    if (!media) return res.status(404).send("Media not found");

    res.set("Content-Type", media.contentType);
    res.send(media.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like/unlike a post
router.put("/like/:postId", async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    const updatedPost = await post.save();

    // FIXED: Add a log to confirm emit
    console.log("Emitting postLiked:", updatedPost._id, "likes:", updatedPost.likes.length);

    // ✅ Emit likePost event to all sockets
    req.app.get("io").emit("postLiked", updatedPost);

    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: "Error updating like" });
  }
});
router.post("/comment/:postId", async (req, res) => {
  try {
    const { userId, author, text } = req.body;

    if (!userId || !text) {
      return res.status(400).json({ error: "userId and text are required" });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Create new comment object
    const newComment = {
      userId,
      author,
      text,
      createdAt: new Date(),
    };

    // Add comment to the post
    post.comments.push(newComment);
    await post.save();

    // Send updated post back
    res.json(post);

    // Emit socket event for real-time update
    req.app.get("io").emit("postCommented", post);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});


module.exports = router;
