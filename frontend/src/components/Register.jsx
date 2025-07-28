import React, { useState } from "react";
import axios from "axios";
import "./Register.css";

function Register({ setPage }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dobDay: "",
    dobMonth: "",
    dobYear: "",
    gender: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dob = new Date(
      `${form.dobYear.padStart(2, "0")}-${form.dobMonth.padStart(2, "0")}-${form.dobDay.padStart(2, "0")}`
    );

    const dataToSend = {
      name: `${form.firstName} ${form.lastName}`, // FIX: combine first & last name
      email: form.email,
      password: form.password,
      gender: form.gender,
      dob,
    };

    try {
      await axios.post("https://social-media-nj4b.onrender.com/api/auth/register", dataToSend);
      alert("Registered successfully! Now go to the login page.");
      setPage("login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <form onSubmit={handleSubmit} className="register-form">
          <input 
           name="firstName"
           placeholder="Enter first name"
           required 
           onChange={handleChange} 
           value={form.firstName} 
           />
          <input 
            name="lastName" 
            placeholder="Enter surname" 
            required onChange={handleChange} 
            value={form.lastName} 
          />

          <label className="dob-label">Date of Birth</label>
          <div className="dob-select">
            <select name="dobDay" required onChange={handleChange} value={form.dobDay}>
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>

            <select name="dobMonth" required onChange={handleChange} value={form.dobMonth}>
              <option value="">Month</option>
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>

            <select name="dobYear" required onChange={handleChange} value={form.dobYear}>
              <option value="">Year</option>
              {Array.from({ length: 100 }, (_, i) => (
                <option key={i} value={2025 - i}>{2025 - i}</option>
              ))}
            </select>
          </div>

          <label className="gender-label">Gender</label>
          <div className="gender-group">
            <label>
              <input
                type="radio"
                name="gender"
                value="Male"
                required
                onChange={handleChange}
                checked={form.gender === "Male"}
              /> Male
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="Female"
                onChange={handleChange}
                checked={form.gender === "Female"}
              /> Female
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="Other"
                onChange={handleChange}
                checked={form.gender === "Other"}
              /> Other
            </label>
          </div>

          <input
            name="email"
            type="email"
            placeholder="Enter email"
            required
            onChange={handleChange}
            value={form.email}
          />
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            required
            onChange={handleChange}
            value={form.password}
          />

          <button type="submit" className="signup-button">Sign Up</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
