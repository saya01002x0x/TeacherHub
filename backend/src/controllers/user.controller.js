import { User } from "../models/user.model.js";

// Lấy thông tin user theo id
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm user theo id (có thể là _id hoặc clerkId)
    const user = await User.findOne({
      $or: [{ _id: id }, { clerkId: id }],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Return thông tin user (không bao gồm sensitive data nếu có)
    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        image: user.image,
        clerkId: user.clerkId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.log("Error getting user by id:", error);
    res.status(500).json({
      message: "Failed to get user",
      error: error.message,
    });
  }
};

// Lấy danh sách users
export const getUsers = async (req, res) => {
  try {
    const {
      limit = 20,
      offset = 0,
      search = "",
    } = req.query;

    // Tạo filter nếu có search
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Query users với pagination
    const users = await User.find(filter)
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .sort({ createdAt: -1 });

    // Đếm tổng số users (để pagination)
    const total = await User.countDocuments(filter);

    // Format response
    const usersData = users.map((user) => ({
      id: user._id,
      email: user.email,
      name: user.name,
      image: user.image,
      clerkId: user.clerkId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    res.status(200).json({
      users: usersData,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: total,
        has_more: parseInt(offset) + usersData.length < total,
      },
    });
  } catch (error) {
    console.log("Error getting users:", error);
    res.status(500).json({
      message: "Failed to get users",
      error: error.message,
    });
  }
};

