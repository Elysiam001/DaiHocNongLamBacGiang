import React, { useState, useEffect, useCallback, useRef } from "react";
import io from "socket.io-client";
import { getSession } from "../services/authStorage.js";
import "../styles/taixiu.css";

const socket = io("https://dainochonglambacgiang.onrender.com");

const Dice3D = ({ value }) => {
  const renderDots = (v) => {
    const dots = [];
    if (v === 1) dots.push(<div key={1} className="dot red"></div>);
    else if (v === 2) {
      dots.push(<div key={1} className="dot"></div>);
      dots.push(<div key={2} className="dot"></div>);
    } else if (v === 3) {
      for (let i = 0; i < 3; i++) dots.push(<div key={i} className="dot"></div>);
    } else if (v === 4) {
      for (let i = 0; i < 4; i++) dots.push(<div key={i} className="dot red"></div>);
    } else if (v === 5) {
      for (let i = 0; i < 5; i++) dots.push(<div key={i} className="dot"></div>);
    } else if (v === 6) {
      for (let i = 0; i < 6; i++) dots.push(<div key={i} className="dot"></div>);
    }
    return dots;
  };

  return (
    <div className="dice-3d">
      <div className={`dice-face val-${value}`}>{renderDots(value)}</div>
    </div>
  );
};

export default function TaiXiuModal({ onClose, jackpotValue }) {
  const session = getSession();
  const [balance, setBalance] = useState(0);
  const [timer, setTimer] = useState(0);
  const [phase, setPhase] = useState("betting");
  const [dices, setDices] = useState([1, 1, 1]);
  const [isBowlClosed, setIsBowlClosed] = useState(true);
  const [totalPool, setTotalPool] = useState({ tai: 0, xiu: 0 });
  const [sessionId, setSessionId] = useState(0);

  // MODAL STATES
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // DRAG STATE
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handlePhaseChange = useCallback((newPhase, resultDices) => {
    if (newPhase === "betting") {
      setIsBowlClosed(true);
    } else if (newPhase === "result") {
      if (resultDices) setDices(resultDices);
      // Wait a bit then open bowl
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
      
      if (data.phase && data.phase !== phase) {
        handlePhaseChange(data.phase, data.dices);
        setPhase(data.phase);
      }
    });
    return () => {
      socket.off("loginSuccess");
      socket.off("balanceUpdate");
      socket.off("taixiuTick");
    };
  }, [session, phase, handlePhaseChange]);

  // DRAG HANDLERS
  const onMouseDown = (e) => {
    if (e.target.closest('.go88-top-deco') || e.target.closest('.go88-table-oval')) {
       if (isHistoryOpen || isRulesOpen) return;
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

  const mockHistory = [
    { session: sessionId - 1, time: "12:35:10", bet: "100,000", win: "+196,000", detail: "Tài (1-5-6)" },
    { session: sessionId - 2, time: "12:34:05", bet: "50,000", win: "-50,000", detail: "Xỉu (2-2-1)" },
    { session: sessionId - 3, time: "12:33:00", bet: "200,000", win: "+392,000", detail: "Tài (4-4-6)" },
  ];

  return (
    <div className="taixiu-modal-overlay">
      <div 
        className="go88-main-container" 
        style={{ transform: `translate(${position.x}px, ${position.y}px)`, cursor: isDragging ? 'grabbing' : 'default' }}
        onMouseDown={onMouseDown}
      >
        {/* OVAL TABLE */}
        <div className="go88-table-oval">
          
          <div className="circle-icon-btn btn-info" onClick={() => setIsHistoryOpen(true)}><i className="fa-solid fa-info"></i></div>
          <div className="circle-icon-btn btn-close" onClick={onClose}><i className="fa-solid fa-xmark"></i></div>

          <div className="circle-icon-btn btn-chart"><i className="fa-solid fa-chart-line"></i></div>
          <div className="circle-icon-btn btn-help" onClick={() => setIsRulesOpen(true)}><i className="fa-solid fa-question"></i></div>
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

          {/* TIMER CENTER - BOWL & DICE AREA */}
          <div className="go88-timer-circle">
             {/* THE BOWL */}
             <div className={`go88-bowl-overlay ${!isBowlClosed ? 'open' : ''}`}>
                {phase === 'betting' && <span className="go88-timer-val">{timer}</span>}
             </div>

             {/* THE DICES */}
             <div className="dice-container">
                {!isBowlClosed && <div className="result-glow"></div>}
                {dices.map((v, i) => <Dice3D key={i} value={v} />)}
             </div>
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

          {/* MODALS ... */}
          {isHistoryOpen && (
            <div className="history-modal-overlay">
              <div className="history-header">
                <div className="history-title">Lịch Sử Cược</div>
                <div className="history-close-btn" onClick={() => setIsHistoryOpen(false)}><i className="fa-solid fa-xmark"></i></div>
              </div>
              <div className="history-body">
                <div className="history-table-head">
                  <div className="history-col">Phiên</div><div className="history-col">Thời Gian</div><div className="history-col">Tổng Cược</div><div className="history-col">Tiền Thắng</div><div className="history-col">Chi Tiết Chơi</div>
                </div>
                <div className="history-list">
                  {mockHistory.map((item, index) => (
                    <div key={index} className="history-row">
                      <div className="history-cell">#{item.session}</div><div className="history-cell">{item.time}</div><div className="history-cell">{item.bet}</div><div className={`history-cell ${item.win.startsWith('+') ? 'win' : 'loss'}`}>{item.win}</div><div className="history-cell">{item.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="history-footer">Trang: 1</div>
            </div>
          )}

          {isRulesOpen && (
            <div className="history-modal-overlay">
              <div className="history-header">
                <div className="history-title">Luật Chơi Tài Xỉu</div>
                <div className="history-close-btn" onClick={() => setIsRulesOpen(false)}><i className="fa-solid fa-xmark"></i></div>
              </div>
              <div className="history-body rules-content" style={{ overflowY: 'auto', color: '#fff' }}>
                <h4 style={{ color: '#ffcc00', marginBottom: 10 }}>GIỚI THIỆU</h4>
                <p style={{ fontSize: 13, marginBottom: 15 }}>Tài Xỉu là game hot nhất hiện nay tại Việt Nam. Người chơi lựa chọn đặt cược vào cửa Tài hoặc Xỉu để giành chiến thắng.</p>
                <h4 style={{ color: '#ffcc00', marginBottom: 10 }}>CÁCH TÍNH NỔ HŨ</h4>
                <p style={{ fontSize: 13, marginBottom: 5 }}>Hũ sẽ nổ khi kết quả xúc xắc rơi vào trường hợp đặc biệt:</p>
                <ul style={{ fontSize: 13, marginLeft: 20, marginBottom: 15 }}><li>Xỉu nổ hũ: 1-1-1 (Tổng 3)</li><li>Tài nổ hũ: 6-6-6 (Tổng 18)</li></ul>
                <h4 style={{ color: '#ffcc00', marginBottom: 10 }}>CHIA TIỀN THƯỞNG</h4>
                <div style={{ background: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 5, marginTop: 10, textAlign: 'center' }}>
                   <div style={{ borderBottom: '1px solid #fff', paddingBottom: 5, marginBottom: 5 }}>Tiền cược x Tiền hũ</div><div>Tổng tiền đặt</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
