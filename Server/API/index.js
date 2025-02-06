const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Secure API Key via environment variables

app.post('/ask-gemini', async (req, res) => {
    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const userPrompt = req.body.userPrompt;
        const result = await model.generateContent(userPrompt);

        res.status(200).json({ response: result.response.text() });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Failed to get response from Gemini AI" });
    }
});

// Export Express.js app for Vercel
module.exports = app;
