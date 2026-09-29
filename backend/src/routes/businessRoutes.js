import express from "express";

import {
    createBusiness,
    getMyBusiness,
} from "../controllers/businessController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/",
    protect,
    createBusiness
);

router.get(
    "/my",
    protect,
    getMyBusiness
);

export default router;