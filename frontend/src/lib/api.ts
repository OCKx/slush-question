export type Kind = "investors" | "startups" | "builders";
export type Profile = {
  id: string;
  name: string;
  company?: string | null;
  description?: string | null;
  project?: string | null;
  answer?: string | null;
  linkedin?: string | null;
  categories: string[];
  published: boolean;
  createdAt: string;
};
export type ProfileInput = Omit<Profile, "id" | "createdAt">;
const base = (import.meta.env.VITE_API_URL || "") + "/api";
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(base + path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.error || `Request failed (${res.status})`);
  }
  return res.json();
}
export const listProfiles = (kind: Kind, admin = false) =>
  api<Profile[]>(`/${kind}${admin ? "?all=1" : ""}`);
export const saveProfile = (kind: Kind, data: ProfileInput, id?: string) =>
  api<Profile>(`/${kind}${id ? "/" + id : ""}`, {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(data),
  });
export const removeProfile = (kind: Kind, id: string) =>
  api<{ ok: boolean }>(`/${kind}/${id}`, { method: "DELETE" });
