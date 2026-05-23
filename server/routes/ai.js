const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const router = express.Router();
const { protect } = require('../middleware/auth');

// Initialize Gemini API (will throw if GEMINI_API_KEY is missing)
let ai = null;
try {
    if (process.env.GEMINI_API_KEY) {
        ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } else {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('GEMINI_API_KEY is not set. AI proofreading will mock responses.');
        }
    }
} catch (err) {
    if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to initialize Gemini API:', err);
    }
}

/**
 * @route   POST /api/ai/proofread
 * @desc    Analyzes document text for spelling, spacing, and Gen Z vocabulary upgrades.
 * @access  Private
 */
router.post('/proofread', protect, async (req, res) => {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
        return res.status(400).json({ message: 'Valid text is required' });
    }

    if (!ai) {
        // Fallback for when API key is missing (helps with testing if user hasn't added it yet)
        return res.json([
            { id: 'mock-1', type: 'spelling', original: 'teh', replacement: 'the', reason: 'Mock spelling fix (Missing API Key)' }
        ]);
    }

    try {
        const prompt = `
You are an AI proofreading agent tailored for Gen Z users.
Analyze the following text and find:
1. Spelling errors (suggest corrections).
2. Boring vocabulary that can be upgraded to modern Gen Z slang (e.g. good -> fire, bad -> mid, etc.).
3. Multiple consecutive spaces that should be single spaces.

Return the result STRICTLY as a JSON array of objects. Do not include markdown code blocks, just raw JSON.
Each object must have the exact following shape:
{
  "id": "a unique string ID (e.g. spell-word)",
  "type": "spelling" | "vocabulary" | "spacing",
  "original": "the exact string to be replaced in the text",
  "replacement": "the suggested correction or slang",
  "reason": "A short reason (e.g. 'Spelling fix' or 'Gen Z upgrade ✨')"
}

Text to analyze:
"${text}"
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.2,
                responseMimeType: 'application/json'
            }
        });

        const jsonString = response.text;
        let parsed;
        try {
            parsed = JSON.parse(jsonString);
        } catch (e) {
            // Attempt to strip markdown if the model ignored the instruction
            const cleaned = jsonString.replace(/^```(?:json)?|```$/gm, '').trim();
            parsed = JSON.parse(cleaned);
        }

        if (!Array.isArray(parsed)) {
            parsed = [];
        }

        res.json(parsed);
    } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Gemini API Error:', err);
        }
        res.status(500).json({ message: 'AI processing failed' });
    }
});

module.exports = router;
