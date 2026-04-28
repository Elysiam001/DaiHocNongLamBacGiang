import React from "react";
import { useNavigate } from "react-router-dom";
import { clearSession, getCurrentUser } from "../services/authStorage.js";

const gameCards = [
  { badge: "LIVE", title: "TÀI", title2: "XỈU", amount1: "$ 14,925,281", amount2: "$ 1,348,340", className: "tile--dice" },
  { badge: "NEW", title: "XÓC ĐĨA", title2: "Livestream", amount1: "$ 8,430,150", amount2: "$ 2,160,400", className: "tile--xocdia" },
  { badge: "LIVE", title: "LIVE CASINO", title2: "", amount1: "$ 22,601,888", amount2: "$ 5,909,120", className: "tile--live" },
  { badge: "MINI GAME", title: "KHO", title2: "BÁU RỒNG", amount1: "$ 33,398,064", amount2: "$ 2,748,951", className: "tile--dragon" }
];

const tabs = ["ALL GAMES", "HOT", "GAME BÀI", "SLOTS", "LIVE", "KHÁC"];

export default function LobbyPage() {
  const nav = useNavigate();
  const user = getCurrentUser();

  function logout() {
    clearSession();
    nav("/login", { replace: true });
  }

  return (
    <div className="page lobby-bg">
      <div className="lobbyShell">
        <header className="lobby__top">
          <div className="lobby__marquee">
            <span className="lobby__winner">ztrau196</span> thắng{" "}
            <span className="lobby__money">31,520,000</span>
          </div>
          <div className="lobby__logoWrap">
            <div className="lobby__logo">GO88</div>
            <div className="lobby__logoSub">GO88.COM</div>
          </div>
          <div className="lobby__announce">
            GO88 sử dụng thuật toán ngẫu nhiên, được giám sát bởi công ty độc lập tại Singapore
          </div>
        </header>

        <main className="lobby">
          <div className="lobby__tabs">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                type="button"
                className={`lobby__tab ${index === 0 ? "is-active" : ""}`}
              >
                {tab}
                {tab === "LIVE" ? <span className="lobby__tabDot" /> : null}
              </button>
            ))}
          </div>

          <section className="lobby__grid">
            <aside className="promoCard">
              <div className="promoCard__miniLogo">GO88</div>
              <div className="promoCard__brand">KÍCH HOẠT</div>
              <div className="promoCard__otp">OTP</div>
              <div className="promoCard__telegram">TELEGRAM</div>
              <div className="promoCard__title">NHẬN NGAY 7000</div>
              <div className="promoCard__sub">An toàn · Bảo mật</div>
            </aside>

            {gameCards.map((card) => (
              <article key={card.title} className={`tile ${card.className}`}>
                <div className="tile__badge">{card.badge}</div>
                <div className="tile__art" aria-hidden="true" />
                <div className="tile__body">
                  <div className="tile__title">{card.title}</div>
                  {card.title2 ? <div className="tile__title tile__title--second">{card.title2}</div> : null}
                  <div className="tile__jackpot">{card.amount1}</div>
                  <div className="tile__jackpot tile__jackpot--small">{card.amount2}</div>
                </div>
              </article>
            ))}
          </section>

          <section className="lobby__bottom">
            <div className="walletCard">
              <div className="walletCard__avatar">{(user?.username || "g").slice(0, 1)}</div>
              <div>
                <div className="walletCard__label">Hãy kích hoạt SDT</div>
                <div className="walletCard__name">{user?.username || "go889citygamer"}</div>
              </div>
              <div className="walletCard__money">0</div>
            </div>

            <nav className="bottomNav">
              <button className="bottomNav__item">RÚT TIỀN</button>
              <button className="bottomNav__item is-highlight">NẠP TIỀN</button>
              <button className="bottomNav__item">SĂN HŨ</button>
              <button className="bottomNav__item">NHIỆM VỤ</button>
              <button className="bottomNav__item">HỘP THƯ</button>
              <button className="bottomNav__item" onClick={logout}>MENU</button>
            </nav>
          </section>
        </main>
      </div>
    </div>
  );
}

