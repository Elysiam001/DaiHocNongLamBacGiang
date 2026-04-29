import React, { useState, useEffect, useCallback, useRef } from "react";
import io from "socket.io-client";
import { getSession } from "../services/authStorage.js";
import "../styles/taixiu.css";

// Ket noi toi Server - Ưu tiên địa chỉ hiện tại của trình duyệt để đồng bộ 100%
const socket = io("/", {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionDelay: 1000
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
  
  // Game State - Không dùng LocalStorage cho Timer để đảm bảo tính Multiplayer
  const [timer, setTimer] = useState(null); // Để null để biết là đang chờ Server
  const [phase, setPhase] = useState("betting");
  const [dices, setDices] = useState([1, 1, 1]);
  const [isBowlClosed, setIsBowlClosed] = useState(true);
  const [isShaking, setIsShaking] = useState(false);
  const [totalPool, setTotalPool] = useState({ tai: 0, xiu: 0 });
  const [sessionId, setSessionId] = useState(0);
  const [history, setHistory] = useState([]);

  const isSynced = useRef(false);

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
        if (resultDices) setDices(resultDices);
      }, 1500);
    }
  }, []);

  useEffect(() => {
    if (!session) return;

    const onConnect = () => {
      socket.emit("login", { username: session.username });
      socket.emit("taixiuJoin");
    };

    socket.on("loginSuccess", (data) => data && data.balance !== undefined && setBalance(data.balance));
    socket.on("balanceUpdate", (data) => data && data.username === session.username && setBalance(data.newBalance));
    
    socket.on("taixiuState", (data) => {
      if (!data) return;
      isSynced.current = true;
      setTimer(data.timer);
      setSessionId(data.sessionId);
      setPhase(data.phase);
      if (data.dices) setDices(data.dices);
      if (data.totalPool) setTotalPool(data.totalPool);
      if (data.history) setHistory(data.history.slice(-20));
    });

    socket.on("taixiuTick", (data) => {
      if (!data) return;
      isSynced.current = true;
      setTimer(data.timer);
      setSessionId(data.sessionId);
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

    if (socket.connected) onConnect();
    else socket.on("connect", onConnect);

    // Countdown locally to keep it smooth between ticks
    const interval = setInterval(() => {
      setTimer(prev => (prev !== null && prev > 0) ? prev - 1 : prev);
    }, 1000);

    return () => {
      clearInterval(interval);
      socket.off("connect", onConnect);
      socket.off("loginSuccess");
      socket.off("balanceUpdate");
      socket.off("taixiuState");
      socket.off("taixiuTick");
    };
  }, [session, handlePhaseChange]);

  // Sync bowl with phase
  useEffect(() => {
    setIsBowlClosed(phase === "betting");
  }, [phase]);

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
             <div className="go88-session-id">#{sessionId || '...'}</div>
          </div>

          <div className="go88-side">
            <div className="go88-user-count"><i className="fa-solid fa-user"></i> 577</div>
            <div className="go88-text-metallic">TÀI</div>
            <div className="go88-pool-val">{totalPool.tai.toLocaleString()}</div>
            <button className="btn-cuoc-glossy">CƯỢC</button>
          </div>

          <div className="go88-timer-circle">
             {isBowlClosed && !isShaking ? (
               <span className="go88-timer-val" style={{ zIndex: 20 }}>{timer !== null ? timer : '...'}</span>
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
            {history.map((res, i) => (
              <div key={i} className={`hist-dot ${res === 1 ? 'tai' : 'xiu'}`}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
