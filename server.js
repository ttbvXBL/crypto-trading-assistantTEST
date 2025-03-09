const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const BINANCE_API_URL = "https://api.binance.com/api/v3";
const AI_API_URL = "http://localhost:5001/analyze";
const SENTIMENT_API_URL = "http://localhost:5002/sentiment";

app.get("/api/market-data", async (req, res) => {
    try {
        const { symbol } = req.query;
        if (!symbol) return res.status(400).json({ error: "Symbol is required" });

        const response = await axios.get(`${BINANCE_API_URL}/ticker/24hr`, {
            params: { symbol: symbol.toUpperCase() }
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch market data" });
    }
});

app.post("/api/trade-analysis", async (req, res) => {
    try {
        const { coin, budget, timeLimit } = req.body;
        const aiResponse = await axios.post(AI_API_URL, { coin, budget, timeLimit });
        const sentimentResponse = await axios.post(SENTIMENT_API_URL, { coin });

        const tradeData = aiResponse.data;
        const sentimentData = sentimentResponse.data;

        const result = { ...tradeData, sentiment: sentimentData.sentiment, news_articles: sentimentData.news_articles };
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to analyze trade data" });
    }
});

app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });
