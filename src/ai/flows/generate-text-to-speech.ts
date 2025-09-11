
'use server';

/**
 * @fileOverview Converts text to speech using dedicated Genkit flows for each speaker type.
 *
 * @exports `generateDefaultSpeech` - Converts text to speech with the default voice.
 * @exports `generateAdvocateSpeech` - Converts text to speech with the advocate voice.
 * @exports `generateSkepticSpeech` - Converts text to speech with the skeptic voice.
 */

import { aiTtsDefault, aiTtsAdvocate, aiTtsSkeptic } from '@/ai/genkit-instances';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';
import wav from 'wav';

const GenerateSpeechInputSchema = z.object({
  textToSpeak: z.string().describe('The text to be converted to speech.'),
});
type GenerateSpeechInput = z.infer<typeof GenerateSpeechInputSchema>;

const GenerateSpeechOutputSchema = z.object({
  audioDataUri: z.string().describe("A data URI of the generated audio. Expected format: 'data:audio/wav;base64,<encoded_data>'."),
});
type GenerateSpeechOutput = z.infer<typeof GenerateSpeechOutputSchema>;

// Helper function to convert PCM data to WAV format
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));
    writer.write(pcmData);
    writer.end();
  });
}

// Generic flow generator
const createSpeechFlow = (
  flowName: string,
  instance: typeof aiTtsDefault, // The type is compatible, so we can use one for the signature
  voiceName: string
) => {
  const flow = instance.defineFlow(
    {
      name: flowName,
      inputSchema: GenerateSpeechInputSchema,
      outputSchema: GenerateSpeechOutputSchema,
    },
    async ({ textToSpeak }) => {
      const maxRetries = 3;
      let lastError: Error | null = null;

      for (let i = 0; i < maxRetries; i++) {
        try {
          const { media } = await instance.generate({
            model: googleAI.model('gemini-2.5-flash-preview-tts'),
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: voiceName },
                },
              },
            },
            prompt: textToSpeak,
          });

          if (!media || !media.url) {
            throw new Error('No media returned from TTS model.');
          }

          const audioBuffer = Buffer.from(
            media.url.substring(media.url.indexOf(',') + 1),
            'base64'
          );
          const wavBase64 = await toWav(audioBuffer);

          return {
            audioDataUri: 'data:audio/wav;base64,' + wavBase64,
          };
        } catch (error) {
          lastError = error as Error;
          console.warn(`TTS attempt ${i + 1} for ${flowName} failed. Retrying...`, lastError.message);
          if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      }
      throw new Error(`Failed to generate TTS for ${flowName} after ${maxRetries} attempts. Last error: ${lastError?.message}`);
    }
  );
  return (input: GenerateSpeechInput): Promise<GenerateSpeechOutput> => flow(input);
};

// Create and export a function for each speaker
export const generateDefaultSpeech = createSpeechFlow('generateDefaultSpeechFlow', aiTtsDefault, 'Algenib');
export const generateAdvocateSpeech = createSpeechFlow('generateAdvocateSpeechFlow', aiTtsAdvocate, 'Achernar');
export const generateSkepticSpeech = createSpeechFlow('generateSkepticSpeechFlow', aiTtsSkeptic, 'Algenib');
