import {
    getBusinessContext,
} from "../services/businessContextService.js";

import {
    generateBusinessCopilotResponse,
} from "../services/businessCopilotService.js";


export const chatWithVyparMind = async (req, res) => {
    try {
        const userId =
            req.user?._id ||
            req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const {
            question,
        } = req.body;

        if (
            !question ||
            typeof question !== "string" ||
            !question.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a business question.",
            });
        }

        /*
         * STEP 1
         *
         * Build the owner's business intelligence context.
         */
        const businessContext =
            await getBusinessContext(userId);

        /*
         * STEP 2
         *
         * Send the question + business context
         * to VyparMind Business Copilot.
         */
        const response =
            await generateBusinessCopilotResponse({
                question: question.trim(),
                businessContext,
            });

        return res.status(200).json({
            success: true,

            data: response,

            generatedAt: new Date(),
        });

    } catch (error) {
        console.error(
            "VyparMind Chat Error:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                error?.message ||
                "Unable to process your business question.",

            error:
                process.env.NODE_ENV === "development"
                    ? error?.stack
                    : undefined,
        });
    }
};