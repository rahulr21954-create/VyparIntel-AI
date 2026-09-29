import Groq from "groq-sdk";

const MODEL =
    process.env.GROQ_MODEL ||
    "openai/gpt-oss-120b";

const groq = process.env.GROQ_API_KEY
    ? new Groq({
        apiKey: process.env.GROQ_API_KEY,
    })
    : null;


// ==========================================
// HELPERS
// ==========================================

const formatMoney = (value) => {
    const number = Number(value || 0);

    return number.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    });
};


const formatPercent = (value) => {
    if (value === null || value === undefined) {
        return "N/A";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "N/A";
    }

    return `${number > 0 ? "+" : ""}${number.toFixed(2)}%`;
};


const getSeverityLabel = (severity) => {
    switch (severity) {
        case "HIGH":
            return "High";

        case "MEDIUM":
            return "Medium";

        case "LOW":
            return "Low";

        default:
            return "Unknown";
    }
};


const isRateLimitError = (error) => {
    const status =
        error?.status ||
        error?.response?.status;

    const message =
        error?.message || "";

    return (
        status === 429 ||
        message.includes("429") ||
        message.includes("rate_limit_exceeded") ||
        message.includes("Rate limit reached")
    );
};


// ==========================================
// DETERMINISTIC RISK ENGINE
// ==========================================

const generateDeterministicRiskInsight = (
    riskData
) => {
    const risks = Array.isArray(riskData?.risks)
        ? riskData.risks
        : [];

    const revenue =
        riskData?.revenue || {};

    const profit =
        riskData?.profit || {};

    const expenseChangePercent =
        riskData?.expenseChangePercent;

    // --------------------------------------
    // NO RISKS
    // --------------------------------------

    if (risks.length === 0) {
        return {
            summary:
                "No major risk signals were detected from the available business data.",

            risks: [],

            overallRisk: "LOW",

            whatToReview: [
                "Continue monitoring revenue.",
                "Continue monitoring expenses.",
                "Review product stock levels regularly.",
                "Monitor profit trends over the next 30 days.",
            ],

            source: "BUSINESS_DATABASE",

            aiAvailable: false,

            rateLimited: false,

            generatedBy:
                "VyparIntel Deterministic Risk Engine",

            generatedAt: new Date(),
        };
    }


    // --------------------------------------
    // OVERALL RISK
    // --------------------------------------

    let overallRisk = "LOW";

    if (
        risks.some(
            (risk) =>
                risk.severity === "HIGH"
        )
    ) {
        overallRisk = "HIGH";
    } else if (
        risks.some(
            (risk) =>
                risk.severity === "MEDIUM"
        )
    ) {
        overallRisk = "MEDIUM";
    }


    // --------------------------------------
    // RISK EXPLANATIONS
    // --------------------------------------

    const structuredRisks = risks.map(
        (risk) => {
            let reason =
                "This risk was detected from the available business data.";

            let possibleImpact =
                "If this situation continues, it may require business attention.";

            let review =
                "Review the underlying business data and monitor the situation.";

            switch (risk.type) {

                case "DECLINING_SALES":
                    reason =
                        `Revenue changed by ${formatPercent(
                            revenue.changePercent
                        )} compared with the previous 30-day period.`;

                    possibleImpact =
                        "If revenue continues to decline, the business may generate less income.";

                    review =
                        "Review recent sales activity and identify products or sales periods contributing to the decline.";

                    break;


                case "NEGATIVE_PROFIT":
                    reason =
                        `Current net profit is ₹${formatMoney(
                            profit.netProfit
                        )}.`;

                    possibleImpact =
                        "If the business continues generating negative net profit, available earnings may remain under pressure.";

                    review =
                        "Review revenue, gross profit, and business expenses to identify where profitability is being reduced.";

                    break;


                case "LOW_STOCK":
                    reason =
                        `${risk.count || 0} product(s) are at or below their minimum stock level.`;

                    possibleImpact =
                        "If stock remains low, some products may become unavailable.";

                    review =
                        "Review the affected products and determine whether inventory needs replenishment.";

                    break;


                case "OUT_OF_STOCK":
                    reason =
                        `${risk.count || 0} product(s) currently have zero stock.`;

                    possibleImpact =
                        "Products with zero stock cannot currently be sold from available inventory.";

                    review =
                        "Review the affected products and their replenishment requirements.";

                    break;


                case "RISING_EXPENSES":
                    reason =
                        `Expenses changed by ${formatPercent(
                            expenseChangePercent
                        )} compared with the previous 30-day period.`;

                    possibleImpact =
                        "If expenses continue increasing faster than business income, profitability may remain under pressure.";

                    review =
                        "Review the expense categories responsible for the increase.";

                    break;


                default:
                    break;
            }


            return {
                type: risk.type,

                severity: risk.severity,

                severityLabel:
                    getSeverityLabel(
                        risk.severity
                    ),

                message:
                    risk.message,

                reason,

                possibleImpact,

                whatToReview: review,

                data: {
                    value:
                        risk.value ??
                        null,

                    count:
                        risk.count ??
                        null,

                    products:
                        risk.products ||
                        [],
                },
            };
        }
    );


    // --------------------------------------
    // REVIEW AREAS
    // --------------------------------------

    const whatToReview = [];


    if (
        risks.some(
            (risk) =>
                risk.type ===
                "NEGATIVE_PROFIT"
        )
    ) {
        whatToReview.push(
            "Review revenue, gross profit and business expenses."
        );
    }


    if (
        risks.some(
            (risk) =>
                risk.type ===
                "DECLINING_SALES"
        )
    ) {
        whatToReview.push(
            "Review recent sales and identify declining products."
        );
    }


    if (
        risks.some(
            (risk) =>
                risk.type ===
                "RISING_EXPENSES"
        )
    ) {
        whatToReview.push(
            "Review expense categories that increased during the current period."
        );
    }


    if (
        risks.some(
            (risk) =>
                risk.type ===
                "LOW_STOCK" ||
                risk.type ===
                "OUT_OF_STOCK"
        )
    ) {
        whatToReview.push(
            "Review inventory levels and replenishment requirements."
        );
    }


    // --------------------------------------
    // SUMMARY
    // --------------------------------------

    const highRiskCount =
        risks.filter(
            (risk) =>
                risk.severity === "HIGH"
        ).length;

    const mediumRiskCount =
        risks.filter(
            (risk) =>
                risk.severity === "MEDIUM"
        ).length;


    let summary;

    if (highRiskCount > 0) {
        summary =
            `The Risk Engine detected ${highRiskCount} high-severity risk signal(s) and ${mediumRiskCount} medium-severity risk signal(s) from the available business data.`;
    } else {
        summary =
            `The Risk Engine detected ${mediumRiskCount} medium-severity risk signal(s) from the available business data.`;
    }


    return {
        summary,

        overallRisk,

        risks: structuredRisks,

        whatToReview,

        source: "BUSINESS_DATABASE",

        aiAvailable: false,

        rateLimited: false,

        generatedBy:
            "VyparIntel Deterministic Risk Engine",

        generatedAt: new Date(),
    };
};


// ==========================================
// GROQ AI RISK ANALYSIS
// ==========================================

const generateAIRiskInsight = async (
    riskData
) => {

    if (!groq) {
        throw new Error(
            "GROQ_API_KEY is not configured."
        );
    }


    const prompt = `
You are VyparIntel's Risk Engine.

Analyze ONLY the business risk data provided below.

BUSINESS RISK DATA:

${JSON.stringify(
    riskData,
    null,
    2
)}

Return a JSON object with exactly this structure:

{
  "summary": "short business risk summary",
  "overallRisk": "LOW | MEDIUM | HIGH",
  "risks": [
    {
      "type": "risk type",
      "severity": "LOW | MEDIUM | HIGH",
      "message": "what the risk is",
      "reason": "why it was detected",
      "possibleImpact": "possible future impact, clearly described as a possibility",
      "whatToReview": "what the owner should review"
    }
  ],
  "whatToReview": [
    "practical review point"
  ]
}

IMPORTANT RULES:

- Use ONLY the supplied data.
- Never invent numbers.
- Never invent products.
- Never invent customers.
- Never invent market conditions.
- Never invent competitors.
- Do not perform calculations.
- Do not claim future events with certainty.
- Clearly distinguish detected facts from possible outcomes.
- Keep the language simple.
- Keep the response practical for a small business owner.
- Return valid JSON only.
`;


    const completion =
        await groq.chat.completions.create({
            model: MODEL,

            messages: [
                {
                    role: "system",
                    content:
                        "You are VyparIntel's evidence-based business Risk Engine.",
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

            max_tokens: 800,
        });


    const content =
        completion
            ?.choices?.[0]
            ?.message?.content;


    if (!content) {
        throw new Error(
            "Risk Engine returned an empty response."
        );
    }


    const parsed =
        JSON.parse(content);


    return {
        ...parsed,

        source: "VYPARMIND_AI",

        aiAvailable: true,

        rateLimited: false,

        generatedBy:
            "VyparMind Risk Intelligence",

        generatedAt: new Date(),
    };
};


// ==========================================
// MAIN RISK ENGINE
// ==========================================

const generateRiskInsight = async (
    riskData
) => {

    // Always build deterministic result first.
    const fallback =
        generateDeterministicRiskInsight(
            riskData
        );


    // --------------------------------------
    // NO API KEY
    // --------------------------------------

    if (!groq) {
        console.warn(
            "⚠️ GROQ_API_KEY not configured. Returning deterministic Risk Engine."
        );

        return fallback;
    }


    // --------------------------------------
    // TRY AI
    // --------------------------------------

    try {

        const aiInsight =
            await generateAIRiskInsight(
                riskData
            );

        return aiInsight;

    } catch (error) {

        if (isRateLimitError(error)) {

            console.warn(
                "⚠️ Groq rate limit reached. Returning deterministic Risk Engine."
            );

            return {
                ...fallback,

                rateLimited: true,

                generatedBy:
                    "VyparIntel Deterministic Risk Engine",
            };
        }


        console.error(
            "Risk Engine AI Error:",
            error.message
        );


        return {
            ...fallback,

            generatedBy:
                "VyparIntel Deterministic Risk Engine",
        };
    }
};


export {
    generateDeterministicRiskInsight,
    generateAIRiskInsight,
};


export default generateRiskInsight;