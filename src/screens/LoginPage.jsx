import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Toast from "../ui/Toast.jsx";
import { login } from "../services/authStorage.js";

export default function LoginPage() {
  const nav = useNavigate();
  const location = useLocation();

  const from = useMemo(() => location.state?.from || "/lobby", [location.state]);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setToast("");
    try {
      const res = login({ identifier, password });
      if (!res.ok) {
        setToast(res.message || "Đăng nhập thất bại.");
        return;
      }
      nav(from, { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page auth-bg">
      <div className="topbar">
        <div className="brand">
          <span className="brand__dot" />
          <span className="brand__text">TÀI XỈU PRESTIGE</span>
        </div>
      </div>

      <main className="auth">
        <div className="auth__card">
          <div className="auth__header">
            <div className="badge">WELCOME BACK</div>
            <div className="subtitle">HIGH STAKES · ELITE GAMING</div>
          </div>

          <form className="form" onSubmit={onSubmit}>
            <label className="field">
              <span className="field__label">USERNAME OR PHONE</span>
              <div className="input">
                <span className="input__icon" aria-hidden="true">
                  👤
                </span>
                <input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your ID"
                  autoComplete="username"
                  inputMode="text"
                />
              </div>
            </label>

            <label className="field">
              <span className="field__label">PASSWORD</span>
              <div className="input">
                <span className="input__icon" aria-hidden="true">
                  🔒
                </span>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            <div className="row row--between">
              <span className="muted small"> </span>
              <button type="button" className="linklike" disabled>
                Forgot Password?
              </button>
            </div>

            <button className="primary" disabled={busy}>
              {busy ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
              <span className="primary__chev" aria-hidden="true">
                »
              </span>
            </button>

            <div className="divider">
              <span>OR JOIN WITH</span>
            </div>

            <div className="social">
              <button type="button" className="social__btn" disabled>
                Google
              </button>
              <button type="button" className="social__btn" disabled>
                Facebook
              </button>
            </div>

            <div className="footer">
              <span className="muted">Don’t have an account?</span>{" "}
              <Link className="link" to="/register">
                ĐĂNG KÝ
              </Link>
            </div>
          </form>
        </div>
      </main>

      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}

