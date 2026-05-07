const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export interface UploadResponse { upload_id: string; count: number; message: string; }
export interface GenerateResponse { job_id: string; message: string; }
export interface JobStatus {
  job_id: string;
  status: "queued" | "processing" | "done" | "error" | string;
  message: string;
  model_url: string | null;
}

export async function uploadImages(files: File[]): Promise<UploadResponse> {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  const res = await fetch(`${BASE}/api/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error(await res.text() || `Upload failed (${res.status})`);
  return res.json();
}

export async function generate3D(uploadId: string): Promise<GenerateResponse> {
  const res = await fetch(`${BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ upload_id: uploadId }),
  });
  if (!res.ok) throw new Error(await res.text() || `Generate failed (${res.status})`);
  return res.json();
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const res = await fetch(`${BASE}/api/job/${jobId}`);
  if (!res.ok) throw new Error(await res.text() || `Status check failed (${res.status})`);
  return res.json();
}

export function modelDownloadUrl(path: string): string {
  return `${BASE}${path}`;
}
