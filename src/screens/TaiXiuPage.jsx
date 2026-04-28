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
          <div className="css-coin-icon">$</div>
          <span>{balance.toLocaleString()}</span>
        </div>
      </div>

      {/* Bàn cược MD5 Premium */}
      <div className="md5-board">
        <div className="md5-header">
          <div className="btn-info">i</div>
          <div className="session-id"># {sessionId}</div>
          <div className="btn-close" onClick={() => nav("/lobby")}>×</div>
        </div>

        <div className="md5-main-content">
          {/* Cửa TÀI */}
          <div className="bet-side left">
            <div className="side-stats-top">
              <span className="user-count">107 <i className="fas fa-user"></i></span>
            </div>
            <div className="side-label-img tai">TÀI</div>
            <div className="pool-value">{totalPool.tai.toLocaleString()}</div>
            <button className="btn-bet-action" onClick={() => handleBet('tai', 100000)}>CƯỢC</button>
            <div className="my-confirmed-bet">{myBet.tai > 0 ? `Đã cược: ${myBet.tai.toLocaleString()}` : ''}</div>
          </div>

          {/* Vòng tròn trung tâm */}
          <div className="md5-center">
            <div className="timer-ring">
              <div className="timer-number">{timer}</div>
            </div>
            <div className="dice-display-area">
              <div className="dice-wrap">
                {dices.map((d, i) => (
                  <div key={i} className={`md5-dice d-${d}`}>
                    {[...Array(d)].map((_, dot) => <div key={dot} className="dot"></div>)}
                  </div>
                ))}
              </div>
              {isBowlClosed && <div className="md5-bowl-cover">
                <div className="bowl-handle"></div>
              </div>}
            </div>
          </div>

          {/* Cửa XỈU */}
          <div className="bet-side right">
            <div className="side-stats-top">
              <span className="user-count">149 <i className="fas fa-user"></i></span>
            </div>
            <div className="side-label-img xiu">XỈU</div>
            <div className="pool-value">{totalPool.xiu.toLocaleString()}</div>
            <button className="btn-bet-action" onClick={() => handleBet('xiu', 100000)}>CƯỢC</button>
            <div className="my-confirmed-bet">{myBet.xiu > 0 ? `Đã cược: ${myBet.xiu.toLocaleString()}` : ''}</div>
          </div>
        </div>

        {/* Lịch sử soi cầu */}
        <div className="md5-history-bar">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`history-dot ${Math.random() > 0.5 ? 't' : 'x'}`}></div>
          ))}
        </div>

        {/* Thanh Hash MD5 */}
        <div className="md5-hash-footer">
          <div className="hash-label">CHUỖI HASH</div>
          <div className="hash-value">64eac0de964ce97f506ffad9dd7363db25...</div>
          <div className="btn-copy">COPY</div>
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
