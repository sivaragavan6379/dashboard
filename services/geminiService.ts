
import { GoogleGenAI, Type } from "@google/genai";
import { SummarizeParams, SummaryResult } from "../types";

export const summarizeContent = async (params: SummarizeParams): Promise<SummaryResult> => {
  const { text, imageBase64, mimeType } = params;
  
  // The Netlify build command 'sed' will replace the text below with your actual key.
  // DO NOT change the line below manually; let the build command handle it.
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || (typeof apiKey === 'string' && apiKey.includes("process.env"))) {
    throw new Error(
      "AI NODE OFFLINE: Key Injection Failed. " +
      "Ensure Netlify Build Command is: sed -i \"s|process.env.API_KEY|'$API_KEY'|g\" services/geminiService.ts " +
      "and Publish Directory is set to '.'"
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Analyze the provided content and return a JSON object.
    1. "detailedSummary": Comprehensive Markdown analysis with bullet points.
    2. "shortSummary": A single, impactful sentence (max 15 words) with an emoji.
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
            detailedSummary: { type: Type.STRING },
            shortSummary: { type: Type.STRING },
          },
          required: ["detailedSummary", "shortSummary"],
        },
      },
    });

    // Strip markdown code blocks if the model includes them
    let rawText = response.text || "";
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    const result = JSON.parse(cleanJson);
    return {
      detailedSummary: result.detailedSummary || "Summary generation successful, but no detail provided.",
      shortSummary: result.shortSummary || "New update received! 📡",
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("403")) {
      throw new Error("Access Denied (403): Check if your API Key has Gemini API enabled in Google AI Studio.");
    }
    throw new Error(error.message || "The AI node is currently unreachable. Check your internet connection.");
  }
};
