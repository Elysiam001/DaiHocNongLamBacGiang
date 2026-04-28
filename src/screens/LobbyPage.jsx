import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearSession,
  getCurrentUser,
  updateDisplayName
} from "../services/authStorage.js";

const gameCards = [
  {
    id: "promo-slider",
    title: "GO88.COM",
    img: "/assets/banner_taixiu.png",
    val: "TRUY CẬP ĐỂ NHẬN LINK",
    badge: "NEW",
    isPromo: true
  },
  {
    id: "game-taixiu-normal",
    title: "TÀI XỈU",
    img: "/assets/banner_taixiu.png",
    val: "64,620,513,565",
    badge: "LIVE",
    jackpot: 5
  },
  {
    id: "game-taixiu-md5",
    title: "TÀI XỈU MD5",
    img: "/assets/banner_taixiu.png",
    val: "411,348,296",
    badge: "MD5",
    jackpot: 3
  },
  {
    id: "game-xocdia",
    title: "XÓC ĐĨA",
    img: "/assets/bg_login.png",
    val: "4,762,018,602",
    badge: "HOT",
    jackpot: 2
  },
  {
    id: "game-taixiu-livestream",
    title: "TÀI XỈU",
    img: "/assets/bg_taixiu.png",
    val: "13,830,137,665",
    badge: "LIVE",
    jackpot: 4
  }
];

const tabs = ["ALL GAMES", "YÊU THÍCH ★", "GAME BÀI", "SLOTS", "LIVE", "KHÁC"];

export default function LobbyPage() {
  const nav = useNavigate();
  const [user, setUser] = useState(() => getCurrentUser());
  const [displayName, setDisplayName] = useState("");
  const [displayNameError, setDisplayNameError] = useState("");
  const [activeTab, setActiveTab] = useState("ALL GAMES");

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
      <div className="top-decor">
        <div className="banner-red"><i className="fa-solid fa-star"></i></div>
      </div>

      {/* Top Bar */}
      <header className="top-bar">
        <div className="marquee-box">
          <i className="fa-solid fa-volume-high"></i>
          <span>GO88.NG là tên miền mới nhất của GO88, Các trang web khác đều là giả mạo.</span>
        </div>

        <div className="logo-container">
          <div className="logo-main">GO88</div>
          <div className="logo-sub">GO88.COM</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 15, paddingTop: 15 }}>
          <div className="top-notice" style={{ textAlign: 'right', fontSize: 11 }}>
            Nạp/Rút bằng <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>TIỀN ẢO</span> để được xử lý nhanh hơn
          </div>
          <button style={{ background: 'linear-gradient(180deg, #8b0000, #4a0000)', border: '2px solid #ffcc00', borderRadius: 8, padding: '5px 10px', color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ffcc00', marginRight: 5 }}></i>
            CẢNH BÁO
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="game-tabs">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`tab-node ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </nav>

      {/* Main Content */}
      <main className="games-grid">
        {gameCards.map((card) => (
          <div key={card.id} className="card-gold-frame">
            <img src={card.img} alt={card.title} className="card-inner-img" />
            <div className="card-badge-red">{card.badge}</div>
            <div className="card-footer-box">
              <div className="card-name">{card.title}</div>
              <div className="card-price">$ {card.val}</div>
              {!card.isPromo && (
                <div className="jackpot-meter">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className={`meter-dot ${i < card.jackpot ? "on" : ""}`} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </main>

      {/* Bottom Bar */}
      <footer className="footer-bar">
        <div className="profile-section">
          <div className="bubble-activate">Hãy kích hoạt SĐT</div>
          <div className="profile-ring">
            <img src="/assets/bg_login.png" alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div className="profile-info">
            <div className="profile-name">{visibleName}</div>
            <div className="profile-money">{ (user?.balance || 0).toLocaleString() }</div>
          </div>
          <button className="footer-icon-btn" style={{ marginLeft: 30 }}>
            <i className="fa-solid fa-receipt"></i>
            <span>RÚT TIỀN</span>
          </button>
        </div>

        <div className="nap-tien-3d-wrap">
          <button className="nap-tien-3d-btn">NẠP TIỀN</button>
        </div>

        <div className="footer-nav">
          <button className="footer-icon-btn">
            <i className="fa-solid fa-gem"></i>
            <span>SĂN HŨ</span>
          </button>
          <button className="footer-icon-btn">
            <i className="fa-solid fa-gift"></i>
            <span>NHIỆM VỤ</span>
          </button>
          <button className="minigame-circle-btn">
            <i className="fa-solid fa-dice" style={{ fontSize: 24, color: '#fff' }}></i>
            <span style={{ fontSize: 9, fontWeight: 900, marginTop: 2, color: '#ffcc00' }}>MINI GAME</span>
          </button>
          <button className="footer-icon-btn" onClick={logout}>
            <i className="fa-solid fa-bars"></i>
            <span>MENU</span>
          </button>
        </div>
      </footer>

      {/* Display Name Modal */}
      {shouldAskDisplayName ? (
        <div className="modal-overlay">
          <div className="modal-gold-premium">
            <h3 style={{ color: "#ffcc00", fontSize: 28, marginBottom: 20 }}>Tên Hiển Thị</h3>
            <form onSubmit={submitDisplayName}>
              <p style={{ color: "#fff", marginBottom: 25, fontSize: 16 }}>Vui lòng nhập tên hiển thị của bạn</p>
              <input
                className="premium-input"
                style={{ width: "100%", textAlign: "center", border: "2px solid #ffcc00", background: "#111", color: "#fff", padding: 15, borderRadius: 12, fontSize: 20 }}
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (displayNameError) setDisplayNameError("");
                }}
                placeholder="Tên hiển thị (tối đa 15 ký tự)"
                maxLength={15}
              />
              {displayNameError && <div style={{ color: "red", margin: "10px 0" }}>{displayNameError}</div>}
              <button className="alert-ok-btn" style={{ marginTop: 25, background: "var(--gold-3d)", border: "none", padding: 18, borderRadius: 35, color: "#000", fontWeight: 1000, width: "100%", fontSize: 20 }}>
                XÁC NHẬN
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
