import { GoogleGenAI, Type } from "@google/genai";
import { SuburbData } from "../types";

const processEnvApiKey = process.env.API_KEY;

export const fetchSuburbData = async (query: string): Promise<SuburbData[]> => {
  if (!processEnvApiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is available.");
  }

  const ai = new GoogleGenAI({ apiKey: processEnvApiKey });

  const isNumeric = /^\d+$/.test(query.trim());
  let promptInstructions = "";

  if (isNumeric) {
    const count = parseInt(query.trim(), 10);
    promptInstructions = `
      Generate a dataset of exactly ${count} unique Australian suburbs selected randomly from across the entire country.
      
      CRITICAL REQUIREMENTS:
      - The selection MUST be diverse. Include suburbs from different states (NSW, VIC, QLD, WA, SA, TAS, NT, ACT).
      - Include a mix of Inner City, Suburban, and Regional/Rural locations.
      - Do NOT just list suburbs from one city. Randomize the selection heavily.
      - DO NOT INCLUDE DUPLICATE SUBURBS. Each suburb in the list must be unique.
    `;
  } else {
    promptInstructions = `
      Generate a comprehensive list of Australian suburbs matching the following query: "${query}".
      
      IMPORTANT: If the query specifies multiple locations (e.g., "Sydney, Melbourne, Brisbane"), ensure you provide a representative selection of suburbs from EACH location specified. Do not focus on just one.
      Provide as many accurate results as possible matching the query (aim for 30-50 results if multiple locations are requested, or 20-30 for single locations).
      Ensure there are no duplicate suburbs in the response.
    `;
  }

  const prompt = `
    ${promptInstructions}

    For each suburb, you must provide:
    1. Suburb Name
    2. Postcode
    3. Longitude (approximate center)
    4. Latitude (approximate center)
    5. Top 5 nearest neighboring suburbs (as a list of strings)
    6. Local Government Area (LGA)
    7. State (Abbreviation, e.g., NSW, VIC)
    8. Region (e.g., Greater Sydney, Gold Coast, Inner Melbourne)
    9. Top 5 Industries (key industries employing people in this area, e.g., Retail, Healthcare)
    10. Google Search Count (Estimated average monthly search volume as a numeric integer, e.g., 12500. If unknown, estimate based on population size and popularity)

    Ensure the data is real and accurate to the best of your knowledge.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              suburbName: { type: Type.STRING },
              postcode: { type: Type.STRING },
              longitude: { type: Type.NUMBER },
              latitude: { type: Type.NUMBER },
              top5NearSuburbs: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              lga: { type: Type.STRING },
              state: { type: Type.STRING },
              region: { type: Type.STRING },
              top5Industries: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              googleSearchCount: { type: Type.NUMBER }
            },
            required: [
              "suburbName", "postcode", "longitude", "latitude", 
              "top5NearSuburbs", "lga", "state", "region",
              "top5Industries", "googleSearchCount"
            ]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      return [];
    }

    const data = JSON.parse(jsonText) as SuburbData[];
    return data;

  } catch (error) {
    console.error("Error fetching suburb data:", error);
    throw new Error("Failed to retrieve suburb data. Please try again.");
  }
};