import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearSession,
  getCurrentUser,
  updateDisplayName
} from "../services/authStorage.js";

const gameCards = [
  {
    id: "game-taixiu-md5",
    title: "TÀI XỈU MD5",
    img: "/assets/banner_taixiu.png",
    amount: "576,636,703",
    amount2: "509,086,351",
    badge: "MD5"
  },
  {
    id: "game-taixiu-normal",
    title: "TÀI XỈU",
    img: "/assets/banner_taixiu.png",
    amount: "64,202,123,493",
    badge: "LIVE"
  },
  {
    id: "game-xocdia",
    title: "XÓC ĐĨA",
    img: "/assets/bg_login.png", // Placeholder
    amount: "4,629,988,387",
    badge: "HOT"
  },
  {
    id: "game-taixiu-livestream",
    title: "TÀI XỈU LIVESTREAM",
    img: "/assets/bg_taixiu.png",
    amount: "13,781,615,174",
    badge: "LIVE"
  }
];

const tabs = ["ALL GAMES", "YÊU THÍCH", "GAME BÀI", "SLOTS", "LIVE", "KHÁC"];

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
      {/* Top Bar */}
      <header className="top-bar">
        <div className="top-left">
          <button className="minigame-btn">
            <i className="fa-solid fa-gamepad" style={{ fontSize: 24 }}></i>
            <span>MINI GAME</span>
          </button>
        </div>

        <div className="top-center">
          <div className="logo-box">
            <div className="logo-main">GO88</div>
            <div className="logo-sub">GO88.COM</div>
          </div>
        </div>

        <div className="top-right">
          <div className="top-notice">
            Để được giải đáp thắc mắc, vui lòng liên hệ <br />
            <span>Livechat</span>
          </div>
        </div>
      </header>

      {/* Tabs Bar */}
      <nav className="tabs-bar">
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
      <main className="main-lobby">
        {/* Promo Card (like the one in screenshot) */}
        <div className="game-card" style={{ border: "2px solid #00f2fe", width: 220 }}>
          <img src="/assets/banner_taixiu.png" alt="Promo" style={{ filter: "brightness(0.7)" }} />
          <div style={{ position: "absolute", top: 10, left: 10, background: "red", padding: "2px 10px", color: "#fff", fontWeight: "bold", fontSize: 12 }}>
            CƯỢC NGAY
          </div>
          <div className="game-card-footer">
            <div style={{ fontSize: 10 }}>CHAMPIONS LEAGUE</div>
            <div style={{ color: "#ffcc00", fontWeight: "bold" }}>PSG vs BAYERN</div>
            <div style={{ fontSize: 10 }}>02:00 29/04/2026</div>
          </div>
        </div>

        {gameCards.map((card) => (
          <div key={card.id} className="game-card">
            <img src={card.img} alt={card.title} />
            <div style={{ position: "absolute", top: 5, right: 5, background: "red", padding: "2px 8px", color: "#fff", borderRadius: 4, fontSize: 10, fontWeight: "bold" }}>
              {card.badge}
            </div>
            <div className="game-card-footer">
              <div style={{ fontSize: 12, fontWeight: "bold", color: "#ffcc00", textTransform: "uppercase" }}>{card.title}</div>
              <div className="card-amount">$ {card.amount}</div>
              {card.amount2 && <div style={{ fontSize: 11, color: "#fff" }}>$ {card.amount2}</div>}
            </div>
          </div>
        ))}
      </main>

      {/* Bottom Bar */}
      <footer className="bottom-bar">
        <div className="user-info">
          <div className="user-avatar">
            <img src="/assets/bg_login.png" alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div className="user-details">
            <div className="user-name">{visibleName}</div>
            <div className="user-balance">{ (user?.balance || 0).toLocaleString() }</div>
          </div>
          <button className="nav-item" style={{ marginLeft: 20 }}>
            <i className="fa-solid fa-money-bill-transfer"></i>
            <span>RÚT TIỀN</span>
          </button>
        </div>

        <div className="center-action">
          <button className="naptien-btn">NẠP TIỀN</button>
        </div>

        <div className="bottom-nav">
          <button className="nav-item">
            <i className="fa-solid fa-gem"></i>
            <span>SĂN HŨ</span>
          </button>
          <button className="nav-item">
            <i className="fa-solid fa-list-check"></i>
            <span>NHIỆM VỤ</span>
          </button>
          <button className="nav-item">
            <i className="fa-solid fa-envelope"></i>
            <span>HỘP THƯ</span>
          </button>
          <button className="nav-item" onClick={logout}>
            <i className="fa-solid fa-bars"></i>
            <span>MENU</span>
          </button>
        </div>
      </footer>

      {/* Display Name Modal */}
      {shouldAskDisplayName ? (
        <div className="modal-overlay">
          <div className="modal-content premium-alert" style={{ background: "linear-gradient(145deg, #222, #000)", borderColor: "#ffcc00" }}>
            <h3 style={{ color: "#ffcc00" }}>Tên Hiển Thị</h3>
            <form onSubmit={submitDisplayName}>
              <p>Vui lòng nhập tên hiển thị của bạn</p>
              <input
                className="premium-input"
                style={{ width: "100%", textAlign: "center", border: "1px solid #ffcc00", color: "#fff" }}
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (displayNameError) setDisplayNameError("");
                }}
                placeholder="Tên hiển thị (tối đa 15 ký tự)"
                maxLength={15}
              />
              {displayNameError && <div style={{ color: "red", margin: "10px 0" }}>{displayNameError}</div>}
              <button className="alert-ok-btn" style={{ background: "linear-gradient(180deg, #ffcc00, #886600)", color: "#000" }}>
                XÁC NHẬN
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
