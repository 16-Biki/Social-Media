require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./Routes/auth");
const postRoutes = require("./Routes/posts");

const app = express();
const server = http.createServer(app); // Create HTTP server for Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // React frontend
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors(
  {origin:"*"}
));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// Socket.IO connection setup
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("likePost", (updatedPost) => {
    //  Safety check to avoid undefined/null errors
    if (!updatedPost || !updatedPost._id) return;
    io.emit("postLiked", updatedPost); // Broadcast to all clients
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


app.set("io", io);

// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error("DB error:", err));