import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

console.log("PROJECT:", process.env.GOOGLE_CLOUD_PROJECT);
console.log("GENAI KEY:", process.env.GOOGLE_GENAI_API_KEY ? "FOUND" : "MISSING");

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
