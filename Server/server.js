const express = require('express')
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

let GEMINI_API_KEY = "AIzaSyAGmbwgDn3dg50z7twbbJIZLBQJAWE7-xo"

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
    res.send(result.response.text());
    console.log(result.response.text());
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})