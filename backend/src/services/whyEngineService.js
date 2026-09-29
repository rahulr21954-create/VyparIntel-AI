import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const generateWhyInsight = async (evidence) => {
    try {
        const prompt = `
You are VyparIntel's Why Engine.

Your job is to explain WHY the current business situation
is happening using ONLY the business evidence provided below.

========================
BUSINESS EVIDENCE
========================

${JSON.stringify(evidence, null, 2)}

========================
YOUR TASK
========================

Analyze the evidence and return the following sections:

1. Main Change
2. Evidence-Based Reasons
3. Important Signals
4. Possible Risks
5. What the Business Owner Should Review

========================
IMPORTANT RULES
========================

- Use ONLY the provided evidence.
- Never invent numbers.
- Never invent sales, expenses, revenue, products, customers,
  market conditions, competitors, or other business facts.
- Do not calculate new metrics.
- Do not change or reinterpret numbers.
- Clearly distinguish confirmed facts from possible explanations.
- A possible explanation must be explicitly described as a possibility.
- If the evidence does not prove a cause, say:
  "The available evidence is insufficient to determine the cause confidently."
- Focus on relationships visible in the evidence.
- Keep the explanation useful for a small-business owner.
- Use simple English.
- Avoid unnecessary technical terminology.
- Do not use markdown tables.
- Use short bullet points.
- Do not repeat the entire evidence object.
- Do not add currency symbols that are not present in the evidence.
- If the evidence contains a currency field, use that currency.
- Keep the response concise but informative.

========================
OUTPUT FORMAT
========================

1. Main Change

- Clearly describe the most important business change or current situation.
- Mention only facts supported by the evidence.

2. Evidence-Based Reasons

- Explain the strongest evidence-supported reasons.
- Separate confirmed evidence from possible explanations.

3. Important Signals

- List the most important signals the business owner should notice.
- Mention positive and negative signals when applicable.

4. Possible Risks

- Explain risks that are directly connected to the evidence.
- Do not exaggerate or invent future outcomes.

5. What the Business Owner Should Review

- Give practical areas the owner should investigate next.
- Do not present unsupported actions as guaranteed solutions.

Remember:
You are an evidence-based explanation engine.
Your job is to explain the evidence, not invent a story around it.
`;

        const completion =
            await groq.chat.completions.create({
                model: "openai/gpt-oss-120b",

                messages: [
                    {
                        role: "system",
                        content:
                            "You are VyparIntel's evidence-based business Why Engine. You explain business situations strictly from structured backend evidence.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],

                temperature: 0.2,
            });

        const insight =
            completion?.choices?.[0]?.message?.content;

        if (!insight) {
            throw new Error(
                "Why Engine returned an empty response."
            );
        }

        return insight.trim();
    } catch (error) {
        console.error(
            "Why Engine AI Error:",
            error.message
        );

        throw new Error(
            "Why Engine failed to generate insight."
        );
    }
};

export default generateWhyInsight;