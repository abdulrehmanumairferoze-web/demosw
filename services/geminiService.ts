
import { GoogleGenAI, Type } from "@google/genai";
import { DepartmentMismatch } from "../types";

export interface SummaryResult {
  executiveSummary: string;
  trendAnalysis: string;
  actions: string[];
}

export const summarizeOperations = async (
  currentData: DepartmentMismatch[],
  previousSummary?: string
): Promise<SummaryResult> => {
  // Always create a new instance right before the call to ensure the latest API key/context is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT' });
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    You are an AI Executive Assistant for the owner of a Pharmaceutical company.
    Analyze the following department mismatches (Actual vs Plan).
    
    IMPORTANT CONTEXT:
    - All monetary values are in PKR (Pakistani Rupee).
    - Sales data is pulled from MREP (https://swiss.mrep.com.pk/Home/Index).
    - Previous Summary Context: ${previousSummary || "No previous report available for comparison."}
    
    GOAL:
    1. Compare current mismatches against the previous summary to highlight if performance is improving or deteriorating.
    2. Provide a 2-3 sentence executive brief.
    3. Identify 3-4 critical action items.
    
    Current Data:
    ${JSON.stringify(currentData, null, 2)}
    
    Provide the response in the following JSON format:
    {
      "executiveSummary": "Concise overview for the owner.",
      "trendAnalysis": "Specific comparison to previous performance (e.g., 'Sales gap widened by 5% since yesterday').",
      "actions": ["Action item 1", "Action item 2", "..."]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            trendAnalysis: { type: Type.STRING },
            actions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["executiveSummary", "trendAnalysis", "actions"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text) as SummaryResult;
  } catch (error) {
    console.error("Gemini Service Error:", error);
    // Graceful fallback for the UI
    return {
      executiveSummary: "System is currently summarizing departmental data. Please refresh or check individual sheets for raw mismatches.",
      trendAnalysis: "Historical comparison is temporarily unavailable due to a network sync error.",
      actions: ["Check ERP/MREP connection stability", "Manual review of Business Development sheet recommended"]
    };
  }
};
