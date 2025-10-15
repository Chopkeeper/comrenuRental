import express from 'express';
import { GoogleGenAI } from "@google/genai";
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @desc    Generate a computer description using AI
// @route   POST /api/ai/generate-description
// @access  Private/Admin
router.post('/generate-description', protect, admin, async (req, res) => {
    const { name, purchaseYear } = req.body;

    if (!name || !purchaseYear) {
        return res.status(400).json({ msg: 'Please provide computer name and purchase year' });
    }

    if (!process.env.API_KEY) {
        return res.status(500).json({ msg: "AI feature is not configured on the server." });
    }
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const prompt = `สร้างคำอธิบายการตลาดสั้นๆ ที่น่าสนใจสำหรับคอมพิวเตอร์ชื่อ "${name}" ซึ่งซื้อในปี ${purchaseYear} เน้นที่ความน่าเชื่อถือและความเหมาะสมสำหรับใช้งานระดับมืออาชีพหรือนักศึกษา ให้อยู่ภายใน 50 คำ`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const description = response.text.trim();
        res.json({ description });

    } catch (error) {
        console.error("Error generating description with Gemini API:", error);
        res.status(500).json({ msg: 'Failed to generate AI description' });
    }
});

export default router;
