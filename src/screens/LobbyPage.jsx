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
            <div className="tile__badge">NỔI BẬT</div>
            <div className="tile__title">TÀI XỈU</div>
            <div className="tile__sub muted">Sắp ra mắt</div>
          </div>
          <div className="tile">
            <div className="tile__badge">TRỰC TIẾP</div>
            <div className="tile__title">CASINO TRỰC TUYẾN</div>
            <div className="tile__sub muted">Sắp ra mắt</div>
          </div>
          <div className="tile">
            <div className="tile__badge">MỚI</div>
            <div className="tile__title">XÓC ĐĨA</div>
            <div className="tile__sub muted">Sắp ra mắt</div>
          </div>
          <div className="tile">
            <div className="tile__badge">SLOTS</div>
            <div className="tile__title">SLOTS</div>
            <div className="tile__sub muted">Sắp ra mắt</div>
          </div>
        </section>
      </main>

      <footer className="legal">
        <span>© {new Date().getFullYear()} Tài Xỉu Giải Trí.</span>
        <span className="muted">Điều khoản · Quyền riêng tư · Chơi có trách nhiệm</span>
      </footer>
    </div>
  );
}

