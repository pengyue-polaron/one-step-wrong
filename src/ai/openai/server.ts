import OpenAI from "openai";

let sharedClient: OpenAI | null | undefined;
let sharedApiKey: string | undefined;
let sharedBaseURL: string | undefined;

const defaultOpenAIModel = "gpt-5.6";

export function getOpenAIBaseURL() {
  const configured = process.env.OPENAI_BASE_URL?.trim();
  if (!configured) return undefined;
  const url = new URL(configured);
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error("OPENAI_BASE_URL must be an HTTPS URL without embedded credentials.");
  }
  return url.toString().replace(/\/$/, "");
}

export function getOpenAIModel() {
  return process.env.OPENAI_MODEL?.trim() || defaultOpenAIModel;
}

export function isOpenRouterConfigured() {
  const baseURL = getOpenAIBaseURL();
  return baseURL ? new URL(baseURL).hostname === "openrouter.ai" : false;
}

export function hasOpenAIApiKey() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const baseURL = getOpenAIBaseURL();
  if (sharedClient !== undefined && apiKey === sharedApiKey && baseURL === sharedBaseURL) {
    return sharedClient;
  }
  sharedApiKey = apiKey;
  sharedBaseURL = baseURL;
  sharedClient = apiKey
    ? new OpenAI({
        apiKey,
        timeout: 20_000,
        maxRetries: 0,
        ...(baseURL ? { baseURL } : {}),
        ...(isOpenRouterConfigured()
          ? {
              defaultHeaders: {
                "HTTP-Referer": process.env.SITE_URL?.trim() || "https://one-step-wrong.pengyue.space",
                "X-Title": "One Step Wrong",
              },
            }
          : {}),
      })
    : null;
  return sharedClient;
}
