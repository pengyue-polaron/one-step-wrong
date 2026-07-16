export type JsonBodyResult =
  | { success: true; data: unknown }
  | { success: false; status: 400 | 413; error: string };

export async function readBoundedJson(request: Request, maxBytes: number): Promise<JsonBodyResult> {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return { success: false, status: 413, error: "Request body is too large." };
  }

  try {
    const text = await request.text();
    if (Buffer.byteLength(text, "utf8") > maxBytes) {
      return { success: false, status: 413, error: "Request body is too large." };
    }
    return { success: true, data: JSON.parse(text) };
  } catch {
    return { success: false, status: 400, error: "Request body must be valid JSON." };
  }
}
