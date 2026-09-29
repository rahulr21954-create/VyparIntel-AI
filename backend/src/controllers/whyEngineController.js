import Sale from "../models/Sale.js";
import Expense from "../models/Expense.js";
import Product from "../models/Product.js";

import generateWhyInsight from "../services/whyEngineService.js";


const getWhyAnalysis = async (req, res) => {
    try {
        const businessId = req.user.business;

        if (!businessId) {
            return res.status(400).json({
                success: false,
                message: "Business not found.",
            });
        }

        // --------------------------------
        // DATE RANGES
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
        // FETCH SALES
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

        // --------------------------------
        // FETCH EXPENSES
        // --------------------------------

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

        // --------------------------------
        // PRODUCTS
        // --------------------------------

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

        // --------------------------------
        // REVENUE CHANGE
        // --------------------------------

        let revenueChangePercent = null;

        if (previousRevenue > 0) {
            revenueChangePercent =
                Number(
                    (
                        ((currentRevenue -
                            previousRevenue) /
                            previousRevenue) *
                        100
                    ).toFixed(2)
                );
        }

        // --------------------------------
        // PRODUCT SALES ANALYSIS
        // --------------------------------

        const currentProductSales = {};
        const previousProductSales = {};

        currentSales.forEach((sale) => {
            sale.items.forEach((item) => {
                const name = item.productName;

                if (!currentProductSales[name]) {
                    currentProductSales[name] = 0;
                }

                currentProductSales[name] +=
                    item.quantity;
            });
        });

        previousSales.forEach((sale) => {
            sale.items.forEach((item) => {
                const name = item.productName;

                if (!previousProductSales[name]) {
                    previousProductSales[name] = 0;
                }

                previousProductSales[name] +=
                    item.quantity;
            });
        });

        // --------------------------------
        // PRODUCT CHANGES
        // --------------------------------

        const productChanges = [];

        const productNames = new Set([
            ...Object.keys(currentProductSales),
            ...Object.keys(previousProductSales),
        ]);

        productNames.forEach((productName) => {
            const current =
                currentProductSales[productName] || 0;

            const previous =
                previousProductSales[productName] || 0;

            let changePercent = null;

            if (previous > 0) {
                changePercent = Number(
                    (
                        ((current - previous) /
                            previous) *
                        100
                    ).toFixed(2)
                );
            }

            productChanges.push({
                productName,
                currentQuantity: current,
                previousQuantity: previous,
                changePercent,
            });
        });

        // Largest declining products
        const decliningProducts =
            productChanges
                .filter(
                    (product) =>
                        product.changePercent !== null &&
                        product.changePercent < 0
                )
                .sort(
                    (a, b) =>
                        a.changePercent -
                        b.changePercent
                )
                .slice(0, 5);

        // --------------------------------
        // EXPENSE ANALYSIS
        // --------------------------------

        const currentExpenseByCategory = {};
        const previousExpenseByCategory = {};

        currentExpenses.forEach((expense) => {
            if (
                !currentExpenseByCategory[
                    expense.category
                ]
            ) {
                currentExpenseByCategory[
                    expense.category
                ] = 0;
            }

            currentExpenseByCategory[
                expense.category
            ] += expense.amount;
        });

        previousExpenses.forEach((expense) => {
            if (
                !previousExpenseByCategory[
                    expense.category
                ]
            ) {
                previousExpenseByCategory[
                    expense.category
                ] = 0;
            }

            previousExpenseByCategory[
                expense.category
            ] += expense.amount;
        });

        const expenseChanges = [];

        const categories = new Set([
            ...Object.keys(
                currentExpenseByCategory
            ),
            ...Object.keys(
                previousExpenseByCategory
            ),
        ]);

        categories.forEach((category) => {
            const current =
                currentExpenseByCategory[
                    category
                ] || 0;

            const previous =
                previousExpenseByCategory[
                    category
                ] || 0;

            let changePercent = null;

            if (previous > 0) {
                changePercent = Number(
                    (
                        ((current - previous) /
                            previous) *
                        100
                    ).toFixed(2)
                );
            }

            expenseChanges.push({
                category,
                currentAmount: current,
                previousAmount: previous,
                changePercent,
            });
        });

        const increasingExpenses =
            expenseChanges
                .filter(
                    (expense) =>
                        expense.changePercent !== null &&
                        expense.changePercent > 0
                )
                .sort(
                    (a, b) =>
                        b.changePercent -
                        a.changePercent
                )
                .slice(0, 5);

        // --------------------------------
        // LOW STOCK SIGNALS
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
        // EVIDENCE
        // --------------------------------

        const evidence = {
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

            decliningProducts,

            increasingExpenses,

            lowStockProducts,

            salesCount: {
                current: currentSales.length,
                previous: previousSales.length,
            },
        };

        // --------------------------------
        // AI EXPLANATION
        // --------------------------------

        const insight =
            await generateWhyInsight(
                evidence
            );

        res.status(200).json({
            success: true,

            evidence,

            vyparMind: {
                whyAnalysis: insight,
            },
        });

    } catch (error) {
        console.error(
            "Why Engine Controller Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to generate Why Engine analysis.",
        });
    }
};


export {
    getWhyAnalysis,
};