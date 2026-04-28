import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearSession,
  getCurrentUser,
  updateDisplayName
} from "../services/authStorage.js";

const gameCards = [
  {
    id: "promo-banner",
    title: "GO88",
    img: "/assets/banner_taixiu.png",
    val: "TRUY CẬP NGAY",
    badge: "NEW",
    isPromo: true,
    players: "99,999+"
  },
  {
    id: "game-taixiu-normal",
    title: "TÀI XỈU",
    img: "/assets/banner_taixiu.png",
    val: "64,620,513,565",
    badge: "LIVE",
    jackpot: 6,
    players: "12,452"
  },
  {
    id: "game-taixiu-md5",
    title: "TÀI XỈU MD5",
    img: "/assets/banner_taixiu.png",
    val: "411,348,296",
    badge: "MD5",
    jackpot: 4,
    players: "8,921"
  },
  {
    id: "game-xocdia",
    title: "XÓC ĐĨA",
    img: "/assets/bg_login.png",
    val: "4,762,018,602",
    badge: "HOT",
    jackpot: 3,
    players: "5,103"
  },
  {
    id: "game-taixiu-livestream",
    title: "TÀI XỈU",
    img: "/assets/bg_taixiu.png",
    val: "13,830,137,665",
    badge: "LIVE",
    jackpot: 5,
    players: "15,284"
  }
];

const tabs = ["ALL GAMES", "YÊU THÍCH ★", "GAME BÀI", "SLOTS", "LIVE", "KHÁC"];

export default function LobbyPage() {
  const nav = useNavigate();
  const [user, setUser] = useState(() => getCurrentUser());
  const [displayName, setDisplayName] = useState("");
  const [displayNameError, setDisplayNameError] = useState("");
  const [activeTab, setActiveTab] = useState("ALL GAMES");
  const [jackpotValues, setJackpotValues] = useState(gameCards.map(c => parseInt(c.val.replace(/,/g, ''))));

  // Simulate jumping jackpot
  useEffect(() => {
    const timer = setInterval(() => {
      setJackpotValues(prev => prev.map(v => v + Math.floor(Math.random() * 10000)));
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
      <div className="top-decor" />

      {/* Top Bar */}
      <header className="top-bar">
        <div className="marquee-gold">
          <i className="fa-solid fa-bullhorn"></i>
          <marquee scrollamount="5">
            CHÀO MỪNG BẠN ĐẾN VỚI THIÊN ĐƯỜNG CỜ BẠC GO88. CHÚC BẠN CHƠI VUI VẺ VÀ THẮNG LỚN! HÃY CẨN THẬN VỚI CÁC TRANG WEB GIẢ MẠO!
          </marquee>
        </div>

        <div className="logo-container">
          <div className="logo-main" style={{ fontSize: 24 }}>ĐH Nông Lâm BG</div>
          <div className="logo-sub">bafu.D-14G(D-CNTT14A)</div>
        </div>

        <div className="top-right">
          <div style={{ textAlign: 'right', fontSize: 11, color: '#aaa' }}>
            Nạp/Rút bằng <span style={{ color: '#ffcc00' }}>TIỀN ẢO</span> <br/>
            để được xử lý nhanh hơn
          </div>
          <button className="btn-alert">
            <i className="fa-solid fa-triangle-exclamation"></i>
            CẢNH BÁO
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="game-tabs">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`tab-item ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </nav>

      {/* Main Content */}
      <main className="games-scroll">
        {gameCards.map((card, idx) => (
          <div key={card.id} className="vip-card">
            <img src={card.img} alt={card.title} className="card-img" />
            <div className="card-badge">{card.badge}</div>
            <div className="active-players">
              <i className="fa-solid fa-users" style={{ marginRight: 5 }}></i>
              {card.players}
            </div>
            
            <div className="card-footer">
              <div className="game-name">{card.title}</div>
              <div className="jackpot-box">
                <div className="jackpot-val">$ {jackpotValues[idx].toLocaleString()}</div>
              </div>
              <div className="meter-row">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className={`meter-dot ${i < card.jackpot ? "active" : ""}`} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Bottom Bar */}
      <footer className="footer-bar">
        <div className="user-panel">
          <div className="sdt-bubble">Hãy kích hoạt SĐT</div>
          <div className="avatar-gold">
            <img src="/assets/bg_login.png" alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div className="user-info">
            <div className="user-name">{visibleName}</div>
            <div className="user-bal">{ (user?.balance || 0).toLocaleString() }</div>
          </div>
          <button className="action-btn" style={{ marginLeft: 40 }}>
            <i className="fa-solid fa-money-bill-transfer"></i>
            <span>RÚT TIỀN</span>
          </button>
        </div>

        <div className="giant-nap-tien-wrap">
          <button className="giant-nap-tien-btn">NẠP TIỀN</button>
        </div>

        <div className="nav-actions">
          <button className="action-btn">
            <i className="fa-solid fa-coins"></i>
            <span>SĂN HŨ</span>
          </button>
          <button className="action-btn">
            <i className="fa-solid fa-gift"></i>
            <span>NHIỆM VỤ</span>
          </button>
          <div className="mini-game-vip">
            <i className="fa-solid fa-dice" style={{ fontSize: 32, color: '#fff' }}></i>
            <span style={{ fontSize: 10, fontWeight: 1000, marginTop: 4, color: '#ffcc00' }}>MINI GAME</span>
          </div>
          <button className="action-btn" onClick={logout}>
            <i className="fa-solid fa-bars"></i>
            <span>MENU</span>
          </button>
        </div>
      </footer>

      {/* Display Name Modal */}
      {shouldAskDisplayName ? (
        <div className="modal-overlay">
          <div className="modal-prestige">
            <h3 style={{ color: "#ffcc00", fontSize: 32, marginBottom: 20, fontWeight: 1000 }}>Tên Hiển Thị</h3>
            <form onSubmit={submitDisplayName}>
              <p style={{ color: "#fff", marginBottom: 30, fontSize: 18 }}>Chào mừng VIP! Vui lòng nhập tên hiển thị</p>
              <input
                className="premium-input"
                style={{ width: "100%", textAlign: "center", border: "3px solid #ffcc00", background: "#111", color: "#fff", padding: 18, borderRadius: 15, fontSize: 24, fontWeight: 'bold' }}
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (displayNameError) setDisplayNameError("");
                }}
                placeholder="Tên hiển thị..."
                maxLength={15}
              />
              {displayNameError && <div style={{ color: "red", margin: "10px 0" }}>{displayNameError}</div>}
              <button className="alert-ok-btn" style={{ marginTop: 30, background: "var(--gold-3d)", border: "none", padding: 20, borderRadius: 40, color: "#000", fontWeight: 1000, width: "100%", fontSize: 22 }}>
                XÁC NHẬN
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
