
import { GoogleGenAI } from "@google/genai";

// FIX: Per coding guidelines, API key must be read from process.env.API_KEY.
// The original code used import.meta.env.VITE_API_KEY which caused a type error.
if (!process.env.API_KEY) {
  // FIX: Updated warning message to reference API_KEY instead of VITE_API_KEY.
  console.warn("ไม่พบ Gemini API key ฟีเจอร์ AI จะถูกปิดใช้งาน กรุณาตั้งค่าตัวแปร API_KEY ในการตั้งค่า deployment ของคุณ");
}

export const generateComputerDescription = async (name: string, purchaseYear: number): Promise<string> => {
    // Check for the key again inside the function to be safe
    if (!process.env.API_KEY) {
        return "การสร้างคำอธิบายด้วย AI ไม่พร้อมใช้งานเนื่องจากไม่มี API key";
    }

    // Initialize the AI client only when the function is called and the key exists
    // FIX: Per coding guidelines, initialize with process.env.API_KEY directly.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `สร้างคำอธิบายการตลาดสั้นๆ ที่น่าสนใจสำหรับคอมพิวเตอร์ชื่อ "${name}" ซึ่งซื้อในปี ${purchaseYear} เน้นที่ความน่าเชื่อถือและความเหมาะสมสำหรับใช้งานระดับมืออาชีพหรือนักศึกษา ให้อยู่ภายใน 50 คำ`;

    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating description with Gemini API:", error);
        return `สร้างคำอธิบายด้วย AI สำหรับ ${name} ไม่สำเร็จ`;
    }
};