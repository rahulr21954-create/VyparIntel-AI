import Sale from "../models/Sale.js";
import Expense from "../models/Expense.js";
import Product from "../models/Product.js";

import generateRiskInsight from "../services/riskEngineService.js";


const getRiskAnalysis = async (req, res) => {
    try {
        const businessId = req.user.business;

        if (!businessId) {
            return res.status(400).json({
                success: false,
                message: "Business not found.",
            });
        }

        // --------------------------------
        // DATE RANGE
        // --------------------------------

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
        // PROFIT
        // --------------------------------

        const currentGrossProfit =
            currentSales.reduce(
                (total, sale) =>
                    total + sale.profit,
                0
            );

        const currentExpensesTotal =
            currentExpenses.reduce(
                (total, expense) =>
                    total + expense.amount,
                0
            );

        const currentNetProfit =
            currentGrossProfit -
            currentExpensesTotal;


        // --------------------------------
        // LOW STOCK RISK
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
        // OUT OF STOCK RISK
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
        // EXPENSE GROWTH
        // --------------------------------

        const previousExpensesTotal =
            previousExpenses.reduce(
                (total, expense) =>
                    total + expense.amount,
                0
            );

        let expenseChangePercent = null;

        if (previousExpensesTotal > 0) {
            expenseChangePercent = Number(
                (
                    ((currentExpensesTotal -
                        previousExpensesTotal) /
                        previousExpensesTotal) *
                    100
                ).toFixed(2)
            );
        }


        // --------------------------------
        // RISK SIGNALS
        // --------------------------------

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
                value: revenueChangePercent,
                message:
                    "Revenue has declined significantly compared with the previous 30-day period.",
            });
        }


        // Negative profit
        if (currentNetProfit < 0) {
            risks.push({
                type: "NEGATIVE_PROFIT",
                severity: "HIGH",
                value: currentNetProfit,
                message:
                    "The business currently has negative net profit.",
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
                count: lowStockProducts.length,
                products: lowStockProducts,
                message:
                    "One or more products are at or below their minimum stock level.",
            });
        }


        // Out of stock
        if (outOfStockProducts.length > 0) {
            risks.push({
                type: "OUT_OF_STOCK",
                severity: "HIGH",
                count: outOfStockProducts.length,
                products: outOfStockProducts,
                message:
                    "One or more products currently have zero stock.",
            });
        }


        // Expense growth
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
                value: expenseChangePercent,
                message:
                    "Business expenses have increased significantly compared with the previous period.",
            });
        }


        // --------------------------------
        // RISK SUMMARY
        // --------------------------------

        const riskData = {
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

            profit: {
                grossProfit:
                    currentGrossProfit,
                expenses:
                    currentExpensesTotal,
                netProfit:
                    currentNetProfit,
            },

            expenseChangePercent,

            risks,
        };


        // --------------------------------
        // AI EXPLANATION
        // --------------------------------

        const insight =
            await generateRiskInsight(
                riskData
            );


        res.status(200).json({
            success: true,

            riskData,

            vyparMind: {
                riskAnalysis: insight,
            },
        });

    } catch (error) {
        console.error(
            "Risk Engine Controller Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to generate risk analysis.",
        });
    }
};


export {
    getRiskAnalysis,
};