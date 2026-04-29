import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import io from "socket.io-client";
import { getSession } from "../services/authStorage.js";
import "../styles/taixiu.css";

const socket = io("/", {
  transports: ["websocket", "polling"],
  reconnection: true
});

const Dice3D = memo(({ value, shaking, className }) => (
  <div className={`dice-3d ${className} ${shaking ? 'shaking' : `show-${value}`}`}>
    <div className="dice-face face-1"><div className="dot"></div></div>
    <div className="dice-face face-2"><div className="dot"></div><div className="dot"></div></div>
    <div className="dice-face face-3"><div className="dot"></div><div className="dot"></div><div className="dot"></div></div>
    <div className="dice-face face-4"><div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div></div>
    <div className="dice-face face-5"><div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div></div>
    <div className="dice-face face-6"><div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div></div>
  </div>
));

export default function TaiXiuModal({ onClose, jackpotValue }) {
  const session = getSession();
  const [balance, setBalance] = useState(0);

  const getGlobalState = () => {
    const cycleTotal = 45; // 30s betting + 15s result
    const totalSeconds = Math.floor(Date.now() / 1000);
    const currentCycleSec = totalSeconds % cycleTotal;
    const currentSId = Math.floor(totalSeconds / cycleTotal);
    
    if (currentCycleSec < 30) {
      return { timer: 30 - currentCycleSec, phase: "betting", sessionId: currentSId, isBowlClosed: true };
    } else {
      return { timer: cycleTotal - currentCycleSec, phase: "result", sessionId: currentSId, isBowlClosed: false };
    }
  };

  const initialState = getGlobalState();
  const [timer, setTimer] = useState(initialState.timer);
  const [phase, setPhase] = useState(initialState.phase);
  const [sessionId, setSessionId] = useState(initialState.sessionId);
  const [isBowlClosed, setIsBowlClosed] = useState(initialState.isBowlClosed);
  
  const getDeterministicResult = (sId) => {
    const seed = sId * 12345;
    const r1 = (Math.sin(seed) * 10000) % 6;
    const r2 = (Math.sin(seed + 1) * 10000) % 6;
    const r3 = (Math.sin(seed + 2) * 10000) % 6;
    return [Math.floor(Math.abs(r1)) + 1, Math.floor(Math.abs(r2)) + 1, Math.floor(Math.abs(r3)) + 1];
  };

  const [dices, setDices] = useState(() => getDeterministicResult(initialState.sessionId));
  const [isShaking, setIsShaking] = useState(false);
  const [isBowlShaking, setIsBowlShaking] = useState(false);

  const totalDice = dices.reduce((a, b) => a + b, 0);
  const isTai = totalDice > 10;

  const handlePhaseChange = useCallback((newPhase, resultDices) => {
    if (newPhase === "betting") {
      setIsBowlClosed(true);
      setIsBowlShaking(true);
      setTimeout(() => setIsBowlShaking(false), 2000); 
    } else if (newPhase === "result") {
      // Shaking before opening
      setIsBowlShaking(true);
      setTimeout(() => {
        setIsBowlShaking(false);
        setIsBowlClosed(false);
        setDices(resultDices);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 1000);
      }, 1000);
    }
  }, []);

  useEffect(() => {
    if (!session) return;
    socket.on("loginSuccess", (data) => data && data.balance !== undefined && setBalance(data.balance));
    socket.on("balanceUpdate", (data) => data && data.username === session.username && setBalance(data.newBalance));

    const interval = setInterval(() => {
      const state = getGlobalState();
      setSessionId(state.sessionId);
      setTimer(state.timer);
      if (state.phase !== phase) {
        setPhase(state.phase);
        const syncDices = getDeterministicResult(state.sessionId);
        handlePhaseChange(state.phase, syncDices);
      }
    }, 1000);

    const onConnect = () => socket.emit("login", { username: session.username });
    if (socket.connected) onConnect();
    else socket.on("connect", onConnect);

    return () => {
      clearInterval(interval);
      socket.off("connect");
      socket.off("loginSuccess");
      socket.off("balanceUpdate");
    };
  }, [session, phase, handlePhaseChange]);

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
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [isDragging, dragOffset]);

  return (
    <div className="taixiu-modal-overlay">
      <div 
        className="go88-main-container" 
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)`, cursor: isDragging ? 'grabbing' : 'default' }}
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

          {/* TAI SIDE */}
          <div className="go88-side">
            <div className={`go88-text-metallic ${phase === "result" && isTai ? 'winner-active' : ''}`}>TÀI</div>
            <div className="go88-pool-val">{(sessionId * 1234).toLocaleString()}</div>
            <button className="btn-cuoc-glossy">CƯỢC</button>
          </div>

          <div className="go88-timer-circle">
             {isBowlClosed && !isShaking ? (
               <span className={`go88-timer-val ${timer <= 5 ? 'timer-low' : ''}`}>{timer}</span>
             ) : (
               <div className="dice-container">
                  <Dice3D value={dices[0]} shaking={isShaking} className="dice-1" />
                  <Dice3D value={dices[1]} shaking={isShaking} className="dice-2" />
                  <Dice3D value={dices[2]} shaking={isShaking} className="dice-3" />
               </div>
             )}
             <div className={`go88-bowl-overlay ${isBowlClosed ? '' : 'open'} ${isBowlShaking ? 'shaking' : ''}`}></div>
          </div>

          {/* XIU SIDE */}
          <div className="go88-side">
            <div className={`go88-text-metallic ${phase === "result" && !isTai ? 'winner-active' : ''}`}>XỈU</div>
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
