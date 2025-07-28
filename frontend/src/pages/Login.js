import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Card } from "primereact/card";
import { Toast } from "primereact/toast";
import { Divider } from "primereact/divider";
import { Avatar } from "primereact/avatar";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useRef(null);

  const showToast = (severity, summary, detail) => {
    toast.current?.show({
      severity,
      summary,
      detail,
      life: 4000,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      showToast("warn", "Thông tin thiếu", "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8000/login", {
        username: username.trim(),
        password,
      });

      const { access_token, user_id, username: name, role } = res.data;
      
      // Store tokens
      localStorage.setItem("token", access_token);
      localStorage.setItem("user_id", user_id);
      localStorage.setItem("username", name);
      localStorage.setItem("role", role);

      // Remember me functionality
      if (remember) {
        localStorage.setItem("remember_username", username);
      } else {
        localStorage.removeItem("remember_username");
      }

      showToast("success", "Đăng nhập thành công", `Chào mừng ${name}!`);

      // Navigate based on role
      setTimeout(() => {
        if (role === "admin") navigate("/admin");
        else if (role === "teacher") navigate("/teacher");
        else if (role === "student") navigate("/student");
        else if (role === "manager") navigate("/manager");
        else navigate("/");
      }, 1000);
      
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.detail || "Lỗi đăng nhập. Vui lòng thử lại.";
      showToast("error", "Đăng nhập thất bại", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load remembered username on component mount
  React.useEffect(() => {
    const rememberedUsername = localStorage.getItem("remember_username");
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRemember(true);
    }
  }, []);

  return (
    <div className="login-container">
      <Toast ref={toast} />
      
      <div className="login-wrapper">
        <div className="login-left">
          <div className="university-info">
            <Avatar 
              image="/logo192.png" 
              className="university-logo" 
              size="xlarge"
              style={{ width: '80px', height: '80px' }}
            />
            <h1 className="university-name">Đại học Cần Thơ</h1>
            <p className="university-subtitle">Can Tho University</p>
            <Divider />
            <div className="features-list">
              <div className="feature-item">
                <i className="pi pi-graduation-cap"></i>
                <span>Hệ thống quản lý đào tạo</span>
              </div>
              <div className="feature-item">
                <i className="pi pi-users"></i>
                <span>Quản lý học viên và giảng viên</span>
              </div>
              <div className="feature-item">
                <i className="pi pi-calendar"></i>
                <span>Lịch học và thời khóa biểu</span>
              </div>
              <div className="feature-item">
                <i className="pi pi-chart-line"></i>
                <span>Báo cáo và thống kê</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <Card className="login-card">
            <div className="login-header">
              <i className="pi pi-sign-in login-icon"></i>
              <h2 className="login-title">Đăng nhập hệ thống</h2>
              <p className="login-description">Vui lòng nhập thông tin đăng nhập của bạn</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-field">
                <label htmlFor="username" className="field-label">
                  <i className="pi pi-user"></i>
                  Tên đăng nhập
                </label>
                <InputText
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  className="login-input"
                  autoComplete="username"
                  disabled={loading}
                />
              </div>

              <div className="form-field">
                <label htmlFor="password" className="field-label">
                  <i className="pi pi-lock"></i>
                  Mật khẩu
                </label>
                <div className="password-wrapper">
                  <InputText
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="login-input"
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <i 
                    className="pi pi-eye password-toggle-icon"
                    onClick={() => {
                      const passwordField = document.getElementById('password');
                      if (passwordField.type === 'password') {
                        passwordField.type = 'text';
                        document.querySelector('.password-toggle-icon').className = 'pi pi-eye-slash password-toggle-icon';
                      } else {
                        passwordField.type = 'password';
                        document.querySelector('.password-toggle-icon').className = 'pi pi-eye password-toggle-icon';
                      }
                    }}
                  ></i>
                </div>
              </div>

              <div className="form-options">
                <div className="remember-me">
                  <Checkbox
                    inputId="remember"
                    checked={remember}
                    onChange={(e) => setRemember(e.checked)}
                    disabled={loading}
                  />
                  <label htmlFor="remember" className="remember-label">
                    Ghi nhớ đăng nhập
                  </label>
                </div>
                <a href="#forgot" className="forgot-password">
                  Quên mật khẩu?
                </a>
              </div>

              <Button
                label="Đăng nhập"
                icon="pi pi-sign-in"
                className="login-button"
                type="submit"
                loading={loading}
                disabled={loading}
              />
            </form>
          </Card>

          <div className="login-footer">
            <p>&copy; 2025 Trường Đại học Cần Thơ. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
