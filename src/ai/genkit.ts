import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

const isDev = process.env.NODE_ENV !== "production";

export const ai = genkit({
  plugins: isDev ? [googleAI()] : [],
  model: isDev ? "googleai/gemini-2.5-flash" : undefined,
});
