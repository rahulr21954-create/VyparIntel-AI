import Groq from "groq-sdk";

import withGroqRetry from "../utils/groqRetry.js";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const MODEL =
    process.env.GROQ_MODEL ||
    "openai/gpt-oss-120b";

/* =========================================================
   HELPERS
========================================================= */

const toNumber = (value) => {
    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
};

const calculateChangePercent = (
    current,
    previous
) => {
    const currentValue =
        toNumber(current);

    const previousValue =
        toNumber(previous);

    if (previousValue === 0) {
        if (currentValue === 0) {
            return 0;
        }

        return null;
    }

    return Number(
        (
            (
                (currentValue - previousValue) /
                Math.abs(previousValue)
            ) * 100
        ).toFixed(2)
    );
};

const normalizeRecommendations = (
    recommendations
) => {
    if (!Array.isArray(recommendations)) {
        return [];
    }

    return recommendations
        .map((item) => ({
            issue:
                item?.issue ||
                item?.problem ||
                "Business issue identified",

            evidence:
                item?.evidence ||
                "Evidence available in supplied business data.",

            recommendedAction:
                item?.recommendedAction ||
                item?.action ||
                item?.recommendation ||
                "Review the relevant business metric.",

            reason:
                item?.reason ||
                "This recommendation is based on available business evidence.",

            priority:
                [
                    "HIGH",
                    "MEDIUM",
                    "LOW",
                ].includes(
                    String(
                        item?.priority || ""
                    ).toUpperCase()
                )
                    ? String(
                        item.priority
                    ).toUpperCase()
                    : "MEDIUM",
        }))
        .filter(
            (item) =>
                item.issue &&
                item.recommendedAction
        );
};

const parseAIResponse = (
    content
) => {
    if (!content) {
        return [];
    }

    let cleaned =
        String(content).trim();

    cleaned = cleaned
        .replace(
            /^```json\s*/i,
            ""
        )
        .replace(
            /^```\s*/i,
            ""
        )
        .replace(
            /\s*```$/i,
            ""
        )
        .trim();

    try {
        const parsed =
            JSON.parse(cleaned);

        if (Array.isArray(parsed)) {
            return parsed;
        }

        if (
            Array.isArray(
                parsed.recommendations
            )
        ) {
            return parsed.recommendations;
        }

        return [];
    } catch {
        return [
            {
                issue:
                    "Business analysis",

                evidence:
                    "The recommendation engine returned a text analysis.",

                recommendedAction:
                    cleaned,

                reason:
                    "The recommendation was generated from the supplied business evidence.",

                priority:
                    "MEDIUM",
            },
        ];
    }
};

/* =========================================================
   BUILD CONTEXT
========================================================= */

const buildRecommendationContext = (
    recommendationData = {}
) => {
    const revenue =
        recommendationData?.revenue || {};

    const expenses =
        recommendationData?.expenses || {};

    const profit =
        recommendationData?.profit || {};

    const inventory =
        recommendationData?.inventory || {};

    const signals =
        Array.isArray(
            recommendationData?.signals
        )
            ? recommendationData.signals
            : [];

    const products =
        Array.isArray(
            recommendationData?.products
        )
            ? recommendationData.products
            : [];

    return {
        period:
            recommendationData?.period ||
            null,

        revenue: {
            current:
                toNumber(
                    revenue.current
                ),

            previous:
                toNumber(
                    revenue.previous
                ),

            changePercent:
                revenue.changePercent ??
                calculateChangePercent(
                    revenue.current,
                    revenue.previous
                ),
        },

        expenses: {
            current:
                toNumber(
                    expenses.current
                ),

            previous:
                toNumber(
                    expenses.previous
                ),

            changePercent:
                expenses.changePercent ??
                calculateChangePercent(
                    expenses.current,
                    expenses.previous
                ),
        },

        profit: {
            grossProfit:
                profit.grossProfit !==
                undefined
                    ? toNumber(
                        profit.grossProfit
                    )
                    : null,

            netProfit:
                profit.netProfit !==
                undefined
                    ? toNumber(
                        profit.netProfit
                    )
                    : null,
        },

        inventory: {
            totalProducts:
                toNumber(
                    inventory.totalProducts
                ),

            lowStockCount:
                toNumber(
                    inventory.lowStockCount
                ),

            outOfStockCount:
                toNumber(
                    inventory.outOfStockCount
                ),
        },

        products:
            products.slice(0, 20),

        signals:
            signals.slice(0, 20),
    };
};

/* =========================================================
   MAIN
========================================================= */

const generateRecommendations =
    async (
        recommendationData = {}
    ) => {
        try {
            const context =
                buildRecommendationContext(
                    recommendationData
                );

            const prompt = `
You are VyparIntel's Recommendation Engine.

You are a specialist engine inside VyparMind.

Your job is to identify practical business actions
from the supplied business evidence.

========================
BUSINESS EVIDENCE
========================

${JSON.stringify(
    context,
    null,
    2
)}

========================
RULES
========================

- Use ONLY supplied evidence.
- Never invent numbers.
- Never invent products.
- Never invent expenses.
- Never invent sales.
- Never invent customers.
- Never invent market conditions.
- Never assume missing information.
- Do not guarantee future results.
- Separate evidence from recommendations.
- Prefer specific actions over generic advice.
- Maximum 5 recommendations.

Return ONLY valid JSON.

Format:

{
    "recommendations": [
        {
            "issue": "Short issue",
            "evidence": "Evidence",
            "recommendedAction": "Practical action",
            "reason": "Why this action is relevant",
            "priority": "HIGH | MEDIUM | LOW"
        }
    ]
}
`;

            const completion =
                await withGroqRetry(() =>
                    groq.chat.completions.create({
                        model: MODEL,

                        messages: [
                            {
                                role: "system",
                                content:
                                    "You are VyparIntel's evidence-based Recommendation Engine. Return JSON only.",
                            },
                            {
                                role: "user",
                                content:
                                    prompt,
                            },
                        ],

                        temperature: 0.15,

                        response_format: {
                            type: "json_object",
                        },
                    })
                );

            const rawContent =
                completion
                    ?.choices?.[0]
                    ?.message?.content || "";

            const parsed =
                parseAIResponse(
                    rawContent
                );

            const recommendations =
                normalizeRecommendations(
                    parsed
                );

            return {
                success: true,

                recommendations,

                count:
                    recommendations.length,

                evidence:
                    context,
            };
        } catch (error) {
            console.error(
                "Recommendation AI Error:",
                error.message
            );

            throw new Error(
                error?.message ||
                "Recommendation Engine failed."
            );
        }
    };

export {
    generateRecommendations,
    buildRecommendationContext,
};

export default
    generateRecommendations;