import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server, io } from "./lib/socket.js";
import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 5001;
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    // In dev, allow whatever Vite port is used (5173, 5174, etc).
    // With credentials=true, `origin: true` will reflect the request origin.
    origin: process.env.NODE_ENV === "production" ? "http://localhost:5173" : true,
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  // Frontend lives at ../frontend/chat_web (Vite build output: dist/)
  app.use(express.static(path.join(__dirname, "../frontend/chat_web/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/chat_web", "dist", "index.html"));
  });
}

server.listen(PORT, async () => {
  console.log("server is running on PORT:" + PORT);
  await connectDB();
});