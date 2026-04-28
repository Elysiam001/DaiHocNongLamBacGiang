import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { getSession } from "../services/authStorage.js";
import "../styles/taixiu.css";

const socket = io("https://dainochonglambacgiang.onrender.com"); // Kết nối đến server của bạn

export default function TaiXiuPage() {
  const nav = useNavigate();
  const session = getSession();
  const [balance, setBalance] = useState(0);
  const [timer, setTimer] = useState(0);
  const [phase, setPhase] = useState("betting");
  const [dices, setDices] = useState([1, 1, 1]);
  const [isBowlClosed, setIsBowlClosed] = useState(true);
  const [myBet, setMyBet] = useState({ tai: 0, xiu: 0 });
  const [totalPool, setTotalPool] = useState({ tai: 0, xiu: 0 });
  const [sessionId, setSessionId] = useState(0);

  useEffect(() => {
    if (!session) {
      nav("/login");
      return;
    }

    socket.emit("login", { username: session.username });
    socket.emit("taixiuJoin");

    socket.on("loginSuccess", (data) => setBalance(data.balance));
    socket.on("balanceUpdate", (data) => {
      if (data.username === session.username) setBalance(data.newBalance);
    });

    socket.on("taixiuTick", (data) => {
      setTimer(data.timer);
      setSessionId(data.sessionId);
      setTotalPool(data.totalPool);
      
      if (data.phase !== phase) {
        setPhase(data.phase);
        handlePhaseChange(data.phase, data.dices);
      }
    });

    return () => {
      socket.off("loginSuccess");
      socket.off("balanceUpdate");
      socket.off("taixiuTick");
    };
  }, [session, phase]);

  const handlePhaseChange = (newPhase, resultDices) => {
    if (newPhase === "betting") {
      setIsBowlClosed(true);
      setMyBet({ tai: 0, xiu: 0 });
      // Hiệu ứng tung xúc xắc ảo ở đây nếu cần
    } else if (newPhase === "result") {
      setDices(resultDices);
      // Đợi 1 chút rồi mở bát
      setTimeout(() => setIsBowlClosed(false), 500);
    }
  };

  const handleBet = (side, amount) => {
    if (phase !== "betting") return;
    socket.emit("taixiuBet", { username: session.username, side, amount });
  };

  return (
    <div className="taixiu-container">
      {/* Nút thoát */}
      <button className="btn-back-lobby" onClick={() => nav("/lobby")}>
        <i className="fas fa-chevron-left"></i> SẢNH
      </button>

      {/* Thông tin người chơi */}
      <div className="player-info-top">
        <div className="balance-box">
          <img src="/assets/coin.png" alt="coin" />
          <span>{balance.toLocaleString()}</span>
        </div>
      </div>

      {/* Bàn cược Ruby */}
      <div className="ruby-board">
        <div className="round-id">#{sessionId}</div>
        
        <div className="bet-sides">
          {/* Bên TÀI */}
          <div className={`side-box tai ${phase === 'result' && dices.reduce((a,b)=>a+b,0) >= 11 ? 'winner' : ''}`} onClick={() => handleBet('tai', 100000)}>
            <div className="side-title">TÀI</div>
            <div className="total-pool">{totalPool.tai.toLocaleString()}</div>
            <div className="my-bet">Đã cược: {myBet.tai.toLocaleString()}</div>
          </div>

          {/* Khu vực Xúc xắc & Bát */}
          <div className="center-action">
            <div className="timer-display">{timer}</div>
            <div className="dice-area">
              <div className="dice-grid">
                {dices.map((d, i) => (
                  <div key={i} className={`dice dice-${d}`}></div>
                ))}
              </div>
              {isBowlClosed && <div className="bowl-cover"></div>}
            </div>
          </div>

          {/* Bên XỈU */}
          <div className={`side-box xiu ${phase === 'result' && dices.reduce((a,b)=>a+b,0) <= 10 ? 'winner' : ''}`} onClick={() => handleBet('xiu', 100000)}>
            <div className="side-title">XỈU</div>
            <div className="total-pool">{totalPool.xiu.toLocaleString()}</div>
            <div className="my-bet">Đã cược: {myBet.xiu.toLocaleString()}</div>
          </div>
        </div>

        {/* Bảng chip cược */}
        <div className="chip-selector">
          {[10000, 50000, 100000, 500000, 1000000].map(val => (
            <div key={val} className="chip" onClick={() => console.log("Chọn chip", val)}>
              {val >= 1000000 ? (val/1000000)+'M' : (val/1000)+'K'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
