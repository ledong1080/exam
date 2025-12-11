
import { GoogleGenAI } from "@google/genai";
import { LATEX_MATH_CONFIG } from "../utils/common";

export const callGeminiAPI = async (prompt: string): Promise<string> => {
  // Use a safe access pattern for process.env
  // In pure browser environments (like standard imports), 'process' might be undefined
  let apiKey = '';
  try {
    // Vite defines process.env.API_KEY as a string literal replacement during build
    // but we check existence to avoid runtime reference errors
    apiKey = process.env.API_KEY || '';
  } catch (e) {
    console.warn("process.env is not available in this environment.");
  }

  if (!apiKey) {
    return "Chưa cấu hình API Key.";
  }

  const ai = new GoogleGenAI({ apiKey });
  const delays = [1000, 2000, 4000];

  // Xây dựng System Instruction dựa trên cấu hình LaTeX
  const systemInstruction = `
    You are a helpful AI tutor for a quiz application.
    IMPORTANT: You must strictly follow these LaTeX formatting rules for Math, Physics, and Chemistry formulas:
    ${JSON.stringify(LATEX_MATH_CONFIG, null, 2)}
    
    When explaining or providing hints:
    1. Use \\( ... \\) for inline math.
    2. Use \\[ ... \\] for display math.
    3. Use the specific symbols defined in the 'symbols' section (e.g., \\angle, \\triangle, \\ce{} for chemistry).
    4. Format your response with clear Markdown (headers ###, bold **, bullet points -).
  `;

  for (let i = 0; i <= delays.length; i++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${systemInstruction}\n\nUser Question/Prompt: ${prompt}`,
      });
      return response.text || "Không thể tạo nội dung.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      if (i === delays.length) return "AI bận.";
      await new Promise(r => setTimeout(r, delays[i]));
    }
  }
  return "Lỗi kết nối.";
};

export const getAIHint = callGeminiAPI;
    