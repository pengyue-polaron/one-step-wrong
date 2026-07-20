import { afterEach, describe, expect, it } from "vitest";
import {
  getOpenAIClient,
  getOpenAIBaseURL,
  getOpenAIModel,
  hasOpenAIApiKey,
  isOpenRouterConfigured,
} from "@/ai/openai/server";

const originalEnv = {
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
  model: process.env.OPENAI_MODEL,
};

function restore(name: "OPENAI_API_KEY" | "OPENAI_BASE_URL" | "OPENAI_MODEL", value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

afterEach(() => {
  restore("OPENAI_API_KEY", originalEnv.apiKey);
  restore("OPENAI_BASE_URL", originalEnv.baseURL);
  restore("OPENAI_MODEL", originalEnv.model);
});

describe("OpenAI server configuration", () => {
  it("uses the default model and no client without a key", () => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_BASE_URL;
    delete process.env.OPENAI_MODEL;
    expect(getOpenAIModel()).toBe("gpt-5.6");
    expect(hasOpenAIApiKey()).toBe(false);
    expect(getOpenAIClient()).toBeNull();
  });

  it("supports an HTTPS OpenAI-compatible endpoint and model", () => {
    process.env.OPENAI_BASE_URL = "https://openrouter.ai/api/v1/";
    process.env.OPENAI_MODEL = "openai/gpt-5.6-terra";
    expect(getOpenAIBaseURL()).toBe("https://openrouter.ai/api/v1");
    expect(getOpenAIModel()).toBe("openai/gpt-5.6-terra");
    expect(isOpenRouterConfigured()).toBe(true);
  });

  it("rejects insecure or credential-bearing compatible endpoints", () => {
    for (const baseURL of ["http://openrouter.ai/api/v1", "https://user:pass@example.com/v1"]) {
      process.env.OPENAI_BASE_URL = baseURL;
      expect(() => getOpenAIBaseURL()).toThrow("must be an HTTPS URL without embedded credentials");
    }
  });
});
