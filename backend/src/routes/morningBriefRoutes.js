import express from "express";

import {
    getMorningBrief,
} from "../controllers/morningBriefController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/",
    protect,
    getMorningBrief
);

export default router;