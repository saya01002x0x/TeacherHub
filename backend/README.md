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


4. **Chạy server:**
```bash
npm run dev
```

Server chạy tại: `http://localhost:5001`

## API Endpoints

- `GET /api/chat/channels` - Lấy danh sách channels
- `GET /api/chat/token` - Lấy Stream token

