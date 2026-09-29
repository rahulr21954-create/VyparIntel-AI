import Groq from "groq-sdk";

const MODEL =
    process.env.GROQ_MODEL ||
    "openai/gpt-oss-120b";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// ========================================
// HELPERS
// ========================================

const money = (value) => {
    const number = Number(value || 0);

    return `₹${number.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;
};

const number = (value) => {
    return Number(value || 0).toLocaleString(
        "en-IN"
    );
};

const percent = (value) => {
    if (
        value === null ||
        value === undefined ||
        !Number.isFinite(Number(value))
    ) {
        return "N/A";
    }

    const numberValue = Number(value);

    return `${numberValue >= 0 ? "+" : ""}${numberValue.toFixed(
        2
    )}%`;
};

// ========================================
// DETECT GROQ RATE LIMIT
// ========================================

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

// ========================================
// DETERMINISTIC WHY ANALYSIS
// ========================================

const generateDeterministicWhyInsight = (
    evidence
) => {
    const revenue =
        evidence?.revenue || {};

    const currentRevenue =
        Number(revenue.current || 0);

    const previousRevenue =
        Number(revenue.previous || 0);

    const revenueChange =
        revenue.changePercent;

    const currentSales =
        Number(
            evidence?.salesCount?.current || 0
        );

    const previousSales =
        Number(
            evidence?.salesCount?.previous || 0
        );

    const decliningProducts =
        Array.isArray(
            evidence?.decliningProducts
        )
            ? evidence.decliningProducts
            : [];

    const increasingExpenses =
        Array.isArray(
            evidence?.increasingExpenses
        )
            ? evidence.increasingExpenses
            : [];

    const lowStockProducts =
        Array.isArray(
            evidence?.lowStockProducts
        )
            ? evidence.lowStockProducts
            : [];

    // ========================================
    // MAIN CHANGE
    // ========================================

    const mainChange = [];

    if (currentRevenue < previousRevenue) {
        mainChange.push(
            `Revenue decreased from ${money(
                previousRevenue
            )} to ${money(
                currentRevenue
            )} (${percent(
                revenueChange
            )}).`
        );
    } else if (
        currentRevenue > previousRevenue
    ) {
        mainChange.push(
            `Revenue increased from ${money(
                previousRevenue
            )} to ${money(
                currentRevenue
            )} (${percent(
                revenueChange
            )}).`
        );
    } else {
        mainChange.push(
            `Revenue is currently ${money(
                currentRevenue
            )}.`
        );
    }

    if (currentSales < previousSales) {
        mainChange.push(
            `Sales count decreased from ${number(
                previousSales
            )} to ${number(
                currentSales
            )}.`
        );
    } else if (
        currentSales > previousSales
    ) {
        mainChange.push(
            `Sales count increased from ${number(
                previousSales
            )} to ${number(
                currentSales
            )}.`
        );
    }

    // ========================================
    // EVIDENCE-BASED REASONS
    // ========================================

    const reasons = [];

    if (currentRevenue < previousRevenue) {
        reasons.push(
            `Confirmed: revenue is ${percent(
                revenueChange
            )} compared with the previous period.`
        );
    }

    if (currentSales < previousSales) {
        reasons.push(
            `Confirmed: the number of recorded sales decreased from ${number(
                previousSales
            )} to ${number(
                currentSales
            )}.`
        );
    }

    if (decliningProducts.length > 0) {
        const products =
            decliningProducts
                .slice(0, 3)
                .map((product) => {
                    return `${product.productName} (${percent(
                        product.changePercent
                    )})`;
                })
                .join(", ");

        reasons.push(
            `Confirmed: declining product sales include ${products}.`
        );
    }

    if (
        increasingExpenses.length > 0
    ) {
        const expenses =
            increasingExpenses
                .slice(0, 3)
                .map((expense) => {
                    return `${expense.category} (${percent(
                        expense.changePercent
                    )})`;
                })
                .join(", ");

        reasons.push(
            `Confirmed: increasing expense categories include ${expenses}.`
        );
    }

    if (reasons.length === 0) {
        reasons.push(
            "The available evidence is insufficient to determine the cause confidently."
        );
    }

    // ========================================
    // IMPORTANT SIGNALS
    // ========================================

    const signals = [];

    if (currentRevenue < previousRevenue) {
        signals.push(
            `Revenue is declining (${percent(
                revenueChange
            )}).`
        );
    }

    if (currentSales < previousSales) {
        signals.push(
            `Sales count is lower than the previous period.`
        );
    }

    if (decliningProducts.length > 0) {
        signals.push(
            `${decliningProducts.length} product(s) show declining sales.`
        );
    }

    if (
        increasingExpenses.length > 0
    ) {
        signals.push(
            `${increasingExpenses.length} expense categor${increasingExpenses.length === 1 ? "y is" : "ies are"} increasing.`
        );
    }

    if (lowStockProducts.length > 0) {
        signals.push(
            `${lowStockProducts.length} product(s) are at or below minimum stock.`
        );
    }

    if (signals.length === 0) {
        signals.push(
            "No major negative signal was identified from the available evidence."
        );
    }

    // ========================================
    // POSSIBLE RISKS
    // ========================================

    const risks = [];

    if (currentRevenue < previousRevenue) {
        risks.push(
            "Continued revenue decline could reduce the business's ability to generate sufficient sales."
        );
    }

    if (decliningProducts.length > 0) {
        risks.push(
            "Continued decline in affected products could contribute to weaker sales performance."
        );
    }

    if (
        increasingExpenses.length > 0
    ) {
        risks.push(
            "Continued increases in expense categories could put additional pressure on profitability."
        );
    }

    if (lowStockProducts.length > 0) {
        risks.push(
            "Low-stock products may require review because inventory availability is becoming a business signal."
        );
    }

    if (risks.length === 0) {
        risks.push(
            "No specific future risk can be established confidently from the available evidence."
        );
    }

    // ========================================
    // WHAT OWNER SHOULD REVIEW
    // ========================================

    const review = [];

    if (decliningProducts.length > 0) {
        review.push(
            "Review the declining products and their recent sales quantities."
        );
    }

    if (
        increasingExpenses.length > 0
    ) {
        review.push(
            "Review the expense categories showing increases."
        );
    }

    if (lowStockProducts.length > 0) {
        review.push(
            "Review products that are at or below minimum stock."
        );
    }

    if (currentSales < previousSales) {
        review.push(
            "Review the periods and products contributing to the lower sales count."
        );
    }

    if (review.length === 0) {
        review.push(
            "Review the underlying sales, expense, and product records for additional context."
        );
    }

    // ========================================
    // FINAL STRUCTURED TEXT
    // ========================================

    return `1. Main Change

- ${mainChange.join("\n- ")}

2. Evidence-Based Reasons

- ${reasons.join("\n- ")}

3. Important Signals

- ${signals.join("\n- ")}

4. Possible Risks

- ${risks.join("\n- ")}

5. What the Business Owner Should Review

- ${review.join("\n- ")}`;
};

// ========================================
// AI WHY ENGINE
// ========================================

const generateAIWhyInsight = async (
    evidence
) => {
    const prompt = `
You are VyparIntel's Why Engine.

Your job is to explain WHY the current business situation
is happening using ONLY the business evidence provided below.

========================
BUSINESS EVIDENCE
========================

${JSON.stringify(
    evidence,
    null,
    2
)}

========================
YOUR TASK
========================

Return these sections:

1. Main Change
2. Evidence-Based Reasons
3. Important Signals
4. Possible Risks
5. What the Business Owner Should Review

RULES:

- Use ONLY the provided evidence.
- Never invent numbers.
- Never invent sales, expenses, revenue, products,
  customers, market conditions, competitors, or other facts.
- Do not invent causes.
- Do not calculate new metrics.
- Clearly distinguish confirmed facts from possible explanations.
- If evidence does not prove a cause, say:
  "The available evidence is insufficient to determine the cause confidently."
- Use simple English.
- Use short bullet points.
- Do not use markdown tables.
- Keep the response concise.
`;

    const completion =
        await groq.chat.completions.create({
            model: MODEL,

            messages: [
                {
                    role: "system",
                    content:
                        "You are VyparIntel's evidence-based business Why Engine.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],

            temperature: 0.2,

            max_tokens: 900,
        });

    const insight =
        completion?.choices?.[0]?.message?.content;

    if (!insight) {
        throw new Error(
            "Why Engine returned an empty response."
        );
    }

    return insight.trim();
};

// ========================================
// MAIN FUNCTION
// ========================================

const generateWhyInsight = async (
    evidence
) => {
    // Always make sure deterministic analysis
    // is available.

    const fallback =
        generateDeterministicWhyInsight(
            evidence
        );

    try {
        if (!process.env.GROQ_API_KEY) {
            console.warn(
                "⚠️ GROQ_API_KEY missing. Using deterministic Why Engine."
            );

            return fallback;
        }

        const insight =
            await generateAIWhyInsight(
                evidence
            );

        return insight;
    } catch (error) {
        console.error(
            "Why Engine AI Error:",
            error.message
        );

        if (isRateLimitError(error)) {
            console.warn(
                "⚠️ Groq unavailable/rate-limited. Using deterministic Why Engine."
            );
        } else {
            console.warn(
                "⚠️ Why Engine AI failed. Using deterministic Why Engine."
            );
        }

        return fallback;
    }
};

export default generateWhyInsight;