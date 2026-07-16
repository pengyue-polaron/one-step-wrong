import { describe, expect, it, vi } from "vitest";
import { readBoundedJson } from "@/app/api/request";

describe("readBoundedJson", () => {
  it("accepts a valid multi-chunk UTF-8 body within the byte limit", async () => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      body: JSON.stringify({ value: "\u6821\u56ed" }),
    });

    await expect(readBoundedJson(request, 64)).resolves.toEqual({
      success: true,
      data: { value: "\u6821\u56ed" },
    });
  });

  it("cancels a streaming body as soon as the byte limit is exceeded", async () => {
    const read = vi.fn()
      .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('{"value":"') })
      .mockResolvedValueOnce({ done: false, value: new Uint8Array(64) })
      .mockResolvedValueOnce({ done: true, value: undefined });
    const cancel = vi.fn().mockResolvedValue(undefined);
    const releaseLock = vi.fn();
    const request = {
      headers: new Headers(),
      body: {
        getReader: () => ({ read, cancel, releaseLock }),
      },
    } as unknown as Request;

    await expect(readBoundedJson(request, 32)).resolves.toEqual({
      success: false,
      status: 413,
      error: "Request body is too large.",
    });
    expect(read).toHaveBeenCalledTimes(2);
    expect(cancel).toHaveBeenCalledOnce();
    expect(releaseLock).toHaveBeenCalledOnce();
  });
});
