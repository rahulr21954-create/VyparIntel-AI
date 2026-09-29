import express from "express";

import {
    getRiskAnalysis,
} from "../controllers/riskEngineController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/",
    protect,
    getRiskAnalysis
);

export default router;