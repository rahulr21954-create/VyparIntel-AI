import Sale from "../models/Sale.js";
import Expense from "../models/Expense.js";
import Product from "../models/Product.js";

const getDashboardAnalytics = async (req, res) => {
    try {
        const businessId = req.user.business;

        if (!businessId) {
            return res.status(400).json({
                success: false,
                message: "Business not found.",
            });
        }

        const sales = await Sale.find({
            business: businessId,
        });

        const expenses = await Expense.find({
            business: businessId,
        });

        const products = await Product.find({
            business: businessId,
        });

        // -------------------------
        // SALES
        // -------------------------

        let revenue = 0;
        let totalCost = 0;
        let profit = 0;

        sales.forEach((sale) => {
            revenue += sale.totalAmount;
            totalCost += sale.totalCost;
            profit += sale.profit;
        });

        // -------------------------
        // EXPENSES
        // -------------------------

        let totalExpenses = 0;

        expenses.forEach((expense) => {
            totalExpenses += expense.amount;
        });

        // -------------------------
        // NET PROFIT
        // -------------------------

        const netProfit = profit - totalExpenses;

        // -------------------------
        // PROFIT MARGIN
        // -------------------------

        const profitMargin =
            revenue > 0
                ? (netProfit / revenue) * 100
                : 0;

        // -------------------------
        // LOW STOCK
        // -------------------------

        const lowStockProducts = products.filter(
            (product) =>
                product.stock <= product.minimumStock
        );

        // -------------------------
        // TOTAL STOCK
        // -------------------------

        const totalStockUnits = products.reduce(
            (total, product) =>
                total + product.stock,
            0
        );

        res.status(200).json({
            success: true,

            analytics: {
                revenue,
                totalCost,
                grossProfit: profit,
                totalExpenses,
                netProfit,
                profitMargin: Number(
                    profitMargin.toFixed(2)
                ),

                totalSales: sales.length,
                totalExpensesCount: expenses.length,
                totalProducts: products.length,

                totalStockUnits,

                lowStockProducts: lowStockProducts.length,
            },
        });
    } catch (error) {
        console.error(
            "Dashboard Analytics Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to calculate analytics.",
        });
    }
};

export {
    getDashboardAnalytics,
};