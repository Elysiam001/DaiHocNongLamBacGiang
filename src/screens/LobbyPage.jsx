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
    val: "576,636,703",
    badge: "MD5",
    jackpotIdx: 3
  },
  {
    id: "game-taixiu-normal",
    title: "TÀI XỈU",
    img: "/assets/banner_taixiu.png",
    val: "64,202,123,493",
    badge: "LIVE",
    jackpotIdx: 5
  },
  {
    id: "game-xocdia",
    title: "XÓC ĐĨA",
    img: "/assets/bg_login.png",
    val: "4,629,988,387",
    badge: "HOT",
    jackpotIdx: 2
  },
  {
    id: "game-taixiu-livestream",
    title: "TÀI XỈU LIVESTREAM",
    img: "/assets/bg_taixiu.png",
    val: "13,781,615,174",
    badge: "LIVE",
    jackpotIdx: 4
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
        <div className="minigame-area">
          <button className="minigame-btn">
            <i className="fa-solid fa-gamepad" style={{ fontSize: 28, color: "#ffcc00" }}></i>
            <span style={{ fontSize: 10, fontWeight: 900, marginTop: 4 }}>MINI GAME</span>
          </button>
        </div>

        <div className="logo-wrap">
          <div className="logo-text">GO88</div>
          <div className="logo-site">GO88.COM</div>
        </div>

        <div className="top-right-info">
          Để được giải đáp thắc mắc, vui lòng liên hệ <br />
          <span>Livechat</span>
        </div>
      </header>

      {/* Tabs */}
      <nav className="tabs-container">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "YÊU THÍCH" ? <>{tab} ★</> : tab}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Ornate Game Cards */}
        {gameCards.map((card) => (
          <div key={card.id} className="ornate-card">
            <img src={card.img} alt={card.title} className="card-img" />
            <div className="card-label">{card.badge}</div>
            <div className="card-info">
              <div className="card-title">{card.title}</div>
              <div className="card-val">$ {card.val}</div>
              <div className="jackpot-dots">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className={`dot ${i < card.jackpotIdx ? "active" : ""}`} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Bottom Bar */}
      <footer className="bottom-bar">
        <div className="user-block">
          <div className="activate-bubble">Hãy kích hoạt SĐT</div>
          <div className="avatar-circle">
            <img src="/assets/bg_login.png" alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div className="user-details-wrap">
            <div className="user-txt">{visibleName}</div>
            <div className="user-balance">{ (user?.balance || 0).toLocaleString() }</div>
          </div>
          <button className="nav-btn" style={{ marginLeft: 15 }}>
            <i className="fa-solid fa-money-bill-transfer"></i>
            <span>RÚT TIỀN</span>
          </button>
        </div>

        <div className="giant-nap-wrap">
          <button className="giant-nap-btn">NẠP TIỀN</button>
        </div>

        <div className="nav-group">
          <button className="nav-btn">
            <i className="fa-solid fa-gem"></i>
            <span>SĂN HŨ</span>
          </button>
          <button className="nav-btn">
            <i className="fa-solid fa-list-check"></i>
            <span>NHIỆM VỤ</span>
          </button>
          <button className="nav-btn">
            <i className="fa-solid fa-envelope"></i>
            <span>HỘP THƯ</span>
          </button>
          <button className="nav-btn" onClick={logout}>
            <i className="fa-solid fa-bars"></i>
            <span>MENU</span>
          </button>
        </div>
      </footer>

      {/* Display Name Modal */}
      {shouldAskDisplayName ? (
        <div className="modal-overlay">
          <div className="modal-gold">
            <h3 style={{ color: "#ffcc00", fontSize: 24, marginBottom: 15 }}>Tên Hiển Thị</h3>
            <form onSubmit={submitDisplayName}>
              <p style={{ color: "#fff", marginBottom: 20 }}>Vui lòng nhập tên hiển thị của bạn</p>
              <input
                className="premium-input"
                style={{ width: "100%", textAlign: "center", border: "1px solid #ffcc00", background: "#000", color: "#fff", padding: 15, borderRadius: 10, fontSize: 18 }}
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (displayNameError) setDisplayNameError("");
                }}
                placeholder="Tên hiển thị (tối đa 15 ký tự)"
                maxLength={15}
              />
              {displayNameError && <div style={{ color: "red", margin: "10px 0" }}>{displayNameError}</div>}
              <button className="alert-ok-btn" style={{ marginTop: 20, background: "var(--gold-primary)", border: "none", padding: 15, borderRadius: 30, color: "#000", fontWeight: 900, width: "100%" }}>
                XÁC NHẬN
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
