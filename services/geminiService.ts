
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateComputerDescription = async (name: string, purchaseYear: number): Promise<string> => {
    if (!process.env.API_KEY) {
        return "AI description generation is unavailable. API key is missing.";
    }

    const prompt = `Generate a brief, appealing marketing description for a computer named "${name}", purchased in ${purchaseYear}. Focus on its potential for reliability and suitability for professional or student use. Keep it under 25 words.`;

    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating description with Gemini API:", error);
        return `Failed to generate AI description for ${name}.`;
    }
};
