import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { getSession } from "../services/authStorage.js";
import "../styles/taixiu.css";

const socket = io("https://dainochonglambacgiang.onrender.com");

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

  const handlePhaseChange = useCallback((newPhase, resultDices) => {
    if (newPhase === "betting") {
      setIsBowlClosed(true);
      setMyBet({ tai: 0, xiu: 0 });
    } else if (newPhase === "result") {
      if (resultDices) setDices(resultDices);
      setTimeout(() => setIsBowlClosed(false), 500);
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

    socket.on("taixiuTick", (data) => {
      if (!data) return;
      setTimer(data.timer || 0);
      setSessionId(data.sessionId || 0);
      if (data.totalPool) setTotalPool(data.totalPool);
      
      setPhase((prevPhase) => {
        if (data.phase && data.phase !== prevPhase) {
          handlePhaseChange(data.phase, data.dices);
          return data.phase;
        }
        return prevPhase;
      });
    });

    return () => {
      socket.off("loginSuccess");
      socket.off("balanceUpdate");
      socket.off("taixiuTick");
    };
  }, [session, nav, handlePhaseChange]);

  const handleBet = (side, amount) => {
    if (phase !== "betting") return;
    socket.emit("taixiuBet", { username: session?.username, side, amount });
  };

  const totalDice = dices.reduce((a, b) => a + b, 0);

  return (
    <div className="go88-taixiu-wrapper">
      {/* Background mờ ảo phía sau */}
      <div className="lobby-preview-bg"></div>

      {/* Bàn cược Go88 MD5 chính */}
      <div className="go88-board">
        {/* Header với Logo và Session */}
        <div className="go88-header">
          <div className="go88-logo">GO88.COM</div>
          <div className="go88-session-wrap">
             <div className="session-text"># {sessionId}</div>
          </div>
          <div className="go88-close-btn" onClick={() => nav("/lobby")}></div>
        </div>

        {/* Các nút chức năng xung quanh */}
        <div className="side-icons left">
          <div className="icon-btn chart"></div>
          <div className="icon-btn help"></div>
          <div className="icon-btn history"></div>
        </div>
        <div className="side-icons right">
          <div className="icon-btn rank"></div>
          <div className="icon-btn chat"></div>
          <div className="icon-btn sound"></div>
        </div>

        <div className="go88-main-content">
          {/* Bên TÀI */}
          <div className={`go88-side tai ${phase === 'result' && totalDice >= 11 ? 'winner' : ''}`}>
             <div className="user-info-box">
                <span className="user-count-icon"></span>
                <span className="count-val">3,762</span>
             </div>
             <div className="label-tai">TÀI</div>
             <div className="pool-val">{(totalPool?.tai || 0).toLocaleString()}</div>
             <button className="go88-bet-btn" onClick={() => handleBet('tai', 100000)}>CƯỢC</button>
          </div>

          {/* Vòng tròn Timer trung tâm */}
          <div className="go88-center">
             <div className="go88-timer-ring">
                <div className="timer-val">{timer}</div>
             </div>
             <div className="go88-dice-area">
                <div className="go88-dice-wrap">
                  {dices.map((d, i) => (
                    <div key={i} className={`go88-dice d-${d}`}>
                      {[...Array(d)].map((_, dot) => <div key={dot} className="dot"></div>)}
                    </div>
                  ))}
                </div>
                {isBowlClosed && <div className="go88-bowl-cover"></div>}
             </div>
          </div>

          {/* Bên XỈU */}
          <div className={`go88-side xiu ${phase === 'result' && totalDice <= 10 ? 'winner' : ''}`}>
             <div className="user-info-box">
                <span className="user-count-icon"></span>
                <span className="count-val">4,502</span>
             </div>
             <div className="label-xiu">XỈU</div>
             <div className="pool-val">{(totalPool?.xiu || 0).toLocaleString()}</div>
             <button className="go88-bet-btn" onClick={() => handleBet('xiu', 100000)}>CƯỢC</button>
          </div>
        </div>

        {/* Chấm soi cầu ở dưới */}
        <div className="go88-history-dots">
           {[...Array(18)].map((_, i) => (
             <div key={i} className={`h-dot ${Math.random() > 0.5 ? 't' : 'x'}`}></div>
           ))}
        </div>

        {/* Thanh Hash MD5 */}
        <div className="go88-hash-bar">
           <div className="hash-label">CHUỖI HASH</div>
           <div className="hash-content">64eac0de964ce97f506ffad9dd7363db25...</div>
           <div className="hash-copy">COPY</div>
        </div>
      </div>

      {/* Chip cược ở dưới cùng */}
      <div className="go88-chip-selector">
        {[10000, 50000, 100000, 500000, 1000000].map(val => (
          <div key={val} className="go88-chip" onClick={() => handleBet(null, val)}>
            {val >= 1000000 ? (val/1000000)+'M' : (val/1000)+'K'}
          </div>
        ))}
      </div>
    </div>
  );
}
