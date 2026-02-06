
import { GoogleGenAI, Type } from "@google/genai";
import { SummarizeParams, SummaryResult } from "../types";

export const summarizeContent = async (params: SummarizeParams): Promise<SummaryResult> => {
  const { text, imageBase64, mimeType } = params;
  
  if (!process.env.API_KEY) {
    throw new Error("API Key not found.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze the provided content. 
    1. Create a "detailedSummary": Use Markdown with bullet points for key takeaways.
    2. Create a "shortSummary": A single, punchy, and understandable sentence (max 20 words) that captures the core essence, like a headline or a key insight card.
  `;

  const parts: any[] = [{ text: prompt }];

  if (text) {
    parts.push({ text: `Content: ${text}` });
  }

  if (imageBase64 && mimeType) {
    parts.push({
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detailedSummary: {
              type: Type.STRING,
              description: "Markdown formatted detailed summary.",
            },
            shortSummary: {
              type: Type.STRING,
              description: "A very brief, one-sentence summary (max 20 words).",
            },
          },
          required: ["detailedSummary", "shortSummary"],
        },
      },
    });

    const result = JSON.parse(response.text);
    return {
      detailedSummary: result.detailedSummary || "No detailed summary available.",
      shortSummary: result.shortSummary || "No highlight available.",
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate insight. Please check your input and try again.");
  }
};
