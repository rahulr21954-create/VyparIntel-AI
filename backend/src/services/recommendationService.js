import Groq from "groq-sdk";

const MODEL =
    process.env.GROQ_MODEL || "openai/gpt-oss-120b";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// ============================================================
// HELPERS
// ============================================================

const money = (value, currency = "INR") => {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
};

const isRateLimitError = (error) => {
    const status =
        error?.status ||
        error?.response?.status;

    const message = String(
        error?.message || ""
    ).toLowerCase();

    return (
        status === 429 ||
        message.includes("rate limit") ||
        message.includes("rate_limit_exceeded") ||
        message.includes("tokens per day") ||
        message.includes("tpd")
    );
};

const priorityOrder = {
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
};

// ============================================================
// DETERMINISTIC RECOMMENDATIONS
// ============================================================

const createDeterministicRecommendations = (
    recommendationData
) => {
    const currency =
        recommendationData?.currency || "INR";

    const revenue =
        Number(
            recommendationData?.revenue?.current || 0
        );

    const previousRevenue =
        Number(
            recommendationData?.revenue?.previous || 0
        );

    const revenueChangePercent =
        recommendationData?.revenue?.changePercent;

    const expenses =
        Number(
            recommendationData?.expenses?.current || 0
        );

    const previousExpenses =
        Number(
            recommendationData?.expenses?.previous || 0
        );

    const expenseChangePercent =
        recommendationData?.expenses?.changePercent;

    const grossProfit =
        Number(
            recommendationData?.profit?.grossProfit || 0
        );

    const netProfit =
        Number(
            recommendationData?.profit?.netProfit || 0
        );

    const signals =
        Array.isArray(
            recommendationData?.signals
        )
            ? recommendationData.signals
            : [];

    const lowStockProducts =
        Array.isArray(
            recommendationData?.inventory?.lowStockProducts
        )
            ? recommendationData.inventory.lowStockProducts
            : [];

    const outOfStockProducts =
        Array.isArray(
            recommendationData?.inventory?.outOfStockProducts
        )
            ? recommendationData.inventory.outOfStockProducts
            : [];

    const recommendations = [];

    // ========================================================
    // NEGATIVE PROFIT
    // ========================================================

    if (netProfit < 0) {
        recommendations.push({
            priority: "HIGH",
            type: "PROFIT_IMPROVEMENT",
            title: "Reduce the current loss",
            reason:
                `Net profit is ${money(
                    netProfit,
                    currency
                )}. Gross profit is ${money(
                    grossProfit,
                    currency
                )}, while business expenses are ${money(
                    expenses,
                    currency
                )}.`,
            action:
                "Review the largest expense categories first and identify costs that can be reduced, delayed, or renegotiated.",
        });
    }

    // ========================================================
    // EXPENSE CONTROL
    // ========================================================

    if (expenses > grossProfit) {
        recommendations.push({
            priority: "HIGH",
            type: "EXPENSE_CONTROL",
            title: "Control expenses",
            reason:
                `Current expenses of ${money(
                    expenses,
                    currency
                )} are higher than gross profit of ${money(
                    grossProfit,
                    currency
                )}.`,
            action:
                "Break expenses into categories and review the largest recurring costs before adding new spending.",
        });
    }

    // ========================================================
    // REVENUE DECLINE
    // ========================================================

    if (
        revenueChangePercent !== null &&
        revenueChangePercent !== undefined &&
        Number(revenueChangePercent) <= -10
    ) {
        recommendations.push({
            priority: "HIGH",
            type: "REVENUE_DECLINE",
            title: "Investigate declining revenue",
            reason:
                `Revenue changed by ${Number(
                    revenueChangePercent
                ).toFixed(1)}% compared with the previous period.`,
            action:
                "Review which products contributed to the decline and compare their recent sales with the previous period.",
        });
    }

    // ========================================================
    // EXPENSE GROWTH
    // ========================================================

    if (
        expenseChangePercent !== null &&
        expenseChangePercent !== undefined &&
        Number(expenseChangePercent) >= 20
    ) {
        recommendations.push({
            priority: "HIGH",
            type: "RISING_EXPENSES",
            title: "Investigate rising expenses",
            reason:
                `Expenses changed by ${Number(
                    expenseChangePercent
                ).toFixed(1)}% compared with the previous period.`,
            action:
                "Identify the expense categories responsible for the increase and review whether each increase is necessary.",
        });
    }

    // ========================================================
    // LOW STOCK
    // ========================================================

    if (lowStockProducts.length > 0) {
        recommendations.push({
            priority: "MEDIUM",
            type: "LOW_STOCK",
            title: "Review low-stock products",
            reason:
                `${lowStockProducts.length} product(s) are at or below their minimum stock level.`,
            action:
                "Review recent sales and supplier lead time before deciding which low-stock products need replenishment.",
        });
    }

    // ========================================================
    // OUT OF STOCK
    // ========================================================

    if (outOfStockProducts.length > 0) {
        recommendations.push({
            priority: "HIGH",
            type: "OUT_OF_STOCK",
            title: "Review out-of-stock products",
            reason:
                `${outOfStockProducts.length} product(s) currently have zero stock.`,
            action:
                "Check recent demand for these products and prioritize replenishment where the sales evidence supports it.",
        });
    }

    // ========================================================
    // SIGNAL-BASED RECOMMENDATIONS
    // ========================================================

    for (const signal of signals) {
        const alreadyExists =
            recommendations.some(
                (item) =>
                    item.type === signal.type
            );

        if (!alreadyExists) {
            recommendations.push({
                priority:
                    signal.severity || "MEDIUM",

                type:
                    signal.type ||
                    "BUSINESS_SIGNAL",

                title:
                    signal.type
                        ?.replaceAll("_", " ")
                        ?.toLowerCase()
                        ?.replace(/\b\w/g, (c) =>
                            c.toUpperCase()
                        ) ||
                    "Business signal detected",

                reason:
                    signal.recommendation ||
                    "A business signal requires review.",

                action:
                    signal.recommendation ||
                    "Review the underlying business data before taking action.",
            });
        }
    }

    // ========================================================
    // DEFAULT
    // ========================================================

    if (recommendations.length === 0) {
        recommendations.push({
            priority: "LOW",
            type: "MONITOR",
            title: "Continue monitoring the business",
            reason:
                "No configured high-priority recommendation signal was detected.",
            action:
                "Continue recording sales, expenses, and inventory accurately so VyparMind can detect meaningful changes.",
        });
    }

    recommendations.sort(
        (a, b) =>
            (priorityOrder[a.priority] || 99) -
            (priorityOrder[b.priority] || 99)
    );

    // ========================================================
    // ACTION PLAN
    // ========================================================

    const highPriority =
        recommendations.filter(
            (item) =>
                item.priority === "HIGH"
        );

    const mediumPriority =
        recommendations.filter(
            (item) =>
                item.priority === "MEDIUM"
        );

    const actionPlan = {
        immediate:
            highPriority.length > 0
                ? highPriority
                      .slice(0, 2)
                      .map(
                          (item) =>
                              item.action
                      )
                : [
                      "Review the latest business performance data.",
                  ],

        today:
            highPriority.length > 0
                ? highPriority
                      .slice(0, 3)
                      .map(
                          (item) =>
                              `Review: ${item.title}`
                      )
                : [
                      "Review revenue, expenses, and product performance.",
                  ],

        thisWeek:
            mediumPriority.length > 0
                ? mediumPriority
                      .slice(0, 3)
                      .map(
                          (item) =>
                              item.action
                      )
                : [
                      "Review product margins and recurring expenses.",
                  ],

        monitor: [
            "Track revenue and expenses during the next business period.",
            "Check whether the identified issue is improving after the action is taken.",
        ],
    };

    // ========================================================
    // SUMMARY
    // ========================================================

    let summary =
        "VyparMind identified business areas that should be reviewed.";

    if (netProfit < 0) {
        summary =
            `The business currently has a net loss of ${money(
                Math.abs(netProfit),
                currency
            )}. The immediate focus should be understanding the expense and margin pressure.`;
    } else if (
        revenueChangePercent !== null &&
        revenueChangePercent !== undefined &&
        revenueChangePercent < 0
    ) {
        summary =
            "Revenue has declined compared with the previous period, so product-level sales performance should be reviewed.";
    } else if (recommendations.length > 0) {
        summary =
            `VyparMind identified ${recommendations.length} actionable business recommendation(s).`;
    }

    return {
        summary,

        recommendations,

        actionPlan,

        whatToDoFirst:
            recommendations[0]?.action ||
            "Review the latest business performance.",

        source: "BUSINESS_DATABASE",

        aiAvailable: false,

        rateLimited: false,

        generatedBy:
            "VyparIntel Deterministic Recommendation Engine",

        generatedAt: new Date(),
    };
};

// ============================================================
// AI ENHANCEMENT
// ============================================================

const generateAIRecommendations = async (
    recommendationData,
    deterministic
) => {
    if (!process.env.GROQ_API_KEY) {
        return null;
    }

    const prompt = `
You are VyparMind, the Business AI Brain of VyparIntel.

Your job is to turn verified business data into a practical,
evidence-based action plan.

BUSINESS DATA:
${JSON.stringify(
    recommendationData,
    null,
    2
)}

CURRENT DETERMINISTIC RECOMMENDATIONS:
${JSON.stringify(
    deterministic.recommendations,
    null,
    2
)}

Return ONLY valid JSON using exactly this structure:

{
  "summary": "short business diagnosis",
  "recommendations": [
    {
      "priority": "HIGH | MEDIUM | LOW",
      "type": "string",
      "title": "string",
      "reason": "string",
      "action": "string"
    }
  ],
  "actionPlan": {
    "immediate": [
      "specific action"
    ],
    "today": [
      "specific action"
    ],
    "thisWeek": [
      "specific action"
    ],
    "monitor": [
      "specific metric or condition to monitor"
    ]
  },
  "whatToDoFirst": "single most important first action"
}

IMPORTANT RULES:

1. Use ONLY supplied business data.
2. Never invent numbers.
3. Never invent products.
4. Never invent expenses.
5. Do not make guaranteed predictions.
6. Explain WHY an action is recommended.
7. Give concrete actions the business owner can actually perform.
8. Prioritize actions based on the supplied evidence.
9. Keep the action plan practical.
10. Do not return markdown.
11. Return valid JSON only.
`;

    const completion =
        await groq.chat.completions.create({
            model: MODEL,

            messages: [
                {
                    role: "system",
                    content:
                        "You are VyparMind, an evidence-based business AI assistant.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],

            temperature: 0.2,

            response_format: {
                type: "json_object",
            },

            max_tokens: 1200,
        });

    const content =
        completion?.choices?.[0]?.message?.content;

    if (!content) {
        return null;
    }

    const parsed =
        JSON.parse(content);

    if (
        !parsed ||
        !Array.isArray(
            parsed.recommendations
        ) ||
        !parsed.actionPlan
    ) {
        return null;
    }

    return {
        ...deterministic,

        summary:
            parsed.summary ||
            deterministic.summary,

        recommendations:
            parsed.recommendations,

        actionPlan: {
            immediate:
                Array.isArray(
                    parsed.actionPlan.immediate
                )
                    ? parsed.actionPlan.immediate
                    : deterministic.actionPlan.immediate,

            today:
                Array.isArray(
                    parsed.actionPlan.today
                )
                    ? parsed.actionPlan.today
                    : deterministic.actionPlan.today,

            thisWeek:
                Array.isArray(
                    parsed.actionPlan.thisWeek
                )
                    ? parsed.actionPlan.thisWeek
                    : deterministic.actionPlan.thisWeek,

            monitor:
                Array.isArray(
                    parsed.actionPlan.monitor
                )
                    ? parsed.actionPlan.monitor
                    : deterministic.actionPlan.monitor,
        },

        whatToDoFirst:
            parsed.whatToDoFirst ||
            deterministic.whatToDoFirst,

        source: "VYPARMIND_AI",

        aiAvailable: true,

        rateLimited: false,

        generatedBy:
            "VyparMind Recommendation Engine",

        generatedAt: new Date(),
    };
};

// ============================================================
// MAIN
// ============================================================

const generateRecommendationInsight = async (
    recommendationData
) => {
    const deterministic =
        createDeterministicRecommendations(
            recommendationData
        );

    try {
        const aiResult =
            await generateAIRecommendations(
                recommendationData,
                deterministic
            );

        if (aiResult) {
            return aiResult;
        }

        return deterministic;
    } catch (error) {
        console.error(
            "Recommendation Engine AI Error:",
            error?.message || error
        );

        return {
            ...deterministic,

            source: "BUSINESS_DATABASE",

            aiAvailable: false,

            rateLimited:
                isRateLimitError(error),

            generatedBy:
                "VyparIntel Deterministic Recommendation Engine",

            generatedAt: new Date(),
        };
    }
};

export default generateRecommendationInsight;