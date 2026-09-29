import express from "express";

import {
    createSale,
    getSales,
    getSale,
} from "../controllers/saleController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/",
    protect,
    createSale
);

router.get(
    "/",
    protect,
    getSales
);

router.get(
    "/:id",
    protect,
    getSale
);

export default router;