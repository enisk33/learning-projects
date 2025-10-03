export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type ProductTemplate = {
  id: number;
  name: string;
  product_type: string;
  base_price: string;
  currency: string;
  mockup_image_url: string;
};

export type ImageJob = {
  id: string;
  prompt: string;
  style: string;
  product_intent: string;
  aspect_ratio: string;
  reference_image_url: string | null;
  output_image_url: string;
  status: "queued" | "running" | "completed" | "failed";
  provider: string;
  created_at: string;
  updated_at: string;
};

type ApiOptions = RequestInit & {
  token?: string;
};

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.token) {
    headers.set("Authorization", `Token ${options.token}`);
  }

  const isFormData = options.body instanceof FormData;
  if (options.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API error ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
