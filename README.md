# Web Tài Xỉu (demo)

Demo web gồm:
- Đăng ký / Đăng nhập (tạm lưu localStorage)
- Sảnh game (placeholder)

## Chạy local

```bash
npm install
npm run dev
```

## Deploy lên Render

### Cách 1 (Web Service)
- Build Command: `npm ci && npm run build`
- Start Command: `npm start`

### Cách 2 (Static Site)
- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`

> Auth hiện tại chỉ là demo (localStorage), **không dùng cho production**.

