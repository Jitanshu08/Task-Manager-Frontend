import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import API from "../services/api";
import { toast } from "react-toastify";

const Login = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post("/api/users/login", { email, password });
      const { token } = response.data;
      localStorage.setItem("token", token); // Store token in localStorage
      toast.success("Logged in successfully!");

      setIsLoggedIn(true); 

      // Redirect to Board page after login
      navigate("/board");
    } catch (error) {
      toast.error("Invalid credentials!");
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <button onClick={() => navigate("/register")}>Register</button>
    </div>
  );
};

export default Login;
