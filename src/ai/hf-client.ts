import { OpenAI } from "openai";

// This client is configured to use the Hugging Face Inference API via its OpenAI-compatible router.
// It uses the HF_TOKEN from your environment variables for authentication.
export const hfClient = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN,
});
