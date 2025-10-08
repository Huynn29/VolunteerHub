## VolunteerHub – Cấu trúc thư mục chuẩn

Mục tiêu: cung cấp skeleton rõ ràng để triển khai nhanh frontend (React + TailwindCSS + React Router + Axios) và backend (Node.js + Express + MongoDB + JWT) cho hệ thống gồm các vai trò: Tình nguyện viên, Quản lý sự kiện, Admin.

### Tổng quan
- Frontend: React (Vite khuyến nghị) + TailwindCSS + React Router + Axios
- Backend: Node.js + Express + Mongoose + JWT (Access/Refresh Token), Socket.IO (tuỳ chọn cho realtime kênh trao đổi)
- Database: MongoDB (Mongoose ORM)

---

## 1) Frontend (`/frontend`)

```bash
frontend/
  .env.example                 # Biến môi trường FE (VITE_API_URL, ...)
  index.html                   # Template HTML (Vite)
  package.json
  postcss.config.cjs
  tailwind.config.cjs
  tsconfig.json                # Nếu dùng TypeScript
  vite.config.ts
  src/
    main.tsx                   # Điểm vào ứng dụng
    App.tsx                    # Shell chính, layout/router mount
    assets/                    # Ảnh, icons, fonts
    styles/
      globals.css              # Import Tailwind và style global
      tailwind.css             # (tuỳ chọn) nếu tách riêng
    routes/
      index.tsx                # Khai báo React Router (route tree)
      guards/
        AuthGuard.tsx          # Bảo vệ route yêu cầu đăng nhập
        RoleGuard.tsx          # Bảo vệ route theo vai trò
    components/
      common/                  # Button, Modal, Input, ...
      layout/
        Navbar.tsx
        Sidebar.tsx
        Footer.tsx
    pages/
      auth/
        LoginPage.tsx
        RegisterPage.tsx
      dashboard/
        AdminDashboard.tsx
        ManagerDashboard.tsx
        VolunteerDashboard.tsx
      events/
        EventListPage.tsx
        EventDetailPage.tsx
        EventCreatePage.tsx
        EventEditPage.tsx
      community/
        FeedPage.tsx           # Kênh trao đổi: post/comment/like
        PostDetailPage.tsx
    store/                     # Redux Toolkit (khuyến nghị)
      index.ts                 # store cấu hình
      slices/
        authSlice.ts           # Đăng nhập/đăng ký, token, user/roles
        eventSlice.ts          # CRUD sự kiện, đăng ký tham gia
        postSlice.ts           # Bài viết/like/comment
        uiSlice.ts             # Trạng thái UI (toasts, loaders,...)
    services/
      apiClient.ts             # Axios instance (baseURL, interceptors)
      authApi.ts               # Đăng nhập/đăng ký/refresh token
      eventApi.ts              # CRUD sự kiện, đăng ký tham gia
      postApi.ts               # Post/comment/like
      uploadApi.ts             # (tuỳ chọn) upload file
    hooks/
      useAuth.ts               # Lấy user/role, helpers login/logout
      usePagination.ts
    utils/
      constants.ts             # ROLE, routes, ...
      helpers.ts               # Hàm tiện ích
      validators.ts            # FE input validation (yup/zod tuỳ chọn)
    types/
      auth.ts
      event.ts
      post.ts
```

Gợi ý biến môi trường FE (`/frontend/.env.example`):

```env
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

---

## 2) Backend (`/backend`)

```bash
backend/
  .env.example                 # Biến môi trường BE
  package.json
  tsconfig.json                # Nếu dùng TypeScript
  src/
    server.ts                  # Khởi động HTTP/Socket
    app.ts                     # Tạo Express app, middleware
    config/
      env.ts                   # Đọc biến môi trường (dotenv)
      db.ts                    # Kết nối Mongoose
      logger.ts                # Logger (winston/pino)
      rateLimit.ts             # Cấu hình rate limiting
    middleware/
      errorHandler.ts          # Xử lý lỗi tập trung
      notFound.ts              # 404 handler
      auth.ts                  # Verify JWT, attach user
      roles.ts                 # RBAC kiểm tra vai trò
    modules/
      auth/
        auth.controller.ts
        auth.service.ts
        auth.route.ts
        auth.validation.ts     # Joi/Zod validation
      user/
        user.model.ts
        user.service.ts
        user.repo.ts
      event/
        event.model.ts
        event.controller.ts
        event.service.ts
        event.repo.ts
        event.route.ts
        event.validation.ts
      registration/
        registration.model.ts  # Đăng ký tham gia sự kiện
        registration.service.ts
        registration.route.ts
      community/
        post.model.ts
        comment.model.ts
        like.model.ts
        community.controller.ts
        community.service.ts
        community.route.ts
        community.validation.ts
    utils/
      jwt.ts                   # Ký/verify access/refresh
      password.ts              # Hash/compare (bcrypt)
      apiResponse.ts           # Chuẩn hoá response
      pagination.ts
    sockets/
      index.ts                 # (tuỳ chọn) Socket.IO for realtime feed
    jobs/
      index.ts                 # (tuỳ chọn) cron/queue
    docs/
      swagger.ts               # (tuỳ chọn) OpenAPI swagger
```

Gợi ý biến môi trường BE (`/backend/.env.example`):

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/volunteerhub
JWT_ACCESS_SECRET=replace_me
JWT_REFRESH_SECRET=replace_me
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CORS_ORIGIN=http://localhost:5173
```

---

## 3) Phân quyền vai trò (RBAC)

- Vai trò hệ thống: `VOLUNTEER`, `EVENT_MANAGER`, `ADMIN`.
- Lưu trong `user.model` (ví dụ: `roles: string[]`).
- BE áp dụng middleware `auth` (yêu cầu JWT) và `roles` (kiểm tra có vai trò cần thiết).
- FE dùng `RoleGuard` để ẩn/khóa route theo vai trò, chỉ hiển thị tính năng phù hợp.

Ví dụ phân tuyến backend:

```text
POST /api/auth/register                 # Công khai
POST /api/auth/login                    # Công khai
POST /api/auth/refresh                  # Công khai
GET  /api/users/me                      # Yêu cầu JWT

GET    /api/events                      # Public/hoặc yêu cầu JWT (tuỳ)
POST   /api/events                      # EVENT_MANAGER, ADMIN
GET    /api/events/:id                  # Public/JWT
PATCH  /api/events/:id                  # EVENT_MANAGER (sở hữu), ADMIN
DELETE /api/events/:id                  # ADMIN hoặc Manager sở hữu

POST   /api/registrations               # VOLUNTEER đăng ký tham gia
GET    /api/registrations/my            # VOLUNTEER xem đơn của mình

GET    /api/community/posts             # Feed
POST   /api/community/posts             # JWT (mọi role)
POST   /api/community/posts/:id/like    # JWT
POST   /api/community/posts/:id/comment # JWT
```

---

## 4) Gợi ý thực thi tính năng

- Đăng ký/Đăng nhập: JWT Access + Refresh, lưu refresh token dạng httpOnly cookie (khuyến nghị) hoặc localStorage (đơn giản hơn nhưng kém an toàn).
- CRUD sự kiện: Quản lý bởi `EVENT_MANAGER` và `ADMIN`. `VOLUNTEER` có thể xem và đăng ký.
- Đăng ký tham gia: tạo `registration` ràng buộc `userId` và `eventId`, trạng thái (PENDING/APPROVED/REJECTED).
- Kênh trao đổi: `post`, `comment`, `like`; có thể bật Socket.IO để realtime cập nhật.
- Dashboard: 3 trang riêng theo vai trò, lấy dữ liệu tổng quan từ API.

---

## 5) Khởi tạo nhanh (tham khảo)

```bash
# Frontend (Vite + React + TS)
pnpm create vite@latest frontend --template react-ts
cd frontend && pnpm add react-router-dom axios @reduxjs/toolkit react-redux
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Backend
mkdir backend && cd backend
pnpm init -y
pnpm add express mongoose jsonwebtoken bcrypt cors cookie-parser zod
pnpm add -D typescript ts-node-dev @types/express @types/jsonwebtoken @types/cors @types/cookie-parser
```

---

## 6) Quy ước & best practices

- Module hoá backend theo `modules/*` để gom controller/service/model/route.
- Response thống nhất qua `apiResponse.ts` (status, message, data, meta).
- Validation đầu vào bằng Zod hoặc Joi, tách file `*.validation.ts`.
- FE quản lý state bằng Redux Toolkit; mọi call API đi qua `services/*Api.ts`.
- Tách `AuthGuard`/`RoleGuard` trên FE và `auth`/`roles` middleware trên BE.

---

Tài liệu này chỉ định cấu trúc thư mục chuẩn để bạn triển khai nhanh. Khi bắt đầu code, hãy tạo file dần theo module để tránh rỗng dự án quá lớn.


