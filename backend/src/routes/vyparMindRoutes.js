import express from "express";

import {
    getVyparMindInsight,
} from "../controllers/vyparMindController.js";

import protect from "../middleware/authMiddleware.js";


const router = express.Router();


router.get(
    "/insight",
    protect,
    getVyparMindInsight
);


export default router;