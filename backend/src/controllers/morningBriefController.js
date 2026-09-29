import buildBusinessContext from "../services/businessContextService.js";
import generateMorningBrief from "../services/morningBriefService.js";


// ========================================
// GET MORNING BRIEF
// ========================================

const getMorningBrief = async (req, res) => {
    try {
        // ========================================
        // BUSINESS ID
        // ========================================

        const businessId = req.user?.business;

        if (!businessId) {
            return res.status(400).json({
                success: false,
                message: "Business not found.",
            });
        }


        // ========================================
        // BUILD BUSINESS CONTEXT
        // ========================================

        console.log(
            "🧠 Building Morning Brief business context..."
        );

        const businessContext =
            await buildBusinessContext(req.user._id);


        if (!businessContext) {
            return res.status(404).json({
                success: false,
                message:
                    "Unable to build business context.",
            });
        }


        console.log(
            "✅ Morning Brief business context ready."
        );


        // ========================================
        // DEBUG BUSINESS DATA
        // ========================================

        console.log(
            "📊 Morning Brief Financials:",
            businessContext.financials
        );

        console.log(
            "📦 Morning Brief Inventory:",
            businessContext.inventory
        );

        console.log(
            "🛒 Morning Brief Sales:",
            businessContext.sales
        );


        // ========================================
        // GENERATE MORNING BRIEF
        // ========================================

        const morningBrief =
            await generateMorningBrief(
                businessContext
            );


        // ========================================
        // DIRECT BUSINESS SNAPSHOT
        // ========================================

        const financials =
            businessContext.financials || {};

        const revenue =
            financials.revenue || {};

        const expenses =
            financials.expenses || {};

        const grossProfit =
            financials.grossProfit || {};

        const profit =
            financials.profit || {};

        const sales =
            businessContext.sales || {};

        const inventory =
            businessContext.inventory || {};


        // ========================================
        // SNAPSHOT
        // ========================================

        const businessSnapshot = {

            revenue: {
                current:
                    Number(
                        revenue.current || 0
                    ),

                previous:
                    Number(
                        revenue.previous || 0
                    ),

                changePercent:
                    revenue.changePercent ??
                    null,
            },


            expenses: {
                current:
                    Number(
                        expenses.current || 0
                    ),

                previous:
                    Number(
                        expenses.previous || 0
                    ),

                changePercent:
                    expenses.changePercent ??
                    null,
            },


            grossProfit: {
                current:
                    Number(
                        grossProfit.current || 0
                    ),

                previous:
                    Number(
                        grossProfit.previous || 0
                    ),

                changePercent:
                    grossProfit.changePercent ??
                    null,
            },


            netProfit: {
                current:
                    Number(
                        profit.current || 0
                    ),

                previous:
                    Number(
                        profit.previous || 0
                    ),

                changePercent:
                    profit.changePercent ??
                    null,

                status:
                    profit.status ||
                    businessContext.businessStatus ||
                    "BREAK_EVEN",
            },


            sales: {
                current:
                    Number(
                        sales.currentPeriod || 0
                    ),

                previous:
                    Number(
                        sales.previousPeriod || 0
                    ),

                changePercent:
                    sales.changePercent ??
                    null,
            },


            inventory: {
                totalProducts:
                    Number(
                        inventory.totalProducts || 0
                    ),

                lowStockCount:
                    Number(
                        inventory.lowStockCount || 0
                    ),

                outOfStockCount:
                    Number(
                        inventory.outOfStockCount || 0
                    ),
            },
        };


        console.log(
            "📈 Morning Brief Snapshot:",
            businessSnapshot
        );


        // ========================================
        // RESPONSE
        // ========================================

        return res.status(200).json({

            success: true,

            generatedAt:
                morningBrief?.generatedAt ||
                new Date(),


            // ========================================
            // BUSINESS
            // ========================================

            business: {
                id:
                    businessContext?.business?.id,

                name:
                    businessContext?.business?.name ||
                    "Your Business",

                category:
                    businessContext?.business?.category ||
                    "",

                currency:
                    businessContext?.business?.currency ||
                    "INR",
            },


            // ========================================
            // PERIOD
            // ========================================

            period:
                businessContext.period || {},


            // ========================================
            // SNAPSHOT
            // ========================================

            businessSnapshot,


            // ========================================
            // MORNING BRIEF
            // ========================================

            morningBrief: {

                summary:
                    morningBrief?.summary ||
                    "",

                whatHappened:
                    morningBrief?.whatHappened ||
                    "",

                whatNeedsAttention:
                    morningBrief?.whatNeedsAttention ||
                    "",

                todayFocus:
                    morningBrief?.todayFocus ||
                    "",

                source:
                    morningBrief?.source ||
                    "BUSINESS_DATABASE",

                aiAvailable:
                    morningBrief?.aiAvailable ??
                    false,

                rateLimited:
                    morningBrief?.rateLimited ??
                    false,

                generatedBy:
                    morningBrief?.generatedBy ||
                    "VyparIntel Deterministic Intelligence",

                generatedAt:
                    morningBrief?.generatedAt ||
                    new Date(),
            },


            // ========================================
            // RAW INTELLIGENCE
            // ========================================

            intelligence: {

                financials:
                    businessContext.financials ||
                    {},

                sales:
                    businessContext.sales ||
                    {},

                inventory:
                    businessContext.inventory ||
                    {},

                products:
                    businessContext.products ||
                    {},

                expenses:
                    businessContext.expenses ||
                    {},

                signals:
                    businessContext.signals ||
                    [],

                businessStatus:
                    businessContext.businessStatus ||
                    "BREAK_EVEN",
            },
        });

    } catch (error) {

        console.error(
            "❌ Morning Brief Controller Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to generate Morning Brief.",

            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};


export {
    getMorningBrief,
};

