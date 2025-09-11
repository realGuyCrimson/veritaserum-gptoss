'use server';

/**
 * @fileOverview Detects potential self-deception in claims across various verticals using a multi-dimensional risk model via a Hugging Face model.
 *
 * - detectSelfDeception - A function that detects self-deception.
 * - DetectSelfDeceptionInput - The input type for the detectSelfDeception function.
 * - DetectSelfDeceptionOutput - The return type for the detectSelfDeception function.
 */

import { z } from 'zod';
import { hfClient } from '@/ai/hf-client';

const DetectSelfDeceptionInputSchema = z.object({
  claim: z.string().describe('The user claim related to personal finance or fitness.'),
  verticals: z
    .array(z.enum(['Finance', 'Fitness', 'Career', 'Relationships', 'Famous Personas', 'History', 'Medicine']))
    .describe('The verticals that the claim belongs to.'),
});
export type DetectSelfDeceptionInput = z.infer<typeof DetectSelfDeceptionInputSchema>;

const DiagnosisItemSchema = z.object({
  bias: z.string().describe("The name of the cognitive bias or deceptive pattern detected (e.g., 'Cognitive Bias', 'Emotional Manipulation', 'Context Distortion')."),
  diagnosis: z.string().describe("A brief, one-sentence diagnosis of how this bias applies to the user's claim."),
  riskScore: z.number().min(0).max(1).describe("A risk score from 0 to 1 for this specific dimension."),
});

const DetectSelfDeceptionOutputSchema = z.object({
  deceptionRiskScore: z.number().min(0).max(1).describe('An overall score from 0 to 1 indicating the total risk of self-deception, derived from the various dimensions.'),
  tldr: z.string().describe("A very short, one-sentence summary of the core issue."),
  diagnosis: z.array(DiagnosisItemSchema).describe('A list of detected cognitive biases and other deception dimensions, each with its own risk score.'),
});
export type DetectSelfDeceptionOutput = z.infer<typeof DetectSelfDeceptionOutputSchema>;

export async function detectSelfDeception(input: DetectSelfDeceptionInput): Promise<DetectSelfDeceptionOutput> {
  const systemPrompt = `You are a systems thinking psychologist who specializes in identifying cognitive biases and patterns of self-deception using a multi-dimensional risk model. Analyze the user's claim within the given verticals.

Your analysis must cover the following dimensions. For each dimension, provide a brief, one-sentence diagnosis explaining its relevance to the claim, and a numerical riskScore from 0.0 to 1.0.
- Honesty: Assess the factual accuracy and potential for misleading statements.
- Intentionality: Evaluate if the deception seems deliberate or unintentional.
- Cognitive Bias: Identify specific cognitive biases at play (e.g., Confirmation Bias, Overconfidence).
- Emotional Manipulation: Check for the use of emotionally charged language to bypass logic.
- Context Distortion: Look for cherry-picking facts or omitting key context.
- Synthetic Content Risk: Assess if the claim could be based on or generating synthetic/AI-created misinformation.
- Social Engineering: Evaluate if the claim could be used to manipulate others.
- Multimodal Inconsistencies: (Hypothetical for text-only) Mention if this dimension is not applicable for text-only claims, with a score of 0.

Based on your analysis, you MUST ONLY respond with a single, valid JSON object with the following structure:
1.  **deceptionRiskScore**: An overall risk score from 0 to 1, aggregating the risk from all dimensions. This should be a thoughtful average of the individual dimension scores.
2.  **tldr**: A single, concise sentence summarizing the core psychological pitfall.
3.  **diagnosis**: An array of 3-5 of the most relevant findings. Each finding should be an object with **bias** (dimension name, e.g., 'Cognitive Bias'), **diagnosis** (your one-sentence explanation), and a **riskScore** (a float between 0.0 and 1.0 for that specific dimension).

Do not add any other text or explanation before or after the JSON object.`;

  const userPrompt = `Here is the user's claim and its context. Please analyze it.
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
  const validationResult = DetectSelfDeceptionOutputSchema.safeParse(parsedResponse);
  if (!validationResult.success) {
    console.error("Hugging Face API response validation error:", validationResult.error);
    throw new Error("The model's response did not match the expected format.");
  }
  
  return validationResult.data;
}
