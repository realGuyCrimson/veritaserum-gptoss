
import { config } from 'dotenv';
config();

// Note: The original genkit flows for debate and deception are no longer imported
// as they have been replaced with non-genkit versions using a Hugging Face model.
// import '@/ai/flows/debate-claim.ts';
// import '@/ai/flows/detect-self-deception.ts';

// This import is for the TTS flows, which still use Genkit and Gemini.
import '@/ai/flows/generate-text-to-speech.ts';
