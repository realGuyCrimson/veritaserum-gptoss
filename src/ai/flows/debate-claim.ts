'use server';

/**
 * @fileOverview This file defines a function for engaging in a debate about a user's claim using a Hugging Face model.
 *
 * The function takes a user's claim as input and generates a debate between an Advocate and a Skeptic agent.
 * The goal is to provide evidence-backed pushback and challenge the user's claim to help the user evaluate potential drawbacks.
 *
 * @exports `debateClaim` - An async function that initiates the debate flow.
 * @exports `DebateClaimInput` - The input type for the `debateClaim` function.
 * @exports `DebateClaimOutput` - The output type for the `debateClaim` function.
 */

import { z } from 'zod';
import { hfClient } from '@/ai/hf-client';

const DebateClaimInputSchema = z.object({
  claim: z.string().describe('The claim made by the user.'),
  verticals: z
    .array(z.enum(['Finance', 'Fitness', 'Career', 'Relationships', 'Famous Personas', 'History', 'Medicine']))
    .describe('The verticals to which the claim belongs.'),
});
export type DebateClaimInput = z.infer<typeof DebateClaimInputSchema>;

const DebateClaimOutputSchema = z.object({
  advocateText: z.string().describe("The Advocate's arguments, presenting a strong case in favor of the user's claim."),
  skepticText: z.string().describe("The Skeptic's arguments, providing evidence-backed pushback and challenging the user's claim."),
});
export type DebateClaimOutput = z.infer<typeof DebateClaimOutputSchema>;

export async function debateClaim(input: DebateClaimInput): Promise<DebateClaimOutput> {
  const systemPrompt = `You are facilitating a debate between an Advocate and a Skeptic regarding a user's claim. The Advocate will provide arguments in favor of the claim, while the Skeptic will raise concerns and counter-arguments. The goal is to provide a balanced perspective to help the user evaluate the claim critically. Please provide the arguments for the Advocate and the Skeptic separately. Each should have only one turn. Do not include the speaker's name (e.g., "Advocate:") in the text itself.

You MUST ONLY respond with a single, valid JSON object with the following structure:
{
  "advocateText": "...",
  "skepticText": "..."
}
Do not add any other text or explanation before or after the JSON object.`;

  const userPrompt = `Here is the user's claim and its context.
  Claim: "${input.claim}"
  Verticals: ${input.verticals.join(', ')}`;

  const chatCompletion = await hfClient.chat.completions.create({
    model: "openai/gpt-oss-120b:cerebras",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const responseContent = chatCompletion.choices[0].message.content;
  if (!responseContent) {
    throw new Error('Received an empty response from the Hugging Face model.');
  }
  
  // The model's response is a JSON string, so we need to parse it.
  const parsedResponse = JSON.parse(responseContent);

  // Validate the parsed response against our Zod schema
  const validationResult = DebateClaimOutputSchema.safeParse(parsedResponse);
  if (!validationResult.success) {
    console.error("Hugging Face API response validation error:", validationResult.error);
    throw new Error("The model's response did not match the expected format.");
  }
  
  return validationResult.data;
}
