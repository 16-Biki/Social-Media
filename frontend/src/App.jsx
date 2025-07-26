import React, { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Feed from "./components/Feed";
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("login");
  if (user) {
    return <Feed user={user} setUser={setUser} />;
  }
  const handleLogout = () => {
    setUser(null);
    setPage("login");
  };
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
        <Register   setPage={setPage} />
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