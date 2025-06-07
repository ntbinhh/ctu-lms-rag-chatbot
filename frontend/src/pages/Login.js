import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState(""); // Đổi từ email -> username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:8000/login", {
        username,
        password,
      });

      const user = res.data;

      // Lưu thông tin vào localStorage
      localStorage.setItem("user", JSON.stringify(user));

      // Điều hướng theo role
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "teacher") navigate("/teacher");
      else if (user.role === "student") navigate("/student");
      else navigate("/dashboard");

    } catch (err) {
      setError(err.response?.data?.detail || "Lỗi đăng nhập");
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <h1>🎓 Trường Đại học Cần Thơ</h1>
        <p>Chào mừng bạn đến với hệ thống học tập trực tuyến.</p>
        <img
          src="/background-cantho.png"
          alt="CTU Background"
          className="login-background"
        />
      </div>

      <div className="login-right">
        <form onSubmit={handleLogin} className="login-form">
          <h2>Đăng nhập</h2>

          {error && <div className="error">{error}</div>}

          <label>Tên đăng nhập</label>
          <input
            type="text"
            placeholder="Nhập tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Mật khẩu</label>
          <input
            type="password"
            placeholder="Nhập mật khẩu tại đây"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="options">
            <label>
              <input type="checkbox" />
              Ghi nhớ mật khẩu
            </label>
            <a href="#" className="forgot-link">
              Quên mật khẩu
            </a>
          </div>

          <button type="submit" className="login-button">
            ĐĂNG NHẬP
          </button>

          
        </form>
      </div>
    </div>
  );
}

export default Login;
