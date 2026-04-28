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
  }
];

export default function LobbyPage() {
  const nav = useNavigate();
  const [user, setUser] = useState(() => getCurrentUser());
  const [displayName, setDisplayName] = useState("");
  const [displayNameError, setDisplayNameError] = useState("");
  const [jackpotValues, setJackpotValues] = useState(gameCards.map(c => {
    const numericPart = c.val.replace(/,/g, "");
    const parsed = parseInt(numericPart);
    return isNaN(parsed) ? 0 : parsed;
  }));

  // Floating Mini Game position
  const [miniGamePos, setMiniGamePos] = useState({ x: 0, y: 0 });

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
          <div className="logo-main">ĐH Nông Lâm BG</div>
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
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.95) 40%)", padding: "30px 20px 20px", textAlign: "center", borderTop: "1px solid rgba(255, 204, 0, 0.3)" }}>
              <div style={{ 
                fontSize: 28, 
                fontWeight: 1000, 
                background: "linear-gradient(180deg, #fff3a6 0%, #ffcc00 50%, #8b6508 100%)", 
                WebkitBackgroundClip: "text", 
                WebkitTextFillColor: "transparent",
                textTransform: "uppercase",
                marginBottom: 2,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))"
              }}>
                {card.title}
              </div>
              <div style={{ fontSize: 10, color: "#aaa", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2, marginBottom: 5 }}>HŨ THƯỞNG</div>
              <div style={{ 
                fontSize: 34, 
                fontWeight: 1000, 
                color: "#fff",
                textShadow: "0 0 10px rgba(255, 204, 0, 0.8), 0 0 20px rgba(255, 204, 0, 0.4)",
                fontFamily: "monospace"
              }}>
                {jackpotValues[idx].toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Floating Mini Game Bubble */}
      <div className="mini-game-bubble">
        <div className="bubble-content">
          <i className="fa-solid fa-dice" style={{ fontSize: 32 }}></i>
          <span>MINI GAME</span>
        </div>
        <div className="badge-count">31</div>
      </div>

      {/* Segmented Bottom Bar (REBALANCED) */}
      <footer className="footer-bar-premium">
        <div className="footer-content">
          {/* LEFT: Unified VIP Panel */}
          <div className="footer-left-vip-panel">
            <div className="vip-user-card">
              <div className="sdt-badge-premium">Hãy kích hoạt SĐT</div>
              <div className="avatar-ring-animated">
                <img src="/assets/bg_login.png" alt="Avatar" />
              </div>
              <div className="vip-info-box">
                <div className="vip-name">{visibleName}</div>
                <div className="vip-balance">
                  <span className="coin-icon">💰</span>
                  { (user?.balance || 0).toLocaleString() }
                </div>
              </div>
            </div>
            
            <div className="action-btn-gold-large">
              <i className="fa-solid fa-vault"></i>
              <span>RÚT TIỀN</span>
            </div>
          </div>

          {/* CENTER: The Golden Power Button */}
          <div className="footer-center-power">
            <div className="nap-tien-orb-wrap">
              <button className="btn-nap-tien-3d">
                <div className="shine-layer"></div>
                <span>NẠP TIỀN</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Expanded Navigation Panel */}
          <div className="footer-right-nav-panel">
            <div className="nav-group-premium-full">
              <div className="nav-item-premium-large">
                <i className="fa-solid fa-gem"></i>
                <span>SĂN HŨ</span>
              </div>
              <div className="nav-item-premium-large">
                <i className="fa-solid fa-gift"></i>
                <span>NHIỆM VỤ</span>
              </div>
              <div className="nav-item-premium-large">
                <i className="fa-solid fa-fire"></i>
                <span>KHUYẾN MÃI</span>
              </div>
              <div className="nav-item-premium-large">
                <i className="fa-solid fa-users"></i>
                <span>ĐẠI LÝ</span>
              </div>
              <div className="nav-item-premium-large">
                <i className="fa-solid fa-envelope"></i>
                <span>HỘP THƯ</span>
              </div>
              <div className="nav-item-premium-large" onClick={logout}>
                <i className="fa-solid fa-right-from-bracket"></i>
                <span>ĐĂNG XUẤT</span>
              </div>
            </div>
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
