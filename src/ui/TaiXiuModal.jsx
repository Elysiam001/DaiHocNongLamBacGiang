import React, { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import { getSession } from "../services/authStorage.js";
import "../styles/taixiu.css";

const socket = io("https://dainochonglambacgiang.onrender.com");

export default function TaiXiuModal({ onClose }) {
  const session = getSession();
  const [balance, setBalance] = useState(0);
  const [timer, setTimer] = useState(0);
  const [phase, setPhase] = useState("betting");
  const [dices, setDices] = useState([1, 1, 1]);
  const [isBowlClosed, setIsBowlClosed] = useState(true);
  const [totalPool, setTotalPool] = useState({ tai: 0, xiu: 0 });
  const [sessionId, setSessionId] = useState(0);

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

  const handleBet = (side, amount) => {
    if (phase !== "betting") return;
    socket.emit("taixiuBet", { username: session?.username, side, amount });
  };

  const totalDice = dices.reduce((a, b) => a + b, 0);

  return (
    <div className="taixiu-modal-overlay">
      <div className="go88-overlay">
        {/* Balance Display */}
        <div className="modal-user-balance">
           <div className="coin-icon">$</div>
           <span>{balance.toLocaleString()}</span>
        </div>

        <div className="go88-top-header">
           <div className="jackpot-container">
              <span className="jackpot-val">74,774,407,191</span>
           </div>
           <div className="session-tag"># {sessionId}</div>
        </div>

        <div className="go88-main-table">
          <div className="side-menu left">
            <div className="circle-btn info blue">i</div>
            <div className="circle-btn chart red"></div>
            <div className="circle-btn help blue">?</div>
            <div className="circle-btn log red"></div>
          </div>
          <div className="side-menu right">
            <div className="circle-btn close red" onClick={onClose}>×</div>
            <div className="circle-btn rank blue"></div>
            <div className="circle-btn chat blue"></div>
            <div className="circle-btn sound gray"></div>
          </div>

          <div className="table-content">
            <div className={`door tai ${phase === 'result' && totalDice >= 11 ? 'winner' : ''}`}>
              <div className="user-stats"><span className="user-icon"></span> 1,858</div>
              <div className="metallic-text">TÀI</div>
              <div className="pool-amount">{totalPool.tai.toLocaleString()}</div>
              <button className="glossy-bet-btn" onClick={() => handleBet('tai', 100000)}>CƯỢC</button>
            </div>
            <div className="md5-center-circle">
               <div className="timer-box"><span className="timer-num">{timer}</span></div>
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
            <div className={`door xiu ${phase === 'result' && totalDice <= 10 ? 'winner' : ''}`}>
              <div className="user-stats"><span className="user-icon"></span> 1,715</div>
              <div className="metallic-text">XỈU</div>
              <div className="pool-amount">{totalPool.xiu.toLocaleString()}</div>
              <button className="glossy-bet-btn" onClick={() => handleBet('xiu', 100000)}>CƯỢC</button>
            </div>
          </div>
          <div className="history-line">
             {[...Array(15)].map((_, i) => (
               <div key={i} className={`dot-h ${Math.random() > 0.5 ? 'white' : 'black'}`}></div>
             ))}
             <div className="last-res">{totalDice}</div>
          </div>
        </div>
        <div className="hash-footer-bar">
           <div className="label-hash">CHUỖI HASH</div>
           <div className="val-hash">64eac0de964ce97f506ffad9dd7363db25...</div>
           <div className="copy-action">COPY</div>
        </div>
      </div>
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
