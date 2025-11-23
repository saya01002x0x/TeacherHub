# Hướng Dẫn Cài Đặt và Test API TeacherHub

## Tổng Quan
TeacherHub là một ứng dụng chat sử dụng Node.js backend với Express, Clerk cho authentication, và Stream Chat cho real-time messaging.

## Yêu Cầu Hệ Thống
- Node.js >= 18
- MongoDB
- Tài khoản Clerk (https://clerk.com)
- Tài khoản Stream Chat (https://getstream.io/chat)

## Cài Đặt

### 1. Clone Repository
```bash
git clone <repository-url>
cd TeacherHub
```

### 2. Cài Đặt Dependencies
```bash
cd backend
npm install
```

### 3. Cấu Hình Environment Variables
- Copy file `.env.example` thành `.env`
- Cập nhật các giá trị:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/teacherhub
NODE_ENV=development
CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>
CLERK_SECRET_KEY=<your_clerk_secret_key>
STREAM_API_KEY=<your_stream_api_key>
STREAM_API_SECRET=<your_stream_api_secret>
CLIENT_URL=http://localhost:5173
```

### 4. Khởi Động Server
```bash
npm run dev
```
Server sẽ chạy trên `http://localhost:5001`

## API Endpoints

### Authentication
Tất cả API yêu cầu authentication qua Clerk JWT token trong header:
```
Authorization: Bearer <jwt_token>
```

### Chat APIs

#### 1. Get Stream Token
- **Method**: GET
- **URL**: `/api/chat/token`
- **Description**: Lấy token để connect với Stream Chat client

#### 2. Create Channel
- **Method**: POST
- **URL**: `/api/chat/channels`
- **Body**:
```json
{
  "name": "Channel Name",
  "description": "Channel description (optional)",
  "type": "team",
  "members": ["user_id_1", "user_id_2"]
}
```
- **Response** (201):
```json
{
  "message": "Channel created successfully",
  "channel": {
    "id": "channel_id",
    "type": "team",
    "name": "Channel Name",
    "description": "Channel description",
    "members": [...],
    "created_at": "2025-11-23T...",
    "created_by_id": "user_id"
  }
}
```

#### 3. Get Channels
- **Method**: GET
- **URL**: `/api/chat/channels?limit=20&offset=0&sort=last_message_at&order=-1`
- **Query Params**:
  - `limit`: Số channel trả về (default: 20)
  - `offset`: Offset cho pagination (default: 0)
  - `sort`: Sắp xếp theo `created_at` hoặc `last_message_at` (default: last_message_at)
  - `order`: 1 (asc) hoặc -1 (desc) (default: -1)

#### 4. Add Members to Channel
- **Method**: POST
- **URL**: `/api/chat/channels/:channelId/members`
- **Body**:
```json
{
  "members": ["user_id_1", "user_id_2"]
}
```

#### 5. Get Channel Members
- **Method**: GET
- **URL**: `/api/chat/channels/:channelId/members`

## Test API với Postman

### 1. Setup Authentication
- Đăng nhập vào ứng dụng frontend để lấy JWT token từ browser Network tab.
- Trong Postman, thêm header: `Authorization: Bearer <token>`

### 2. Test Create Channel
- **URL**: `http://localhost:5001/api/chat/channels`
- **Method**: POST
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Body**:
```json
{
  "name": "Test Channel",
  "description": "A test channel",
  "type": "team",
  "members": []
}
```

### 3. Expected Response
- **Status**: 201
- **Body**: Như trên

## Troubleshooting

### Lỗi "Unauthorized - you must be logged in"
- Kiểm tra JWT token có hợp lệ và chưa hết hạn.
- Đảm bảo header `Authorization` đúng format.

### Lỗi Stream Chat
- Kiểm tra `STREAM_API_KEY` và `STREAM_API_SECRET` đúng.
- Đảm bảo users tồn tại trên Stream trước khi tạo channel.

### Lỗi MongoDB
- Đảm bảo MongoDB đang chạy.
- Kiểm tra `MONGO_URI` đúng.

## Development Notes
- Sử dụng Clerk cho authentication.
- Stream Chat handle real-time messaging.
- MongoDB lưu trữ data bổ sung nếu cần.

## Support
Nếu gặp vấn đề, kiểm tra console logs và đảm bảo tất cả environment variables đã được set đúng.