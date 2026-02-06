
import { GoogleGenAI, Type } from "@google/genai";
import { SummarizeParams, SummaryResult } from "../types";

export const summarizeContent = async (params: SummarizeParams): Promise<SummaryResult> => {
  const { text, imageBase64, mimeType } = params;
  
  /**
   * TARGET FOR NETLIFY BUILD COMMAND:
   * Your 'sed' command looks for the exact string 'process.env.API_KEY'.
   * It will replace it with your actual key during deployment.
   */
  const apiKey = process.env.API_KEY;
  
  // Validation logic to check if 'sed' succeeded
  const isKeyInvalid = !apiKey || 
                       apiKey === "undefined" || 
                       (typeof apiKey === 'string' && apiKey.includes("process.env"));

  if (isKeyInvalid) {
    throw new Error(
      "AI NODE OFFLINE: Key Injection Failed. " +
      "1. Check your Netlify Environment Variables for 'API_KEY'. " +
      "2. Ensure Build Command is: sed -i \"s|process.env.API_KEY|'$API_KEY'|g\" services/geminiService.ts"
    );
  }

  const ai = new GoogleGenAI({ apiKey: apiKey as string });
  
  const systemInstruction = `
    You are 'InsightDash', an advanced campus AI node.
    Return a JSON response with:
    1. "detailedSummary": Comprehensive Markdown with bullet points.
    2. "shortSummary": A 1-sentence headline + 1 emoji.
  `;

  const parts: any[] = [];
  if (text) parts.push({ text: `Analyze text: ${text}` });
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

    const rawText = response.text || "{}";
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleanJson);

    return {
      detailedSummary: result.detailedSummary || "No detailed summary available.",
      shortSummary: result.shortSummary || "New update received! 📡",
    };
  } catch (error: any) {
    console.error("AI Error:", error);
    if (error.message?.includes("403")) {
      throw new Error("AUTH ERROR: Check if your API Key is valid and has billing enabled.");
    }
    throw new Error(error.message || "Synthesis failed. Uplink timed out.");
  }
};
