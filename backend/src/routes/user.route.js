import express from "express";
import { getUserById, getUsers } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/users - Lấy danh sách users (phải đặt trước /:id để tránh conflict)
router.get("/", protectRoute, getUsers);

// GET /api/users/:id - Lấy thông tin user theo id
router.get("/:id", protectRoute, getUserById);

export default router;

