import React, { useState, useEffect, useCallback, useRef } from "react";
import io from "socket.io-client";
import { getSession } from "../services/authStorage.js";
import "../styles/taixiu.css";

const socket = io("https://daihocnonglambacgiang.onrender.com", {
  transports: ["websocket", "polling"],
  reconnection: true
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
  
  // Game State - Khoi phuc tinh nang nho bo nho
  const [timer, setTimer] = useState(() => {
    const saved = Number(localStorage.getItem("tx_timer"));
    return (saved > 0 && saved <= 30) ? saved : 30;
  });
  const [phase, setPhase] = useState(() => localStorage.getItem("tx_phase") || "betting");
  const [dices, setDices] = useState(() => JSON.parse(localStorage.getItem("tx_dices")) || [1, 1, 1]);
  const [isBowlClosed, setIsBowlClosed] = useState(() => localStorage.getItem("tx_bowl") !== "open");
  const [isShaking, setIsShaking] = useState(false);
  const [totalPool, setTotalPool] = useState(() => JSON.parse(localStorage.getItem("tx_pool")) || { tai: 0, xiu: 0 });
  const [sessionId, setSessionId] = useState(() => Number(localStorage.getItem("tx_sid")) || Math.floor(Date.now() / 60000));
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem("tx_history")) || []);

  // Luu vao LocalStorage moi khi trang thai thay doi
  useEffect(() => {
    localStorage.setItem("tx_timer", timer);
    localStorage.setItem("tx_phase", phase);
    localStorage.setItem("tx_dices", JSON.stringify(dices));
    localStorage.setItem("tx_bowl", isBowlClosed ? "closed" : "open");
    localStorage.setItem("tx_pool", JSON.stringify(totalPool));
    localStorage.setItem("tx_sid", sessionId);
    localStorage.setItem("tx_history", JSON.stringify(history));
  }, [timer, phase, dices, isBowlClosed, totalPool, sessionId, history]);

  // Refs to handle sync vs local
  const lastServerTick = useRef(0);
  const isOnline = useRef(false);

  const totalDice = dices.reduce((a, b) => a + b, 0);

  const handlePhaseChange = useCallback((newPhase, resultDices) => {
    if (newPhase === "betting") {
      setIsBowlClosed(true);
      setIsShaking(true);
      setTimer(30);
      setSessionId(s => s + 1);
      setTimeout(() => setIsShaking(false), 2000); 
    } else if (newPhase === "result") {
      setIsBowlClosed(false);
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        if (resultDices) {
          setDices(resultDices);
        } else {
          // Local Random Result if no server dices
          setDices([
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1
          ]);
        }
      }, 1500);
    }
  }, []);

  useEffect(() => {
    if (!session) return;

    // Listeners
    socket.on("loginSuccess", (data) => data && data.balance !== undefined && setBalance(data.balance));
    socket.on("balanceUpdate", (data) => data && data.username === session.username && setBalance(data.newBalance));
    socket.on("taixiuHistory", (data) => Array.isArray(data) && setHistory(data.slice(-20)));

    socket.on("taixiuState", (data) => {
      if (!data) return;
      isOnline.current = true;
      lastServerTick.current = Date.now();
      setTimer(data.timer);
      setSessionId(data.sessionId);
      setPhase(data.phase);
      setDices(data.dices || [1,1,1]);
      setIsBowlClosed(data.phase !== "result");
    });

    socket.on("taixiuTick", (data) => {
      if (!data) return;
      isOnline.current = true;
      lastServerTick.current = Date.now();
      setTimer(data.timer);
      setSessionId(data.sessionId);
      if (data.totalPool) setTotalPool(data.totalPool);
      setPhase(prevPhase => {
        if (data.phase && data.phase !== prevPhase) {
          handlePhaseChange(data.phase, data.dices);
          return data.phase;
        }
        return prevPhase;
      });
    });

    // Connection
    const onConnect = () => {
      socket.emit("login", { username: session.username });
      socket.emit("taixiuJoin");
    };
    if (socket.connected) onConnect();
    else socket.on("connect", onConnect);

    // Hybrid Game Loop
    const interval = setInterval(() => {
      const now = Date.now();
      // Check if server is inactive for more than 3 seconds
      if (now - lastServerTick.current > 3000) {
        isOnline.current = false;
      }

      if (!isOnline.current) {
        // LOCAL LOGIC
        setTimer(prev => {
          if (prev > 1) return prev - 1;
          if (prev === 1) {
             if (phase === "betting") {
               setPhase("result");
               handlePhaseChange("result", null);
               return 10; // Result phase lasts 10s
             } else {
               setPhase("betting");
               handlePhaseChange("betting", null);
               return 30; // Betting phase lasts 30s
             }
          }
          return 0;
        });
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      socket.off("connect", onConnect);
      socket.off("loginSuccess");
      socket.off("balanceUpdate");
      socket.off("taixiuTick");
      socket.off("taixiuState");
    };
  }, [session, phase, handlePhaseChange]);

  // DRAG LOGIC
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const onMouseDown = (e) => {
    if (e.target.closest('.go88-top-deco') || e.target.closest('.go88-table-oval')) {
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

  return (
    <div className="taixiu-modal-overlay">
      <div 
        className="go88-main-container" 
        style={{ transform: `translate(${position.x}px, ${position.y}px)`, cursor: isDragging ? 'grabbing' : 'default' }}
        onMouseDown={onMouseDown}
      >
        <div className="go88-table-oval">
          <div className="circle-icon-btn btn-info"><i className="fa-solid fa-info"></i></div>
          <div className="circle-icon-btn btn-close" onClick={onClose}><i className="fa-solid fa-xmark"></i></div>
          <div className="circle-icon-btn btn-chart"><i className="fa-solid fa-chart-line"></i></div>
          <div className="circle-icon-btn btn-help"><i className="fa-solid fa-question"></i></div>
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
            <button className="btn-cuoc-glossy">CƯỢC</button>
          </div>

          <div className="go88-timer-circle">
             {isBowlClosed && !isShaking ? (
               <span className="go88-timer-val" style={{ zIndex: 20 }}>{timer}</span>
             ) : (
               <div className="dice-container">
                  {!isBowlClosed && <div className="go88-result-val-top">{totalDice}</div>}
                  <Dice3D value={dices[0]} shaking={isShaking} className="dice-1" />
                  <Dice3D value={dices[1]} shaking={isShaking} className="dice-2" />
                  <Dice3D value={dices[2]} shaking={isShaking} className="dice-3" />
               </div>
             )}
             <div className={`go88-bowl-overlay ${isBowlClosed ? '' : 'open'}`}></div>
          </div>

          <div className="go88-side">
            <div className="go88-user-count"><i className="fa-solid fa-user"></i> 1,178</div>
            <div className="go88-text-metallic">XỈU</div>
            <div className="go88-pool-val">{totalPool.xiu.toLocaleString()}</div>
            <button className="btn-cuoc-glossy">CƯỢC</button>
          </div>

          <div className="go88-history-row">
             {history.length > 0 ? history.map((res, i) => (
                <div key={i} className={`hist-dot ${res === 1 ? 'tai' : 'xiu'}`}></div>
             )) : [...Array(15)].map((_, i) => (
                <div key={i} className={`hist-dot ${i % 2 === 0 ? 'tai' : 'xiu'}`}></div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
