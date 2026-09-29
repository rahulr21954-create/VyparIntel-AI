import express from "express";

import {
    chatWithVyparMind,
} from "../controllers/vyparMindChatController.js";

import authMiddleware from "../middleware/authMiddleware.js";


const router = express.Router();


router.post(
    "/chat",
    authMiddleware,
    chatWithVyparMind
);


export default router;