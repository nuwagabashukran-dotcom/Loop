import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface GeneratedEffect {
  id: string;
  label: string;
  type: string;
  icon: string;
  description: string;
}

export const generateCustomEffect = async (userInput: string): Promise<GeneratedEffect> => {
  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a creative video effect for a short-form video app (similar to TikTok) based on this description: "${userInput}". 
    The effect should have a catchy name, a representative emoji, and a brief technical description.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, description: "Catcy name of the effect" },
          type: { type: Type.STRING, description: "Category of the effect (e.g., Visual, Motion, Lighting)" },
          icon: { type: Type.STRING, description: "A single representative emoji" },
          description: { type: Type.STRING, description: "Brief description of what the effect does visually" }
        },
        required: ["label", "type", "icon", "description"]
      }
    }
  });

  const data = JSON.parse(result.text);
  return {
    ...data,
    id: `ai-${Date.now()}`
  };
};
