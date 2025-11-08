import { GoogleGenAI } from "@google/genai";
import { UserRole } from '../types';

// Assume process.env.API_KEY is available
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getNaviAiResponse = async (question: string, role: UserRole): Promise<string> => {
  if (!API_KEY) {
    return "The AI Tutor is currently unavailable. Please check the API configuration.";
  }

  let systemInstruction = `You are NaviAI, an expert academic AI assistant.`;
  if (role === UserRole.Student) {
    systemInstruction = `You are NaviAI, an expert academic tutor for high school students. 
    Your goal is to provide clear, accurate, and concise explanations for any academic question.
    Explain complex topics simply, using examples where helpful.
    If a question is outside of an academic context (e.g., personal advice, inappropriate topics), politely decline to answer and state your purpose as an academic assistant.
    Format your answers using Markdown for readability (e.g., use lists, bold text, and code blocks for code).`;
  } else if (role === UserRole.Teacher) {
    systemInstruction = `You are NaviAI, an expert AI assistant for high school teachers. 
    Your goal is to provide support for lesson planning, creating quiz questions, explaining complex topics in a teachable way, and offering classroom management strategies.
    Provide practical, well-structured, and creative ideas.
    If a question is outside of an educational or classroom context, politely decline to answer and state your purpose as a teaching assistant.
    Format your answers using Markdown for readability (e.g., use lists, bold text, and tables).`;
  }


  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: question,
      config: {
        systemInstruction,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error fetching NaviAI response from Gemini:", error);
    return "Sorry, I encountered an error while processing your request. Please try again later.";
  }
};