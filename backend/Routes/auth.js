const express = require("express");
const multer = require("multer");
const User = require("../models/User");
const router = express.Router();

// Use memory storage for profile pictures
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/register", upload.single("profilePic"), async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if email already exists
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Email already registered" });

    const user = new User({
      name,
      email,
      password,
      profilePic: req.file?.buffer || null,
      profilePicType: req.file?.mimetype || null,
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    res.json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/profile-pic/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user?.profilePic) {
      res.set("Content-Type", user.profilePicType);
      return res.send(user.profilePic);
    }
    res.status(404).send("No profile picture");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/uploadProfilePic/:email", upload.single("profilePic"), async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOneAndUpdate(
      { email },
      {
        profilePic: req.file.buffer,
        profilePicType: req.file.mimetype,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile picture updated successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;