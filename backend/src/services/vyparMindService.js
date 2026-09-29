import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const generateBusinessInsight = async (analytics) => {
    try {
        const prompt = `
You are VyparIntel, the AI business intelligence engine
inside VyparIntel.

Your job is to help small business owners understand
their business data in simple language.

Here is the calculated business data:

${JSON.stringify(analytics, null, 2)}

Analyze the information and respond with:

1. Business Summary
2. What is happening?
3. Why it may be happening
4. Important risks
5. Opportunities
6. Recommended actions

Rules:
- Do not invent numbers.
- Use only the provided data.
- Do not perform financial calculations yourself.
- Keep the language simple.
- Give practical business-oriented suggestions.
- Clearly distinguish facts from possible explanations.
`;

        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",

            messages: [
                {
                    role: "system",
                    content:
                        "You are VyparIntel, a business intelligence assistant for small businesses.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],

            temperature: 0.3,
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error(
            "VyparMind Error:",
            error.message
        );

        throw new Error(
            "VyparMind failed to generate insight."
        );
    }
};

export default generateBusinessInsight;