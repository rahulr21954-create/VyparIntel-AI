import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true,
            trim: true,
            enum: [
                "Retail",
                "Inventory",
                "Rent",
                "Salary",
                "Utilities",
                "Marketing",
                "Transportation",
                "Maintenance",
                "Office",
                "Other",
            ],
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        description: {
            type: String,
            trim: true,
        },

        paymentMethod: {
            type: String,
            enum: ["cash", "upi", "card", "bank", "other"],
            default: "cash",
        },

        expenseDate: {
            type: Date,
            default: Date.now,
        },

        business: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Business",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;