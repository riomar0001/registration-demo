import express from "express";
import path from "path";
import registrationRoutes from "./routes/membersRoutes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use("/uploads", express.static(path.resolve("uploads")));

// Routes
app.use("/api", registrationRoutes);

export default app;

