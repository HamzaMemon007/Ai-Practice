import { GoogleGenerativeAI } from "@google/generative-ai";






const askGemini = async () => {
    let GEMINI_API_KEY = "AIzaSyAGmbwgDn3dg50z7twbbJIZLBQJAWE7-xo"
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = document.getElementById("userQuerry").value;


    const result = await model.generateContent(prompt);
    console.log(result.response.text());
    document.getElementById("response").innerHTML = result.response.text();
}
