import express from "express";

import {
    getBusinessDecision,
} from "../controllers/businessDecisionController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/decision",
    authMiddleware,
    getBusinessDecision
);

export default router;