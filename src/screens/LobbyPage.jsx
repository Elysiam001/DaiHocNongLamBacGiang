import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TaiXiuModal from "../ui/TaiXiuModal.jsx";
import {
  clearSession,
  getCurrentUser
} from "../services/authStorage.js";
import "../styles/global.css";

export default function LobbyPage() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [isTaiXiuOpen, setIsTaiXiuOpen] = useState(false);
  const [jackpotValues, setJackpotValues] = useState([
    74528740777, 1876884729, 8437235236, 14994947616,
  ]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      nav("/");
    } else {
      setUser(currentUser);
    }

    const timer = setInterval(() => {
      setJackpotValues((prev) =>
        prev.map((val) => val + Math.floor(Math.random() * 10000))
      );
    }, 3000);

    return () => clearInterval(timer);
  }, [nav]);

  const handleLogout = () => {
    clearSession();
    nav("/");
  };

  const gameCards = [
    { id: 1, title: "Tài Xỉu MD5", type: "taixiu", img: "/assets/banner_taixiu.png" },
    { id: 2, title: "Tiến Lên", type: "card", img: "/assets/tienlen_banner_1776964796317.png" },
    { id: 3, title: "Phỏm", type: "card", img: "/assets/phom_banner_1776964820031.png" },
    { id: 4, title: "Nổ Hũ", type: "slot", img: "/assets/banner_taixiu.png" },
  ];

  if (!user) return null;

  return (
    <div className="lobby-container">
      <header className="top-bar">
        <div className="logo-box">
          <div className="logo-main">ELYSIAM</div>
          <div className="logo-sub">CASINO PRESTIGE</div>
        </div>
        <div className="header-actions">
           <button className="btn-logout-premium" onClick={handleLogout}>ĐĂNG XUẤT</button>
        </div>
      </header>

      <main className="main-lobby">
        <div className="game-grid-premium">
          {gameCards.map((card, idx) => (
            <div 
              key={card.id} 
              className="game-card-premium" 
              onClick={() => card.type === 'taixiu' ? setIsTaiXiuOpen(true) : null}
            >
              <img src={card.img} alt={card.title} className="game-img-premium" />
              <div className="jackpot-premium-badge">
                <span className="label">HŨ THƯỞNG</span>
                <span className="value">{jackpotValues[idx]?.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Overlay bàn Tài Xỉu */}
      {isTaiXiuOpen && <TaiXiuModal onClose={() => setIsTaiXiuOpen(false)} jackpotValue={jackpotValues[0]} />}

      <footer className="footer-bar-premium">
        <div className="footer-content">
          <div className="footer-left-vip-panel">
            <div className="vip-user-card">
              <div className="sdt-badge-premium">SĐT: {user.phone}</div>
              <div className="avatar-ring-animated">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="avatar" />
              </div>
              <div className="vip-info-box">
                <div className="vip-name">{user.username}</div>
                <div className="vip-balance">
                   <span className="coin-icon-mini">$</span>
                   {user.balance?.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="action-btn-gold-large">
               <i className="fa-solid fa-gift"></i>
               <span>SỰ KIỆN</span>
            </div>
          </div>

          <div className="footer-center-power">
             <button className="btn-nap-tien-3d">
                <span>NẠP TIỀN</span>
             </button>
          </div>

          <div className="footer-right-nav-panel">
             <div className="nav-group-premium-full">
                <div className="nav-item-premium-large active">
                   <i className="fa-solid fa-house"></i>
                   <span>SẢNH</span>
                </div>
                <div className="nav-item-premium-large">
                   <i className="fa-solid fa-list-check"></i>
                   <span>NHIỆM VỤ</span>
                </div>
                <div className="nav-item-premium-large">
                   <i className="fa-solid fa-headset"></i>
                   <span>HỖ TRỢ</span>
                </div>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
