const API_URL = import.meta.env.VITE_API_URL || "/api";

function getToken() {
  return localStorage.getItem("token");
}

function buildHeaders(extra = {}) {
  const headers = { "Content-Type": "application/json", ...extra };
  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function apiGet(path) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `GET ${path} failed (${response.status})`);
  }

  return response.json();
}

export async function apiPost(path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `POST ${path} failed (${response.status})`);
  }

  return response.json();
}
