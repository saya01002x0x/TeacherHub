# TeacherHub

## Cấu Hình Environment Variables

### Backend
Copy `backend/.env.example` thành `backend/.env` và điền các key:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/teacherhub
NODE_ENV=development
CLERK_PUBLISHABLE_KEY=<lấy_từ_clerk.com>
CLERK_SECRET_KEY=<lấy_từ_clerk.com>
STREAM_API_KEY=<lấy_từ_getstream.io>
STREAM_API_SECRET=<lấy_từ_getstream.io>
CLIENT_URL=http://localhost:5173
SENTRY_DSN=<lấy_từ_sentry.io>
```

### Frontend
Copy `frontend/.env.example` thành `frontend/.env` và điền các key:

```env
VITE_CLERK_PUBLISHABLE_KEY=<lấy_từ_clerk.com>
VITE_STREAM_API_KEY=<lấy_từ_getstream.io>
VITE_SENTRY_DSN=<lấy_từ_sentry.io>
VITE_API_BASE_URL=http://localhost:5001/api
```

## Cách Chạy

### 1. Cài đặt dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Chạy ứng dụng

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Xong!** Truy cập `http://localhost:5173`

## Yêu Cầu
- Node.js >= 18
- MongoDB đang chạy
- Tài khoản [Clerk](https://clerk.com)
- Tài khoản [Stream Chat](https://getstream.io/chat)
- Tài khoản [Sentry](https://sentry.io) (optional)
