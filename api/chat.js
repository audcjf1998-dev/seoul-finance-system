export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "POST 요청만 허용됩니다." });
    }

    try {
        const { message } = req.body;

        const response = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-5",
                input: message,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        return res.status(200).json({
            answer: data.output_text,
        });
    } catch (error) {
        return res.status(500).json({
            error: "GPT 호출 중 오류가 발생했습니다.",
        });
    }
}