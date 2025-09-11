
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Instance for deception detection flow
export const aiDetectDeception = genkit({
  plugins: [googleAI({
    apiKey: process.env.GEMINI_API_KEY_DETECT_DECEPTION || process.env.GEMINI_API_KEY
  })],
  model: 'googleai/gemini-2.5-flash',
});

// Instance for debate claim flow
export const aiDebateClaim = genkit({
  plugins: [googleAI({
    apiKey: process.env.GEMINI_API_KEY_DEBATE_CLAIM || process.env.GEMINI_API_KEY
  })],
  model: 'googleai/gemini-2.5-flash',
});

// Main TTS instance for Default speaker
export const aiTtsDefault = genkit({
    plugins: [googleAI({
      apiKey: process.env.GEMINI_API_KEY_TTS_DEFAULT || process.env.GEMINI_API_KEY_TTS || process.env.GEMINI_API_KEY
    })],
});

// TTS instance for Advocate speaker
export const aiTtsAdvocate = genkit({
    plugins: [googleAI({
      apiKey: process.env.GEMINI_API_KEY_TTS_ADVOCATE || process.env.GEMINI_API_KEY_TTS || process.env.GEMINI_API_KEY
    })],
});

// TTS instance for Skeptic speaker
export const aiTtsSkeptic = genkit({
    plugins: [googleAI({
      apiKey: process.env.GEMINI_API_KEY_TTS_SKEPTIC || process.env.GEMINI_API_KEY_TTS || process.env.GEMINI_API_KEY
    })],
});
