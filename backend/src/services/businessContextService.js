import Business from "../models/Business.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import Expense from "../models/Expense.js";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const round = (value) =>
    Math.round((Number(value) || 0) * 100) / 100;

const percentageChange = (current, previous) => {
    if (!previous) {
        if (current === 0) return 0;
        return null;
    }

    return round(((current - previous) / previous) * 100);
};

const sum = (items, field) =>
    round(
        items.reduce(
            (total, item) =>
                total + (Number(item?.[field]) || 0),
            0
        )
    );

const getDateRange = (daysAgoStart, daysAgoEnd) => {
    const now = new Date();

    const end = new Date(now);

    const start = new Date(now);
    start.setDate(start.getDate() - daysAgoStart);

    const previousStart = new Date(now);
    previousStart.setDate(
        previousStart.getDate() - daysAgoEnd
    );

    return {
        start,
        end,
        previousStart,
    };
};

/*
|--------------------------------------------------------------------------
| Main Business Context
|--------------------------------------------------------------------------
*/

export const getBusinessContext = async (userId) => {
    try {
        console.log(
            "🧠 Building VyparMind business context..."
        );

        /*
        |--------------------------------------------------------------------------
        | 1. Find business owned by logged-in user
        |--------------------------------------------------------------------------
        */

        const business = await Business.findOne({
            owner: userId,
        }).lean();

        if (!business) {
            throw new Error(
                "No business found for this user."
            );
        }

        const businessId = business._id;

        /*
        |--------------------------------------------------------------------------
        | 2. Date periods
        |--------------------------------------------------------------------------
        |
        | Current  = Last 30 days
        | Previous = 30 days before that
        |
        */

        const now = new Date();

        const currentStart = new Date(now);
        currentStart.setDate(
            currentStart.getDate() - 30
        );

        const previousStart = new Date(now);
        previousStart.setDate(
            previousStart.getDate() - 60
        );

        /*
        |--------------------------------------------------------------------------
        | 3. Fetch business data
        |--------------------------------------------------------------------------
        */

        const [
            currentSales,
            previousSales,
            currentExpenses,
            previousExpenses,
            products,
        ] = await Promise.all([
            Sale.find({
                business: businessId,
                saleDate: {
                    $gte: currentStart,
                    $lte: now,
                },
            }).lean(),

            Sale.find({
                business: businessId,
                saleDate: {
                    $gte: previousStart,
                    $lt: currentStart,
                },
            }).lean(),

            Expense.find({
                business: businessId,
                expenseDate: {
                    $gte: currentStart,
                    $lte: now,
                },
            }).lean(),

            Expense.find({
                business: businessId,
                expenseDate: {
                    $gte: previousStart,
                    $lt: currentStart,
                },
            }).lean(),

            Product.find({
                business: businessId,
            }).lean(),
        ]);

        /*
        |--------------------------------------------------------------------------
        | 4. Current Revenue
        |--------------------------------------------------------------------------
        */

        const currentRevenue = sum(
            currentSales,
            "totalAmount"
        );

        const previousRevenue = sum(
            previousSales,
            "totalAmount"
        );

        /*
        |--------------------------------------------------------------------------
        | 5. Cost of Goods Sold
        |--------------------------------------------------------------------------
        */

        const currentCost = sum(
            currentSales,
            "totalCost"
        );

        const previousCost = sum(
            previousSales,
            "totalCost"
        );

        /*
        |--------------------------------------------------------------------------
        | 6. Gross Profit
        |--------------------------------------------------------------------------
        |
        | Sale.profit already exists in your Sale schema.
        |
        */

        const currentGrossProfit = sum(
            currentSales,
            "profit"
        );

        const previousGrossProfit = sum(
            previousSales,
            "profit"
        );

        /*
        |--------------------------------------------------------------------------
        | 7. Business Expenses
        |--------------------------------------------------------------------------
        */

        const currentExpensesTotal = sum(
            currentExpenses,
            "amount"
        );

        const previousExpensesTotal = sum(
            previousExpenses,
            "amount"
        );

        /*
        |--------------------------------------------------------------------------
        | 8. Net Profit
        |--------------------------------------------------------------------------
        |
        | Net Profit = Gross Profit - Business Expenses
        |
        */

        const currentNetProfit = round(
            currentGrossProfit -
                currentExpensesTotal
        );

        const previousNetProfit = round(
            previousGrossProfit -
                previousExpensesTotal
        );

        /*
        |--------------------------------------------------------------------------
        | 9. Profit / Loss Status
        |--------------------------------------------------------------------------
        */

        let profitStatus = "BREAK_EVEN";

        if (currentNetProfit > 0) {
            profitStatus = "PROFIT";
        } else if (currentNetProfit < 0) {
            profitStatus = "LOSS";
        }

        /*
        |--------------------------------------------------------------------------
        | 10. Sales Statistics
        |--------------------------------------------------------------------------
        */

        const currentSalesCount =
            currentSales.length;

        const previousSalesCount =
            previousSales.length;

        /*
        |--------------------------------------------------------------------------
        | 11. Inventory Statistics
        |--------------------------------------------------------------------------
        */

        const totalProducts =
            products.length;

        const lowStockProducts =
            products.filter(
                (product) =>
                    Number(product.stock) <=
                    Number(product.minimumStock)
            );

        const outOfStockProducts =
            products.filter(
                (product) =>
                    Number(product.stock) === 0
            );

        /*
        |--------------------------------------------------------------------------
        | 12. Product Performance
        |--------------------------------------------------------------------------
        */

        const productPerformanceMap = {};

        currentSales.forEach((sale) => {
            if (!Array.isArray(sale.items)) {
                return;
            }

            sale.items.forEach((item) => {
                const productId =
                    item.product?.toString() ||
                    item.productName;

                if (!productPerformanceMap[productId]) {
                    productPerformanceMap[
                        productId
                    ] = {
                        productId:
                            item.product?.toString() ||
                            null,

                        productName:
                            item.productName,

                        quantitySold: 0,

                        revenue: 0,

                        profit: 0,
                    };
                }

                productPerformanceMap[
                    productId
                ].quantitySold +=
                    Number(item.quantity) || 0;

                productPerformanceMap[
                    productId
                ].revenue +=
                    Number(item.total) || 0;

                productPerformanceMap[
                    productId
                ].profit +=
                    (
                        (Number(item.sellingPrice) ||
                            0) -
                        (Number(item.costPrice) ||
                            0)
                    ) *
                    (Number(item.quantity) || 0);
            });
        });

        const productPerformance =
            Object.values(
                productPerformanceMap
            )
                .map((product) => ({
                    ...product,

                    revenue: round(
                        product.revenue
                    ),

                    profit: round(
                        product.profit
                    ),
                }))
                .sort(
                    (a, b) =>
                        b.revenue -
                        a.revenue
                );

        /*
        |--------------------------------------------------------------------------
        | 13. Top / Weak Products
        |--------------------------------------------------------------------------
        */

        const topProducts =
            productPerformance
                .slice(0, 5);

        const weakestProducts =
            [...productPerformance]
                .sort(
                    (a, b) =>
                        a.profit -
                        b.profit
                )
                .slice(0, 5);

        /*
        |--------------------------------------------------------------------------
        | 14. Expense Breakdown
        |--------------------------------------------------------------------------
        */

        const expenseBreakdownMap = {};

        currentExpenses.forEach(
            (expense) => {
                const category =
                    expense.category ||
                    "Other";

                if (
                    !expenseBreakdownMap[
                        category
                    ]
                ) {
                    expenseBreakdownMap[
                        category
                    ] = 0;
                }

                expenseBreakdownMap[
                    category
                ] +=
                    Number(expense.amount) ||
                    0;
            }
        );

        const expenseBreakdown =
            Object.entries(
                expenseBreakdownMap
            )
                .map(
                    ([
                        category,
                        amount,
                    ]) => ({
                        category,
                        amount: round(amount),
                    })
                )
                .sort(
                    (a, b) =>
                        b.amount -
                        a.amount
                );

        /*
        |--------------------------------------------------------------------------
        | 15. Financial Changes
        |--------------------------------------------------------------------------
        */

        const revenueChange =
            percentageChange(
                currentRevenue,
                previousRevenue
            );

        const expenseChange =
            percentageChange(
                currentExpensesTotal,
                previousExpensesTotal
            );

        const profitChange =
            percentageChange(
                currentNetProfit,
                previousNetProfit
            );

        const salesChange =
            percentageChange(
                currentSalesCount,
                previousSalesCount
            );

        /*
        |--------------------------------------------------------------------------
        | 16. Business Signals
        |--------------------------------------------------------------------------
        */

        const signals = [];

        if (
            revenueChange !== null &&
            revenueChange < -5
        ) {
            signals.push({
                type: "REVENUE_DECLINE",

                severity:
                    revenueChange < -20
                        ? "HIGH"
                        : "MEDIUM",

                message:
                    `Revenue decreased by ${Math.abs(
                        revenueChange
                    )}% compared with the previous 30-day period.`,
            });
        }

        if (
            expenseChange !== null &&
            expenseChange > 10
        ) {
            signals.push({
                type: "EXPENSE_INCREASE",

                severity:
                    expenseChange > 25
                        ? "HIGH"
                        : "MEDIUM",

                message:
                    `Expenses increased by ${expenseChange}% compared with the previous 30-day period.`,
            });
        }

        if (currentNetProfit < 0) {
            signals.push({
                type: "BUSINESS_LOSS",

                severity: "HIGH",

                message:
                    `The business recorded a net loss of ${Math.abs(
                        currentNetProfit
                    )} during the current 30-day period.`,
            });
        }

        if (
            currentNetProfit > 0 &&
            profitChange !== null &&
            profitChange < -10
        ) {
            signals.push({
                type: "PROFIT_DECLINE",

                severity: "HIGH",

                message:
                    `Net profit decreased by ${Math.abs(
                        profitChange
                    )}% compared with the previous period.`,
            });
        }

        if (
            currentNetProfit > 0 &&
            (profitChange === null ||
                profitChange >= -10)
        ) {
            signals.push({
                type: "BUSINESS_PROFIT",

                severity: "POSITIVE",

                message:
                    `The business generated a net profit of ${currentNetProfit}.`,
            });
        }

        if (lowStockProducts.length > 0) {
            signals.push({
                type: "LOW_STOCK",

                severity: "MEDIUM",

                message:
                    `${lowStockProducts.length} product(s) are at or below minimum stock.`,
            });
        }

        if (outOfStockProducts.length > 0) {
            signals.push({
                type: "OUT_OF_STOCK",

                severity: "HIGH",

                message:
                    `${outOfStockProducts.length} product(s) are currently out of stock.`,
            });
        }

        /*
        |--------------------------------------------------------------------------
        | 17. Business Status
        |--------------------------------------------------------------------------
        */

        let businessStatus = "STABLE";

        if (currentNetProfit < 0) {
            businessStatus = "LOSS";
        } else if (
            currentNetProfit > 0 &&
            profitChange !== null &&
            profitChange < -10
        ) {
            businessStatus =
                "PROFIT_DECLINING";
        } else if (
            currentNetProfit > 0
        ) {
            businessStatus = "PROFITABLE";
        }

        /*
        |--------------------------------------------------------------------------
        | 18. Explicit Business Facts
        |--------------------------------------------------------------------------
        |
        | This section is extremely important.
        |
        | VyparMind receives these facts directly and does not
        | have to "guess" what profit or loss means.
        |
        */

        const currency =
            business.currency || "INR";

        const businessFacts = [
            `Business name: ${
                business.name
            }`,

            `Business category: ${
                business.category
            }`,

            `Current period: Last 30 days`,

            `Previous comparison period: 30 days before the current period`,

            `Current revenue: ${currentRevenue} ${currency}`,

            `Previous revenue: ${previousRevenue} ${currency}`,

            `Current cost of goods sold: ${currentCost} ${currency}`,

            `Current gross profit: ${currentGrossProfit} ${currency}`,

            `Current business expenses: ${currentExpensesTotal} ${currency}`,

            `Current net profit: ${currentNetProfit} ${currency}`,

            `Previous net profit: ${previousNetProfit} ${currency}`,

            `Profit/loss status: ${profitStatus}`,

            `Current sales count: ${currentSalesCount}`,

            `Previous sales count: ${previousSalesCount}`,

            `Total products: ${totalProducts}`,

            `Low-stock products: ${lowStockProducts.length}`,

            `Out-of-stock products: ${outOfStockProducts.length}`,

            `Net profit definition: Gross Profit - Business Expenses`,

            `Gross profit definition: Revenue - Cost of Goods Sold`,
        ];

        /*
        |--------------------------------------------------------------------------
        | 19. Final Context
        |--------------------------------------------------------------------------
        */

        const context = {
            business: {
                id: businessId,
                name: business.name,
                category: business.category,
                currency,
            },

            period: {
                current: "Last 30 days",
                previous:
                    "Previous 30 days",

                currentStart,
                currentEnd: now,

                previousStart,
                previousEnd:
                    currentStart,
            },

            financials: {
                revenue: {
                    current:
                        currentRevenue,

                    previous:
                        previousRevenue,

                    changePercent:
                        revenueChange,
                },

                costOfGoodsSold: {
                    current:
                        currentCost,

                    previous:
                        previousCost,
                },

                grossProfit: {
                    current:
                        currentGrossProfit,

                    previous:
                        previousGrossProfit,

                    changePercent:
                        percentageChange(
                            currentGrossProfit,
                            previousGrossProfit
                        ),
                },

                expenses: {
                    current:
                        currentExpensesTotal,

                    previous:
                        previousExpensesTotal,

                    changePercent:
                        expenseChange,
                },

                profit: {
                    current:
                        currentNetProfit,

                    previous:
                        previousNetProfit,

                    changePercent:
                        profitChange,

                    status:
                        profitStatus,
                },

                netProfitDefinition:
                    "Net Profit = Gross Profit - Business Expenses",

                grossProfitDefinition:
                    "Gross Profit = Revenue - Cost of Goods Sold",
            },

            sales: {
                currentPeriod:
                    currentSalesCount,

                previousPeriod:
                    previousSalesCount,

                changePercent:
                    salesChange,
            },

            inventory: {
                totalProducts,

                lowStockCount:
                    lowStockProducts.length,

                outOfStockCount:
                    outOfStockProducts.length,

                lowStockProducts:
                    lowStockProducts.map(
                        (product) => ({
                            id:
                                product._id,
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
                            id:
                                product._id,
                            name:
                                product.name,
                            stock:
                                product.stock,
                        })
                    ),
            },

            products: {
                total:
                    totalProducts,

                performance:
                    productPerformance,

                topProducts,

                weakestProducts,
            },

            expenses: {
                breakdown:
                    expenseBreakdown,
            },

            signals,

            businessStatus,

            businessFacts,
        };

        /*
        |--------------------------------------------------------------------------
        | 20. Debug Log
        |--------------------------------------------------------------------------
        */

        console.log(
            "✅ VyparMind Business Context:"
        );

        console.log({
            revenue:
                context.financials.revenue
                    .current,

            expenses:
                context.financials.expenses
                    .current,

            grossProfit:
                context.financials.grossProfit
                    .current,

            netProfit:
                context.financials.profit
                    .current,

            status:
                context.financials.profit
                    .status,

            sales:
                context.sales.currentPeriod,

            products:
                context.products.total,
        });

        return context;
    } catch (error) {
        console.error(
            "❌ Business Context Error:",
            error
        );

        throw new Error(
            error?.message ||
                "Failed to build business context."
        );
    }
};

export default getBusinessContext;