
import { GoogleGenAI, Type } from "@google/genai";
import { SummarizeParams, SummaryResult } from "../types";

export const summarizeContent = async (params: SummarizeParams): Promise<SummaryResult> => {
  const { text, imageBase64, mimeType } = params;
  
  /**
   * IMPORTANT: The 'sed' command in Netlify replaces the string below.
   * If you see 'process.env.API_KEY' in your browser console, the sed command failed.
   */
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || (typeof apiKey === 'string' && apiKey.includes("process.env"))) {
    throw new Error(
      "AI NODE OFFLINE: Key Injection Failed. Check Netlify Environment Variables and Build Command."
    );
  }

  const ai = new GoogleGenAI({ apiKey: apiKey as string });
  
  const systemInstruction = `
    You are 'InsightDash', an AI node.
    Return a JSON object with:
    1. "detailedSummary": Markdown analysis.
    2. "shortSummary": One-sentence headline + emoji.
  `;

  const parts: any[] = [];
  if (text) parts.push({ text: `Analyze this: ${text}` });
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
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detailedSummary: { type: Type.STRING },
            shortSummary: { type: Type.STRING },
          },
          required: ["detailedSummary", "shortSummary"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      detailedSummary: result.detailedSummary || "No detailed summary provided.",
      shortSummary: result.shortSummary || "Update Received 📡",
    };
  } catch (error: any) {
    console.error("AI Node Error:", error);
    throw new Error(error.message || "Uplink Failed.");
  }
};
