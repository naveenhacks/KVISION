import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Gets a response from the Gemini AI model.
 * @param prompt The user's input.
 * @param role The role of the user (student or teacher) to tailor the system instruction.
 * @returns The AI's text response.
 */
export const getAiResponse = async (prompt: string, role: string): Promise<string> => {
  try {
    const systemInstruction = role === 'student'
      ? "You are NaviAI, a friendly and helpful study assistant for a student at Kendriya Vidyalaya Unnao. Your goal is to explain concepts clearly, concisely, and in an encouraging tone. Help with homework, clarify doubts, and make learning engaging. Keep responses focused on educational content."
      : "You are NaviAI, a professional and insightful teaching assistant for a teacher at Kendriya Vidyalaya Unnao. Provide support for lesson plans, creating class materials, generating quiz questions, and offering pedagogical suggestions. Your responses should be practical and well-structured.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "I'm sorry, I encountered an error while processing your request. Please check your connection or try again later.";
  }
};