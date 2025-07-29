import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Feed from "./components/Feed";
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("login");

  // ✅ Load user data from localStorage when app starts
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user from storage:", e);
      }
    }
  }, []);

  // ✅ Save only minimal user data to localStorage when user changes
  useEffect(() => {
    if (user) {
      const minimalUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: user.token || null,
        profilePic: user.profilePicUrl || null // store only URL, not binary
      };
      try {
        localStorage.setItem("user", JSON.stringify(minimalUser));
      } catch (e) {
        console.error("Storage quota exceeded:", e);
      }
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setPage("login");
    localStorage.removeItem("user"); // ✅ Clear on logout
  };

  if (user) {
    return <Feed user={user} setUser={setUser} onLogout={handleLogout} />;
  }

  return (
    <div className="frontpage">
      <div className="auth-box">
        <h1>Social Media App</h1>
        {page === "login" ? (
          <>
            <Login setUser={setUser} />
            <div className="switch-link">
              Don’t have an account?{" "}
              <button onClick={() => setPage("register")}>Create new account</button>
            </div>
          </>
        ) : (
          <>
            <Register setPage={setPage} />
            <div className="switch-link">
              Already have an account?{" "}
              <button onClick={() => setPage("login")}>Login here</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
