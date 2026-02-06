
import { GoogleGenAI, Type } from "@google/genai";
import { SummarizeParams, SummaryResult } from "../types";

export const summarizeContent = async (params: SummarizeParams): Promise<SummaryResult> => {
  const { text, imageBase64, mimeType } = params;
  
  // Use process.env.API_KEY as per requirements
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure the API_KEY environment variable is set in your hosting provider's dashboard.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Analyze the provided content and return a JSON object.
    1. "detailedSummary": Comprehensive Markdown analysis with bullet points.
    2. "shortSummary": A single, impactful sentence (max 15 words) suitable for a scrolling ticker.
  `;

  const parts: any[] = [{ text: prompt }];

  if (text) {
    parts.push({ text: `Input Text: ${text}` });
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
              description: "Markdown detailed summary.",
            },
            shortSummary: {
              type: Type.STRING,
              description: "Concise headline summary.",
            },
          },
          required: ["detailedSummary", "shortSummary"],
        },
      },
    });

    // Handle cases where model might still return markdown-wrapped JSON
    let rawText = response.text || "";
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : rawText;

    const result = JSON.parse(cleanJson);
    return {
      detailedSummary: result.detailedSummary || "No detailed summary available.",
      shortSummary: result.shortSummary || "No highlight available.",
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("403")) {
      throw new Error("Access Denied (403): Your API Key might be restricted or invalid.");
    }
    if (error.message?.includes("404")) {
      throw new Error("Model not found (404): The specified Gemini model is unavailable.");
    }
    throw new Error(error.message || "An unexpected error occurred during AI synthesis.");
  }
};
