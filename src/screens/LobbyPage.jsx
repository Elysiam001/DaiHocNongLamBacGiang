import React from "react";
import { useNavigate } from "react-router-dom";
import { clearSession, getCurrentUser } from "../services/authStorage.js";

export default function LobbyPage() {
  const nav = useNavigate();
  const user = getCurrentUser();

  function logout() {
    clearSession();
    nav("/login", { replace: true });
  }

  return (
    <div className="page lobby-bg">
      <header className="lobby__top">
        <div className="brand brand--compact">
          <span className="brand__dot" />
          <span className="brand__text">TÀI XỈU PRESTIGE</span>
        </div>
        <div className="lobby__user">
          <div className="muted small">Xin chào</div>
          <div className="lobby__name">{user?.username || "Player"}</div>
        </div>
        <button className="ghost" onClick={logout}>
          Đăng xuất
        </button>
      </header>

      <main className="lobby">
        <div className="lobby__hero">
          <div className="lobby__title">SẢNH GAME</div>
          <div className="lobby__desc muted">
            Tạm thời chỉ dựng giao diện + đăng nhập/đăng ký. Phần game Tài/Xỉu sẽ làm tiếp theo.
          </div>
        </div>

        <section className="lobby__grid">
          <div className="tile">
            <div className="tile__badge">HOT</div>
            <div className="tile__title">TÀI XỈU</div>
            <div className="tile__sub muted">Coming soon</div>
          </div>
          <div className="tile">
            <div className="tile__badge">LIVE</div>
            <div className="tile__title">LIVE CASINO</div>
            <div className="tile__sub muted">Coming soon</div>
          </div>
          <div className="tile">
            <div className="tile__badge">NEW</div>
            <div className="tile__title">XÓC ĐĨA</div>
            <div className="tile__sub muted">Coming soon</div>
          </div>
          <div className="tile">
            <div className="tile__badge">SLOTS</div>
            <div className="tile__title">SLOTS</div>
            <div className="tile__sub muted">Coming soon</div>
          </div>
        </section>
      </main>

      <footer className="legal">
        <span>© {new Date().getFullYear()} Tài Xỉu Entertainment.</span>
        <span className="muted">Terms · Privacy · Responsible gaming</span>
      </footer>
    </div>
  );
}

