import { z } from "zod";

export const idSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase kebab-case IDs.");

export const shortTextSchema = z.string().trim().min(1).max(120);
export const bodyTextSchema = z.string().trim().min(1).max(700);
export const longTextSchema = z.string().trim().min(1).max(1_400);

export type ValidationIssue = {
  path: string;
  message: string;
};

export type ValidationResult<T> =
  | { success: true; data: T; issues: [] }
  | { success: false; issues: ValidationIssue[] };

export function toValidationResult<T>(result: z.ZodSafeParseResult<T>): ValidationResult<T> {
  if (result.success) return { success: true, data: result.data, issues: [] };
  return {
    success: false,
    issues: result.error.issues.map((issue) => ({
      path: issue.path.join(".") || "root",
      message: issue.message,
    })),
  };
}

export function findDuplicates(values: string[]) {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

const unsafeContentPatterns = [
  /<\/?(?:script|iframe|object|embed)\b/i,
  /javascript\s*:/i,
  /(?:curl|wget)\s+https?:\/\//i,
  /(?:run|execute|paste)\s+(?:this\s+)?(?:command|script|code)/i,
  /(?:send|share|enter|collect|provide)\s+(?:me\s+)?(?:your\s+)?(?:password|passcode|api\s*key|recovery\s*code|mfa\s*code)/i,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
];

export function containsUnsafeInstruction(value: unknown): boolean {
  if (typeof value === "string") return unsafeContentPatterns.some((pattern) => pattern.test(value));
  if (Array.isArray(value)) return value.some(containsUnsafeInstruction);
  if (value && typeof value === "object") return Object.values(value).some(containsUnsafeInstruction);
  return false;
}

export function normalizeDomain(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "");
}

export function isValidHostname(value: string) {
  const hostname = normalizeDomain(value);
  if (hostname.length < 3 || hostname.length > 253 || !hostname.includes(".")) return false;
  return hostname.split(".").every(
    (label) =>
      label.length >= 1
      && label.length <= 63
      && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label),
  );
}

export function hostnameMatchesDomain(url: string, domain: string) {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    const normalized = normalizeDomain(domain);
    return hostname === normalized || hostname.endsWith(`.${normalized}`);
  } catch {
    return false;
  }
}
