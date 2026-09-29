import Groq from "groq-sdk";

import {
    understandBusinessQuestion,
} from "./businessIntentService.js";

import {
    buildBusinessQueryContext,
} from "./businessQueryService.js";

import generateWhyInsight from "./whyEngineService.js";
import generateRiskInsight from "./riskEngineService.js";
import generateRecommendations from "./recommendationService.js";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const MODEL =
    process.env.GROQ_MODEL ||
    "openai/gpt-oss-120b";

/* =========================================================
   HELPERS
========================================================= */

const safeJsonParse = (text) => {
    if (!text) return null;

    let cleaned = String(text).trim();

    cleaned = cleaned
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch {
        const firstBrace = cleaned.indexOf("{");
        const lastBrace = cleaned.lastIndexOf("}");

        if (
            firstBrace !== -1 &&
            lastBrace !== -1 &&
            lastBrace > firstBrace
        ) {
            try {
                return JSON.parse(
                    cleaned.slice(
                        firstBrace,
                        lastBrace + 1
                    )
                );
            } catch {
                return null;
            }
        }

        return null;
    }
};

const asArray = (value) => {
    if (!value) return [];

    return Array.isArray(value)
        ? value
        : [value];
};

const money = (value, currency = "INR") => {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(amount);
};

const number = (value) =>
    Number(value ?? 0).toLocaleString("en-IN");

const getFinancials = (businessContext) =>
    businessContext?.financials || {};

const getCurrency = (businessContext) =>
    businessContext?.business?.currency || "INR";

/* =========================================================
   DETERMINISTIC BUSINESS ANSWERS
========================================================= */

const generateDeterministicBusinessAnswer = ({
    question,
    intent,
    businessContext,
}) => {
    const intentName =
        intent?.intent || "";

    const financials =
        getFinancials(businessContext);

    const currency =
        getCurrency(businessContext);

    const revenue =
        financials?.revenue?.current ?? 0;

    const previousRevenue =
        financials?.revenue?.previous ?? 0;

    const revenueChange =
        financials?.revenue?.changePercent ?? 0;

    const grossProfit =
        financials?.grossProfit?.current ?? 0;

    const previousGrossProfit =
        financials?.grossProfit?.previous ?? 0;

    const expenses =
        financials?.expenses?.current ?? 0;

    const previousExpenses =
        financials?.expenses?.previous ?? 0;

    const expenseChange =
        financials?.expenses?.changePercent ?? 0;

    const netProfit =
        financials?.profit?.current ?? 0;

    const previousNetProfit =
        financials?.profit?.previous ?? 0;

    const profitChange =
        financials?.profit?.changePercent ?? 0;

    const profitStatus =
        financials?.profit?.status ||
        "BREAK_EVEN";

    const sales =
        businessContext?.sales?.currentPeriod ?? 0;

    const previousSales =
        businessContext?.sales?.previousPeriod ?? 0;

    const totalProducts =
        businessContext?.inventory?.totalProducts ??
        businessContext?.products?.total ??
        0;

    const lowStockCount =
        businessContext?.inventory?.lowStockCount ?? 0;

    const outOfStockCount =
        businessContext?.inventory?.outOfStockCount ?? 0;

    /* =====================================================
       REVENUE QUERY
    ===================================================== */

    if (intentName === "REVENUE_QUERY") {
        return {
            answer:
                `Your revenue for the current period is ${money(
                    revenue,
                    currency
                )}.`,

            summary:
                `Current revenue is ${money(
                    revenue,
                    currency
                )}.`,

            whatHappened: [
                {
                    title: "Current Revenue",
                    description:
                        `Your business generated ${money(
                            revenue,
                            currency
                        )} in revenue during the current period.`,
                    evidence:
                        `Revenue: ${money(
                            revenue,
                            currency
                        )}`,
                },
            ],

            whyItHappened: [],

            whatToDoNext: [],

            importantSignals: [
                {
                    signal:
                        "Revenue comparison",
                    evidence:
                        `Previous period: ${money(
                            previousRevenue,
                            currency
                        )}. Change: ${revenueChange}%.`,
                    priority:
                        revenueChange < 0
                            ? "HIGH"
                            : "MEDIUM",
                },
            ],

            followUpQuestions: [
                "Why did my revenue change?"
            ],
        };
    }

    /* =====================================================
       EXPENSE QUERY
    ===================================================== */

    if (intentName === "EXPENSE_QUERY") {
        return {
            answer:
                `Your business expenses for the current period are ${money(
                    expenses,
                    currency
                )}.`,

            summary:
                `Current expenses are ${money(
                    expenses,
                    currency
                )}.`,

            whatHappened: [
                {
                    title: "Current Expenses",
                    description:
                        `Your business recorded ${money(
                            expenses,
                            currency
                        )} in expenses during the current period.`,
                    evidence:
                        `Expenses: ${money(
                            expenses,
                            currency
                        )}`,
                },
            ],

            whyItHappened: [],

            whatToDoNext: [],

            importantSignals: [
                {
                    signal:
                        "Expense comparison",
                    evidence:
                        `Previous period: ${money(
                            previousExpenses,
                            currency
                        )}. Change: ${expenseChange}%.`,
                    priority:
                        expenseChange > 0
                            ? "HIGH"
                            : "MEDIUM",
                },
            ],

            followUpQuestions: [
                "Why are my expenses increasing?"
            ],
        };
    }

    /* =====================================================
       PROFIT QUERY
    ===================================================== */

    if (intentName === "PROFIT_QUERY") {
        const statusText =
            profitStatus === "PROFIT"
                ? "profit"
                : profitStatus === "LOSS"
                    ? "loss"
                    : "break-even";

        return {
            answer:
                `Your current net ${statusText} is ${money(
                    Math.abs(netProfit),
                    currency
                )}.`,

            summary:
                `Net result: ${money(
                    netProfit,
                    currency
                )} (${profitStatus}).`,

            whatHappened: [
                {
                    title: "Net Profit",
                    description:
                        `Your current net result is ${money(
                            netProfit,
                            currency
                        )}.`,
                    evidence:
                        `Revenue: ${money(
                            revenue,
                            currency
                        )}; Gross Profit: ${money(
                            grossProfit,
                            currency
                        )}; Expenses: ${money(
                            expenses,
                            currency
                        )}; Net Profit: ${money(
                            netProfit,
                            currency
                        )}.`,
                },
            ],

            whyItHappened: [],

            whatToDoNext: [],

            importantSignals: [
                {
                    signal:
                        "Business profit status",
                    evidence:
                        `Current status: ${profitStatus}. Previous net result: ${money(
                            previousNetProfit,
                            currency
                        )}. Change: ${profitChange}%.`,
                    priority:
                        netProfit < 0
                            ? "HIGH"
                            : "MEDIUM",
                },
            ],

            followUpQuestions: [
                "Why did my profit decrease?",
                "What should I do to improve my profit?"
            ],
        };
    }

    /* =====================================================
       SALES ANALYSIS
    ===================================================== */

    if (intentName === "SALES_ANALYSIS") {
        const salesChange =
            previousSales === 0
                ? null
                : Number(
                    (
                        ((sales - previousSales) /
                            previousSales) *
                        100
                    ).toFixed(2)
                );

        return {
            answer:
                `You have ${number(
                    sales
                )} sales in the current period.`,

            summary:
                `Current-period sales count is ${number(
                    sales
                )}.`,

            whatHappened: [
                {
                    title: "Sales Activity",
                    description:
                        `Your business recorded ${number(
                            sales
                        )} sales during the current period.`,
                    evidence:
                        `Current sales: ${number(
                            sales
                        )}; Previous sales: ${number(
                            previousSales
                        )}.`,
                },
            ],

            whyItHappened: [],

            whatToDoNext: [],

            importantSignals: [
                {
                    signal:
                        "Sales comparison",
                    evidence:
                        salesChange === null
                            ? "A percentage comparison is unavailable because the previous period has zero sales."
                            : `Sales changed by ${salesChange}% compared with the previous period.`,
                    priority:
                        salesChange !== null &&
                        salesChange < 0
                            ? "HIGH"
                            : "MEDIUM",
                },
            ],

            followUpQuestions: [
                "Why did my sales change?"
            ],
        };
    }

    /* =====================================================
       INVENTORY ANALYSIS
    ===================================================== */

    if (intentName === "INVENTORY_ANALYSIS") {
        return {
            answer:
                `You currently have ${number(
                    totalProducts
                )} products, with ${number(
                    lowStockCount
                )} low-stock products and ${number(
                    outOfStockCount
                )} out-of-stock products.`,

            summary:
                `${number(
                    totalProducts
                )} products are tracked in your inventory.`,

            whatHappened: [
                {
                    title: "Inventory Status",
                    description:
                        `Your inventory contains ${number(
                            totalProducts
                        )} products.`,
                    evidence:
                        `Low stock: ${number(
                            lowStockCount
                        )}; Out of stock: ${number(
                            outOfStockCount
                        )}.`,
                },
            ],

            whyItHappened: [],

            whatToDoNext: [],

            importantSignals: [
                {
                    signal:
                        "Low-stock inventory",
                    evidence:
                        `${number(
                            lowStockCount
                        )} products are currently low on stock.`,
                    priority:
                        lowStockCount > 0
                            ? "HIGH"
                            : "LOW",
                },
            ],

            followUpQuestions: [
                "Which products need restocking?"
            ],
        };
    }

    /* =====================================================
       BUSINESS HEALTH
    ===================================================== */

    if (intentName === "BUSINESS_HEALTH") {
        const status =
            profitStatus;

        const statusDescription =
            status === "LOSS"
                ? `The business is currently showing a net loss of ${money(
                    Math.abs(netProfit),
                    currency
                )}.`
                : status === "PROFIT"
                    ? `The business is currently showing a net profit of ${money(
                        netProfit,
                        currency
                    )}.`
                    : "The business is currently at break-even.";

        return {
            answer:
                `${statusDescription} Current revenue is ${money(
                    revenue,
                    currency
                )}, gross profit is ${money(
                    grossProfit,
                    currency
                )}, and expenses are ${money(
                    expenses,
                    currency
                )}.`,

            summary:
                `Business status: ${status}.`,

            whatHappened: [
                {
                    title:
                        "Current Business Status",
                    description:
                        statusDescription,
                    evidence:
                        `Revenue: ${money(
                            revenue,
                            currency
                        )}; Gross Profit: ${money(
                            grossProfit,
                            currency
                        )}; Expenses: ${money(
                            expenses,
                            currency
                        )}; Net Profit: ${money(
                            netProfit,
                            currency
                        )}.`,
                },
            ],

            whyItHappened: [],

            whatToDoNext: [],

            importantSignals: [
                {
                    signal:
                        "Profit status",
                    evidence:
                        `Current status: ${status}.`,
                    priority:
                        status === "LOSS"
                            ? "HIGH"
                            : "MEDIUM",
                },
            ],

            followUpQuestions: [
                "Why is my business in this position?"
            ],
        };
    }

    return null;
};

/* =========================================================
   DETERMINISTIC DIAGNOSIS FALLBACK
========================================================= */

const generateDeterministicDiagnosisFallback = ({
    question,
    intent,
    businessContext,
}) => {
    const financials =
        getFinancials(businessContext);

    const currency =
        getCurrency(businessContext);

    const revenue =
        financials?.revenue?.current ?? 0;

    const previousRevenue =
        financials?.revenue?.previous ?? 0;

    const revenueChange =
        financials?.revenue?.changePercent ?? 0;

    const grossProfit =
        financials?.grossProfit?.current ?? 0;

    const previousGrossProfit =
        financials?.grossProfit?.previous ?? 0;

    const grossProfitChange =
        financials?.grossProfit?.changePercent ?? 0;

    const expenses =
        financials?.expenses?.current ?? 0;

    const previousExpenses =
        financials?.expenses?.previous ?? 0;

    const expenseChange =
        financials?.expenses?.changePercent ?? 0;

    const netProfit =
        financials?.profit?.current ?? 0;

    const previousNetProfit =
        financials?.profit?.previous ?? 0;

    const profitChange =
        financials?.profit?.changePercent ?? 0;

    const status =
        financials?.profit?.status ||
        "BREAK_EVEN";

    const expenseDifference =
        expenses - grossProfit;

    const whatHappened = [];

    if (status === "LOSS") {
        whatHappened.push({
            title: "Current Loss Position",
            description:
                `The business currently has a net loss of ${money(
                    Math.abs(netProfit),
                    currency
                )}.`,
            evidence:
                `Net Profit: ${money(
                    netProfit,
                    currency
                )}.`,
        });
    } else {
        whatHappened.push({
            title: "Current Profit Position",
            description:
                `The business currently has a net result of ${money(
                    netProfit,
                    currency
                )}.`,
            evidence:
                `Net Profit: ${money(
                    netProfit,
                    currency
                )}.`,
        });
    }

    if (revenueChange < 0) {
        whatHappened.push({
            title: "Revenue Decline",
            description:
                "Revenue is lower than the previous period.",
            evidence:
                `Current: ${money(
                    revenue,
                    currency
                )}; Previous: ${money(
                    previousRevenue,
                    currency
                )}; Change: ${revenueChange}%.`,
        });
    }

    if (grossProfitChange < 0) {
        whatHappened.push({
            title: "Gross Profit Decline",
            description:
                "Gross profit is lower than the previous period.",
            evidence:
                `Current: ${money(
                    grossProfit,
                    currency
                )}; Previous: ${money(
                    previousGrossProfit,
                    currency
                )}; Change: ${grossProfitChange}%.`,
        });
    }

    if (expenseChange > 0) {
        whatHappened.push({
            title: "Expense Increase",
            description:
                "Business expenses are higher than the previous period.",
            evidence:
                `Current: ${money(
                    expenses,
                    currency
                )}; Previous: ${money(
                    previousExpenses,
                    currency
                )}; Change: ${expenseChange}%.`,
        });
    }

    const whyItHappened = [];

    if (
        status === "LOSS" &&
        expenses > grossProfit
    ) {
        whyItHappened.push({
            reason:
                "Business expenses are greater than gross profit.",
            evidence:
                `Gross Profit: ${money(
                    grossProfit,
                    currency
                )}; Expenses: ${money(
                    expenses,
                    currency
                )}; Difference: ${money(
                    expenseDifference,
                    currency
                )}.`,
            confidence: "HIGH",
        });
    }

    if (revenueChange < 0) {
        whyItHappened.push({
            reason:
                "Revenue is lower than the previous period.",
            evidence:
                `Revenue changed by ${revenueChange}% compared with the previous period.`,
            confidence: "HIGH",
        });
    }

    if (expenseChange > 0) {
        whyItHappened.push({
            reason:
                "Expenses increased compared with the previous period.",
            evidence:
                `Expenses changed by ${expenseChange}% compared with the previous period.`,
            confidence: "HIGH",
        });
    }

    if (whyItHappened.length === 0) {
        whyItHappened.push({
            reason:
                "The available evidence is insufficient to determine the cause confidently.",
            evidence:
                "The available business context does not establish a specific cause.",
            confidence: "LOW",
        });
    }

    const whatToDoNext = [
        {
            action:
                "Review the expense breakdown.",
            reason:
                "Expenses are an important component of the current net result.",
            priority:
                expenseChange > 0 ||
                expenses > grossProfit
                    ? "HIGH"
                    : "MEDIUM",
        },
        {
            action:
                "Review revenue and product-level sales performance.",
            reason:
                "This can help identify whether weaker sales are contributing to the change.",
            priority:
                revenueChange < 0
                    ? "HIGH"
                    : "MEDIUM",
        },
    ];

    return {
        answer:
            `Your current net profit is ${money(
                netProfit,
                currency
            )}. ` +
            `Gross profit is ${money(
                grossProfit,
                currency
            )}, while business expenses are ${money(
                expenses,
                currency
            )}. ` +
            (
                expenses > grossProfit
                    ? `Expenses are greater than gross profit, which is the main evidence behind the current loss position.`
                    : `The available evidence does not establish one specific cause for the change in profit.`
            ),

        summary:
            `Current net result: ${money(
                netProfit,
                currency
            )} (${status}).`,

        whatHappened,

        whyItHappened,

        whatToDoNext,

        importantSignals: [
            {
                signal:
                    "Current net result",
                evidence:
                    `Net Profit: ${money(
                        netProfit,
                        currency
                    )}. Previous: ${money(
                        previousNetProfit,
                        currency
                    )}. Change: ${profitChange}%.`,
                priority:
                    netProfit < 0
                        ? "HIGH"
                        : "MEDIUM",
            },
            {
                signal:
                    "Revenue",
                evidence:
                    `Current revenue: ${money(
                        revenue,
                        currency
                    )}. Change: ${revenueChange}%.`,
                priority:
                    revenueChange < 0
                        ? "HIGH"
                        : "MEDIUM",
            },
            {
                signal:
                    "Expenses",
                evidence:
                    `Current expenses: ${money(
                        expenses,
                        currency
                    )}. Change: ${expenseChange}%.`,
                priority:
                    expenseChange > 0
                        ? "HIGH"
                        : "MEDIUM",
            },
        ],

        followUpQuestions: [
            "Which expense category increased the most?",
            "Which products are contributing the most profit?",
            "What should I do to improve my profit?"
        ],

        fallback: true,
    };
};

/* =========================================================
   RUN WHY ENGINE
========================================================= */

const runWhyEngine = async ({
    businessContext,
}) => {
    try {
        console.log(
            "🧠 VyparMind → Why Engine"
        );

        const result =
            await generateWhyInsight(
                businessContext
            );

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        console.error(
            "Why Engine Tool Error:",
            error.message
        );

        return {
            success: false,
            error:
                error?.message ||
                "Why Engine failed.",
        };
    }
};

/* =========================================================
   RUN RISK ENGINE
========================================================= */

const runRiskEngine = async ({
    businessContext,
}) => {
    try {
        console.log(
            "⚠️ VyparMind → Risk Engine"
        );

        const result =
            await generateRiskInsight(
                businessContext
            );

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        console.error(
            "Risk Engine Tool Error:",
            error.message
        );

        return {
            success: false,
            error:
                error?.message ||
                "Risk Engine failed.",
        };
    }
};

/* =========================================================
   RUN RECOMMENDATION ENGINE
========================================================= */

const runRecommendationEngine =
    async ({
        businessContext,
    }) => {
        try {
            console.log(
                "💡 VyparMind → Recommendation Engine"
            );

            const result =
                await generateRecommendations(
                    businessContext
                );

            return {
                success: true,
                data: result,
            };
        } catch (error) {
            console.error(
                "Recommendation Engine Tool Error:",
                error.message
            );

            return {
                success: false,
                error:
                    error?.message ||
                    "Recommendation Engine failed.",
            };
        }
    };

/* =========================================================
   TOOL ORCHESTRATOR
========================================================= */

const runBusinessTools = async ({
    intent,
    businessContext,
}) => {
    const tools =
        intent?.requiredTools || [];

    const intentName =
        intent?.intent || "";

    /*
     * IMPORTANT:
     *
     * PROFIT_DIAGNOSIS only needs Why Engine.
     *
     * Risk and Recommendation should NOT automatically
     * run here because they consume additional Groq quota.
     */

    const needsWhy =
        tools.includes("WHY_ENGINE") ||
        [
            "REVENUE_DIAGNOSIS",
            "EXPENSE_DIAGNOSIS",
            "PROFIT_DIAGNOSIS",
        ].includes(intentName);

    const needsRisk =
        tools.includes("RISK_ENGINE") ||
        [
            "BUSINESS_HEALTH",
            "RISK_ANALYSIS",
        ].includes(intentName);

    const needsRecommendation =
        tools.includes(
            "RECOMMENDATION_ENGINE"
        ) ||
        [
            "RECOMMENDATION",
            "ACTION_PLAN",
        ].includes(intentName);

    const results = {
        why: null,
        risk: null,
        recommendation: null,
    };

    const promises = [];

    if (needsWhy) {
        promises.push(
            runWhyEngine({
                businessContext,
            }).then((result) => {
                results.why = result;
            })
        );
    }

    if (needsRisk) {
        promises.push(
            runRiskEngine({
                businessContext,
            }).then((result) => {
                results.risk = result;
            })
        );
    }

    if (needsRecommendation) {
        promises.push(
            runRecommendationEngine({
                businessContext,
            }).then((result) => {
                results.recommendation =
                    result;
            })
        );
    }

    await Promise.all(promises);

    return results;
};

/* =========================================================
   FINAL AI ANSWER
========================================================= */

const generateFinalAnswer = async ({
    question,
    intent,
    businessContext,
    queryContext,
    toolResults,
}) => {
    const prompt = `
You are VyparMind, the AI Business Brain of VyparIntel.

Answer the business owner using ONLY the supplied business data.

USER QUESTION:
${question}

BUSINESS CONTEXT:
${JSON.stringify(
    businessContext,
    null,
    2
)}

FOCUSED BUSINESS EVIDENCE:
${JSON.stringify(
    queryContext,
    null,
    2
)}

WHY ENGINE:
${JSON.stringify(
    toolResults?.why,
    null,
    2
)}

RISK ENGINE:
${JSON.stringify(
    toolResults?.risk,
    null,
    2
)}

RECOMMENDATION ENGINE:
${JSON.stringify(
    toolResults?.recommendation,
    null,
    2
)}

QUESTION INTENT:
${JSON.stringify(
    intent,
    null,
    2
)}

RULES:

- Use only supplied business data.
- Never invent numbers.
- Never invent products, expenses, sales, customers or market facts.
- Preserve supplied numbers.
- Clearly distinguish facts from possible explanations.
- If evidence does not establish a cause, say so.
- Recommendations are suggestions, not guaranteed outcomes.
- Return ONLY valid JSON.

OUTPUT:

{
    "answer": "Direct answer",
    "summary": "Short summary",
    "whatHappened": [],
    "whyItHappened": [],
    "whatToDoNext": [],
    "importantSignals": [],
    "followUpQuestions": []
}
`;

    try {
        const completion =
            await groq.chat.completions.create({
                model: MODEL,

                temperature: 0.1,

                max_tokens: 700,

                messages: [
                    {
                        role: "system",
                        content:
                            "You are VyparMind, an evidence-first business intelligence assistant.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],

                response_format: {
                    type: "json_object",
                },
            });

        const content =
            completion
                ?.choices?.[0]
                ?.message?.content;

        const parsed =
            safeJsonParse(content);

        if (!parsed) {
            return {
                answer:
                    content ||
                    "I could not generate a structured business answer.",
                summary: "",
                whatHappened: [],
                whyItHappened: [],
                whatToDoNext: [],
                importantSignals: [],
                followUpQuestions: [],
            };
        }

        return {
            answer:
                parsed.answer || "",

            summary:
                parsed.summary || "",

            whatHappened:
                asArray(
                    parsed.whatHappened
                ),

            whyItHappened:
                asArray(
                    parsed.whyItHappened
                ),

            whatToDoNext:
                asArray(
                    parsed.whatToDoNext
                ),

            importantSignals:
                asArray(
                    parsed.importantSignals
                ),

            followUpQuestions:
                asArray(
                    parsed.followUpQuestions
                ),
        };
    } catch (error) {
        const status =
            error?.status ||
            error?.response?.status;

        const message =
            error?.message || "";

        const errorCode =
            error?.error?.error?.code ||
            error?.response?.data?.error?.code;

        const isRateLimit =
            status === 429 ||
            errorCode ===
                "rate_limit_exceeded" ||
            message.includes(
                "rate_limit_exceeded"
            ) ||
            message.includes(
                "Rate limit reached"
            );

        if (isRateLimit) {
            console.warn(
                "⚠️ Groq unavailable during final answer. Using deterministic fallback."
            );

            return generateDeterministicDiagnosisFallback({
                question,
                intent,
                businessContext,
            });
        }

        console.error(
            "VyparMind Final Answer Error:",
            error.message
        );

        return generateDeterministicDiagnosisFallback({
            question,
            intent,
            businessContext,
        });
    }
};

/* =========================================================
   MAIN BUSINESS COPILOT
========================================================= */

export const generateBusinessCopilotResponse =
    async ({
        question,
        businessContext,
    }) => {
        if (
            !question ||
            !String(question).trim()
        ) {
            throw new Error(
                "Business question is required."
            );
        }

        /* -----------------------------------------------
           STEP 1
           Understand question
        ------------------------------------------------ */

        const intent =
            understandBusinessQuestion(
                question
            );

        console.log(
            "\n================================"
        );

        console.log(
            "🤖 VYPARMIND QUESTION:",
            question
        );

        console.log(
            "🎯 INTENT:",
            intent?.intent
        );

        console.log(
            "🧩 ENTITY:",
            intent?.entity
        );

        console.log(
            "📅 PERIOD:",
            intent?.period
        );

        console.log(
            "🛠️ TOOLS:",
            intent?.requiredTools
        );

        /* -----------------------------------------------
           STEP 2
           Build focused evidence
        ------------------------------------------------ */

        const queryContext =
            buildBusinessQueryContext({
                intent,
                businessContext,
            });

        /* -----------------------------------------------
           STEP 3
           DETERMINISTIC FACTUAL ANSWERS
        ------------------------------------------------ */

        const deterministicAnswer =
            generateDeterministicBusinessAnswer({
                question,
                intent,
                businessContext,
            });

        if (deterministicAnswer) {
            console.log(
                "⚡ VyparMind → Deterministic Business Answer"
            );

            return {
                question,

                intent: {
                    name:
                        intent?.intent ||
                        "GENERAL_BUSINESS_QUERY",

                    entity:
                        intent?.entity ||
                        null,

                    period:
                        intent?.period ||
                        null,

                    questionType:
                        intent?.questionType ||
                        "QUERY",

                    requiredTools:
                        intent?.requiredTools ||
                        [],
                },

                ...deterministicAnswer,

                evidence:
                    queryContext,

                specialistEngines: {
                    why: null,
                    risk: null,
                    recommendation: null,
                },

                source:
                    "BUSINESS_DATABASE",

                generatedBy:
                    "VyparMind Business Facts",

                generatedAt:
                    new Date(),
            };
        }

        /* -----------------------------------------------
           STEP 4
           RUN SPECIALIST ENGINES
        ------------------------------------------------ */

        const toolResults =
            await runBusinessTools({
                intent,
                businessContext,
            });

        /* -----------------------------------------------
           STEP 5
           FINAL AI REASONING
        ------------------------------------------------ */

        const finalAnswer =
            await generateFinalAnswer({
                question,
                intent,
                businessContext,
                queryContext,
                toolResults,
            });

        console.log(
            "🧠 SPECIALIST RESULTS:"
        );

        console.log(
            "Why:",
            toolResults?.why?.success
        );

        console.log(
            "Risk:",
            toolResults?.risk?.success
        );

        console.log(
            "Recommendation:",
            toolResults
                ?.recommendation
                ?.success
        );

        console.log(
            "✅ VYPARMIND ANSWER GENERATED"
        );

        console.log(
            "================================\n"
        );

        return {
            question,

            intent: {
                name:
                    intent?.intent ||
                    "GENERAL_BUSINESS_QUERY",

                entity:
                    intent?.entity ||
                    null,

                period:
                    intent?.period ||
                    null,

                questionType:
                    intent?.questionType ||
                    "QUERY",

                requiredTools:
                    intent?.requiredTools ||
                    [],
            },

            answer:
                finalAnswer.answer,

            summary:
                finalAnswer.summary,

            whatHappened:
                finalAnswer.whatHappened,

            whyItHappened:
                finalAnswer.whyItHappened,

            whatToDoNext:
                finalAnswer.whatToDoNext,

            importantSignals:
                finalAnswer.importantSignals,

            followUpQuestions:
                finalAnswer.followUpQuestions,

            evidence:
                queryContext,

            specialistEngines: {
                why:
                    toolResults?.why ||
                    null,

                risk:
                    toolResults?.risk ||
                    null,

                recommendation:
                    toolResults?.recommendation ||
                    null,
            },

            source:
                "VYPARMIND_AI",

            generatedAt:
                new Date(),
        };
    };

export default
    generateBusinessCopilotResponse;

