import { getEnvValue } from "@/lib/env";
type Part = { partNumber: number; etag: string };
type Upload = { uploadId: string; uploadPart(partNumber: number, body: ReadableStream<Uint8Array>): Promise<{ etag: string }>; complete(parts: Part[]): Promise<unknown> };
type Bucket = { list(options?: { prefix?: string }): Promise<{ objects: Array<{ key: string; size: number; uploaded: Date; httpMetadata?: { contentType?: string } }> }>; delete(key: string): Promise<void>; createMultipartUpload(key: string, options?: { httpMetadata?: { contentType?: string } }): Promise<Upload>; resumeMultipartUpload(key: string, uploadId: string): Upload };
const PREFIX = "uploads/";
export async function mediaBucket(): Promise<Bucket | null> { try { return ((await import("cloudflare:workers")) as { env?: { MEDIA?: Bucket } }).env?.MEDIA ?? null; } catch { return null; } }
export function mediaKey(name: string) { const ext = name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "bin"; return `${PREFIX}${crypto.randomUUID()}.${ext}`; }
export function validKey(key: string) { return key.startsWith(PREFIX) && !key.includes(".."); }
export async function publicMediaUrl(key: string) { const base = await getEnvValue("R2_PUBLIC_BASE_URL"); return base ? `${base.replace(/\/$/, "")}/${key.split("/").map(encodeURIComponent).join("/")}` : null; }
export { PREFIX };
