/*
|--------------------------------------------------------------------------
| VYPARMIND — BUSINESS INTENT ENGINE
|--------------------------------------------------------------------------
|
| Converts a natural-language business question into a structured intent.
|
| Example:
|
| "Why did my profit decrease?"
|
|        ↓
|
| {
|   intent: "PROFIT_DIAGNOSIS",
|   needsWhy: true,
|   needsRisk: false,
|   needsRecommendation: true
| }
|
|--------------------------------------------------------------------------
*/

const INTENTS = {
    GENERAL_BUSINESS_QUERY: "GENERAL_BUSINESS_QUERY",

    REVENUE_QUERY: "REVENUE_QUERY",
    EXPENSE_QUERY: "EXPENSE_QUERY",
    PROFIT_QUERY: "PROFIT_QUERY",

    REVENUE_DIAGNOSIS: "REVENUE_DIAGNOSIS",
    EXPENSE_DIAGNOSIS: "EXPENSE_DIAGNOSIS",
    PROFIT_DIAGNOSIS: "PROFIT_DIAGNOSIS",

    PRODUCT_ANALYSIS: "PRODUCT_ANALYSIS",
    INVENTORY_ANALYSIS: "INVENTORY_ANALYSIS",

    SALES_ANALYSIS: "SALES_ANALYSIS",

    BUSINESS_HEALTH: "BUSINESS_HEALTH",

    RISK_ANALYSIS: "RISK_ANALYSIS",

    RECOMMENDATION: "RECOMMENDATION",

    ACTION_PLAN: "ACTION_PLAN",

    SIMULATION: "SIMULATION",

    COMPARISON: "COMPARISON",
};


// ============================================================================
// NORMALIZE QUESTION
// ============================================================================

const normalizeQuestion = (question = "") => {
    return String(question)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");
};


// ============================================================================
// KEYWORD HELPERS
// ============================================================================

const containsAny = (
    question,
    words
) => {
    return words.some(
        (word) =>
            question.includes(word)
    );
};


// ============================================================================
// DETECT TIME PERIOD
// ============================================================================

const detectPeriod = (question) => {

    if (
        containsAny(question, [
            "today",
            "todays",
            "today's",
        ])
    ) {
        return "TODAY";
    }

    if (
        containsAny(question, [
            "yesterday",
        ])
    ) {
        return "YESTERDAY";
    }

    if (
        containsAny(question, [
            "this week",
            "weekly",
            "week",
        ])
    ) {
        return "THIS_WEEK";
    }

    if (
        containsAny(question, [
            "last week",
        ])
    ) {
        return "LAST_WEEK";
    }

    if (
        containsAny(question, [
            "this month",
            "monthly",
            "month",
        ])
    ) {
        return "THIS_MONTH";
    }

    if (
        containsAny(question, [
            "last month",
        ])
    ) {
        return "LAST_MONTH";
    }

    if (
        containsAny(question, [
            "this year",
            "yearly",
            "year",
        ])
    ) {
        return "THIS_YEAR";
    }

    if (
        containsAny(question, [
            "last year",
        ])
    ) {
        return "LAST_YEAR";
    }

    if (
        containsAny(question, [
            "recent",
            "recently",
            "lately",
        ])
    ) {
        return "RECENT";
    }

    return "LAST_30_DAYS";
};


// ============================================================================
// DETECT ENTITY
// ============================================================================

const detectEntity = (question) => {

    if (
        containsAny(question, [
            "product",
            "products",
            "item",
            "items",
            "sku",
        ])
    ) {
        return "PRODUCT";
    }

    if (
        containsAny(question, [
            "expense",
            "expenses",
            "cost",
            "costs",
            "spending",
            "spent",
        ])
    ) {
        return "EXPENSE";
    }

    if (
        containsAny(question, [
            "sale",
            "sales",
            "selling",
            "sold",
            "orders",
            "order",
        ])
    ) {
        return "SALES";
    }

    if (
        containsAny(question, [
            "inventory",
            "stock",
            "stocks",
            "warehouse",
        ])
    ) {
        return "INVENTORY";
    }

    if (
        containsAny(question, [
            "revenue",
            "income",
            "turnover",
            "earning",
            "earnings",
        ])
    ) {
        return "REVENUE";
    }

    if (
        containsAny(question, [
            "profit",
            "profits",
            "margin",
            "margins",
        ])
    ) {
        return "PROFIT";
    }

    if (
        containsAny(question, [
            "business",
            "health",
            "performance",
            "condition",
        ])
    ) {
        return "BUSINESS";
    }

    return "BUSINESS";
};


// ============================================================================
// DETECT QUESTION TYPE
// ============================================================================

const detectQuestionType = (
    question
) => {

    if (
        containsAny(question, [
            "why",
            "reason",
            "cause",
            "caused",
            "because",
            "what happened",
        ])
    ) {
        return "DIAGNOSIS";
    }

    if (
        containsAny(question, [
            "what should i do",
            "what can i do",
            "how should i",
            "how can i",
            "what do i need to do",
            "next step",
            "next steps",
            "action",
            "actions",
        ])
    ) {
        return "ACTION";
    }

    if (
        containsAny(question, [
            "what if",
            "suppose",
            "if i",
            "if we",
            "increase price",
            "decrease price",
            "raise price",
            "lower price",
        ])
    ) {
        return "SIMULATION";
    }

    if (
        containsAny(question, [
            "compare",
            "comparison",
            "versus",
            "vs",
            "difference",
            "better than",
        ])
    ) {
        return "COMPARISON";
    }

    if (
        containsAny(question, [
            "should i",
            "should we",
            "recommend",
            "recommendation",
            "suggest",
            "advice",
        ])
    ) {
        return "RECOMMENDATION";
    }

    if (
        containsAny(question, [
            "risk",
            "danger",
            "problem",
            "threat",
            "warning",
            "alert",
        ])
    ) {
        return "RISK";
    }

    return "QUERY";
};


// ============================================================================
// INTENT CLASSIFICATION
// ============================================================================

const classifyIntent = (
    question
) => {

    const normalized =
        normalizeQuestion(
            question
        );

    const entity =
        detectEntity(
            normalized
        );

    const questionType =
        detectQuestionType(
            normalized
        );

    let intent =
        INTENTS.GENERAL_BUSINESS_QUERY;


    // ------------------------------------------------------------------------
    // SIMULATION
    // ------------------------------------------------------------------------

    if (
        questionType ===
        "SIMULATION"
    ) {

        intent =
            INTENTS.SIMULATION;
    }


    // ------------------------------------------------------------------------
    // COMPARISON
    // ------------------------------------------------------------------------

    else if (
        questionType ===
        "COMPARISON"
    ) {

        intent =
            INTENTS.COMPARISON;
    }


    // ------------------------------------------------------------------------
    // DIAGNOSIS
    // ------------------------------------------------------------------------

    else if (
        questionType ===
        "DIAGNOSIS"
    ) {

        if (
            entity ===
            "REVENUE"
        ) {
            intent =
                INTENTS.REVENUE_DIAGNOSIS;
        }

        else if (
            entity ===
            "EXPENSE"
        ) {
            intent =
                INTENTS.EXPENSE_DIAGNOSIS;
        }

        else if (
            entity ===
            "PROFIT"
        ) {
            intent =
                INTENTS.PROFIT_DIAGNOSIS;
        }

        else if (
            entity ===
            "PRODUCT"
        ) {
            intent =
                INTENTS.PRODUCT_ANALYSIS;
        }

        else if (
            entity ===
            "INVENTORY"
        ) {
            intent =
                INTENTS.INVENTORY_ANALYSIS;
        }

        else {
            intent =
                INTENTS.GENERAL_BUSINESS_QUERY;
        }
    }


    // ------------------------------------------------------------------------
    // ACTION
    // ------------------------------------------------------------------------

    else if (
        questionType ===
        "ACTION"
    ) {

        intent =
            INTENTS.ACTION_PLAN;
    }


    // ------------------------------------------------------------------------
    // RECOMMENDATION
    // ------------------------------------------------------------------------

    else if (
        questionType ===
        "RECOMMENDATION"
    ) {

        intent =
            INTENTS.RECOMMENDATION;
    }


    // ------------------------------------------------------------------------
    // RISK
    // ------------------------------------------------------------------------

    else if (
        questionType ===
        "RISK"
    ) {

        intent =
            INTENTS.RISK_ANALYSIS;
    }


    // ------------------------------------------------------------------------
    // NORMAL BUSINESS QUERY
    // ------------------------------------------------------------------------

    else {

        if (
            entity ===
            "REVENUE"
        ) {
            intent =
                INTENTS.REVENUE_QUERY;
        }

        else if (
            entity ===
            "EXPENSE"
        ) {
            intent =
                INTENTS.EXPENSE_QUERY;
        }

        else if (
            entity ===
            "PROFIT"
        ) {
            intent =
                INTENTS.PROFIT_QUERY;
        }

        else if (
            entity ===
            "PRODUCT"
        ) {
            intent =
                INTENTS.PRODUCT_ANALYSIS;
        }

        else if (
            entity ===
            "INVENTORY"
        ) {
            intent =
                INTENTS.INVENTORY_ANALYSIS;
        }

        else if (
            entity ===
            "SALES"
        ) {
            intent =
                INTENTS.SALES_ANALYSIS;
        }

        else if (
            entity ===
            "BUSINESS"
        ) {
            intent =
                INTENTS.BUSINESS_HEALTH;
        }
    }


    return {
        intent,

        entity,

        questionType,

        period:
            detectPeriod(
                normalized
            ),

        originalQuestion:
            question,

        normalizedQuestion:
            normalized,
    };
};


// ============================================================================
// DETERMINE REQUIRED TOOLS
// ============================================================================

export const getRequiredTools = (
    intent
) => {

    switch (intent) {

        case INTENTS.REVENUE_DIAGNOSIS:

        case INTENTS.EXPENSE_DIAGNOSIS:

        case INTENTS.PROFIT_DIAGNOSIS:

        case INTENTS.PRODUCT_ANALYSIS:

            return [
                "BUSINESS_CONTEXT",
                "WHY_ENGINE",
            ];


        case INTENTS.RISK_ANALYSIS:

            return [
                "BUSINESS_CONTEXT",
                "RISK_ENGINE",
            ];


        case INTENTS.RECOMMENDATION:

        case INTENTS.ACTION_PLAN:

            return [
                "BUSINESS_CONTEXT",
                "RECOMMENDATION_ENGINE",
            ];


        case INTENTS.BUSINESS_HEALTH:

            return [
                "BUSINESS_CONTEXT",
                "RISK_ENGINE",
                "RECOMMENDATION_ENGINE",
            ];


        case INTENTS.SIMULATION:

            return [
                "BUSINESS_CONTEXT",
                "SIMULATION_ENGINE",
            ];


        case INTENTS.COMPARISON:

            return [
                "BUSINESS_CONTEXT",
                "ANALYTICS",
            ];


        default:

            return [
                "BUSINESS_CONTEXT",
            ];
    }
};


// ============================================================================
// PUBLIC FUNCTION
// ============================================================================

export const understandBusinessQuestion = (
    question
) => {

    if (
        !question ||
        typeof question !== "string"
    ) {

        throw new Error(
            "A valid business question is required."
        );
    }


    const classification =
        classifyIntent(
            question
        );


    const tools =
        getRequiredTools(
            classification.intent
        );


    return {
        ...classification,

        requiredTools:
            tools,

        needsBusinessContext:
            tools.includes(
                "BUSINESS_CONTEXT"
            ),

        needsWhy:
            tools.includes(
                "WHY_ENGINE"
            ),

        needsRisk:
            tools.includes(
                "RISK_ENGINE"
            ),

        needsRecommendation:
            tools.includes(
                "RECOMMENDATION_ENGINE"
            ),

        needsSimulation:
            tools.includes(
                "SIMULATION_ENGINE"
            ),

        needsAnalytics:
            tools.includes(
                "ANALYTICS"
            ),
    };
};


export {
    INTENTS,
    classifyIntent,
    detectEntity,
    detectPeriod,
};