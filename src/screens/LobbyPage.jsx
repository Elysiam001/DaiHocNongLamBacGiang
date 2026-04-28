import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearSession,
  getCurrentUser,
  updateDisplayName
} from "../services/authStorage.js";

const gameCards = [
  {
    id: "game-taixiu-normal",
    title: "TÀI XỈU",
    img: "/assets/banner_taixiu.png",
    val: "64,620,513,565",
    badge: "LIVE",
    jackpot: 7
  },
  {
    id: "game-taixiu-md5",
    title: "TÀI XỈU MD5",
    img: "/assets/banner_taixiu.png",
    val: "411,348,296",
    badge: "MD5",
    jackpot: 4
  },
  {
    id: "game-xocdia",
    title: "XÓC ĐĨA",
    img: "/assets/bg_login.png",
    val: "4,762,018,602",
    badge: "HOT",
    jackpot: 3
  },
  {
    id: "game-taixiu-livestream",
    title: "TÀI XỈU",
    img: "/assets/bg_taixiu.png",
    val: "13,830,137,665",
    badge: "LIVE",
    jackpot: 5
  }
];

export default function LobbyPage() {
  const nav = useNavigate();
  const [user, setUser] = useState(() => getCurrentUser());
  const [displayName, setDisplayName] = useState("");
  const [displayNameError, setDisplayNameError] = useState("");
  const [jackpotValues, setJackpotValues] = useState(gameCards.map(c => parseInt(c.val.replace(/,/g, ''))));

  useEffect(() => {
    const timer = setInterval(() => {
      setJackpotValues(prev => prev.map(v => v + Math.floor(Math.random() * 5000)));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const visibleName = useMemo(
    () => user?.displayName || user?.username || "Player",
    [user]
  );
  const shouldAskDisplayName = !user?.displayName;

  function logout() {
    clearSession();
    nav("/login", { replace: true });
  }

  function submitDisplayName(e) {
    e.preventDefault();
    const res = updateDisplayName(displayName);
    if (!res.ok) {
      setDisplayNameError(res.message || "Không thể lưu tên hiển thị.");
      return;
    }

    setUser(res.user);
    setDisplayName("");
    setDisplayNameError("");
  }

  return (
    <div className="lobby-container">
      {/* Top Bar */}
      <header className="top-bar">
        <div style={{ flex: 1 }}></div>
        <div className="logo-box">
          <div className="logo-main" style={{ fontSize: 24 }}>ĐH Nông Lâm BG</div>
          <div className="logo-sub">bafu.D-14G(D-CNTT14A)</div>
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}>
           <button style={{ background: 'linear-gradient(180deg, #8b0000, #4a0000)', border: '2px solid #ffcc00', borderRadius: 8, padding: '5px 15px', color: '#fff', fontSize: 11, fontWeight: 'bold' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ffcc00', marginRight: 5 }}></i>
            CẢNH BÁO
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-lobby">
        {gameCards.map((card, idx) => (
          <div key={card.id} className="game-card">
            <img src={card.img} alt={card.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", top: 15, right: 10, background: "red", padding: "4px 10px", color: "#fff", borderRadius: 5, fontSize: 12, fontWeight: "bold" }}>
              {card.badge}
            </div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.9)", padding: 15, textAlign: "center", borderTop: "2px solid #ffcc00" }}>
              <div style={{ fontSize: 18, fontWeight: "bold", color: "#ffcc00", marginBottom: 5 }}>{card.title}</div>
              <div style={{ fontSize: 22, fontWeight: "bold", color: "#fff" }}>$ {jackpotValues[idx].toLocaleString()}</div>
            </div>
          </div>
        ))}
      </main>

      {/* Segmented Bottom Bar */}
      <footer className="footer-bar">
        {/* Segment 1: User Profile */}
        <div className="footer-segment user-segment">
          <div className="sdt-box">Hãy kích hoạt SĐT</div>
          <div className="profile-wrap">
            <div className="avatar-gold-ring">
              <img src="/assets/bg_login.png" alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div className="name-bal-box">
              <div className="user-label-name">{visibleName}</div>
              <div className="user-label-bal">{ (user?.balance || 0).toLocaleString() }</div>
            </div>
          </div>
        </div>

        {/* Segment 2: Rút Tiền */}
        <div className="footer-segment rut-tien-segment">
          <div className="nav-item-box">
            <i className="fa-solid fa-money-bill-transfer"></i>
            <span>RÚT TIỀN</span>
          </div>
        </div>

        {/* Segment 3: Nạp Tiền (Giant Center) */}
        <div className="footer-segment nap-tien-segment">
          <button className="btn-nap-3d">
            <span>NẠP TIỀN</span>
          </button>
        </div>

        {/* Segment 4: Nav Actions */}
        <div className="footer-segment nav-segments">
          <div className="nav-item-box">
            <i className="fa-solid fa-gem"></i>
            <span>SĂN HŨ</span>
          </div>
          <div className="nav-item-box">
            <i className="fa-solid fa-gift"></i>
            <span>NHIỆM VỤ</span>
          </div>
          <div className="nav-item-box">
            <i className="fa-solid fa-envelope"></i>
            <span>HỘP THƯ</span>
          </div>
          <div className="mini-game-btn-new">
            <i className="fa-solid fa-dice" style={{ fontSize: 32, color: '#fff' }}></i>
            <span style={{ fontSize: 10, fontWeight: 1000, color: '#ffcc00' }}>MINI GAME</span>
            <div className="badge-count">31</div>
          </div>
          <div className="nav-item-box" onClick={logout}>
            <i className="fa-solid fa-bars"></i>
            <span>MENU</span>
          </div>
        </div>
      </footer>

      {/* Display Name Modal */}
      {shouldAskDisplayName ? (
        <div className="modal-overlay">
          <div className="modal-gold-premium" style={{ background: "#000", border: "4px solid #ffcc00", padding: 40, borderRadius: 30, textAlign: "center" }}>
            <h3 style={{ color: "#ffcc00", fontSize: 28, marginBottom: 20 }}>Tên Hiển Thị</h3>
            <form onSubmit={submitDisplayName}>
              <p style={{ color: "#fff", marginBottom: 25 }}>Vui lòng nhập tên hiển thị</p>
              <input
                style={{ width: "100%", textAlign: "center", border: "2px solid #ffcc00", background: "#111", color: "#fff", padding: 15, borderRadius: 12, fontSize: 20 }}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tên hiển thị..."
                maxLength={15}
              />
              <button style={{ marginTop: 25, background: "linear-gradient(180deg, #ffcc00, #8b6508)", border: "none", padding: 18, borderRadius: 35, color: "#000", fontWeight: 1000, width: "100%", fontSize: 20 }}>
                XÁC NHẬN
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
