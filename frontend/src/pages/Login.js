import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
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

      const { access_token, user_id, username: name, role } = res.data;
      localStorage.setItem("token", access_token);
      localStorage.setItem("user_id", user_id);
      localStorage.setItem("username", name);
      localStorage.setItem("role", role);

      if (role === "admin") navigate("/admin");
      else if (role === "teacher") navigate("/teacher");
      else if (role === "student") navigate("/student");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Lỗi đăng nhập");
    }
  };

  return (
    <div className="login-container">
      <Card title="🎓 Đăng nhập hệ thống" className="login-card">
        <p className="login-subtitle">Trường Đại học Cần Thơ</p>
        <form onSubmit={handleLogin} className="p-fluid">
          {error && (
            <Message severity="error" text={error} style={{ marginBottom: "1rem" }} />
          )}

          <div className="p-field">
            <label htmlFor="username">Tên đăng nhập</label>
            <InputText
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tên đăng nhập"
              required
            />
          </div>

          <div className="p-field">
            <label htmlFor="password">Mật khẩu</label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              toggleMask
              feedback={false}
              required
            />
          </div>

          <div className="p-field-checkbox" style={{ margin: "1rem 0" }}>
            <Checkbox
              inputId="remember"
              checked={remember}
              onChange={(e) => setRemember(e.checked)}
            />
            <label htmlFor="remember" style={{ marginLeft: "0.5rem" }}>
              Ghi nhớ mật khẩu
            </label>
          </div>

          <Button
            label="Đăng nhập"
            icon="pi pi-sign-in"
            className="p-button-primary"
            type="submit"
          />
        </form>
      </Card>
    </div>
  );
}

export default Login;
