import Expense from "../models/Expense.js";

// Create Expense
const createExpense = async (req, res) => {
    try {
        const businessId = req.user.business;

        if (!businessId) {
            return res.status(400).json({
                success: false,
                message: "Business not found. Please create a business first.",
            });
        }

        const {
            category,
            amount,
            description,
            paymentMethod,
            expenseDate,
        } = req.body;

        if (!category || amount === undefined) {
            return res.status(400).json({
                success: false,
                message: "Category and amount are required.",
            });
        }

        if (Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Expense amount must be greater than 0.",
            });
        }

        const expense = await Expense.create({
            category,
            amount: Number(amount),
            description,
            paymentMethod,
            expenseDate,
            business: businessId,
        });

        res.status(201).json({
            success: true,
            message: "Expense created successfully.",
            expense,
        });
    } catch (error) {
        console.error("Create Expense Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create expense.",
        });
    }
};


// Get All Expenses
const getExpenses = async (req, res) => {
    try {
        const businessId = req.user.business;

        if (!businessId) {
            return res.status(400).json({
                success: false,
                message: "Business not found.",
            });
        }

        const expenses = await Expense.find({
            business: businessId,
        }).sort({
            expenseDate: -1,
        });

        res.status(200).json({
            success: true,
            count: expenses.length,
            expenses,
        });
    } catch (error) {
        console.error("Get Expenses Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch expenses.",
        });
    }
};


// Get Single Expense
const getExpense = async (req, res) => {
    try {
        const businessId = req.user.business;

        const expense = await Expense.findOne({
            _id: req.params.id,
            business: businessId,
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found.",
            });
        }

        res.status(200).json({
            success: true,
            expense,
        });
    } catch (error) {
        console.error("Get Expense Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch expense.",
        });
    }
};


// Update Expense
const updateExpense = async (req, res) => {
    try {
        const businessId = req.user.business;

        const allowedFields = [
            "category",
            "amount",
            "description",
            "paymentMethod",
            "expenseDate",
        ];

        const updates = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (updates.amount !== undefined) {
            updates.amount = Number(updates.amount);

            if (updates.amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Expense amount must be greater than 0.",
                });
            }
        }

        const expense = await Expense.findOneAndUpdate(
            {
                _id: req.params.id,
                business: businessId,
            },
            updates,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Expense updated successfully.",
            expense,
        });
    } catch (error) {
        console.error("Update Expense Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update expense.",
        });
    }
};


// Delete Expense
const deleteExpense = async (req, res) => {
    try {
        const businessId = req.user.business;

        const expense = await Expense.findOneAndDelete({
            _id: req.params.id,
            business: businessId,
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Expense deleted successfully.",
        });
    } catch (error) {
        console.error("Delete Expense Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete expense.",
        });
    }
};


export {
    createExpense,
    getExpenses,
    getExpense,
    updateExpense,
    deleteExpense,
};