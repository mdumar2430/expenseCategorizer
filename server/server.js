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
    const prompt = `Extract the amount and categorize the expense into one of these categories: ${allowedCategories.join(", ")} based on the given text: "${text}".

    ### Rules:
    1. Identify the amount from the text. If no amount is found, return: {"amount": 0, "category": "Unknown"}.
    2. Understand the context of the text and classify it correctly based on Indian expense categories.
    3. **Mapping Guidelines:**
       - **Food & Drinks**: Include all fruits, vegetables, meals, snacks, groceries, restaurants, and beverages.
       - **Transport**: Cover taxis, auto-rickshaws, fuel, metro, bus, and train fares.
       - **Bills & Utilities**: Include electricity, water, gas, phone, and internet bills.
       - **Rent & Housing**: Cover rent payments, maintenance charges, and home-related expenses.
       - **Shopping**: Include purchases like clothes, gadgets, electronics, and accessories.
       - **Health & Wellness**: Include doctor visits, medicines, hospital bills, and gym memberships.
       - **Entertainment**: Cover movies, subscriptions, outings, and events.
       - **Gifts & Donations**: Include charitable donations, gifting expenses, and religious offerings.
       - **Education**: Cover tuition fees, books, online courses, and learning materials.
       - **Miscellaneous**: Assign this category only if none of the above match.
    
    ### Examples:
    - "Spent 100Rs on Biryani" → {"amount": 100, "category": "Food & Drinks"}
    - "Bought vegetables for 200" → {"amount": 200, "category": "Food & Drinks"}
    - "Took a cab for 250Rs" → {"amount": 250, "category": "Transport"}
    - "Electricity bill was 1200Rs" → {"amount": 1200, "category": "Bills & Utilities"}
    - "Paid rent of 5000" → {"amount": 5000, "category": "Rent & Housing"}
    - "Purchased a mobile for 20,000Rs" → {"amount": 20000, "category": "Shopping"}
    - "Doctor consultation, paid 1500Rs" → {"amount": 1500, "category": "Health & Wellness"}
    - "Netflix subscription for 500Rs" → {"amount": 500, "category": "Entertainment"}
    - "Random text with no amount" → {"amount": 0, "category": "Unknown"}
    
    Ensure the response is **always valid JSON** with no additional text.`;
    
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
