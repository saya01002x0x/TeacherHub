import express from "express";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
// import { ingestServe } from "./config/ingest.js";
import chatRoutes from "./routes/chat.route.js";
import userRoutes from "./routes/user.route.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(clerkMiddleware()); // req.auth will be available in the request object

// Ingest webhook endpoint
// ingestServe(app);

app.get("/", (req, res) => {
  res.send("Hello World! 123");
});

app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);

const startServer = async () => {
  try {
    await connectDB();
    if (ENV.NODE_ENV !== "production") {
      app.listen(ENV.PORT, () => {
        console.log("Server started on port:", ENV.PORT);
      });
    }
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1); // Exit the process with a failure code
  }
};

startServer();

export default app;

