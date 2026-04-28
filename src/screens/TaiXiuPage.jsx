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
    <div className="go88-container">
      <div className="go88-overlay">
        {/* Jackpot & Header Area */}
        <div className="go88-top-header">
           <div className="dragon-left"></div>
           <div className="jackpot-container">
              <span className="jackpot-val">74,611,761,253</span>
           </div>
           <div className="session-tag"># {sessionId}</div>
        </div>

        {/* Bàn cược Capsule */}
        <div className="go88-main-table">
          {/* Icon Trái uốn lượn */}
          <div className="side-menu left">
            <div className="circle-btn info blue">i</div>
            <div className="circle-btn chart red"></div>
            <div className="circle-btn help blue">?</div>
            <div className="circle-btn log red"></div>
          </div>

          {/* Icon Phải uốn lượn */}
          <div className="side-menu right">
            <div className="circle-btn close red" onClick={() => nav("/lobby")}>×</div>
            <div className="circle-btn rank blue"></div>
            <div className="circle-btn chat blue"></div>
            <div className="circle-btn sound gray"></div>
          </div>

          <div className="table-content">
            {/* Cửa TÀI */}
            <div className="door tai">
              <div className="user-stats">
                 <span className="user-icon"></span> 641
              </div>
              <div className="metallic-text">TÀI</div>
              <div className="pool-amount">{totalPool.tai.toLocaleString()}</div>
              <button className="glossy-bet-btn" onClick={() => handleBet('tai', 100000)}>CƯỢC</button>
            </div>

            {/* Vòng quay MD5 chính giữa */}
            <div className="md5-center-circle">
               <div className="timer-box">
                  <span className="timer-num">{timer}</span>
               </div>
               <div className="dice-container">
                  <div className="dice-group">
                    {dices.map((d, i) => (
                      <div key={i} className={`real-dice d-${d}`}>
                        {[...Array(d)].map((_, dot) => <div key={dot} className="dot"></div>)}
                      </div>
                    ))}
                  </div>
                  {isBowlClosed && <div className="real-bowl"></div>}
               </div>
            </div>

            {/* Cửa XỈU */}
            <div className="door xiu">
              <div className="user-stats">
                 <span className="user-icon"></span> 384
              </div>
              <div className="metallic-text">XỈU</div>
              <div className="pool-amount">{totalPool.xiu.toLocaleString()}</div>
              <button className="glossy-bet-btn" onClick={() => handleBet('xiu', 100000)}>CƯỢC</button>
            </div>
          </div>

          {/* Lịch sử soi cầu bottom */}
          <div className="history-line">
             {[...Array(15)].map((_, i) => (
               <div key={i} className={`dot-h ${Math.random() > 0.5 ? 'white' : 'black'}`}></div>
             ))}
             <div className="last-res">14</div>
          </div>
        </div>

        {/* MD5 Hash Footer */}
        <div className="hash-footer-bar">
           <div className="label-hash">CHUỖI HASH</div>
           <div className="val-hash">64eac0de964ce97f506ffad9dd7363db25...</div>
           <div className="copy-action">COPY</div>
        </div>
      </div>

      {/* Chips selector */}
      <div className="go88-chips-bar">
        {[10000, 50000, 100000, 500000, 1000000].map(val => (
          <div key={val} className="go88-chip-item">
            {val >= 1000000 ? (val/1000000)+'M' : (val/1000)+'K'}
          </div>
        ))}
      </div>
    </div>
  );
}
