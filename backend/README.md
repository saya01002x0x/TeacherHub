# Backend Setup

## Cài đặt

1. **Cài đặt dependencies:**
```bash
npm install
```

2. **Tạo file `.env`:**
```bash
cp .env.example .env
```

3. **Cấu hình `.env`:**
- `MONGO_URI`: MongoDB connection string
- `STREAM_API_KEY`: Stream Chat API key
- `STREAM_API_SECRET`: Stream Chat API secret
- `CLERK_SECRET_KEY`: Clerk secret key
- `CLERK_PUBLISHABLE_KEY`: Clerk publishable key

4. **Cài đặt Clerk:**
   - Đăng ký tài khoản tại [https://clerk.com](https://clerk.com)
   - Tạo một application mới
   - Lấy `CLERK_SECRET_KEY` và `CLERK_PUBLISHABLE_KEY` từ Dashboard
   - Thêm vào file `.env`
   - Tạo users trên Clerk Dashboard và lấy `clerkId` của từng user
   - Cập nhật `clerkId` trong file `src/data/mock-users.json`

5. **Seed mock users:**
```bash
npm run seed:users
```
Script sẽ đọc file `data/mock-users.json` và tạo users trong MongoDB.

6. **Chạy server:**
```bash
npm run dev
```

Server chạy tại: `http://localhost:5001`

## API Endpoints

- `GET /api/chat/channels` - Lấy danh sách channels
- `GET /api/chat/token` - Lấy Stream token

