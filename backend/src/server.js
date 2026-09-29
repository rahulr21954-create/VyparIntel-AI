import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

import "dotenv/config";

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import businessRoutes from "./routes/businessRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import vyparMindRoutes from "./routes/vyparMindRoutes.js";
import whyEngineRoutes from "./routes/whyEngineRoutes.js";
import riskEngineRoutes from "./routes/riskEngineRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import morningBriefRoutes from "./routes/morningBriefRoutes.js";
import businessDecisionRoutes from './routes/businessDecisionRoutes.js'
import vyparMindChatRoutes from "./routes/vyparMindChatRoutes.js";

const app = express();

const PORT = process.env.PORT || 8002;

// Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/business",businessRoutes);
app.use("/api/products",productRoutes);
app.use("/api/sales",saleRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/vyparmind", vyparMindRoutes);
app.use("/api/why", whyEngineRoutes);
app.use("/api/risk", riskEngineRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/morning-brief", morningBriefRoutes);
app.use("/api/business-ai", businessDecisionRoutes);
app.use(
    "/api/vyparmind",
    vyparMindChatRoutes
);

// Root
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "VyparIntel Backend is running 🚀",
    });
});

app.listen(PORT, () => {
    console.log(`VyparIntel Backend running on port ${PORT}`);
});