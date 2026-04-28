const USERS_KEY = "tx_users_v1";
const SESSION_KEY = "tx_session_v1";

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function getUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  const users = raw ? safeJsonParse(raw, []) : [];
  return Array.isArray(users) ? users : [];
}

function setUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? safeJsonParse(raw, null) : null;
}

export function setSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function normalizePhoneOrUsername(value) {
  return String(value || "").trim().toLowerCase();
}

export function register({ username, phone, password, referralCode }) {
  const u = String(username || "").trim();
  const p = String(phone || "").trim();
  const pw = String(password || "");

  if (!u) return { ok: false, message: "Vui lòng nhập username." };
  if (!p) return { ok: false, message: "Vui lòng nhập số điện thoại." };
  if (pw.length < 8) return { ok: false, message: "Mật khẩu tối thiểu 8 ký tự." };

  const users = getUsers();
  const keyUser = normalizePhoneOrUsername(u);
  const keyPhone = normalizePhoneOrUsername(p);
  const exists = users.some(
    (x) =>
      normalizePhoneOrUsername(x.username) === keyUser ||
      normalizePhoneOrUsername(x.phone) === keyPhone
  );
  if (exists) return { ok: false, message: "Username hoặc số điện thoại đã tồn tại." };

  const newUser = {
    id: crypto.randomUUID?.() ?? String(Date.now()),
    username: u,
    phone: p,
    password: pw,
    referralCode: String(referralCode || "").trim() || null,
    createdAt: Date.now()
  };
  setUsers([newUser, ...users]);

  setSession({ userId: newUser.id });
  return { ok: true, user: newUser };
}

export function login({ identifier, password }) {
  const id = normalizePhoneOrUsername(identifier);
  const pw = String(password || "");
  if (!id) return { ok: false, message: "Vui lòng nhập username hoặc số điện thoại." };
  if (!pw) return { ok: false, message: "Vui lòng nhập mật khẩu." };

  const users = getUsers();
  const user = users.find(
    (x) =>
      normalizePhoneOrUsername(x.username) === id ||
      normalizePhoneOrUsername(x.phone) === id
  );
  if (!user) return { ok: false, message: "Tài khoản không tồn tại." };
  if (user.password !== pw) return { ok: false, message: "Mật khẩu không đúng." };

  setSession({ userId: user.id });
  return { ok: true, user };
}

export function getCurrentUser() {
  const session = getSession();
  if (!session?.userId) return null;
  return getUsers().find((u) => u.id === session.userId) ?? null;
}

