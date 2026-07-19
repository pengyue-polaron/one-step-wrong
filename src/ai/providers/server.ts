import type OpenAI from "openai";
import { getOpenAIClient, hasOpenAIApiKey } from "@/ai/openai/server";
import { createLocalCodexProvider } from "@/ai/providers/localCodex";

export type AdaptiveProvider = Pick<OpenAI, "responses">;
export type AdaptiveProviderKind = "openai-api" | "local-codex";

let sharedLocalCodexProvider: AdaptiveProvider | undefined;

export function isLocalCodexProviderEnabled(
  environment: Record<string, string | undefined> = process.env,
  nodeEnvironment = process.env.NODE_ENV,
) {
  const enabled = environment.CODEX_LOCAL_PROVIDER?.trim().toLowerCase();
  return nodeEnvironment !== "production" && (enabled === "1" || enabled === "true");
}

export function getAdaptiveProviderKind(): AdaptiveProviderKind | null {
  if (hasOpenAIApiKey()) return "openai-api";
  if (isLocalCodexProviderEnabled()) return "local-codex";
  return null;
}

export function hasAdaptiveProvider() {
  return getAdaptiveProviderKind() !== null;
}

export function getAdaptiveProvider(): AdaptiveProvider | null {
  const apiProvider = getOpenAIClient();
  if (apiProvider) return apiProvider;
  if (!isLocalCodexProviderEnabled()) return null;
  sharedLocalCodexProvider ??= createLocalCodexProvider();
  return sharedLocalCodexProvider;
}
