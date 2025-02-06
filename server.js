const express = require('express')
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

let GEMINI_API_KEY = process.env.GEMINI_API_KEY

const app = express()
const port = 3000

app.use(cors()); // Allow requests from other origins
app.use(express.json());


app.use(express.static('public'));


app.post('/ask-gemini', async(req, res) => {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


    let userPrompt = req.body.userPrompt;
    // userPrompt.toLowerCase()
    
    const prompt = userPrompt;


    const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        res.json({ response: responseText });
        console.log(responseText);
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})