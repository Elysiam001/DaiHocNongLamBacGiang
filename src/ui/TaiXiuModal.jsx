import React, { useState, useEffect, useCallback, useRef } from "react";
import io from "socket.io-client";
import { getSession } from "../services/authStorage.js";
import "../styles/taixiu.css";

const socket = io("/", {
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

  // Logic tính toán thời gian thực tế ngay lập tức
  const getGlobalState = () => {
    const cycleTotal = 45; // 30s betting + 15s result
    const totalSeconds = Math.floor(Date.now() / 1000);
    const currentCycleSec = totalSeconds % cycleTotal;
    const currentSId = Math.floor(totalSeconds / cycleTotal);
    
    if (currentCycleSec < 30) {
      return { 
        timer: 30 - currentCycleSec, 
        phase: "betting", 
        sessionId: currentSId,
        isBowlClosed: true 
      };
    } else {
      return { 
        timer: cycleTotal - currentCycleSec, 
        phase: "result", 
        sessionId: currentSId,
        isBowlClosed: false
      };
    }
  };

  // Game State - Khởi tạo giá trị đúng ngay từ Frame đầu tiên
  const initialState = getGlobalState();
  const [timer, setTimer] = useState(initialState.timer);
  const [phase, setPhase] = useState(initialState.phase);
  const [sessionId, setSessionId] = useState(initialState.sessionId);
  const [isBowlClosed, setIsBowlClosed] = useState(initialState.isBowlClosed);
  
  // Logic tạo kết quả đồng bộ dựa trên số phiên (Seed)
  const getDeterministicResult = (sId) => {
    const seed = sId * 12345;
    const r1 = (Math.sin(seed) * 10000) % 6;
    const r2 = (Math.sin(seed + 1) * 10000) % 6;
    const r3 = (Math.sin(seed + 2) * 10000) % 6;
    return [
      Math.floor(Math.abs(r1)) + 1,
      Math.floor(Math.abs(r2)) + 1,
      Math.floor(Math.abs(r3)) + 1
    ];
  };

  const [dices, setDices] = useState(() => getDeterministicResult(initialState.sessionId));
  const [isShaking, setIsShaking] = useState(false);
  const [totalPool, setTotalPool] = useState({ tai: 0, xiu: 0 });
  const [history, setHistory] = useState([]);

  const totalDice = dices.reduce((a, b) => a + b, 0);

  const handlePhaseChange = useCallback((newPhase, resultDices) => {
    if (newPhase === "betting") {
      setIsBowlClosed(true);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 2000); 
    } else if (newPhase === "result") {
      setIsBowlClosed(false);
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        setDices(resultDices);
      }, 1500);
    }
  }, []);

  useEffect(() => {
    if (!session) return;

    // Listeners from server (if any)
    socket.on("loginSuccess", (data) => data && data.balance !== undefined && setBalance(data.balance));
    socket.on("balanceUpdate", (data) => data && data.username === session.username && setBalance(data.newBalance));
    socket.on("taixiuTick", (data) => {
      if (data) lastUpdate.current = Date.now();
    });

    const onConnect = () => socket.emit("login", { username: session.username });
    if (socket.connected) onConnect();
    else socket.on("connect", onConnect);

    // GLOBAL SYNC LOOP (Pseudo-Server)
    const interval = setInterval(() => {
      const now = Date.now();
      const cycleTotal = 45; // 30s betting + 15s result
      const totalSeconds = Math.floor(now / 1000);
      const currentCycleSec = totalSeconds % cycleTotal;
      const currentSId = Math.floor(totalSeconds / cycleTotal);

      setSessionId(currentSId);

      if (currentCycleSec < 30) {
        // BETTING PHASE
        const newTimer = 30 - currentCycleSec;
        setTimer(newTimer);
        if (phase !== "betting") {
          setPhase("betting");
          handlePhaseChange("betting", null);
        }
      } else {
        // RESULT PHASE
        const newTimer = cycleTotal - currentCycleSec;
        setTimer(newTimer);
        if (phase !== "result") {
          setPhase("result");
          const syncDices = getDeterministicResult(currentSId);
          handlePhaseChange("result", syncDices);
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      socket.off("connect");
      socket.off("loginSuccess");
      socket.off("balanceUpdate");
      socket.off("taixiuTick");
    };
  }, [session, phase, handlePhaseChange]);

  // Sync bowl
  useEffect(() => {
    if (phase === "betting") setIsBowlClosed(true);
    else setIsBowlClosed(false);
  }, [phase]);

  // DRAG
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
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', () => setIsDragging(false));
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
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
            <div className="go88-pool-val">{(sessionId * 1234).toLocaleString()}</div>
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
            <div className="go88-pool-val">{(sessionId * 987).toLocaleString()}</div>
            <button className="btn-cuoc-glossy">CƯỢC</button>
          </div>

          <div className="go88-history-row">
            {[...Array(15)].map((_, i) => {
               const res = getDeterministicResult(sessionId - i - 1).reduce((a,b)=>a+b,0);
               return <div key={i} className={`hist-dot ${res > 10 ? 'tai' : 'xiu'}`}></div>
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
