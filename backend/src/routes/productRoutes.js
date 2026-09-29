import express from "express";

import {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/productController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/",
    protect,
    createProduct
);

router.get(
    "/",
    protect,
    getProducts
);

router.get(
    "/:id",
    protect,
    getProduct
);

router.put(
    "/:id",
    protect,
    updateProduct
);

router.delete(
    "/:id",
    protect,
    deleteProduct
);

export default router;