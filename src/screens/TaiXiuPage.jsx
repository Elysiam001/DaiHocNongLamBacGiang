import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { getSession } from "../services/authStorage.js";
import "../styles/taixiu.css";

const socket = io("https://daihocnonglambacgiang.onrender.com");

export default function TaiXiuPage() {
  const nav = useNavigate();
  const session = getSession();
  
  // Khoi tao state tu LocalStorage de khong bi ve 0 khi reload
  const [balance, setBalance] = useState(0);
  const [timer, setTimer] = useState(() => Number(localStorage.getItem("tx_timer")) || 0);
  const [phase, setPhase] = useState(() => localStorage.getItem("tx_phase") || "betting");
  const [dices, setDices] = useState(() => JSON.parse(localStorage.getItem("tx_dices")) || [1, 1, 1]);
  const [isBowlClosed, setIsBowlClosed] = useState(() => localStorage.getItem("tx_bowl") !== "open");
  const [isShaking, setIsShaking] = useState(false);
  const [myBet, setMyBet] = useState({ tai: 0, xiu: 0 });
  const [totalPool, setTotalPool] = useState(() => JSON.parse(localStorage.getItem("tx_pool")) || { tai: 0, xiu: 0 });
  const [sessionId, setSessionId] = useState(() => Number(localStorage.getItem("tx_sid")) || 0);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem("tx_history")) || []);

  // Luu vao LocalStorage moi khi co thay doi
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
      setMyBet({ tai: 0, xiu: 0 });
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
    if (!session) {
      nav("/login");
      return;
    }

    socket.emit("login", { username: session.username });
    socket.emit("taixiuJoin");

    socket.on("loginSuccess", (data) => {
      if (data && data.balance !== undefined) setBalance(data.balance);
    });

    socket.on("balanceUpdate", (data) => {
      if (data && data.username === session.username) setBalance(data.newBalance);
    });

    socket.on("taixiuHistory", (data) => {
      if (Array.isArray(data)) setHistory(data.slice(-20));
    });

    // Lắng nghe sự kiện Join thành công để cập nhật trạng thái tức thì
    socket.on("taixiuState", (data) => {
      if (!data) return;
      setTimer(data.timer || 0);
      setSessionId(data.sessionId || 0);
      if (data.totalPool) setTotalPool(data.totalPool);
      if (data.history) setHistory(data.history.slice(-20));
      
      setPhase(data.phase);
      if (data.phase === "result") {
        setDices(data.dices || [1,1,1]);
        setIsBowlClosed(false); // Mở bát luôn nếu đang ở phase result
        setIsShaking(false);
      } else {
        setIsBowlClosed(true);
      }
    });

    socket.on("taixiuTick", (data) => {
      if (!data) return;
      setTimer(data.timer || 0);
      setSessionId(data.sessionId || 0);
      if (data.totalPool) setTotalPool(data.totalPool);
      if (data.history) setHistory(data.history.slice(-20));
      
      setPhase((prevPhase) => {
        if (data.phase && data.phase !== prevPhase) {
          handlePhaseChange(data.phase, data.dices);
          return data.phase;
        }
        return prevPhase;
      });
    });

    // Bo dem nguoc local de thoi gian muot ma hon
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(interval);
      socket.off("loginSuccess");
      socket.off("balanceUpdate");
      socket.off("taixiuHistory");
      socket.off("taixiuState");
      socket.off("taixiuTick");
    };
  }, [session, nav, handlePhaseChange]);

  const handleBet = (side, amount) => {
    if (phase !== "betting") return;
    socket.emit("taixiuBet", { username: session?.username, side, amount });
  };

  const totalDice = dices.reduce((a, b) => a + b, 0);

  // Helper component for 3D Dice
  const Dice3D = ({ value, shaking, className }) => (
    <div className={`dice-3d ${className} ${shaking ? 'shaking' : `show-${value}`}`}>
      <div className="dice-face face-1"><div className="dot"></div></div>
      <div className="dice-face face-2"><div className="dot"></div><div className="dot"></div></div>
      <div className="dice-face face-3"><div className="dot"></div><div className="dot"></div><div className="dot"></div></div>
      <div className="dice-face face-4"><div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div></div>
      <div className="dice-face face-5"><div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div><div className="dot"></div></div>
      <div className="dice-face face-6">
        <div className="dot"></div><div className="dot"></div><div className="dot"></div>
        <div className="dot"></div><div className="dot"></div><div className="dot"></div>
      </div>
    </div>
  );

  return (
    <div className="taixiu-modal-overlay">
      <div className="go88-main-container">
        {/* Jackpot & Header Area */}
        <div className="go88-top-deco">
           <div className="go88-jackpot-wrap">
              <span className="go88-jackpot-val">74,611,761,253</span>
           </div>
           <div className="go88-session-id"># {sessionId}</div>
        </div>

        {/* Bàn cược Oval */}
        <div className="go88-table-oval">
          {/* Icon Menu */}
          <div className="circle-icon-btn btn-info"><i>i</i></div>
          <div className="circle-icon-btn btn-chart"></div>
          <div className="circle-icon-btn btn-help"><i>?</i></div>
          <div className="circle-icon-btn btn-log"></div>

          <div className="circle-icon-btn btn-close" onClick={() => nav("/lobby")}><i>×</i></div>
          <div className="circle-icon-btn btn-rank"></div>
          <div className="circle-icon-btn btn-chat"></div>
          <div className="circle-icon-btn btn-mute"></div>

          {/* Cửa TÀI */}
          <div className="go88-side">
            <div className="go88-user-count">👤 641</div>
            <div className="go88-text-metallic">TÀI</div>
            <div className="go88-pool-val">{totalPool.tai.toLocaleString()}</div>
            <button className="btn-cuoc-glossy" onClick={() => handleBet('tai', 100000)}>CƯỢC</button>
          </div>

          {/* Timer & Dice Center */}
          <div className="go88-timer-circle">
             {isBowlClosed && !isShaking ? (
               <span className="go88-timer-val">{timer}</span>
             ) : (
               <div className="dice-container">
                  {/* Điểm số hiện lên ở trên đầu */}
                  {!isBowlClosed && (
                    <div className="go88-result-val-top">{totalDice}</div>
                  )}

                  <Dice3D value={dices[0]} shaking={isShaking} className="dice-1" />
                  <Dice3D value={dices[1]} shaking={isShaking} className="dice-2" />
                  <Dice3D value={dices[2]} shaking={isShaking} className="dice-3" />
               </div>
             )}
             
             <div className={`go88-bowl-overlay ${isBowlClosed ? '' : 'open'}`}></div>
          </div>

          {/* Cửa XỈU */}
          <div className="go88-side">
            <div className="go88-user-count">👤 384</div>
            <div className="go88-text-metallic">XỈU</div>
            <div className="go88-pool-val">{totalPool.xiu.toLocaleString()}</div>
            <button className="btn-cuoc-glossy" onClick={() => handleBet('xiu', 100000)}>CƯỢC</button>
          </div>

          {/* Lịch sử soi cầu bottom (Sử dụng dữ liệu thật) */}
          <div className="go88-history-row">
             {history.map((res, i) => (
               <div key={i} className={`hist-dot ${res === 1 ? 'tai' : 'xiu'}`}></div>
             ))}
          </div>
        </div>

        {/* Chips selector */}
        <div className="go88-chips-bar" style={{ position: 'absolute', bottom: '-80px' }}>
          {[10000, 50000, 100000, 500000, 1000000].map(val => (
            <div key={val} className="go88-chip-item">
              {val >= 1000000 ? (val/1000000)+'M' : (val/1000)+'K'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
