import React, { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import { getSession } from "../services/authStorage.js";
import "../styles/taixiu.css";

const socket = io("https://daihocnonglambacgiang.onrender.com", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5
});

const Dice3D = ({ value, shaking, className }) => (
  <div className={`dice-3d ${className} ${shaking ? 'shaking' : `show-${value}`}`}>
    <div className="dice-face face-1"><div className="dot"></div></div>
    <div className="dice-face face-2"><div className="dot"></div><div className="dot"></div></div>
    <div className="dice-face face-3"><div className="dot"></div><div className="dot"></div><div className="dot"></div></div>
    <div className="dice-face face-4"><div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div></div>
    <div className="dice-face face-5"><div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div></div>
    <div className="dice-face face-6"><div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div></div>
  </div>
);

export default function TaiXiuModal({ onClose, jackpotValue }) {
  const session = getSession();
  const [balance, setBalance] = useState(0);
  
  // Dong bo LocalStorage de khong bi reset khi reload
  const [timer, setTimer] = useState(() => {
    const saved = Number(localStorage.getItem("tx_timer"));
    return saved > 0 ? saved : 60; // Mac dinh 60 de thay no chay
  });
  const [phase, setPhase] = useState(() => localStorage.getItem("tx_phase") || "betting");
  const [dices, setDices] = useState(() => JSON.parse(localStorage.getItem("tx_dices")) || [1, 1, 1]);
  const [isBowlClosed, setIsBowlClosed] = useState(() => localStorage.getItem("tx_bowl") !== "open");
  const [isShaking, setIsShaking] = useState(false);
  const [totalPool, setTotalPool] = useState(() => JSON.parse(localStorage.getItem("tx_pool")) || { tai: 0, xiu: 0 });
  const [sessionId, setSessionId] = useState(() => Number(localStorage.getItem("tx_sid")) || 0);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem("tx_history")) || []);

  // DRAG STATE
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  const totalDice = dices.reduce((a, b) => a + b, 0);

  // Luu vao LocalStorage
  useEffect(() => {
    localStorage.setItem("tx_timer", timer);
    localStorage.setItem("tx_phase", phase);
    localStorage.setItem("tx_dices", JSON.stringify(dices));
    localStorage.setItem("tx_bowl", isBowlClosed ? "closed" : "open");
    localStorage.setItem("tx_pool", JSON.stringify(totalPool));
    localStorage.setItem("tx_sid", sessionId);
    localStorage.setItem("tx_history", JSON.stringify(history));
  }, [timer, phase, dices, isBowlClosed, totalPool, sessionId, history]);

  const handlePhaseChange = useCallback((newPhase, resultDices) => {
    if (newPhase === "betting") {
      setIsBowlClosed(true);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 2000); 
    } else if (newPhase === "result") {
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        if (resultDices) setDices(resultDices);
        setTimeout(() => setIsBowlClosed(false), 500);
      }, 1000);
    }
  }, []);

  useEffect(() => {
    if (!session) return;

    const onConnect = () => {
      socket.emit("login", { username: session.username });
      socket.emit("taixiuJoin");
    };

    if (socket.connected) {
      onConnect();
    } else {
      socket.on("connect", onConnect);
    }

    socket.on("loginSuccess", (data) => data && data.balance !== undefined && setBalance(data.balance));
    socket.on("balanceUpdate", (data) => data && data.username === session.username && setBalance(data.newBalance));
    
    socket.on("taixiuHistory", (data) => {
      if (Array.isArray(data)) setHistory(data.slice(-20));
    });

    socket.on("taixiuState", (data) => {
      if (!data) return;
      if (typeof data.timer === 'number') setTimer(data.timer);
      setSessionId(data.sessionId || 0);
      if (data.totalPool) setTotalPool(data.totalPool);
      if (data.history) setHistory(data.history.slice(-20));
      setPhase(data.phase);
      if (data.phase === "result") {
        setDices(data.dices || [1,1,1]);
        setIsBowlClosed(false);
        setIsShaking(false);
      } else {
        setIsBowlClosed(true);
      }
    });

    socket.on("taixiuTick", (data) => {
      if (!data) return;
      if (typeof data.timer === 'number') setTimer(data.timer);
      setSessionId(data.sessionId || 0);
      if (data.totalPool) setTotalPool(data.totalPool);
      if (data.history) setHistory(data.history.slice(-20));
      setPhase(prevPhase => {
        if (data.phase && data.phase !== prevPhase) {
          handlePhaseChange(data.phase, data.dices);
          return data.phase;
        }
        return prevPhase;
      });
    });

    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(interval);
      socket.off("loginSuccess");
      socket.off("balanceUpdate");
      socket.off("taixiuHistory");
      socket.off("taixiuState");
      socket.off("taixiuTick");
    };
  }, [session, handlePhaseChange]);

  const onMouseDown = (e) => {
    if (e.target.closest('.go88-top-deco') || e.target.closest('.go88-table-oval')) {
       if (isHistoryOpen || isRulesOpen) return;
       setIsDragging(true);
       setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    };
    const onMouseUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleBet = (side, amount) => {
    if (phase !== "betting" || !isBowlClosed) return;
    // Logic cuoc thuc te qua socket se them sau
  };

  return (
    <div className="taixiu-modal-overlay">
      <div 
        className="go88-main-container" 
        style={{ transform: `translate(${position.x}px, ${position.y}px)`, cursor: isDragging ? 'grabbing' : 'default' }}
        onMouseDown={onMouseDown}
      >
        <div className="go88-table-oval">
          <div className="circle-icon-btn btn-info" onClick={() => setIsHistoryOpen(true)}><i className="fa-solid fa-info"></i></div>
          <div className="circle-icon-btn btn-close" onClick={onClose}><i className="fa-solid fa-xmark"></i></div>
          <div className="circle-icon-btn btn-chart"><i className="fa-solid fa-chart-line"></i></div>
          <div className="circle-icon-btn btn-help" onClick={() => setIsRulesOpen(true)}><i className="fa-solid fa-question"></i></div>
          <div className="circle-icon-btn btn-log"><i className="fa-solid fa-scroll"></i></div>
          <div className="circle-icon-btn btn-rank"><i className="fa-solid fa-trophy"></i></div>
          <div className="circle-icon-btn btn-chat"><i className="fa-solid fa-comment-dots"></i></div>
          <div className="circle-icon-btn btn-mute"><i className="fa-solid fa-hand-dots"></i></div>

          <div className="go88-top-deco" style={{ cursor: 'grab' }}>
             <div className="go88-jackpot-wrap"><span className="go88-jackpot-val">{(jackpotValue || 0).toLocaleString()}</span></div>
             <div className="go88-session-id">#{sessionId}</div>
          </div>

          <div className="go88-side">
            <div className="go88-user-count"><i className="fa-solid fa-user"></i> 577</div>
            <div className="go88-text-metallic">TÀI</div>
            <div className="go88-pool-val">{totalPool.tai.toLocaleString()}</div>
            <button className="btn-cuoc-glossy" onClick={() => handleBet('tai', 100000)}>CƯỢC</button>
          </div>

          <div className="go88-timer-circle">
             {/* Bộ đếm giây - Luôn nằm trên cùng khi úp bát */}
             {isBowlClosed && !isShaking && (
               <span className="go88-timer-val" style={{ zIndex: 20 }}>{timer}</span>
             )}

             {/* Xúc xắc - Chỉ hiện khi mở bát hoặc đang lắc */}
             {(!isBowlClosed || isShaking) && (
               <div className="dice-container">
                  {!isBowlClosed && <div className="go88-result-val-top">{totalDice}</div>}
                  <Dice3D value={dices[0]} shaking={isShaking} className="dice-1" />
                  <Dice3D value={dices[1]} shaking={isShaking} className="dice-2" />
                  <Dice3D value={dices[2]} shaking={isShaking} className="dice-3" />
               </div>
             )}
             
             {/* Cái Bát - Có z-index là 15 */}
             <div className={`go88-bowl-overlay ${isBowlClosed ? '' : 'open'}`}></div>
          </div>

          <div className="go88-side">
            <div className="go88-user-count"><i className="fa-solid fa-user"></i> 1,178</div>
            <div className="go88-text-metallic">XỈU</div>
            <div className="go88-pool-val">{totalPool.xiu.toLocaleString()}</div>
            <button className="btn-cuoc-glossy" onClick={() => handleBet('xiu', 100000)}>CƯỢC</button>
          </div>

          <div className="go88-history-row">
            {history.map((res, i) => (
              <div key={i} className={`hist-dot ${res === 1 ? 'tai' : 'xiu'}`}></div>
            ))}
          </div>

          {isHistoryOpen && (
            <div className="history-modal-overlay">
              <div className="history-header">
                <div className="history-title">Lịch Sử Cược</div>
                <div className="history-close-btn" onClick={() => setIsHistoryOpen(false)}><i className="fa-solid fa-xmark"></i></div>
              </div>
              <div className="history-body">
                <p style={{color: '#fff', textAlign: 'center', padding: 20}}>Dữ liệu lịch sử đang được cập nhật...</p>
              </div>
            </div>
          )}

          {isRulesOpen && (
            <div className="history-modal-overlay">
              <div className="history-header">
                <div className="history-title">Luật Chơi</div>
                <div className="history-close-btn" onClick={() => setIsRulesOpen(false)}><i className="fa-solid fa-xmark"></i></div>
              </div>
              <div className="history-body" style={{color: '#fff', padding: 20}}>
                <p>4-10: Xỉu</p>
                <p>11-17: Tài</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
