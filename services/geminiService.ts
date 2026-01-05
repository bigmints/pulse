
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Article } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateArticleData = async (url: string, rawText: string): Promise<Partial<Article>> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following content from URL (${url}): ${rawText}. 
    Provide a title, a short 1-sentence description, a detailed summary (3 paragraphs), and a category.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          shortDescription: { type: Type.STRING },
          fullSummary: { type: Type.STRING },
          category: { type: Type.STRING }
        },
        required: ["title", "shortDescription", "fullSummary", "category"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    url,
    date: new Date().toISOString()
  };
};

export const generateHeroImage = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `Create a minimalist, high-quality, conceptual editorial illustration for an article about: ${prompt}. Style: Clean, modern, soft lighting, 16:9 aspect ratio.` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return 'https://picsum.photos/1200/675';
};
