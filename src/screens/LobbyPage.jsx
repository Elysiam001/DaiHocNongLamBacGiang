import React from "react";
import { useNavigate } from "react-router-dom";
import { clearSession, getCurrentUser } from "../services/authStorage.js";

const gameCards = [
  {
    badge: "NỔI BẬT",
    title: "TÀI XỈU",
    subtitle: "Giải trí đỉnh cao",
    amount: "$ 14,925,281",
    className: "tile--dice"
  },
  {
    badge: "MỚI",
    title: "XÓC ĐĨA",
    subtitle: "Phòng chơi sôi động",
    amount: "$ 8,430,150",
    className: "tile--xocdia"
  },
  {
    badge: "TRỰC TIẾP",
    title: "CASINO LIVE",
    subtitle: "Người dẫn xinh đẹp",
    amount: "$ 22,601,888",
    className: "tile--live"
  },
  {
    badge: "MINI GAME",
    title: "KHO BÁU RỒNG",
    subtitle: "Săn thưởng may mắn",
    amount: "$ 33,398,064",
    className: "tile--dragon"
  }
];

const tabs = ["Tất cả", "Nổi bật", "Game bài", "Slots", "Live", "Khác"];

export default function LobbyPage() {
  const nav = useNavigate();
  const user = getCurrentUser();

  function logout() {
    clearSession();
    nav("/login", { replace: true });
  }

  return (
    <div className="page lobby-bg">
      <header className="lobby__top">
        <div className="lobby__left">
          <div className="brand brand--compact">
            <span className="brand__dot" />
            <span className="brand__text">TÀI XỈU PRESTIGE</span>
          </div>
          <div className="lobby__ticker">
            <span className="lobby__tickerHot">Thắng lớn</span>
            <span>quỹ thưởng đang tăng mạnh trong sảnh game</span>
          </div>
        </div>
        <div className="lobby__logo">GO88</div>
        <div className="lobby__actions">
          <div className="lobby__user">
            <div className="muted small">Xin chào</div>
            <div className="lobby__name">{user?.username || "Người chơi"}</div>
          </div>
          <button className="ghost" onClick={logout}>
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="lobby">
        <section className="lobby__hero">
          <div className="lobby__banner">
            <div className="lobby__bannerText">
              <div className="lobby__eyebrow">Sảnh Game Đẳng Cấp</div>
              <div className="lobby__title">Nạp tiền, săn thưởng, vào bàn ngay</div>
              <div className="lobby__desc muted">
                Giao diện được làm lại theo phong cách casino mobile sang trọng để chuẩn bị
                cho phần game tiếp theo.
              </div>
            </div>
            <button className="primary lobby__cta">NẠP TIỀN</button>
          </div>

          <div className="lobby__tabs">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                type="button"
                className={`lobby__tab ${index === 0 ? "is-active" : ""}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <section className="lobby__grid">
            <aside className="promoCard">
              <div className="promoCard__brand">KÍCH HOẠT</div>
              <div className="promoCard__title">NHẬN THƯỞNG 7000</div>
              <div className="promoCard__sub">An toàn · Bảo mật · Tốc độ</div>
              <button className="ghost promoCard__btn">Kích hoạt ngay</button>
            </aside>

            {gameCards.map((card) => (
              <article key={card.title} className={`tile ${card.className}`}>
                <div className="tile__badge">{card.badge}</div>
                <div className="tile__art" aria-hidden="true" />
                <div className="tile__body">
                  <div className="tile__title">{card.title}</div>
                  <div className="tile__sub">{card.subtitle}</div>
                  <div className="tile__jackpot">{card.amount}</div>
                </div>
              </article>
            ))}
          </section>
        </section>

        <section className="lobby__bottom">
          <div className="walletCard">
            <div className="walletCard__avatar">{(user?.username || "N").slice(0, 1)}</div>
            <div>
              <div className="walletCard__label">Tài khoản chính</div>
              <div className="walletCard__name">{user?.username || "Người chơi"}</div>
            </div>
            <div className="walletCard__money">$0</div>
          </div>

          <nav className="bottomNav">
            <button className="bottomNav__item is-highlight">NẠP TIỀN</button>
            <button className="bottomNav__item">RÚT TIỀN</button>
            <button className="bottomNav__item">SĂN HŨ</button>
            <button className="bottomNav__item">NHIỆM VỤ</button>
            <button className="bottomNav__item">HỘP THƯ</button>
            <button className="bottomNav__item">MENU</button>
          </nav>
        </section>
      </main>

      <footer className="legal">
        <span>© {new Date().getFullYear()} Tài Xỉu Giải Trí.</span>
        <span className="muted">Điều khoản · Quyền riêng tư · Chơi có trách nhiệm</span>
      </footer>
    </div>
  );
}

