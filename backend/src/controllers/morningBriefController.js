import Sale from "../models/Sale.js";
import Expense from "../models/Expense.js";
import Product from "../models/Product.js";

import generateMorningBrief from "../services/morningBriefService.js";

const getMorningBrief = async (req, res) => {
    try {
        const businessId = req.user.business;

        if (!businessId) {
            return res.status(400).json({
                success: false,
                message: "Business not found",
            });
        }

        // ========================================
        // DATE RANGES
        // ========================================

        const now = new Date();

        const currentStart = new Date(now);
        currentStart.setDate(
            currentStart.getDate() - 30
        );

        const previousStart = new Date(now);
        previousStart.setDate(
            previousStart.getDate() - 60
        );

        const previousEnd = new Date(now);
        previousEnd.setDate(
            previousEnd.getDate() - 30
        );


        // ========================================
        // FETCH DATA
        // ========================================

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
                $lt: previousEnd,
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
                $lt: previousEnd,
            },
        });

        const products = await Product.find({
            business: businessId,
        });


        // ========================================
        // REVENUE
        // ========================================

        const currentRevenue = currentSales.reduce(
            (sum, sale) =>
                sum + Number(sale.totalAmount || 0),
            0
        );

        const previousRevenue = previousSales.reduce(
            (sum, sale) =>
                sum + Number(sale.totalAmount || 0),
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


        // ========================================
        // EXPENSES
        // ========================================

        const currentExpenseTotal =
            currentExpenses.reduce(
                (sum, expense) =>
                    sum + Number(expense.amount || 0),
                0
            );

        const previousExpenseTotal =
            previousExpenses.reduce(
                (sum, expense) =>
                    sum + Number(expense.amount || 0),
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


        // ========================================
        // PROFIT
        // ========================================

        const grossProfit = currentSales.reduce(
            (sum, sale) =>
                sum + Number(sale.profit || 0),
            0
        );

        const netProfit =
            grossProfit -
            currentExpenseTotal;


        // ========================================
        // INVENTORY
        // ========================================

        const lowStockProducts =
            products.filter(
                (product) =>
                    product.stock <=
                    product.minimumStock
            );

        const outOfStockProducts =
            products.filter(
                (product) =>
                    product.stock === 0
            );


        // ========================================
        // BUSINESS SIGNALS
        // ========================================

        const risks = [];


        // Revenue decline
        if (
            revenueChangePercent !== null &&
            revenueChangePercent <= -10
        ) {
            risks.push({
                type: "DECLINING_SALES",

                severity:
                    revenueChangePercent <= -25
                        ? "HIGH"
                        : "MEDIUM",

                value:
                    revenueChangePercent,

                message:
                    "Revenue has declined compared with the previous period.",
            });
        }


        // Negative profit
        if (netProfit < 0) {
            risks.push({
                type: "NEGATIVE_PROFIT",

                severity: "HIGH",

                value: netProfit,

                message:
                    "Current net profit is negative.",
            });
        }


        // Low stock
        if (lowStockProducts.length > 0) {
            risks.push({
                type: "LOW_STOCK",

                severity:
                    lowStockProducts.length >= 5
                        ? "HIGH"
                        : "MEDIUM",

                value:
                    lowStockProducts.length,

                message:
                    `${lowStockProducts.length} products are at or below minimum stock.`,
            });
        }


        // Out of stock
        if (outOfStockProducts.length > 0) {
            risks.push({
                type: "OUT_OF_STOCK",

                severity: "HIGH",

                value:
                    outOfStockProducts.length,

                message:
                    `${outOfStockProducts.length} products are out of stock.`,
            });
        }


        // Rising expenses
        if (
            expenseChangePercent !== null &&
            expenseChangePercent >= 20
        ) {
            risks.push({
                type: "RISING_EXPENSES",

                severity:
                    expenseChangePercent >= 40
                        ? "HIGH"
                        : "MEDIUM",

                value:
                    expenseChangePercent,

                message:
                    "Expenses have increased significantly compared with the previous period.",
            });
        }


        // ========================================
        // STRUCTURED BUSINESS DATA FOR AI
        // ========================================

        const businessData = {
            period: {
                current: "Last 30 days",
                previous: "Previous 30 days",
            },

            sales: {
                currentRevenue,
                previousRevenue,
                revenueChangePercent,
                totalSales:
                    currentSales.length,

                previousTotalSales:
                    previousSales.length,
            },

            expenses: {
                currentExpenseTotal,
                previousExpenseTotal,
                expenseChangePercent,
            },

            profitability: {
                grossProfit,
                currentExpenses:
                    currentExpenseTotal,
                netProfit,
            },

            inventory: {
                totalProducts:
                    products.length,

                lowStockCount:
                    lowStockProducts.length,

                outOfStockCount:
                    outOfStockProducts.length,

                lowStockProducts:
                    lowStockProducts.map(
                        (product) => ({
                            name:
                                product.name,

                            stock:
                                product.stock,

                            minimumStock:
                                product.minimumStock,
                        })
                    ),

                outOfStockProducts:
                    outOfStockProducts.map(
                        (product) => ({
                            name:
                                product.name,

                            stock:
                                product.stock,
                        })
                    ),
            },

            risks,
        };


        // ========================================
        // STRUCTURED DATA FOR FRONTEND
        // ========================================

        const briefData = {

            period: {
                current:
                    "Last 30 days",

                previous:
                    "Previous 30 days",
            },


            revenue: {
                current:
                    currentRevenue,

                previous:
                    previousRevenue,

                changePercent:
                    revenueChangePercent,
            },


            expenses: {
                current:
                    currentExpenseTotal,

                previous:
                    previousExpenseTotal,

                changePercent:
                    expenseChangePercent,
            },


            profit: {
                grossProfit,

                netProfit,
            },


            inventory: {
                totalProducts:
                    products.length,

                lowStockCount:
                    lowStockProducts.length,

                outOfStockCount:
                    outOfStockProducts.length,
            },


            signals: risks.map(
                (risk) => ({
                    type:
                        risk.type,

                    severity:
                        risk.severity,

                    value:
                        risk.value,

                    message:
                        risk.message,
                })
            ),
        };


        // ========================================
        // AI MORNING BRIEF
        // ========================================

        const morningBrief =
            await generateMorningBrief(
                businessData
            );


        // ========================================
        // RESPONSE
        // ========================================

        return res.status(200).json({

            success: true,

            generatedAt:
                new Date(),

            briefData,

            businessData,

            vyparMind: {

                morningBrief,

            },
        });


    } catch (error) {

        console.error(
            "Morning Brief Controller Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to generate morning brief",

        });
    }
};


export {
    getMorningBrief,
};