
'use server';

import { detectSelfDeception } from '@/ai/flows/detect-self-deception';
import { debateClaim } from '@/ai/flows/debate-claim';
import { generateDefaultSpeech, generateAdvocateSpeech, generateSkepticSpeech } from '@/ai/flows/generate-text-to-speech';
import type { Vertical } from '@/lib/types';

interface AnalyzeClaimInput {
  claim: string;
  verticals: Vertical[];
}

export async function runAnalysis(input: AnalyzeClaimInput) {
  if (!input.claim || !input.verticals || input.verticals.length === 0) {
    throw new Error('Claim and at least one vertical are required.');
  }
  const result = await detectSelfDeception(input);
  return result;
}

interface DebateClaimTextInput {
  claim: string;
  verticals: Vertical[];
}

export async function runDebateText(input: DebateClaimTextInput) {
  if (!input.claim || !input.verticals || input.verticals.length === 0) {
    throw new Error('Claim and at least one vertical are required.');
  }
  const result = await debateClaim(input);
  return result;
}

interface GenerateSpeechInput {
  textToSpeak: string;
}

export async function runDefaultAudio(input: GenerateSpeechInput) {
    if (!input.textToSpeak) {
        throw new Error('Text to speak is required.');
    }
    return await generateDefaultSpeech(input);
}


interface DebateAudioInput {
    advocateText: string;
    skepticText: string;
}

export async function runDebateAudio(input: DebateAudioInput) {
    if (!input.advocateText || !input.skepticText) {
        throw new Error('Advocate and Skeptic text are required to generate audio.');
    }

    const [advocateAudioResult, skepticAudioResult] = await Promise.all([
      (async () => {
        try {
          return await generateAdvocateSpeech({ textToSpeak: input.advocateText });
        } catch (error) {
          console.error("Failed to generate advocate audio:", error);
          return { audioDataUri: '' };
        }
      })(),
      (async () => {
        try {
          return await generateSkepticSpeech({ textToSpeak: input.skepticText });
        } catch (error) {
          console.error("Failed to generate skeptic audio:", error);
          return { audioDataUri: '' };
        }
      })(),
    ]);

    return {
        advocateAudio: advocateAudioResult.audioDataUri,
        skepticAudio: skepticAudioResult.audioDataUri,
    }
}
