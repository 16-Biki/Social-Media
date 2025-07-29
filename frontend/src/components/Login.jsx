import React, { useState } from "react";
import axios from "axios";

function Login({ setUser }) {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://social-media-nj4b.onrender.com/api/auth/login", form);
      setUser(res.data.user); 
    } catch (error) {
      alert("Invalid user");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" placeholder="Enter email" required onChange={handleChange} />
      <br />
      <input type="password" name="password" placeholder="Enter password" required onChange={handleChange} />
      <br />
      <button type="submit" className="login-button">Log in</button>
    </form>
  );
}

export default Login;
