import { API_BASE_URL } from '../constants/constants';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions<TBody> {
  body?: TBody;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

async function request<TResponse, TBody = unknown>(
  path: string,
  method: HttpMethod,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const url = `${API_BASE_URL}${path}`;
  const { body, headers, signal } = options;

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}${text ? `: ${text}` : ''}`);
  }

  // 204 No Content
  if (res.status === 204) {
    return undefined as unknown as TResponse;
  }

  const data = (await res.json()) as unknown;
  return data as TResponse;
}

export const apiClient = {
  get: <TResponse>(path: string, opts?: RequestOptions<never>) => request<TResponse, never>(path, 'GET', opts),
  post: <TResponse, TBody = unknown>(path: string, body?: TBody, opts?: RequestOptions<TBody>) => request<TResponse, TBody>(path, 'POST', { ...opts, body }),
  put: <TResponse, TBody = unknown>(path: string, body?: TBody, opts?: RequestOptions<TBody>) => request<TResponse, TBody>(path, 'PUT', { ...opts, body }),
  patch: <TResponse, TBody = unknown>(path: string, body?: TBody, opts?: RequestOptions<TBody>) => request<TResponse, TBody>(path, 'PATCH', { ...opts, body }),
  delete: <TResponse>(path: string, opts?: RequestOptions<never>) => request<TResponse, never>(path, 'DELETE', opts),
};


