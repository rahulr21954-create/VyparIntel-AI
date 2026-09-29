import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const MODEL =
    process.env.GROQ_MODEL ||
    "openai/gpt-oss-120b";


// ========================================
// HELPERS
// ========================================

const formatMoney = (value, currency = "INR") => {
    const amount = Number(value || 0);

    if (currency === "INR") {
        return `₹${amount.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
        })}`;
    }

    return `${currency} ${amount.toLocaleString(
        "en-IN",
        {
            maximumFractionDigits: 2,
        }
    )}`;
};


const safeNumber = (value) => {
    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
};


const safePercent = (value) => {
    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {
        return null;
    }

    return Number(Number(value).toFixed(2));
};


const getFinancials = (businessData) => {
    return (
        businessData?.financials ||
        {}
    );
};


const getCurrency = (businessData) => {
    return (
        businessData?.business?.currency ||
        "INR"
    );
};


const getBusinessName = (businessData) => {
    return (
        businessData?.business?.name ||
        "Your Business"
    );
};


// ========================================
// BUILD STRUCTURED SNAPSHOT
// ========================================

const buildBusinessSnapshot = (
    businessData
) => {
    const financials =
        getFinancials(businessData);

    const revenue =
        financials.revenue || {};

    const expenses =
        financials.expenses || {};

    const grossProfit =
        financials.grossProfit || {};

    const profit =
        financials.profit || {};

    const sales =
        businessData?.sales || {};

    const inventory =
        businessData?.inventory || {};

    return {
        revenue: {
            current:
                safeNumber(revenue.current),

            previous:
                safeNumber(revenue.previous),

            changePercent:
                safePercent(
                    revenue.changePercent
                ),
        },

        expenses: {
            current:
                safeNumber(expenses.current),

            previous:
                safeNumber(expenses.previous),

            changePercent:
                safePercent(
                    expenses.changePercent
                ),
        },

        grossProfit: {
            current:
                safeNumber(grossProfit.current),

            previous:
                safeNumber(grossProfit.previous),

            changePercent:
                safePercent(
                    grossProfit.changePercent
                ),
        },

        netProfit: {
            current:
                safeNumber(profit.current),

            previous:
                safeNumber(profit.previous),

            changePercent:
                safePercent(
                    profit.changePercent
                ),

            status:
                profit.status ||
                "BREAK_EVEN",
        },

        sales: {
            current:
                safeNumber(
                    sales.currentPeriod
                ),

            previous:
                safeNumber(
                    sales.previousPeriod
                ),

            changePercent:
                safePercent(
                    sales.changePercent
                ),
        },

        inventory: {
            totalProducts:
                safeNumber(
                    inventory.totalProducts
                ),

            lowStockCount:
                safeNumber(
                    inventory.lowStockCount
                ),

            outOfStockCount:
                safeNumber(
                    inventory.outOfStockCount
                ),
        },
    };
};


// ========================================
// DETERMINISTIC SUMMARY
// ========================================

const buildSummary = (
    businessData
) => {
    const currency =
        getCurrency(businessData);

    const snapshot =
        buildBusinessSnapshot(
            businessData
        );

    const revenue =
        snapshot.revenue.current;

    const expenses =
        snapshot.expenses.current;

    const grossProfit =
        snapshot.grossProfit.current;

    const netProfit =
        snapshot.netProfit.current;

    const status =
        snapshot.netProfit.status;

    const sales =
        snapshot.sales.current;

    const products =
        snapshot.inventory.totalProducts;

    const lowStock =
        snapshot.inventory.lowStockCount;

    const outOfStock =
        snapshot.inventory.outOfStockCount;


    let summary =
        `${getBusinessName(
            businessData
        )} generated ${formatMoney(
            revenue,
            currency
        )} in revenue during the current period. `;

    summary +=
        `Gross profit is ${formatMoney(
            grossProfit,
            currency
        )}, while business expenses are ${formatMoney(
            expenses,
            currency
        )}. `;

    summary +=
        `Net profit is ${formatMoney(
            netProfit,
            currency
        )} and the current business status is ${status}. `;

    summary +=
        `${sales} sale(s) and ${products} product(s) are currently recorded.`;


    if (lowStock > 0) {
        summary +=
            ` ${lowStock} product(s) are at or below minimum stock.`;
    }

    if (outOfStock > 0) {
        summary +=
            ` ${outOfStock} product(s) are out of stock.`;
    }

    return summary;
};


// ========================================
// WHAT HAPPENED
// ========================================

const buildWhatHappened = (
    businessData
) => {
    const snapshot =
        buildBusinessSnapshot(
            businessData
        );

    const points = [];


    const revenueChange =
        snapshot.revenue.changePercent;

    const expenseChange =
        snapshot.expenses.changePercent;

    const profitChange =
        snapshot.netProfit.changePercent;

    const salesChange =
        snapshot.sales.changePercent;


    if (
        revenueChange !== null
    ) {
        if (revenueChange < 0) {
            points.push(
                `Revenue decreased by ${Math.abs(
                    revenueChange
                ).toFixed(2)}% compared with the previous period.`
            );
        } else if (
            revenueChange > 0
        ) {
            points.push(
                `Revenue increased by ${revenueChange.toFixed(
                    2
                )}% compared with the previous period.`
            );
        } else {
            points.push(
                "Revenue remained unchanged compared with the previous period."
            );
        }
    }


    if (
        expenseChange !== null
    ) {
        if (expenseChange > 0) {
            points.push(
                `Expenses increased by ${expenseChange.toFixed(
                    2
                )}% compared with the previous period.`
            );
        } else if (
            expenseChange < 0
        ) {
            points.push(
                `Expenses decreased by ${Math.abs(
                    expenseChange
                ).toFixed(2)}% compared with the previous period.`
            );
        }
    }


    if (
        profitChange !== null
    ) {
        if (profitChange < 0) {
            points.push(
                `Net profit decreased by ${Math.abs(
                    profitChange
                ).toFixed(2)}% compared with the previous period.`
            );
        } else if (
            profitChange > 0
        ) {
            points.push(
                `Net profit increased by ${profitChange.toFixed(
                    2
                )}% compared with the previous period.`
            );
        }
    }


    if (
        salesChange !== null
    ) {
        points.push(
            `Sales count changed by ${salesChange >= 0 ? "+" : ""}${salesChange.toFixed(
                2
            )}% compared with the previous period.`
        );
    }


    if (points.length === 0) {
        return "There is not enough previous-period data to determine major changes.";
    }


    return points.join("\n");
};


// ========================================
// WHAT NEEDS ATTENTION
// ========================================

const buildWhatNeedsAttention = (
    businessData
) => {
    const snapshot =
        buildBusinessSnapshot(
            businessData
        );

    const signals =
        businessData?.signals || [];

    const attention = [];


    if (
        snapshot.netProfit.current < 0
    ) {
        attention.push(
            `Net profit is negative at ${formatMoney(
                snapshot.netProfit.current,
                getCurrency(businessData)
            )}.`
        );
    }


    if (
        snapshot.expenses.changePercent !== null &&
        snapshot.expenses.changePercent > 0
    ) {
        attention.push(
            `Expenses have increased by ${snapshot.expenses.changePercent.toFixed(
                2
            )}% compared with the previous period.`
        );
    }


    if (
        snapshot.inventory.lowStockCount > 0
    ) {
        attention.push(
            `${snapshot.inventory.lowStockCount} product(s) are at or below minimum stock.`
        );
    }


    if (
        snapshot.inventory.outOfStockCount > 0
    ) {
        attention.push(
            `${snapshot.inventory.outOfStockCount} product(s) are currently out of stock.`
        );
    }


    signals
        .filter(
            (signal) =>
                signal?.severity === "HIGH"
        )
        .forEach((signal) => {
            if (signal?.message) {
                attention.push(
                    signal.message
                );
            }
        });


    if (attention.length === 0) {
        return "No major business signals currently require immediate attention.";
    }


    return attention
        .map(
            (item) => `• ${item}`
        )
        .join("\n");
};


// ========================================
// TODAY'S FOCUS
// ========================================

const buildTodayFocus = (
    businessData
) => {
    const snapshot =
        buildBusinessSnapshot(
            businessData
        );

    const focus = [];


    if (
        snapshot.netProfit.current < 0
    ) {
        focus.push(
            "Review expenses and gross profit drivers to understand the current loss."
        );
    }


    if (
        snapshot.expenses.changePercent !== null &&
        snapshot.expenses.changePercent > 0
    ) {
        focus.push(
            "Review expense categories that increased compared with the previous period."
        );
    }


    if (
        snapshot.inventory.lowStockCount > 0 ||
        snapshot.inventory.outOfStockCount > 0
    ) {
        focus.push(
            "Review low-stock and out-of-stock products before the next sales cycle."
        );
    }


    if (
        snapshot.revenue.changePercent !== null &&
        snapshot.revenue.changePercent < 0
    ) {
        focus.push(
            "Review recent sales and product performance to identify the source of the revenue decline."
        );
    }


    if (focus.length === 0) {
        focus.push(
            "Review current sales, expenses, profit and inventory trends before making business decisions."
        );
    }


    return focus
        .map(
            (item) => `• ${item}`
        )
        .join("\n");
};


// ========================================
// DATABASE FALLBACK
// ========================================

const generateFallbackBrief = (
    businessData,
    reason = "DATABASE_INTELLIGENCE"
) => {
    const snapshot =
        buildBusinessSnapshot(
            businessData
        );

    return {
        summary:
            buildSummary(
                businessData
            ),

        whatHappened:
            buildWhatHappened(
                businessData
            ),

        whatNeedsAttention:
            buildWhatNeedsAttention(
                businessData
            ),

        todayFocus:
            buildTodayFocus(
                businessData
            ),

        businessSnapshot:
            snapshot,

        source:
            "BUSINESS_DATABASE",

        aiAvailable:
            false,

        rateLimited:
            reason === "RATE_LIMIT",

        generatedBy:
            "VyparIntel Deterministic Intelligence",

        generatedAt:
            new Date(),
    };
};


// ========================================
// AI BRIEF
// ========================================

const generateAIBrief = async (
    businessData
) => {
    const snapshot =
        buildBusinessSnapshot(
            businessData
        );

    const prompt = `
You are VyparMind, the business intelligence AI
inside VyparIntel.

Analyze ONLY the supplied business data.

BUSINESS DATA:

${JSON.stringify(
    {
        business:
            businessData?.business || {},

        period:
            businessData?.period || {},

        snapshot,

        products:
            businessData?.products || {},

        expenses:
            businessData?.expenses || {},

        signals:
            businessData?.signals || [],
    },
    null,
    2
)}

Return ONLY valid JSON.

Required format:

{
  "summary": "short business summary",
  "whatHappened": "explain recent changes",
  "whatNeedsAttention": "explain important issues",
  "todayFocus": "practical areas to review"
}

Rules:

- Use only supplied data.
- Never invent numbers.
- Never invent products.
- Never invent reasons that are not supported by data.
- Do not guarantee future results.
- Keep language simple.
- Be practical for a small business owner.
- Separate facts from recommendations.
- Do not use markdown code fences.
`;


    const completion =
        await groq.chat.completions.create({
            model: MODEL,

            messages: [
                {
                    role: "system",
                    content:
                        "You are VyparIntel's evidence-based business intelligence assistant.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],

            temperature: 0.2,

            max_tokens: 600,

            response_format: {
                type: "json_object",
            },
        });


    const content =
        completion?.choices?.[0]?.message?.content;


    if (!content) {
        throw new Error(
            "Empty Morning Brief AI response."
        );
    }


    const parsed =
        JSON.parse(content);


    return {
        summary:
            parsed.summary ||
            "No summary generated.",

        whatHappened:
            parsed.whatHappened ||
            "No major changes were identified.",

        whatNeedsAttention:
            parsed.whatNeedsAttention ||
            "No major issues were identified.",

        todayFocus:
            parsed.todayFocus ||
            "Review your current business metrics before making decisions.",

        businessSnapshot:
            snapshot,

        source:
            "GROQ_AI",

        aiAvailable:
            true,

        rateLimited:
            false,

        generatedBy:
            "VyparIntel Morning Brief AI",

        generatedAt:
            new Date(),
    };
};


// ========================================
// MAIN SERVICE
// ========================================

const generateMorningBrief = async (
    businessData
) => {
    if (!businessData) {
        throw new Error(
            "Business data is required for Morning Brief."
        );
    }


    /*
     * Always build database intelligence first.
     * This guarantees Morning Brief can work
     * even when Groq is unavailable.
     */

    const databaseBrief =
        generateFallbackBrief(
            businessData
        );


    // ========================================
    // TRY AI
    // ========================================

    try {
        console.log(
            "🧠 Morning Brief → Attempting AI generation..."
        );

        const aiBrief =
            await generateAIBrief(
                businessData
            );

        console.log(
            "✅ Morning Brief AI generated successfully."
        );

        return aiBrief;

    } catch (error) {

        const message =
            error?.message || "";

        const status =
            error?.status ||
            error?.response?.status;


        const isRateLimit =
            status === 429 ||
            message.includes(
                "rate_limit_exceeded"
            ) ||
            message.includes(
                "Rate limit reached"
            );


        if (isRateLimit) {

            console.warn(
                "⚠️ Groq rate limit detected."
            );

            console.warn(
                "⚡ Morning Brief using database intelligence."
            );


            return generateFallbackBrief(
                businessData,
                "RATE_LIMIT"
            );
        }


        console.error(
            "Morning Brief AI Error:",
            message
        );


        return databaseBrief;
    }
};


// ========================================
// EXPORTS
// ========================================

export {
    generateMorningBrief,
    generateFallbackBrief,
    generateAIBrief,
    buildBusinessSnapshot,
};

export default generateMorningBrief;

