import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearSession,
  getCurrentUser,
  updateDisplayName
} from "../services/authStorage.js";

const gameCards = [
  {
    id: "game-taixiu",
    title: "TÀI XỈU",
    img: "/assets/banner_taixiu.png",
    poolLeft: "259,305,000",
    poolRight: "249,756,000",
    highlight: true
  },
  {
    id: "game-tienlen",
    title: "TIẾN LÊN MIỀN NAM",
    img: "/assets/tienlen_banner_1776964796317.png",
    highlight: true
  },
  {
    id: "game-phom",
    title: "PHỎM - TÁ LẢ",
    img: "/assets/phom_banner_1776964820031.png",
    highlight: true
  }
];

export default function LobbyPage() {
  const nav = useNavigate();
  const [user, setUser] = useState(() => getCurrentUser());
  const [displayName, setDisplayName] = useState("");
  const [displayNameError, setDisplayNameError] = useState("");

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
          <div className="logo">
            <i className="fa-solid fa-crown" style={{ color: "#ffd700", fontSize: 24 }}></i>
            <span style={{ fontWeight: 900, color: "#fff", fontStyle: "italic", fontSize: 20 }}>SUN</span>
          </div>
          <div className="user-profile-box">
            <div className="avatar-wrap">
              <img src="/assets/bg_login.png" alt="Avatar" className="avatar-img" />
            </div>
            <div className="username-wrap">
              <span id="player-name">{visibleName}</span>
            </div>
          </div>
        </div>

        <div className="top-center">
          <div className="balance-container">
            <div className="currency-symbol">VNĐ</div>
            <div className="balance-amount" id="player-balance">
              {(user?.balance || 0).toLocaleString()}
            </div>
            <button className="btn-add-money" id="btn-deposit-top">
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>

        <div className="top-right">
          <button className="top-icon-btn" id="btn-fullscreen">
            <i className="fa-solid fa-expand"></i>
            <span>Phóng To</span>
          </button>
          <button className="top-icon-btn">
            <i className="fa-solid fa-bell"></i>
            <span>Tin Tức</span>
          </button>
          <button className="top-icon-btn" id="btn-logout" onClick={logout}>
            <i className="fa-solid fa-gear"></i>
            <span>Đăng Xuất</span>
          </button>
        </div>
      </header>

      {/* Marquee */}
      <div className="marquee-container">
        <marquee behavior="scroll" direction="left" scrollamount="5">
          Chào mừng {visibleName} đến với cổng game uy tín nhất! Chúc các bạn chơi game vui vẻ và thắng lớn!
        </marquee>
      </div>

      {/* Main Game Area */}
      <main className="main-lobby">
        <div className="game-nav-bar">
          <button className="nav-arrow"><i className="fa-solid fa-chevron-left"></i></button>
          <div className="nav-links">
            <button className="nav-link active">ALL</button>
            <button className="nav-link">SLOTS</button>
            <button className="nav-link">GAME BÀI</button>
          </div>
          <button className="nav-arrow"><i className="fa-solid fa-chevron-right"></i></button>
        </div>

        <div className="game-carousel">
          {gameCards.map((card) => (
            <div
              key={card.id}
              className={`game-card ${card.highlight ? "highlight" : ""}`}
              id={card.id}
            >
              <img src={card.img} alt={card.title} />
              <div className={`game-card-footer ${!card.poolLeft ? "single" : ""}`}>
                {card.poolLeft ? (
                  <>
                    <div className="pool-left">
                      TÀI <br /> <span className="small-num">{card.poolLeft}</span>
                    </div>
                    <div className="pool-right">
                      <span className="small-num">{card.poolRight}</span> <br /> XỈU
                    </div>
                  </>
                ) : (
                  card.title
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Bottom Bar */}
      <footer className="bottom-bar-container">
        <div className="bottom-bar-bg">
          <div className="bottom-left">
            <button className="bottom-btn" id="btn-event">
              <i className="fa-solid fa-gift"></i>
              <span>Sự Kiện</span>
            </button>
            <button className="bottom-btn" id="btn-rules">
              <i className="fa-solid fa-book-open"></i>
              <span>Luật Chơi</span>
            </button>
          </div>

          <div className="bottom-center">
            <button id="btn-withdraw-center" className="btn-withdraw-massive">
              RÚT TIỀN
            </button>
          </div>

          <div className="bottom-right">
            <button className="bottom-btn" id="btn-hotline">
              <i className="fa-solid fa-phone"></i>
              <span>Hotline</span>
            </button>
            <button className="bottom-btn" id="btn-livechat">
              <i className="fa-solid fa-comments"></i>
              <span>Live Chat</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Display Name Modal */}
      {shouldAskDisplayName ? (
        <div className="modal-overlay">
          <div className="modal-content premium-alert">
            <h3>Tên Hiển Thị</h3>
            <form onSubmit={submitDisplayName}>
              <p>
                Vui lòng nhập tên hiển thị của bạn
                <br />
                (Tên hiển thị chỉ đặt được một lần duy nhất)
              </p>

              <div style={{ marginBottom: 20 }}>
                <input
                  className="premium-input"
                  style={{ width: "100%", textAlign: "center" }}
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    if (displayNameError) setDisplayNameError("");
                  }}
                  placeholder="Tên hiển thị (tối đa 15 ký tự)"
                  maxLength={15}
                />
              </div>

              {displayNameError ? (
                <div style={{ color: "#ff4d4d", marginBottom: 10 }}>{displayNameError}</div>
              ) : null}

              <button className="alert-ok-btn">XÁC NHẬN</button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
