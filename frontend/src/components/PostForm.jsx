import React, { useState, useRef } from "react";
import axios from "axios";
import "./PostForm.css";

function PostForm({ user, addNewPost }) {
  const [text, setText] = useState("");
  const [media, setMedia] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef(null);

  const handleMediaChange = (e) => {
    setMedia([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text && media.length === 0) return;

    const formData = new FormData();
    formData.append("text", text);
    formData.append("userId", user._id);
    media.forEach((file) => {
      formData.append("media", file);
    });

    // Clear input fields immediately
    setText("");
    setMedia([]);
    if (fileInputRef.current) fileInputRef.current.value = null;

    setIsPosting(true); // Show "Posting..." and disable button

    try {
      const res = await axios.post(
        "http://localhost:5000/api/posts/create",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } } 
        // tells the server that  sending files.
        //Without this header, file uploads will be fail.
      );

      addNewPost({ ...res.data.post, author: user.name, userId: user._id });
    } catch (err) {
      console.error("Error creating post:", err);
    } finally {
      setIsPosting(false); // Re-enable the button
    }
  };

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`What's on your mind, ${user.name}?`}
        disabled={isPosting}
      />
      <div className="post-actions">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleMediaChange}
          ref={fileInputRef}
          disabled={isPosting}
        />
        <button type="submit" disabled={isPosting}>
          {isPosting ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}

export default PostForm;
