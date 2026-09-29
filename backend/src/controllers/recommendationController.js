import Sale from "../models/Sale.js";
import Expense from "../models/Expense.js";
import Product from "../models/Product.js";

import generateRecommendations
    from "../services/recommendationService.js";


const getRecommendations = async (req, res) => {
    try {
        const businessId = req.user.business;

        if (!businessId) {
            return res.status(400).json({
                success: false,
                message: "Business not found.",
            });
        }

        const now = new Date();

        const currentStart = new Date(now);
        currentStart.setDate(
            currentStart.getDate() - 30
        );

        const previousStart = new Date(now);
        previousStart.setDate(
            previousStart.getDate() - 60
        );


        // --------------------------------
        // FETCH DATA
        // --------------------------------

        const currentSales = await Sale.find({
            business: businessId,
            saleDate: {
                $gte: currentStart,
                $lte: now,
            },
        });

        const previousSales = await Sale.find({
            business: businessId,
            saleDate: {
                $gte: previousStart,
                $lt: currentStart,
            },
        });

        const currentExpenses = await Expense.find({
            business: businessId,
            expenseDate: {
                $gte: currentStart,
                $lte: now,
            },
        });

        const previousExpenses = await Expense.find({
            business: businessId,
            expenseDate: {
                $gte: previousStart,
                $lt: currentStart,
            },
        });

        const products = await Product.find({
            business: businessId,
        });


        // --------------------------------
        // REVENUE
        // --------------------------------

        const currentRevenue = currentSales.reduce(
            (total, sale) =>
                total + sale.totalAmount,
            0
        );

        const previousRevenue = previousSales.reduce(
            (total, sale) =>
                total + sale.totalAmount,
            0
        );

        let revenueChangePercent = null;

        if (previousRevenue > 0) {
            revenueChangePercent = Number(
                (
                    ((currentRevenue -
                        previousRevenue) /
                        previousRevenue) *
                    100
                ).toFixed(2)
            );
        }


        // --------------------------------
        // EXPENSES
        // --------------------------------

        const currentExpenseTotal =
            currentExpenses.reduce(
                (total, expense) =>
                    total + expense.amount,
                0
            );

        const previousExpenseTotal =
            previousExpenses.reduce(
                (total, expense) =>
                    total + expense.amount,
                0
            );

        let expenseChangePercent = null;

        if (previousExpenseTotal > 0) {
            expenseChangePercent = Number(
                (
                    ((currentExpenseTotal -
                        previousExpenseTotal) /
                        previousExpenseTotal) *
                    100
                ).toFixed(2)
            );
        }


        // --------------------------------
        // PROFIT
        // --------------------------------

        const grossProfit =
            currentSales.reduce(
                (total, sale) =>
                    total + sale.profit,
                0
            );

        const netProfit =
            grossProfit -
            currentExpenseTotal;


        // --------------------------------
        // LOW STOCK
        // --------------------------------

        const lowStockProducts =
            products
                .filter(
                    (product) =>
                        product.stock <=
                        product.minimumStock
                )
                .map((product) => ({
                    productName: product.name,
                    stock: product.stock,
                    minimumStock:
                        product.minimumStock,
                }));


        // --------------------------------
        // OUT OF STOCK
        // --------------------------------

        const outOfStockProducts =
            products
                .filter(
                    (product) =>
                        product.stock === 0
                )
                .map((product) => ({
                    productName: product.name,
                    stock: product.stock,
                }));


        // --------------------------------
        // BUILD RECOMMENDATION SIGNALS
        // --------------------------------

        const signals = [];


        if (
            revenueChangePercent !== null &&
            revenueChangePercent <= -10
        ) {
            signals.push({
                type: "DECLINING_REVENUE",
                severity: "HIGH",
                value: revenueChangePercent,
                recommendation:
                    "Review products with declining sales and investigate possible causes.",
            });
        }


        if (netProfit < 0) {
            signals.push({
                type: "NEGATIVE_NET_PROFIT",
                severity: "HIGH",
                value: netProfit,
                recommendation:
                    "Review major expenses and product-level margins.",
            });
        }


        if (
            expenseChangePercent !== null &&
            expenseChangePercent >= 20
        ) {
            signals.push({
                type: "RISING_EXPENSES",
                severity: "MEDIUM",
                value: expenseChangePercent,
                recommendation:
                    "Review expense categories with the largest increases.",
            });
        }


        if (lowStockProducts.length > 0) {
            signals.push({
                type: "LOW_STOCK",
                severity: "MEDIUM",
                products: lowStockProducts,
                recommendation:
                    "Review replenishment needs for products at or below minimum stock.",
            });
        }


        if (outOfStockProducts.length > 0) {
            signals.push({
                type: "OUT_OF_STOCK",
                severity: "HIGH",
                products: outOfStockProducts,
                recommendation:
                    "Review replenishment for products currently out of stock.",
            });
        }


        // --------------------------------
        // STRUCTURED DATA FOR AI
        // --------------------------------

        const recommendationData = {
            period: {
                current: "Last 30 days",
                previous: "Previous 30 days",
            },

            revenue: {
                current: currentRevenue,
                previous: previousRevenue,
                changePercent:
                    revenueChangePercent,
            },

            expenses: {
                current: currentExpenseTotal,
                previous: previousExpenseTotal,
                changePercent:
                    expenseChangePercent,
            },

            profit: {
                grossProfit,
                netProfit,
            },

            signals,
        };


        // --------------------------------
        // AI
        // --------------------------------

        const aiRecommendations =
            await generateRecommendations(
                recommendationData
            );


        res.status(200).json({
            success: true,

            recommendationData,

            vyparMind: {
                recommendations:
                    aiRecommendations,
            },
        });

    } catch (error) {
        console.error(
            "Recommendation Controller Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to generate recommendations.",
        });
    }
};


export {
    getRecommendations,
};