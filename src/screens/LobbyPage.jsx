import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TaiXiuModal from "../ui/TaiXiuModal.jsx";
import {
  clearSession,
  getCurrentUser
} from "../services/authStorage.js";
import "../styles/lobby.css";

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
    { id: 1, title: "Tài Xỉu MD5", type: "taixiu" },
    { id: 2, title: "Tiến Lên", type: "card" },
    { id: 3, title: "Bắn Cá", type: "fish" },
    { id: 4, title: "Nổ Hũ", type: "slot" },
  ];

  if (!user) return null;

  return (
    <div className="lobby-container-bafu">
      <header className="header-bafu">
        <div className="user-info-bafu">
          <div className="avatar-bafu"></div>
          <div className="user-details-bafu">
            <div className="username-bafu">{user.username}</div>
            <div className="balance-bafu">
              Số dư: <span className="gold-text-bafu">{user.balance?.toLocaleString()} đ</span>
            </div>
          </div>
        </div>
        <div className="logo-center-bafu">ELYSIAM CASINO</div>
        <div className="header-actions-bafu">
          <button className="btn-action-bafu">NẠP TIỀN</button>
          <button className="btn-action-bafu logout" onClick={handleLogout}>ĐĂNG XUẤT</button>
        </div>
      </header>

      <main className="main-lobby">
        {gameCards.map((card, idx) => (
          <div 
            key={card.id} 
            className="game-card-bafu" 
            onClick={() => card.type === 'taixiu' ? setIsTaiXiuOpen(true) : null}
          >
            <img src="/assets/banner_taixiu_bafu.png" alt={card.title} className="game-img-bafu" />
            <div className="jackpot-bafu-container">
              <span className="jackpot-bafu-label">HŨ THƯỞNG:</span>
              <span className="jackpot-bafu-value">
                {jackpotValues[idx] ? jackpotValues[idx].toLocaleString() : "0"}
              </span>
            </div>
          </div>
        ))}
      </main>

      {isTaiXiuOpen && <TaiXiuModal onClose={() => setIsTaiXiuOpen(false)} />}

      <footer className="footer-nav-bafu">
        <div className="nav-item-bafu active">SẢNH</div>
        <div className="nav-item-bafu">NHIỆM VỤ</div>
        <div className="nav-item-bafu">SỰ KIỆN</div>
        <div className="nav-item-bafu">HỖ TRỢ</div>
      </footer>
    </div>
  );
}
