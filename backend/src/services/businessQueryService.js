// backend/src/services/businessQueryService.js

const toNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

const round = (value, decimals = 2) => {
    const factor = 10 ** decimals;
    return Math.round(toNumber(value) * factor) / factor;
};

const formatMoney = (value) => {
    return `₹${Math.round(toNumber(value)).toLocaleString("en-IN")}`;
};

const getChangeDirection = (changePercent) => {
    const value = toNumber(changePercent);

    if (value > 0) return "INCREASED";
    if (value < 0) return "DECREASED";
    return "UNCHANGED";
};

const sortDescending = (items = [], key) => {
    return [...items].sort(
        (a, b) => toNumber(b?.[key]) - toNumber(a?.[key])
    );
};

const sortAscending = (items = [], key) => {
    return [...items].sort(
        (a, b) => toNumber(a?.[key]) - toNumber(b?.[key])
    );
};

/**
 * Extract revenue evidence
 */
const buildRevenueEvidence = (businessContext) => {
    const revenue = businessContext?.revenue || {};

    return {
        current: toNumber(revenue.current),
        previous: toNumber(revenue.previous),
        changePercent: toNumber(revenue.changePercent),
        direction: getChangeDirection(revenue.changePercent),

        formatted: {
            current: formatMoney(revenue.current),
            previous: formatMoney(revenue.previous),
        },

        interpretation:
            toNumber(revenue.changePercent) < 0
                ? "Revenue is lower than the previous comparison period."
                : toNumber(revenue.changePercent) > 0
                    ? "Revenue is higher than the previous comparison period."
                    : "Revenue is unchanged from the previous comparison period.",
    };
};

/**
 * Extract expense evidence
 */
const buildExpenseEvidence = (businessContext) => {
    const expenses = businessContext?.expenses || {};

    return {
        current: toNumber(expenses.current),
        previous: toNumber(expenses.previous),
        changePercent: toNumber(expenses.changePercent),
        direction: getChangeDirection(expenses.changePercent),

        formatted: {
            current: formatMoney(expenses.current),
            previous: formatMoney(expenses.previous),
        },

        interpretation:
            toNumber(expenses.changePercent) > 0
                ? "Expenses are higher than the previous comparison period."
                : toNumber(expenses.changePercent) < 0
                    ? "Expenses are lower than the previous comparison period."
                    : "Expenses are unchanged from the previous comparison period.",
    };
};

/**
 * Extract profit evidence
 */
const buildProfitEvidence = (businessContext) => {
    const profit = businessContext?.profit || {};

    const grossProfit = toNumber(profit.grossProfit);
    const netProfit = toNumber(profit.netProfit);

    return {
        grossProfit,
        netProfit,

        formatted: {
            grossProfit: formatMoney(grossProfit),
            netProfit: formatMoney(netProfit),
        },

        margin:
            toNumber(businessContext?.revenue?.current) > 0
                ? round(
                    (netProfit / toNumber(businessContext.revenue.current)) *
                    100
                )
                : 0,
    };
};

/**
 * Extract inventory evidence
 */
const buildInventoryEvidence = (businessContext) => {
    const inventory = businessContext?.inventory || {};

    return {
        totalProducts: toNumber(inventory.totalProducts),
        lowStockCount: toNumber(inventory.lowStockCount),
        outOfStockCount: toNumber(inventory.outOfStockCount),

        health:
            toNumber(inventory.outOfStockCount) > 0
                ? "OUT_OF_STOCK_ITEMS_PRESENT"
                : toNumber(inventory.lowStockCount) > 0
                    ? "LOW_STOCK_ITEMS_PRESENT"
                    : "INVENTORY_STABLE",
    };
};

/**
 * Extract product evidence
 */
const buildProductEvidence = (businessContext) => {
    const products = Array.isArray(businessContext?.productPerformance)
        ? businessContext.productPerformance
        : [];

    const topProducts = sortDescending(products, "revenue")
        .slice(0, 5)
        .map((product) => ({
            name:
                product.name ||
                product.productName ||
                "Unknown Product",

            revenue: toNumber(product.revenue),

            quantitySold:
                toNumber(product.quantitySold) ||
                toNumber(product.unitsSold) ||
                toNumber(product.quantity),

            salesCount: toNumber(product.salesCount),

            profit:
                product.profit !== undefined
                    ? toNumber(product.profit)
                    : null,
        }));

    const lowestRevenueProducts = sortAscending(products, "revenue")
        .slice(0, 5)
        .map((product) => ({
            name:
                product.name ||
                product.productName ||
                "Unknown Product",

            revenue: toNumber(product.revenue),

            quantitySold:
                toNumber(product.quantitySold) ||
                toNumber(product.unitsSold) ||
                toNumber(product.quantity),

            salesCount: toNumber(product.salesCount),

            profit:
                product.profit !== undefined
                    ? toNumber(product.profit)
                    : null,
        }));

    return {
        totalProducts: products.length,
        topProducts,
        lowestRevenueProducts,
    };
};

/**
 * Extract low-stock products
 */
const buildStockEvidence = (businessContext) => {
    const lowStockProducts = Array.isArray(
        businessContext?.lowStockProducts
    )
        ? businessContext.lowStockProducts
        : [];

    return lowStockProducts.slice(0, 10).map((product) => ({
        name:
            product.name ||
            product.productName ||
            "Unknown Product",

        stock:
            toNumber(product.stock) ||
            toNumber(product.quantity) ||
            toNumber(product.currentStock),

        minimumStock:
            toNumber(product.minimumStock) ||
            toNumber(product.minStock) ||
            null,
    }));
};

/**
 * Extract business signals
 */
const buildSignalEvidence = (businessContext) => {
    const signals = Array.isArray(businessContext?.signals)
        ? businessContext.signals
        : [];

    return signals.map((signal) => {
        if (typeof signal === "string") {
            return {
                message: signal,
            };
        }

        return {
            type: signal.type || signal.name || "BUSINESS_SIGNAL",
            severity: signal.severity || signal.priority || "MEDIUM",
            message:
                signal.message ||
                signal.description ||
                signal.reason ||
                "",
        };
    });
};

/**
 * Build comparison evidence
 */
const buildComparisonEvidence = (businessContext) => {
    const revenue = businessContext?.revenue || {};
    const expenses = businessContext?.expenses || {};
    const profit = businessContext?.profit || {};

    return {
        revenue: {
            current: toNumber(revenue.current),
            previous: toNumber(revenue.previous),
            changePercent: toNumber(revenue.changePercent),
        },

        expenses: {
            current: toNumber(expenses.current),
            previous: toNumber(expenses.previous),
            changePercent: toNumber(expenses.changePercent),
        },

        profit: {
            current: toNumber(profit.netProfit),
        },

        comparisonPeriod: {
            current: businessContext?.period?.current || "Current period",
            previous:
                businessContext?.period?.previous ||
                "Previous period",
        },
    };
};

/**
 * Build the focused evidence package.
 *
 * IMPORTANT:
 * This function does NOT call the LLM.
 *
 * Its job is to decide:
 * "What does VyparMind actually need to know
 *  for this particular question?"
 */
export const buildBusinessQueryContext = ({
    intent = {},
    businessContext = {},
}) => {
    const intentName =
        typeof intent === "string"
            ? intent
            : intent?.intent || "GENERAL_BUSINESS_QUERY";

    const entity =
        typeof intent === "object"
            ? intent?.entity || null
            : null;

    const questionType =
        typeof intent === "object"
            ? intent?.questionType || "QUERY"
            : "QUERY";

    const period =
        typeof intent === "object"
            ? intent?.period || "LAST_30_DAYS"
            : "LAST_30_DAYS";

    const evidence = {};

    /*
     * Revenue questions
     */
    if (
        intentName === "REVENUE_QUERY" ||
        intentName === "REVENUE_DIAGNOSIS"
    ) {
        evidence.revenue = buildRevenueEvidence(businessContext);
    }

    /*
     * Expense questions
     */
    if (
        intentName === "EXPENSE_QUERY" ||
        intentName === "EXPENSE_DIAGNOSIS"
    ) {
        evidence.expenses = buildExpenseEvidence(businessContext);
    }

    /*
     * Profit questions
     */
    if (
        intentName === "PROFIT_QUERY" ||
        intentName === "PROFIT_DIAGNOSIS"
    ) {
        evidence.profit = buildProfitEvidence(businessContext);
        evidence.revenue = buildRevenueEvidence(businessContext);
        evidence.expenses = buildExpenseEvidence(businessContext);
    }

    /*
     * Product questions
     */
    if (intentName === "PRODUCT_ANALYSIS") {
        evidence.products = buildProductEvidence(businessContext);
        evidence.inventory = buildInventoryEvidence(businessContext);
    }

    /*
     * Inventory questions
     */
    if (intentName === "INVENTORY_ANALYSIS") {
        evidence.inventory = buildInventoryEvidence(businessContext);
        evidence.lowStockProducts = buildStockEvidence(businessContext);
    }

    /*
     * Sales questions
     */
    if (intentName === "SALES_ANALYSIS") {
        evidence.revenue = buildRevenueEvidence(businessContext);
        evidence.products = buildProductEvidence(businessContext);

        evidence.salesCount = {
            current:
                toNumber(
                    businessContext?.salesCount?.current
                ),
            previous:
                toNumber(
                    businessContext?.salesCount?.previous
                ),
        };
    }

    /*
     * Business health
     */
    if (intentName === "BUSINESS_HEALTH") {
        evidence.revenue = buildRevenueEvidence(businessContext);
        evidence.expenses = buildExpenseEvidence(businessContext);
        evidence.profit = buildProfitEvidence(businessContext);
        evidence.inventory = buildInventoryEvidence(businessContext);
        evidence.signals = buildSignalEvidence(businessContext);
    }

    /*
     * Diagnosis questions need enough evidence
     * to explain WHY something happened.
     */
    if (
        questionType === "DIAGNOSIS" ||
        intentName.includes("DIAGNOSIS")
    ) {
        evidence.revenue =
            evidence.revenue ||
            buildRevenueEvidence(businessContext);

        evidence.expenses =
            evidence.expenses ||
            buildExpenseEvidence(businessContext);

        evidence.profit =
            evidence.profit ||
            buildProfitEvidence(businessContext);

        evidence.products =
            evidence.products ||
            buildProductEvidence(businessContext);

        evidence.inventory =
            evidence.inventory ||
            buildInventoryEvidence(businessContext);

        evidence.signals =
            evidence.signals ||
            buildSignalEvidence(businessContext);
    }

    /*
     * Recommendation / action questions
     */
    if (
        intentName === "RECOMMENDATION" ||
        intentName === "ACTION_PLAN" ||
        questionType === "ACTION" ||
        questionType === "RECOMMENDATION"
    ) {
        evidence.revenue =
            evidence.revenue ||
            buildRevenueEvidence(businessContext);

        evidence.expenses =
            evidence.expenses ||
            buildExpenseEvidence(businessContext);

        evidence.profit =
            evidence.profit ||
            buildProfitEvidence(businessContext);

        evidence.products =
            evidence.products ||
            buildProductEvidence(businessContext);

        evidence.inventory =
            evidence.inventory ||
            buildInventoryEvidence(businessContext);

        evidence.signals =
            evidence.signals ||
            buildSignalEvidence(businessContext);
    }

    /*
     * Risk questions
     */
    if (
        intentName === "RISK_ANALYSIS" ||
        questionType === "RISK"
    ) {
        evidence.revenue =
            evidence.revenue ||
            buildRevenueEvidence(businessContext);

        evidence.expenses =
            evidence.expenses ||
            buildExpenseEvidence(businessContext);

        evidence.inventory =
            evidence.inventory ||
            buildInventoryEvidence(businessContext);

        evidence.signals =
            evidence.signals ||
            buildSignalEvidence(businessContext);
    }

    /*
     * Comparison questions
     */
    if (
        intentName === "COMPARISON" ||
        questionType === "COMPARISON"
    ) {
        evidence.comparison =
            buildComparisonEvidence(businessContext);
    }

    /*
     * Simulation is not fully implemented yet.
     *
     * We still provide the baseline business state
     * so the future simulation engine can use it.
     */
    if (
        intentName === "SIMULATION" ||
        questionType === "SIMULATION"
    ) {
        evidence.baseline = {
            revenue: toNumber(
                businessContext?.revenue?.current
            ),

            expenses: toNumber(
                businessContext?.expenses?.current
            ),

            profit: toNumber(
                businessContext?.profit?.netProfit
            ),
        };

        evidence.simulationStatus =
            "SIMULATION_ENGINE_PENDING";
    }

    /*
     * General business question
     *
     * Give VyparMind a compact business snapshot,
     * not the entire database.
     */
    if (
        intentName === "GENERAL_BUSINESS_QUERY" ||
        Object.keys(evidence).length === 0
    ) {
        evidence.businessSnapshot = {
            revenue: buildRevenueEvidence(businessContext),
            expenses: buildExpenseEvidence(businessContext),
            profit: buildProfitEvidence(businessContext),
            inventory: buildInventoryEvidence(businessContext),
        };
    }

    return {
        intent: intentName,
        entity,
        questionType,
        period,

        business: {
            businessName:
                businessContext?.business?.name ||
                businessContext?.businessName ||
                "Business",

            businessType:
                businessContext?.business?.type ||
                businessContext?.businessType ||
                null,
        },

        periodContext: {
            current:
                businessContext?.period?.current ||
                "Current period",

            previous:
                businessContext?.period?.previous ||
                "Previous period",
        },

        evidence,

        signals: buildSignalEvidence(businessContext),

        generatedFrom: "VyparIntel Business Data",
    };
};

export default buildBusinessQueryContext;