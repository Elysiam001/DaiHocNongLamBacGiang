import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../ui/Toast.jsx";
import { register } from "../services/authStorage.js";

export default function RegisterPage() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [agree, setAgree] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setToast("");

    if (!agree) return setToast("Bạn cần đồng ý điều khoản và điều kiện.");
    if (password !== confirmPassword) return setToast("Mật khẩu xác nhận không khớp.");

    setBusy(true);
    try {
      const res = register({ username, phone, password, referralCode });
      if (!res.ok) {
        setToast(res.message || "Đăng ký thất bại.");
        return;
      }
      nav("/lobby", { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page auth-bg">
      <div className="topbar">
        <Link to="/login" className="backbtn" aria-label="Quay lại đăng nhập">
          ←
        </Link>
        <div className="topbar__title">
          <div className="title">Tạo Tài Khoản</div>
          <div className="subtitle muted">THAM GIA CÙNG PRESTIGE GAMING</div>
        </div>
        <div className="topbar__spacer" />
      </div>

      <main className="auth">
        <div className="auth__card">
          <form className="form" onSubmit={onSubmit}>
            <label className="field">
              <span className="field__label">TÊN ĐĂNG NHẬP</span>
              <div className="input">
                <span className="input__icon" aria-hidden="true">
                  👤
                </span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  autoComplete="username"
                />
              </div>
            </label>

            <label className="field">
              <span className="field__label">SỐ ĐIỆN THOẠI</span>
              <div className="input">
                <span className="input__icon" aria-hidden="true">
                  📱
                </span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09xx xxx xxx"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </div>
            </label>

            <label className="field">
              <span className="field__label">MẬT KHẨU</span>
              <div className="input">
                <span className="input__icon" aria-hidden="true">
                  🔒
                </span>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 8 ký tự"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </label>

            <label className="field">
              <span className="field__label">XÁC NHẬN MẬT KHẨU</span>
              <div className="input">
                <span className="input__icon" aria-hidden="true">
                  ✅
                </span>
                <input
                  type={showPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  autoComplete="new-password"
                />
              </div>
            </label>

            <label className="field">
              <span className="field__label row row--between">
                <span>MÃ GIỚI THIỆU</span>
                <span className="muted small">Tùy chọn</span>
              </span>
              <div className="input">
                <span className="input__icon" aria-hidden="true">
                  🎁
                </span>
                <input
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Nhập mã giới thiệu"
                />
              </div>
            </label>

            <label className="check">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span>
                Tôi đồng ý với <span className="linklike">điều khoản và điều kiện</span> và
                xác nhận tôi trên 18 tuổi.
              </span>
            </label>

            <button className="primary" disabled={busy}>
              {busy ? "ĐANG TẠO..." : "TẠO TÀI KHOẢN"}
            </button>

            <div className="footer">
              <span className="muted">Đã có tài khoản?</span>{" "}
              <Link className="link" to="/login">
                Đăng nhập
              </Link>
            </div>

            <div className="divider">
              <span>HOẶC THAM GIA NHANH BẰNG</span>
            </div>
            <div className="social">
              <button type="button" className="social__btn" disabled>
                Google
              </button>
              <button type="button" className="social__btn" disabled>
                Facebook
              </button>
            </div>
          </form>
        </div>
      </main>

      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}

