import express from "express";

import {
    getWhyAnalysis,
} from "../controllers/whyEngineController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/",
    protect,
    getWhyAnalysis
);

export default router;