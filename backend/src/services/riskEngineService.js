import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const generateRiskInsight = async (riskData) => {
    try {
        const prompt = `
You are VyparIntel's Risk Engine.

Analyze the business risk signals provided below.

BUSINESS RISK DATA:

${JSON.stringify(riskData, null, 2)}

For each important risk, explain:

1. What is the risk?
2. Why was it detected?
3. What could happen if the situation continues?
4. What should the business owner review?

Rules:
- Use ONLY the supplied data.
- Never invent numbers.
- Do not claim certainty about future events.
- Distinguish detected signals from possible future outcomes.
- Keep the language simple and practical.
- Do not perform calculations yourself.
`;

        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",

            messages: [
                {
                    role: "system",
                    content:
                        "You are VyparIntel's business risk analysis assistant.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],

            temperature: 0.2,
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error(
            "Risk Engine AI Error:",
            error.message
        );

        throw new Error(
            "Risk Engine failed to generate insight."
        );
    }
};

export default generateRiskInsight;