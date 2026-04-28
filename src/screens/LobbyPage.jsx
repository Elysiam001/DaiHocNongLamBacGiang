import React from "react";
import { useNavigate } from "react-router-dom";
import { clearSession, getCurrentUser } from "../services/authStorage.js";

const gameCards = [
  {
    badge: "LIVE",
    title: "TÀI",
    title2: "XỈU",
    amount1: "$ 14,925,281",
    amount2: "$ 1,348,340",
    className: "lshot-card--taixiu"
  },
  {
    badge: "NEW",
    title: "XÓC ĐĨA",
    title2: "Livestream",
    amount1: "$ 8,430,150",
    amount2: "$ 2,160,400",
    className: "lshot-card--xocdia"
  },
  {
    badge: "LIVE",
    title: "LIVE CASINO",
    title2: "",
    amount1: "$ 22,601,888",
    amount2: "$ 5,909,120",
    className: "lshot-card--live"
  },
  {
    badge: "MINI GAME",
    title: "KHO",
    title2: "TÀNG LONG",
    amount1: "$ 33,398,064",
    amount2: "$ 2,748,951",
    className: "lshot-card--dragon"
  }
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
      <div className="lshot">
        <header className="lshot__topbar">
          <div className="lshot__ticker">
            <span className="lshot__tickerUser">ztrau196</span> thắng{" "}
            <span className="lshot__tickerMoney">31,520,000</span>
          </div>

          <div className="lshot__logoBox">
            <div className="lshot__logo">GO88</div>
            <div className="lshot__logoSub">GO88.COM</div>
          </div>

          <div className="lshot__notice">
            GO88 sử dụng thuật toán ngẫu nhiên, được giám sát bởi công ty độc lập tại Singapore
          </div>
        </header>

        <main className="lshot__main">
          <div className="lshot__tabs">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                type="button"
                className={`lshot__tab ${index === 0 ? "is-active" : ""}`}
              >
                {tab}
                {tab === "LIVE" ? <span className="lshot__tabDot" /> : null}
              </button>
            ))}
          </div>

          <section className="lshot__cards">
            <aside className="lshot-promo">
              <div className="lshot-promo__mini">GO88</div>
              <div className="lshot-promo__title1">KÍCH HOẠT</div>
              <div className="lshot-promo__title2">OTP</div>
              <div className="lshot-promo__title3">TELEGRAM</div>
              <div className="lshot-promo__title4">NHẬN NGAY</div>
              <div className="lshot-promo__title5">7000</div>
              <div className="lshot-promo__footer">An toàn · Bảo mật</div>
            </aside>

            {gameCards.map((card) => (
              <article key={card.title} className={`lshot-card ${card.className}`}>
                <div className="lshot-card__badge">{card.badge}</div>
                <div className="lshot-card__frame">
                  <div className="lshot-card__art" aria-hidden="true" />
                  <div className="lshot-card__body">
                    <div className="lshot-card__title">{card.title}</div>
                    {card.title2 ? <div className="lshot-card__title2">{card.title2}</div> : null}
                    <div className="lshot-card__amount">{card.amount1}</div>
                    <div className="lshot-card__amount lshot-card__amount--green">
                      {card.amount2}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="lshot__bottom">
            <div className="lshot-user">
              <div className="lshot-user__activate">Hãy kích hoạt SDT</div>
              <div className="lshot-user__row">
                <div className="lshot-user__avatar">{(user?.username || "g").slice(0, 1)}</div>
                <div>
                  <div className="lshot-user__name">{user?.username || "go889citygamer"}</div>
                  <div className="lshot-user__money">0</div>
                </div>
              </div>
            </div>

            <div className="lshot__depositWrap">
              <button className="lshot__deposit">NẠP TIỀN</button>
            </div>

            <nav className="lshot-nav">
              <button className="lshot-nav__item">RÚT TIỀN</button>
              <button className="lshot-nav__item">SĂN HŨ</button>
              <button className="lshot-nav__item">NHIỆM VỤ</button>
              <button className="lshot-nav__item">HỘP THƯ</button>
              <button className="lshot-nav__item" onClick={logout}>
                MENU
              </button>
            </nav>
          </section>
        </main>
      </div>
    </div>
  );
}

