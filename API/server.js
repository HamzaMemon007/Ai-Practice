// api/ask-gemini.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = "AIzaSyAGmbwgDn3dg50z7twbbJIZLBQJAWE7-xo";

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const userPrompt = req.body.userPrompt;
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        try {
            const result = await model.generateContent(userPrompt);
            res.status(200).json({ response: result.response.text() });
        } catch (error) {
            res.status(500).json({ error: "Something went wrong!" });
        }
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
};
