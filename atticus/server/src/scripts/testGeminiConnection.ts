import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

/**
 * Tests the validity of the Gemini API key and the API connection.
 */
async function testKey(): Promise<void> {
  // Retrieve the API key from environment variables
  const apiKey: string | undefined = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ Error: GEMINI_API_KEY is not set in your .env file.");
    return;
  }

  try {
    // 1. Initialize the client using the correct pattern
    const genAI = new GoogleGenAI({ apiKey, apiVersion: "v1"});

    // 2. Call the generateContent method directly on the client instance
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello! Confirm that you received this message and are listening.",
    });

    // 3. Access the generated text directly from the result object
    const responseText = result.text;
    
    // 4. Successful validation
    console.log("✅ API Key is valid and the Gemini API is listening!");
    if (responseText) {
        console.log("Response (Snippet):", responseText.trim().substring(0, 100) + "...");
    } else {
        console.error("❌ Error: Response text is undefined.");
    }

  } catch (error) {
    // 5. Robust error handling
    console.error("❌ API Key check FAILED.");
    
    // The error object type is unknown in a catch block, so we check if it has a message property
    if (error instanceof Error) {
        console.error("Error Details:", error.message);
        if (error.message.includes("API key not valid")) {
            console.error("💡 Action: Double-check your API key for typos or ensure it hasn't expired.");
        }
    } else {
        console.error("An unknown error occurred:", error);
    }
  }
}

testKey();