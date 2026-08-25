const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private csrfToken: string | null = null;
  private csrfPromise: Promise<void> | null = null;

  private getToken(): string | null {
    return localStorage.getItem('vs_admin_token');
  }

  private async fetchCsrfToken() {
    if (this.csrfPromise) return this.csrfPromise;
    this.csrfPromise = fetch(`${API_BASE}/csrf`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        this.csrfToken = data.token;
      })
      .catch(console.error);
    return this.csrfPromise;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.method && options.method !== 'GET' && options.method !== 'HEAD') {
      if (!this.csrfToken) await this.fetchCsrfToken();
      if (this.csrfToken) {
        headers['x-csrf-token'] = this.csrfToken;
      }
    }

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: 'include' });

    if (res.status === 401) {
      localStorage.removeItem('vs_admin_token');
      localStorage.removeItem('vs_admin_claims');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(body.error || `API error ${res.status}`);
    }

    return res.json();
  }

  get<T>(path: string) {
    return this.request<T>(path);
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
