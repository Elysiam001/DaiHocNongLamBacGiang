import React, { useState, useEffect, useCallback, useRef } from "react";
import io from "socket.io-client";
import { getSession } from "../services/authStorage.js";
import "../styles/taixiu.css";

const socket = io("https://dainochonglambacgiang.onrender.com");

export default function TaiXiuModal({ onClose, jackpotValue }) {
  const session = getSession();
  const [balance, setBalance] = useState(0);
  const [timer, setTimer] = useState(0);
  const [phase, setPhase] = useState("betting");
  const [dices, setDices] = useState([1, 1, 1]);
  const [isBowlClosed, setIsBowlClosed] = useState(true);
  const [totalPool, setTotalPool] = useState({ tai: 0, xiu: 0 });
  const [sessionId, setSessionId] = useState(0);

  // DRAG STATE
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handlePhaseChange = useCallback((newPhase, resultDices) => {
    if (newPhase === "betting") {
      setIsBowlClosed(true);
    } else if (newPhase === "result") {
      if (resultDices) setDices(resultDices);
      setTimeout(() => setIsBowlClosed(false), 500);
    }
  }, []);

  useEffect(() => {
    if (!session) return;
    socket.emit("login", { username: session.username });
    socket.emit("taixiuJoin");
    socket.on("loginSuccess", (data) => data && data.balance !== undefined && setBalance(data.balance));
    socket.on("balanceUpdate", (data) => data && data.username === session.username && setBalance(data.newBalance));
    socket.on("taixiuTick", (data) => {
      if (!data) return;
      setTimer(data.timer || 0);
      setSessionId(data.sessionId || 0);
      if (data.totalPool) setTotalPool(data.totalPool);
      setPhase((prev) => {
        if (data.phase && data.phase !== prev) {
          handlePhaseChange(data.phase, data.dices);
          return data.phase;
        }
        return prev;
      });
    });
    return () => {
      socket.off("loginSuccess");
      socket.off("balanceUpdate");
      socket.off("taixiuTick");
    };
  }, [session, handlePhaseChange]);

  // DRAG HANDLERS
  const onMouseDown = (e) => {
    if (e.target.closest('.go88-top-deco') || e.target.closest('.go88-table-oval')) {
       setIsDragging(true);
       setDragOffset({
         x: e.clientX - position.x,
         y: e.clientY - position.y
       });
    }
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
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
    if (phase !== "betting") return;
    socket.emit("taixiuBet", { username: session?.username, side, amount });
  };

  return (
    <div className="taixiu-modal-overlay">
      <div 
        className="go88-main-container" 
        ref={containerRef}
        style={{ transform: `translate(${position.x}px, ${position.y}px)`, cursor: isDragging ? 'grabbing' : 'default' }}
        onMouseDown={onMouseDown}
      >
        {/* OVAL TABLE */}
        <div className="go88-table-oval">
          
          {/* ALL BUTTONS INSIDE OVAL FOR PRECISION */}
          <div className="circle-icon-btn btn-info"><i className="fa-solid fa-info"></i></div>
          <div className="circle-icon-btn btn-close" onClick={onClose}><i className="fa-solid fa-xmark"></i></div>

          <div className="circle-icon-btn btn-chart"><i className="fa-solid fa-chart-line"></i></div>
          <div className="circle-icon-btn btn-help"><i className="fa-solid fa-question"></i></div>
          <div className="circle-icon-btn btn-log"><i className="fa-solid fa-scroll"></i></div>

          <div className="circle-icon-btn btn-rank"><i className="fa-solid fa-trophy"></i></div>
          <div className="circle-icon-btn btn-chat"><i className="fa-solid fa-comment-dots"></i></div>
          <div className="circle-icon-btn btn-mute"><i className="fa-solid fa-hand-dots"></i></div>

          {/* HEADER DECO */}
          <div className="go88-top-deco" style={{ cursor: 'grab' }}>
             <div className="go88-jackpot-wrap">
                <span className="go88-jackpot-val">{(jackpotValue || 0).toLocaleString()}</span>
             </div>
             <div className="go88-session-id">#{sessionId}</div>
          </div>

          {/* TÀI SIDE */}
          <div className="go88-side">
            <div className="go88-user-count"><i className="fa-solid fa-user"></i> 577</div>
            <div className="go88-text-metallic">TÀI</div>
            <div className="go88-pool-val">{totalPool.tai.toLocaleString()}</div>
            <button className="btn-cuoc-glossy" onClick={() => handleBet('tai', 100000)}>CƯỢC</button>
          </div>

          {/* TIMER CENTER */}
          <div className="go88-timer-circle">
             {phase === 'betting' ? (
               <span className="go88-timer-val">{timer}</span>
             ) : (
               <div className="dice-result-wrap">
                  {dices.map((d, i) => <div key={i} className="go88-dice">{d}</div>)}
               </div>
             )}
          </div>

          {/* XỈU SIDE */}
          <div className="go88-side">
            <div className="go88-user-count"><i className="fa-solid fa-user"></i> 1,178</div>
            <div className="go88-text-metallic">XỈU</div>
            <div className="go88-pool-val">{totalPool.xiu.toLocaleString()}</div>
            <button className="btn-cuoc-glossy" onClick={() => handleBet('xiu', 100000)}>CƯỢC</button>
          </div>

          {/* HISTORY DOTS */}
          <div className="go88-history-row">
            {[...Array(18)].map((_, i) => (
              <div key={i} className={`hist-dot ${Math.random() > 0.5 ? 'tai' : 'xiu'}`}></div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
