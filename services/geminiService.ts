
import { GoogleGenAI } from "@google/genai";

// FIX: Per coding guidelines, API key must be read from process.env.API_KEY.
// The original code used import.meta.env.VITE_API_KEY which caused a type error.
if (!process.env.API_KEY) {
  // FIX: Updated warning message to reference API_KEY instead of VITE_API_KEY.
  console.warn("Gemini API key not found. AI features will be disabled. Please set the API_KEY environment variable in your deployment settings.");
}

export const generateComputerDescription = async (name: string, purchaseYear: number): Promise<string> => {
    // Check for the key again inside the function to be safe
    if (!process.env.API_KEY) {
        return "AI description generation is unavailable. API key is missing.";
    }

    // Initialize the AI client only when the function is called and the key exists
    // FIX: Per coding guidelines, initialize with process.env.API_KEY directly.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
