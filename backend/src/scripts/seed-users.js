import "dotenv/config";
import { connectDB } from "../config/db.js";
import { User } from "../models/user.model.js";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const seedUsers = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log("Connected to MongoDB");

    // Read mock users from JSON file
    const filePath = join(__dirname, "../data/mock-users.json");
    const fileContent = await readFile(filePath, "utf-8");
    const mockUsers = JSON.parse(fileContent);

    console.log(`\nFound ${mockUsers.length} users in mock data file`);

    // Clear existing users (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // console.log("Cleared existing users");

    // Insert users
    const insertedUsers = [];
    const skippedUsers = [];

    for (const userData of mockUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({
          $or: [{ email: userData.email }, { clerkId: userData.clerkId }],
        });

        if (existingUser) {
          console.log(`⏭️  Skipped: User with email "${userData.email}" or clerkId "${userData.clerkId}" already exists`);
          skippedUsers.push(userData);
          continue;
        }

        const user = await User.create(userData);
        insertedUsers.push(user);
        console.log(`✅ Created user: ${user.name} (${user.email})`);
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }

    // Summary
    console.log("\n=== Seed Summary ===");
    console.log(`✅ Successfully inserted: ${insertedUsers.length} users`);
    console.log(`⏭️  Skipped (already exists): ${skippedUsers.length} users`);
    console.log(`📊 Total processed: ${mockUsers.length} users`);

    // Query test
    console.log("\n=== Testing Query ===");
    const totalUsers = await User.countDocuments();
    console.log(`Total users in database: ${totalUsers}`);

    const sampleUser = await User.findOne();
    if (sampleUser) {
      console.log(`Sample user:`, {
        name: sampleUser.name,
        email: sampleUser.email,
        clerkId: sampleUser.clerkId,
      });
    }

    console.log("\n✅ Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    process.exit(1);
  }
};

seedUsers();

