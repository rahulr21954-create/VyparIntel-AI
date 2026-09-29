import express from "express";

import {
    createExpense,
    getExpenses,
    getExpense,
    updateExpense,
    deleteExpense,
} from "../controllers/expenseController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();


// Create Expense
router.post("/", protect, createExpense);

// Get All Expenses
router.get("/", protect, getExpenses);

// Get Single Expense
router.get("/:id", protect, getExpense);

// Update Expense
router.put("/:id", protect, updateExpense);

// Delete Expense
router.delete("/:id", protect, deleteExpense);


export default router;