const express = require("express");
const OpenAI = require("openai");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const allowedCategories = [
  "Food & Drinks",
  "Transport",
  "Bills & Utilities",
  "Rent & Housing",
  "Shopping",
  "Health & Wellness",
  "Entertainment",
  "Gifts & Donations",
  "Education",
  "Miscellaneous",
];

async function categorizeExpense(text) {
  const prompt = `Extract the amount and match it to one of these categories: ${allowedCategories.join(
    ", "
  )} from ${text}.
  Example: "Spent 100Rs in Briyani" → {"amount": 100, "category": "Food & Drinks"}
  Return JSON only. Also validate the prompt if there is no amount present or return { amount: 0, category: "Unknown" }`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 50,
    });

    return JSON.parse(
      response.choices[0].message.content.replace(/```json|```/g, "").trim()
    );
  } catch (error) {
    console.error("Error categorizing expense:", error);
    return { amount: 0, category: "Unknown" };
  }
}

app.use(cors());
app.use(bodyParser.json());

app.post("/categorize", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text input is required" });
  }

  const result = await categorizeExpense(text);
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
