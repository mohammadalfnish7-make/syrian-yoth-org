import { NextRequest } from "next/server";

const BASE_URL = "http://localhost:3000";

export function createJsonRequest(
  path: string,
  method: string,
  body?: unknown,
  headers?: Record<string, string>
) {
  return new NextRequest(new URL(path, BASE_URL), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function createGetRequest(path: string) {
  return new NextRequest(new URL(path, BASE_URL), { method: "GET" });
}

export function createFormDataRequest(path: string, formData: FormData) {
  return new NextRequest(new URL(path, BASE_URL), {
    method: "POST",
    body: formData,
  });
}
