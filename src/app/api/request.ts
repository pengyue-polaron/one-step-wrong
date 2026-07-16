export type JsonBodyResult =
  | { success: true; data: unknown }
  | { success: false; status: 400 | 413; error: string };

export async function readBoundedJson(request: Request, maxBytes: number): Promise<JsonBodyResult> {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return { success: false, status: 413, error: "Request body is too large." };
  }

  const reader = request.body?.getReader();
  if (!reader) {
    return { success: false, status: 400, error: "Request body must be valid JSON." };
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return { success: false, status: 413, error: "Request body is too large." };
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return { success: true, data: JSON.parse(new TextDecoder().decode(bytes)) };
  } catch {
    return { success: false, status: 400, error: "Request body must be valid JSON." };
  } finally {
    reader.releaseLock();
  }
}
