import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const MODEL =
    process.env.GROQ_MODEL || "openai/gpt-oss-120b";

/**
 * Central VyparMind Business Decision AI
 *
 * Converts business intelligence into:
 * 1. What happened
 * 2. Why it happened
 * 3. What risk exists
 * 4. What the owner should do next
 */
export async function generateBusinessDecision(businessContext) {
    if (!businessContext) {
        throw new Error("Business context is required");
    }

    const prompt = `
You are VyparMind, the AI Business Decision Intelligence engine
inside VyparIntel.

Your job is NOT simply to report business numbers.

Your job is to understand the numbers and help a small business
owner make the next decision.

Analyze ONLY the business evidence provided below.

Do NOT invent:
- customers
- reasons
- market conditions
- competitor behavior
- causes
- future results
- financial numbers

If the evidence does not prove a reason, clearly say that the
reason cannot be determined from the available data.

BUSINESS DATA
----------------
${JSON.stringify(businessContext, null, 2)}
----------------

Analyze the business using this framework:

1. WHAT HAPPENED?
Identify the most important changes in revenue, expenses,
profit, sales and inventory.

2. WHY DID IT HAPPEN?
Use the available evidence to identify the strongest supported
reasons for the change.

3. WHAT IS THE BUSINESS RISK?
Identify important risks supported by the data.

4. WHAT SHOULD THE OWNER DO NEXT?
Give practical actions based ONLY on the evidence.

5. WHAT SHOULD THE OWNER INVESTIGATE?
Identify anything important that cannot yet be explained.

Return ONLY valid JSON.

Use exactly this structure:

{
  "businessStatus": "HEALTHY | NEEDS_ATTENTION | CRITICAL",
  "headline": "short explanation of the most important situation",

  "whatHappened": [
    {
      "title": "short title",
      "description": "what changed",
      "evidence": "supporting business evidence"
    }
  ],

  "whyItHappened": [
    {
      "reason": "possible reason supported by evidence",
      "evidence": "specific evidence",
      "confidence": "HIGH | MEDIUM | LOW"
    }
  ],

  "risks": [
    {
      "risk": "business risk",
      "evidence": "supporting evidence",
      "priority": "HIGH | MEDIUM | LOW"
    }
  ],

  "recommendedActions": [
    {
      "action": "specific action the owner can take",
      "reason": "why this action is relevant",
      "priority": "HIGH | MEDIUM | LOW"
    }
  ],

  "investigateNext": [
    "question or issue that should be investigated next"
  ]
}

Rules:
- Use simple English.
- Be concise.
- Focus on decisions.
- Never fabricate evidence.
- Never claim certainty when the data does not support it.
- Prefer specific actions over generic advice.
`;

    const completion = await groq.chat.completions.create({
        model: MODEL,
        temperature: 0.2,
        messages: [
            {
                role: "system",
                content:
                    "You are VyparMind, an evidence-based AI business decision assistant.",
            },
            {
                role: "user",
                content: prompt,
            },
        ],
    });

    const content =
        completion?.choices?.[0]?.message?.content?.trim();

    if (!content) {
        throw new Error(
            "VyparMind returned an empty business decision"
        );
    }

    // Remove markdown fences if the model adds them.
    const cleaned = content
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch (error) {
        console.error(
            "VyparMind Business Decision JSON parse error:",
            error
        );

        console.error("Raw AI response:", content);

        throw new Error(
            "VyparMind returned invalid decision JSON"
        );
    }
}

export default generateBusinessDecision;