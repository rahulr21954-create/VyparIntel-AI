import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const MODEL =
    process.env.GROQ_MODEL ||
    "openai/gpt-oss-120b";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const formatMoney = (value, currency = "INR") => {
    const amount = Number(value) || 0;

    return `${currency} ${amount.toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    )}`;
};

const getValue = (obj, path, fallback = 0) => {
    const value = path
        .split(".")
        .reduce(
            (current, key) =>
                current?.[key],
            obj
        );

    return value ?? fallback;
};

/*
|--------------------------------------------------------------------------
| Fallback Morning Brief
|--------------------------------------------------------------------------
|
| This runs when Groq is unavailable.
|
| It uses only deterministic business data.
|
*/

const generateFallbackBrief = (
    businessData
) => {
    const currency =
        businessData?.business?.currency ||
        "INR";

    const revenue =
        getValue(
            businessData,
            "financials.revenue.current"
        );

    const previousRevenue =
        getValue(
            businessData,
            "financials.revenue.previous"
        );

    const revenueChange =
        getValue(
            businessData,
            "financials.revenue.changePercent",
            null
        );

    const expenses =
        getValue(
            businessData,
            "financials.expenses.current"
        );

    const previousExpenses =
        getValue(
            businessData,
            "financials.expenses.previous"
        );

    const expenseChange =
        getValue(
            businessData,
            "financials.expenses.changePercent",
            null
        );

    const grossProfit =
        getValue(
            businessData,
            "financials.grossProfit.current"
        );

    const netProfit =
        getValue(
            businessData,
            "financials.profit.current"
        );

    const profitStatus =
        getValue(
            businessData,
            "financials.profit.status",
            "BREAK_EVEN"
        );

    const profitChange =
        getValue(
            businessData,
            "financials.profit.changePercent",
            null
        );

    const sales =
        getValue(
            businessData,
            "sales.currentPeriod"
        );

    const products =
        getValue(
            businessData,
            "inventory.totalProducts"
        );

    const lowStock =
        getValue(
            businessData,
            "inventory.lowStockCount"
        );

    const outOfStock =
        getValue(
            businessData,
            "inventory.outOfStockCount"
        );

    const signals =
        Array.isArray(
            businessData?.signals
        )
            ? businessData.signals
            : [];

    const highSignals =
        signals.filter(
            (signal) =>
                signal?.severity === "HIGH"
        );

    const mediumSignals =
        signals.filter(
            (signal) =>
                signal?.severity === "MEDIUM"
        );

    /*
    |--------------------------------------------------------------------------
    | Summary
    |--------------------------------------------------------------------------
    */

    let summary = "";

    if (profitStatus === "PROFIT") {
        summary =
            `The business generated a net profit of ${formatMoney(
                netProfit,
                currency
            )} during the last 30 days. Revenue was ${formatMoney(
                revenue,
                currency
            )}, while business expenses were ${formatMoney(
                expenses,
                currency
            )}.`;
    } else if (profitStatus === "LOSS") {
        summary =
            `The business recorded a net loss of ${formatMoney(
                Math.abs(netProfit),
                currency
            )} during the last 30 days. Revenue was ${formatMoney(
                revenue,
                currency
            )}, while business expenses were ${formatMoney(
                expenses,
                currency
            )}.`;
    } else {
        summary =
            `The business is currently at break-even for the last 30 days. Revenue was ${formatMoney(
                revenue,
                currency
            )} and business expenses were ${formatMoney(
                expenses,
                currency
            )}.`;
    }

    /*
    |--------------------------------------------------------------------------
    | What Happened
    |--------------------------------------------------------------------------
    */

    const whatHappened = [];

    whatHappened.push(
        `Revenue: ${formatMoney(
            revenue,
            currency
        )}.`
    );

    if (
        revenueChange !== null &&
        revenueChange !== undefined
    ) {
        if (revenueChange > 0) {
            whatHappened.push(
                `Revenue increased by ${revenueChange}% compared with the previous 30-day period.`
            );
        } else if (revenueChange < 0) {
            whatHappened.push(
                `Revenue decreased by ${Math.abs(
                    revenueChange
                )}% compared with the previous 30-day period.`
            );
        } else {
            whatHappened.push(
                "Revenue was unchanged compared with the previous 30-day period."
            );
        }
    } else {
        whatHappened.push(
            `Previous-period revenue: ${formatMoney(
                previousRevenue,
                currency
            )}.`
        );
    }

    whatHappened.push(
        `Gross profit: ${formatMoney(
            grossProfit,
            currency
        )}.`
    );

    whatHappened.push(
        `Business expenses: ${formatMoney(
            expenses,
            currency
        )}.`
    );

    if (
        expenseChange !== null &&
        expenseChange !== undefined
    ) {
        if (expenseChange > 0) {
            whatHappened.push(
                `Expenses increased by ${expenseChange}% compared with the previous period.`
            );
        } else if (expenseChange < 0) {
            whatHappened.push(
                `Expenses decreased by ${Math.abs(
                    expenseChange
                )}% compared with the previous period.`
            );
        }
    } else {
        whatHappened.push(
            `Previous-period expenses: ${formatMoney(
                previousExpenses,
                currency
            )}.`
        );
    }

    whatHappened.push(
        `Net profit/loss: ${formatMoney(
            netProfit,
            currency
        )} (${profitStatus}).`
    );

    if (
        profitChange !== null &&
        profitChange !== undefined
    ) {
        if (profitChange > 0) {
            whatHappened.push(
                `Net profit increased by ${profitChange}% compared with the previous period.`
            );
        } else if (profitChange < 0) {
            whatHappened.push(
                `Net profit decreased by ${Math.abs(
                    profitChange
                )}% compared with the previous period.`
            );
        }
    }

    whatHappened.push(
        `Sales recorded: ${sales}.`
    );

    whatHappened.push(
        `Total products: ${products}.`
    );

    /*
    |--------------------------------------------------------------------------
    | What Needs Attention
    |--------------------------------------------------------------------------
    */

    const whatNeedsAttention = [];

    highSignals.forEach(
        (signal) => {
            if (signal?.message) {
                whatNeedsAttention.push(
                    signal.message
                );
            }
        }
    );

    mediumSignals.forEach(
        (signal) => {
            if (signal?.message) {
                whatNeedsAttention.push(
                    signal.message
                );
            }
        }
    );

    if (
        outOfStock > 0 &&
        !whatNeedsAttention.some(
            (item) =>
                item
                    .toLowerCase()
                    .includes(
                        "out of stock"
                    )
        )
    ) {
        whatNeedsAttention.push(
            `${outOfStock} product(s) are currently out of stock.`
        );
    }

    if (
        lowStock > 0 &&
        !whatNeedsAttention.some(
            (item) =>
                item
                    .toLowerCase()
                    .includes(
                        "low stock"
                    )
        )
    ) {
        whatNeedsAttention.push(
            `${lowStock} product(s) are at or below minimum stock.`
        );
    }

    if (
        whatNeedsAttention.length === 0
    ) {
        whatNeedsAttention.push(
            "No major risk signal was detected in the supplied business data."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Today's Focus
    |--------------------------------------------------------------------------
    */

    const todayFocus = [];

    if (outOfStock > 0) {
        todayFocus.push(
            "Review the products that are currently out of stock."
        );
    }

    if (lowStock > 0) {
        todayFocus.push(
            "Review products that are at or below their minimum stock level."
        );
    }

    if (
        expenseChange !== null &&
        expenseChange > 10
    ) {
        todayFocus.push(
            "Review the expense categories contributing to the current expense increase."
        );
    }

    if (
        revenueChange !== null &&
        revenueChange < -5
    ) {
        todayFocus.push(
            "Review recent sales and product performance to understand the revenue decline."
        );
    }

    if (
        profitChange !== null &&
        profitChange < -10
    ) {
        todayFocus.push(
            "Review the factors associated with the recent decline in net profit."
        );
    }

    if (todayFocus.length === 0) {
        todayFocus.push(
            "Review today's sales and inventory position."
        );

        todayFocus.push(
            "Monitor revenue, expenses, and net profit."
        );

        todayFocus.push(
            "Review any new business signals as they appear."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Final fallback format
    |--------------------------------------------------------------------------
    */

    return [
        "1. Summary",
        "",
        summary,
        "",
        "2. What Happened",
        "",
        ...whatHappened.map(
            (item) => `- ${item}`
        ),
        "",
        "3. What Needs Attention",
        "",
        ...whatNeedsAttention.map(
            (item) => `- ${item}`
        ),
        "",
        "4. Today's Focus",
        "",
        ...todayFocus.map(
            (item) => `- ${item}`
        ),
    ].join("\n");
};

/*
|--------------------------------------------------------------------------
| Main Morning Brief Generator
|--------------------------------------------------------------------------
*/

const generateMorningBrief = async (
    businessData
) => {
    try {
        /*
        |--------------------------------------------------------------------------
        | Validate business data
        |--------------------------------------------------------------------------
        */

        if (
            !businessData ||
            typeof businessData !== "object"
        ) {
            throw new Error(
                "Business data is required."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Prompt
        |--------------------------------------------------------------------------
        */

        const prompt = `
You are VyparIntel's Morning Brief Engine.

Create a concise daily business brief for a
small-business owner using ONLY the business data
provided below.

========================
BUSINESS DATA
========================

${JSON.stringify(
    businessData,
    null,
    2
)}

========================
YOUR TASK
========================

Create exactly these sections:

1. Summary
2. What Happened
3. What Needs Attention
4. Today's Focus

========================
RULES
========================

- Use ONLY supplied business data.
- Never invent numbers.
- Never invent customers.
- Never invent competitors.
- Never invent market conditions.
- Never invent external causes.
- Never invent products.
- Never invent sales or expenses.
- Do not create unsupported explanations.
- Do not make financial calculations yourself.
- Clearly distinguish facts from suggestions.
- If the data does not establish a cause, do not claim a cause.
- Keep language simple.
- Write for a small-business owner.
- Use short bullet points.
- Do not use markdown tables.
- Do not repeat the entire business data object.

========================
OUTPUT FORMAT
========================

1. Summary

[2-3 concise sentences]

2. What Happened

- [fact]
- [fact]
- [fact]

3. What Needs Attention

- [signal/risk]
- [signal/risk]

4. Today's Focus

- [practical review area]
- [practical review area]
- [practical review area]
`;

        /*
        |--------------------------------------------------------------------------
        | Groq call
        |--------------------------------------------------------------------------
        |
        | max_tokens keeps unnecessary output consumption lower.
        |
        */

        const completion =
            await groq.chat.completions.create({
                model: MODEL,

                messages: [
                    {
                        role: "system",
                        content:
                            "You are VyparIntel's evidence-based Morning Brief Engine. Summarize supplied business data accurately and concisely.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],

                temperature: 0.2,

                max_tokens: 500,
            });

        const morningBrief =
            completion
                ?.choices?.[0]
                ?.message
                ?.content;

        if (!morningBrief) {
            throw new Error(
                "Morning Brief returned an empty response."
            );
        }

        return morningBrief.trim();
    } catch (error) {
        console.error(
            "Morning Brief AI Error:",
            error?.message || error
        );

        /*
        |--------------------------------------------------------------------------
        | Detect Groq rate-limit errors
        |--------------------------------------------------------------------------
        */

        const status =
            error?.status ||
            error?.response?.status;

        const message =
            error?.message || "";

        const errorBody =
            error?.error?.error ||
            error?.response?.data?.error ||
            {};

        const errorCode =
            errorBody?.code;

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
                "⚠️ Groq unavailable. Returning deterministic Morning Brief."
            );

            return generateFallbackBrief(
                businessData
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Other AI failures
        |--------------------------------------------------------------------------
        |
        | Even if Groq has another temporary problem,
        | Morning Brief should still remain usable.
        |
        */

        console.warn(
            "⚠️ Morning Brief AI unavailable. Using business-data fallback."
        );

        return generateFallbackBrief(
            businessData
        );
    }
};

export default generateMorningBrief;

