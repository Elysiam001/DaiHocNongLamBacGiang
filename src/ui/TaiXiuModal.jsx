import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import io from "socket.io-client";
import { getSession } from "../services/authStorage.js";
import { gsap } from "gsap";
import * as THREE from "three";
import "../styles/taixiu.css";

const socket = io("/", {
  transports: ["websocket", "polling"],
  reconnection: true
});

/* 
  THÀNH PHẦN XÚC XẮC 3D THẬT (THREE.JS)
*/
const ThreeDiceWorld = ({ dices, isShaking, phase }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const diceRefs = useRef([]);

  useEffect(() => {
    // 1. Setup Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 8, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(240, 240);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(5, 10, 5);
    spotLight.castShadow = true;
    scene.add(spotLight);

    // 3. Create Dice Meshes
    const createDice = (x, z) => {
      const geometry = new THREE.BoxGeometry(2.2, 2.2, 2.2);
      
      // Tạo các mặt xúc xắc bằng Canvas để đẹp và thật
      const materials = [1, 6, 2, 5, 3, 4].map(num => {
        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#cc0000'; // Đỏ Ruby
        ctx.fillRect(0, 0, 128, 128);
        ctx.fillStyle = '#ffffff';
        // Vẽ dấu chấm dựa trên số
        const drawDot = (dx, dy) => {
          ctx.beginPath(); ctx.arc(dx, dy, 12, 0, Math.PI * 2); ctx.fill();
        };
        const centers = {
          1: [[64, 64]],
          2: [[32, 32], [96, 96]],
          3: [[32, 32], [64, 64], [96, 96]],
          4: [[32, 32], [32, 96], [96, 32], [96, 96]],
          5: [[32, 32], [32, 96], [64, 64], [96, 32], [96, 96]],
          6: [[32, 32], [32, 64], [32, 96], [96, 32], [96, 64], [96, 96]]
        };
        centers[num].forEach(pos => drawDot(pos[0], pos[1]));
        const texture = new THREE.CanvasTexture(canvas);
        return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.3, metalness: 0.2 });
      });

      const dice = new THREE.Mesh(geometry, materials);
      dice.position.set(x, 0, z);
      dice.castShadow = true;
      scene.add(dice);
      return dice;
    };

    diceRefs.current = [
      createDice(-2.5, -1.5),
      createDice(2.5, -1.5),
      createDice(0, 2.5)
    ];

    // 4. Render Loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  // 5. Handle Animations (GSAP)
  useEffect(() => {
    if (isShaking) {
      diceRefs.current.forEach((dice, i) => {
        gsap.to(dice.rotation, {
          x: Math.random() * Math.PI * 10,
          y: Math.random() * Math.PI * 10,
          z: Math.random() * Math.PI * 10,
          duration: 2,
          ease: "power2.inOut"
        });
        gsap.to(dice.position, {
          x: dice.position.x + (Math.random() - 0.5) * 2,
          z: dice.position.z + (Math.random() - 0.5) * 2,
          y: 2 + Math.random() * 2,
          duration: 0.2,
          repeat: 10,
          yoyo: true
        });
      });
    } else if (phase === "result") {
      const getRotationForValue = (val) => {
        const rots = {
          1: { x: 0, y: 0, z: 0 },
          2: { x: 0, y: Math.PI / 2, z: 0 },
          3: { x: -Math.PI / 2, y: 0, z: 0 },
          4: { x: Math.PI / 2, y: 0, z: 0 },
          5: { x: 0, y: -Math.PI / 2, z: 0 },
          6: { x: Math.PI, y: 0, z: 0 }
        };
        return rots[val] || rots[1];
      };

      diceRefs.current.forEach((dice, i) => {
        const targetRot = getRotationForValue(dices[i]);
        gsap.to(dice.rotation, {
          x: targetRot.x + Math.PI * 4,
          y: targetRot.y + Math.PI * 4,
          z: targetRot.z,
          duration: 1.5,
          ease: "back.out(1.7)"
        });
        gsap.to(dice.position, { y: 0, duration: 0.5, ease: "bounce.out" });
      });
    }
  }, [isShaking, phase, dices]);

  return <div ref={mountRef} className="three-dice-container" />;
};

export default function TaiXiuModal({ onClose, jackpotValue }) {
  const session = getSession();
  const [balance, setBalance] = useState(0);

  const getGlobalState = () => {
    const cycleTotal = 45; // 30s betting + 15s result
    const totalSeconds = Math.floor(Date.now() / 1000);
    const currentCycleSec = totalSeconds % cycleTotal;
    const currentSId = Math.floor(totalSeconds / cycleTotal);
    
    if (currentCycleSec < 30) return { timer: 30 - currentCycleSec, phase: "betting", sessionId: currentSId, isBowlClosed: true };
    return { timer: cycleTotal - currentCycleSec, phase: "result", sessionId: currentSId, isBowlClosed: false };
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
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 2500); 
    } else if (newPhase === "result") {
      setIsBowlShaking(true);
      setTimeout(() => {
        setIsBowlShaking(false);
        setIsBowlClosed(false);
        setDices(resultDices);
      }, 1000);
    }
  }, []);

  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      const state = getGlobalState();
      setSessionId(state.sessionId);
      setTimer(state.timer);
      if (state.phase !== phase) {
        setPhase(state.phase);
        handlePhaseChange(state.phase, getDeterministicResult(state.sessionId));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [session, phase, handlePhaseChange]);

  return (
    <div className="taixiu-modal-overlay">
      <div className="casino-mobile-layout">
        <div className="casino-table">
          {/* HEADER */}
          <div className="casino-header">
             <div className="jackpot-area">
                <div className="jackpot-label">HŨ THƯỞNG</div>
                <div className="jackpot-value">{(jackpotValue || 99313706286).toLocaleString()}</div>
                <div className="session-id">#{sessionId}</div>
             </div>
             <div className="close-btn" onClick={onClose}>×</div>
          </div>

          <div className="casino-main-row">
             {/* TAI SIDE */}
             <div className={`bet-side tai-side ${phase === "result" && isTai ? 'winner-glow' : phase === "result" ? 'side-dim' : ''}`}>
                <div className="bet-title">TÀI</div>
                <div className="bet-count"><i className="fa-solid fa-user"></i> 4,272</div>
                <div className="bet-pool">2.142.916.349</div>
                <button className="casino-bet-btn">CƯỢC</button>
             </div>

             {/* CENTER BOWL AREA */}
             <div className="bowl-area">
                <div className="bowl-circle-bg">
                   <ThreeDiceWorld dices={dices} isShaking={isShaking} phase={phase} />
                   <div className={`casino-bowl ${isBowlClosed ? 'closed' : 'opened'} ${isBowlShaking ? 'shaking' : ''}`}></div>
                   {isBowlClosed ? (
                     <div className="countdown-timer">{timer}</div>
                   ) : (
                     <div className="result-score-overlay">
                        <div className="result-number">{totalDice}</div>
                        {phase === "result" && <div className="result-countdown">{timer}</div>}
                     </div>
                   )}
                </div>
             </div>

             {/* XIU SIDE */}
             <div className={`bet-side xiu-side ${phase === "result" && !isTai ? 'winner-glow' : phase === "result" ? 'side-dim' : ''}`}>
                <div className="bet-title">XỈU</div>
                <div className="bet-count"><i className="fa-solid fa-user"></i> 4,638</div>
                <div className="bet-pool">2.142.916.349</div>
                <button className="casino-bet-btn">CƯỢC</button>
             </div>
          </div>

          {/* FOOTER HISTORY */}
          <div className="casino-footer">
             <div className="history-dots">
                {[...Array(15)].map((_, i) => {
                   const res = getDeterministicResult(sessionId - i - 1).reduce((a,b)=>a+b,0);
                   return <div key={i} className={`h-dot ${res > 10 ? 'h-tai' : 'h-xiu'}`}></div>
                })}
             </div>
          </div>
        </div>

        {/* SIDE BUTTONS */}
        <div className="casino-sidebar-left">
           <div className="s-btn"><i className="fa-solid fa-info"></i></div>
           <div className="s-btn"><i className="fa-solid fa-chart-line"></i></div>
           <div className="s-btn"><i className="fa-solid fa-question"></i></div>
           <div className="s-btn"><i className="fa-solid fa-scroll"></i></div>
        </div>
        <div className="casino-sidebar-right">
           <div className="s-btn"><i className="fa-solid fa-trophy"></i></div>
           <div className="s-btn"><i className="fa-solid fa-comment-dots"></i></div>
           <div className="s-btn"><i className="fa-solid fa-hand-dots"></i></div>
        </div>
      </div>
    </div>
  );
}
