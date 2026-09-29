import Business from "../models/Business.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import Expense from "../models/Expense.js";

import generateBusinessDecision from "../services/businessDecisionService.js";

const getDateRange = (days = 30) => {
    const currentEnd = new Date();

    const currentStart = new Date();
    currentStart.setDate(currentStart.getDate() - days);

    const previousEnd = new Date(currentStart);

    const previousStart = new Date(previousEnd);
    previousStart.setDate(previousStart.getDate() - days);

    return {
        currentStart,
        currentEnd,
        previousStart,
        previousEnd,
    };
};

const calculateChange = (current, previous) => {
    if (!previous) {
        return current > 0 ? 100 : 0;
    }

    return ((current - previous) / Math.abs(previous)) * 100;
};

const getSaleAmount = (sale) => {
    return Number(
        sale.totalAmount ??
            sale.total ??
            sale.amount ??
            sale.grandTotal ??
            0
    );
};

const getExpenseAmount = (expense) => {
    return Number(
        expense.amount ??
            expense.totalAmount ??
            expense.total ??
            0
    );
};

export const getBusinessDecision = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const {
            currentStart,
            currentEnd,
            previousStart,
            previousEnd,
        } = getDateRange(30);

        // --------------------------------------------------
        // 1. BUSINESS
        // --------------------------------------------------

        const business = await Business.findOne({
            owner: userId,
        }).lean();

        // --------------------------------------------------
        // 2. SALES
        // --------------------------------------------------

        const [
            currentSales,
            previousSales,
        ] = await Promise.all([
            Sale.find({
                user: userId,
                createdAt: {
                    $gte: currentStart,
                    $lte: currentEnd,
                },
            }).lean(),

            Sale.find({
                user: userId,
                createdAt: {
                    $gte: previousStart,
                    $lt: previousEnd,
                },
            }).lean(),
        ]);

        // --------------------------------------------------
        // 3. EXPENSES
        // --------------------------------------------------

        const [
            currentExpenses,
            previousExpenses,
        ] = await Promise.all([
            Expense.find({
                user: userId,
                createdAt: {
                    $gte: currentStart,
                    $lte: currentEnd,
                },
            }).lean(),

            Expense.find({
                user: userId,
                createdAt: {
                    $gte: previousStart,
                    $lt: previousEnd,
                },
            }).lean(),
        ]);

        // --------------------------------------------------
        // 4. PRODUCTS
        // --------------------------------------------------

        const products = await Product.find({
            user: userId,
        }).lean();

        // --------------------------------------------------
        // 5. CALCULATE BUSINESS NUMBERS
        // --------------------------------------------------

        const currentRevenue = currentSales.reduce(
            (total, sale) => total + getSaleAmount(sale),
            0
        );

        const previousRevenue = previousSales.reduce(
            (total, sale) => total + getSaleAmount(sale),
            0
        );

        const currentExpenseTotal = currentExpenses.reduce(
            (total, expense) =>
                total + getExpenseAmount(expense),
            0
        );

        const previousExpenseTotal = previousExpenses.reduce(
            (total, expense) =>
                total + getExpenseAmount(expense),
            0
        );

        const currentProfit =
            currentRevenue - currentExpenseTotal;

        const previousProfit =
            previousRevenue - previousExpenseTotal;

        const revenueChange = calculateChange(
            currentRevenue,
            previousRevenue
        );

        const expenseChange = calculateChange(
            currentExpenseTotal,
            previousExpenseTotal
        );

        const profitChange = calculateChange(
            currentProfit,
            previousProfit
        );

        // --------------------------------------------------
        // 6. INVENTORY SIGNALS
        // --------------------------------------------------

        const lowStockProducts = products.filter((product) => {
            const stock = Number(
                product.stock ??
                    product.quantity ??
                    product.currentStock ??
                    0
            );

            const minimumStock = Number(
                product.minStock ??
                    product.minimumStock ??
                    product.lowStockThreshold ??
                    5
            );

            return stock > 0 && stock <= minimumStock;
        });

        const outOfStockProducts = products.filter((product) => {
            const stock = Number(
                product.stock ??
                    product.quantity ??
                    product.currentStock ??
                    0
            );

            return stock <= 0;
        });

        // --------------------------------------------------
        // 7. BUSINESS CONTEXT
        // --------------------------------------------------

        const businessContext = {
            business: {
                name:
                    business?.businessName ||
                    business?.name ||
                    "Business",
                category:
                    business?.category ||
                    business?.businessType ||
                    "Unknown",
            },

            period: {
                current: "Last 30 days",
                previous: "Previous 30 days",
            },

            revenue: {
                current: currentRevenue,
                previous: previousRevenue,
                changePercent: Number(
                    revenueChange.toFixed(2)
                ),
            },

            expenses: {
                current: currentExpenseTotal,
                previous: previousExpenseTotal,
                changePercent: Number(
                    expenseChange.toFixed(2)
                ),
            },

            profit: {
                current: currentProfit,
                previous: previousProfit,
                changePercent: Number(
                    profitChange.toFixed(2)
                ),
            },

            sales: {
                currentCount: currentSales.length,
                previousCount: previousSales.length,
            },

            inventory: {
                totalProducts: products.length,
                lowStockCount: lowStockProducts.length,
                outOfStockCount:
                    outOfStockProducts.length,

                lowStockProducts: lowStockProducts
                    .slice(0, 10)
                    .map((product) => ({
                        name:
                            product.name ||
                            product.productName ||
                            "Unnamed product",

                        stock: Number(
                            product.stock ??
                                product.quantity ??
                                product.currentStock ??
                                0
                        ),
                    })),

                outOfStockProducts:
                    outOfStockProducts
                        .slice(0, 10)
                        .map((product) => ({
                            name:
                                product.name ||
                                product.productName ||
                                "Unnamed product",
                        })),
            },

            signals: {
                revenueDeclining:
                    revenueChange < 0,

                expensesIncreasing:
                    expenseChange > 0,

                profitDeclining:
                    profitChange < 0,

                inventoryPressure:
                    lowStockProducts.length > 0 ||
                    outOfStockProducts.length > 0,
            },
        };

        // --------------------------------------------------
        // 8. ASK VYPARMIND
        // --------------------------------------------------

        const decision =
            await generateBusinessDecision(
                businessContext
            );

        // --------------------------------------------------
        // 9. RESPONSE
        // --------------------------------------------------

        return res.status(200).json({
            success: true,

            generatedAt: new Date(),

            businessData: businessContext,

            decision,
        });
    } catch (error) {
        console.error(
            "Business Decision Controller Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to generate business decision",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};