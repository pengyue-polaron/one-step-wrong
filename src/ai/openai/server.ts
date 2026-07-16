import OpenAI from "openai";

let sharedClient: OpenAI | null | undefined;

export const OPENAI_MODEL = "gpt-5.6";

export function getOpenAIClient() {
  if (sharedClient !== undefined) return sharedClient;
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  sharedClient = apiKey
    ? new OpenAI({ apiKey, timeout: 20_000, maxRetries: 0 })
    : null;
  return sharedClient;
}
