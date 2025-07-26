import React from "react";

function PostList({ posts }) {
  return (
    <div>
      {posts.map(post => (
        <div key={post._id}>
          <h4>{post.author}</h4>
          <p>{post.content}</p>
          {post.media && post.mediaType.startsWith("image/") && <img src={post.media} alt="post" width="200" />}
          {post.media && post.mediaType.startsWith("video/") && (
            <video controls width="250">
              <source src={post.media} type={post.mediaType} />
            </video>
          )}
          <hr />
        </div>
      ))}
    </div>
  );
}

export default PostList;
