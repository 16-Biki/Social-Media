import React, { useState } from "react";
import axios from "axios";

function ProfileUploader({ email, refreshUser }) {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("profilePic", file);
   await axios.post(`https://social-media-nj4b.onrender.com/api/auth/uploadProfilePic/${email}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
});

    refreshUser(); // Optional
  };

  return (
    <div style={{ marginBottom: "10px" }}>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload Profile Picture</button>
    </div>
  );
}

export default ProfileUploader;
