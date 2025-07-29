import React, { useEffect, useState, memo } from "react";
import defaultProfile from "../assets/profile.png";
import axios from "axios";
import PostForm from "./PostForm";
import socket from "../socket.js"; 
import "./Feed.css";

const PostCard = memo(({ post, getProfilePic, user, onDeletePost, onToggleLike, onAddComment }) => {
  const isAuthor = post.userId === user._id;
  const isLiked = post.likes?.includes(user._id);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [visibleCount, setVisibleCount] = useState(2); // initially show 2 comments

const handleCommentSubmit = () => {
  if (!commentText.trim()) return;
  onAddComment(post._id, commentText); // ✅ Removed user.name from here
  setCommentText("");
};

const handleViewMore = () => {
  setVisibleCount(post.comments.length); // show all comments
};
const visibleComments = (post.comments || []).slice(-visibleCount);



  return (
    <div className="post-card">
      <div className="post-header">
        <img
          src={getProfilePic(post.userId)}
          alt="profile"
          className="post-profile-pic"
          onError={(e) => (e.target.src = defaultProfile)}
        />
        <div>
          <strong>{post.author}</strong>
          <div className="post-time">{new Date(post.createdAt).toLocaleString()}</div>
        </div>
        {isAuthor && (
          <button onClick={() => onDeletePost(post._id)} className="delete-button">
              Delete
          </button>
        )}
      </div>

      <div className="post-content">
        <p>{post.text}</p>
        {post.media && post.media.length > 0 && (
          <div className="post-media">
            {post.media.map((m, index) => (
              <img
                key={index}
                src={`https://social-media-nj4b.onrender.com/api/posts/media/${post._id}/${index}`}
                alt="post media"
              />
            ))}
          </div>
        )}
      </div>

      <div className="post-actions">
        <button
          onClick={() => onToggleLike(post._id)}
          className={isLiked ? "like-button liked" : "like-button"}
        >
          👍 Like ({post.likes?.length || 0})
        </button>
        <button onClick={() => setShowComments((prev) => !prev)}>
          💬 Comment ({post.comments?.length || 0})
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
         {visibleComments.map((c, idx) => (
  <div key={idx} className="comment">
    <strong>{c.author || "Unknown User"}</strong>: {c.text}
    <div className="comment-time">{new Date(c.createdAt).toLocaleString()}</div>
  </div>
))}

          {post.comments.length > visibleCount && (
            <button className="view-more" onClick={handleViewMore}>
              View more comments
            </button>
          )}

          <div className="add-comment">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button onClick={handleCommentSubmit} className="send-button">Send</button>
          </div>
        </div>
      )}
    </div>
  );
});


function Feed({ user, setUser }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshPic, setRefreshPic] = useState(Date.now());

  const fetchPosts = async () => {
    try {
      const res = await axios.get("https://social-media-nj4b.onrender.com/api/posts");
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    socket.on("postLiked", (updatedPost) => {
      setPosts((prev) =>
        prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
      );
    });

    socket.on("postCommented", (updatedPost) => {
      setPosts((prev) =>
        prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
      );
    });

    return () => {
      socket.off("postLiked");
      socket.off("postCommented");
    };
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to Logout?");
    if (confirmLogout) {
    setUser(null);
  }
  };

  const getProfilePic = (id) =>
    id
      ? `https://social-media-nj4b.onrender.com/api/auth/profile-pic/${id}?t=${refreshPic}`
      : defaultProfile;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      await axios.post(
        `https://social-media-nj4b.onrender.com/api/auth/uploadProfilePic/${user.email}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setRefreshPic(Date.now());
    } catch (err) {
      console.error("Error uploading profile picture:", err);
    }
  };

  const addNewPost = (post) => {
    setPosts((prev) => [post, ...prev]);
  };

  const handleDeletePost = async (postId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`https://social-media-nj4b.onrender.com/api/posts/${postId}`, {
        data: { userId: user._id },
      });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                likes: p.likes.includes(user._id)
                  ? p.likes.filter((id) => id !== user._id)
                  : [...p.likes, user._id],
              }
            : p
        )
      );

      await axios.put(`https://social-media-nj4b.onrender.com/api/posts/like/${postId}`, {
        userId: user._id,
      });
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  const handleAddComment = async (postId, text) => {
  try {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  userId: user._id,
                  author: user.name,
                  text,
                  createdAt: new Date(),
                },
              ],
            }
          : p
      )
    );

    await axios.post(`https://social-media-nj4b.onrender.com/api/posts/comment/${postId}`, {
      userId: user._id,
      author: user.name,
      text,
    });
  } catch (err) {
    console.error("Failed to add comment:", err);
  }
};


  return (
  <div className="feed-container">
    <div className="profile-post-container">
      <div className="logged-in-user">
        <label htmlFor="profileUpload">
          <img
            src={getProfilePic(user._id)}
            alt="Your profile"
            className="header-profile-pic clickable"
            onError={(e) => (e.target.src = defaultProfile)}
          />
        </label>
        <input
          id="profileUpload"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <h2>{user.name}</h2>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      <PostForm user={user} addNewPost={addNewPost} />
    </div>

    {loading ? (
      <div>Loading feed...</div>
    ) : (
      posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          getProfilePic={getProfilePic}
          user={user}
          onDeletePost={handleDeletePost}
          onToggleLike={handleToggleLike}
          onAddComment={handleAddComment}
        />
      ))
    )}
  </div>
);
}

export default Feed;
