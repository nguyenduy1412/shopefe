
// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

export async function api<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers, ...rest } = options;

    const url = new URL(`${API_BASE_URL}${endpoint}`);

    if (params) {
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }

    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...headers,
    };

    const response = await fetch(url.toString(), {
        headers: defaultHeaders,
        ...rest,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || `API Error: ${response.statusText}`);
    }

    return response.json();
}
