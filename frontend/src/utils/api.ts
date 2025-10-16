// Utilitários para API do frontend SyncTask
// Seguindo diretrizes: funções específicas ao invés de comentários

import { API_BASE_URL, ERROR_MESSAGES, HTTP_STATUS } from '../constants/index.js';
import { getAuthToken } from './storage.js';

export const createApiUrl = (endpoint: string): string => {
    return `${API_BASE_URL}${endpoint}`;
};

export const createAuthHeaders = (): Record<string, string> => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

export const handleApiError = (error: unknown): string => {
    if (error && typeof error === 'object' && 'response' in error) {
        const { status, data } = (error as any).response;

        switch (status) {
            case HTTP_STATUS.UNAUTHORIZED:
                return ERROR_MESSAGES.UNAUTHORIZED;
            case HTTP_STATUS.FORBIDDEN:
                return ERROR_MESSAGES.PERMISSION_DENIED;
            case HTTP_STATUS.NOT_FOUND:
                return ERROR_MESSAGES.BOARD_NOT_FOUND;
            case HTTP_STATUS.BAD_REQUEST:
                return data.message || ERROR_MESSAGES.INVALID_INPUT;
            case HTTP_STATUS.INTERNAL_SERVER_ERROR:
                return ERROR_MESSAGES.SERVER_ERROR;
            default:
                return data.message || ERROR_MESSAGES.UNKNOWN_ERROR;
        }
    }

    if (error && typeof error === 'object' && 'request' in error) {
        return ERROR_MESSAGES.NETWORK_ERROR;
    }

    return ERROR_MESSAGES.UNKNOWN_ERROR;
};

export const createApiRequest = async <T>(
    url: string,
    options: RequestInit = {}
): Promise<T> => {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...createAuthHeaders(),
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`) as any;
        error.response = {
            status: response.status,
            data: await response.json().catch(() => ({})),
        };
        throw error;
    }

    return response.json();
};

export const createGetRequest = <T>(endpoint: string): Promise<T> => {
    const url = createApiUrl(endpoint);
    return createApiRequest<T>(url, { method: 'GET' });
};

export const createPostRequest = <T>(endpoint: string, data: unknown): Promise<T> => {
    const url = createApiUrl(endpoint);
    return createApiRequest<T>(url, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const createPutRequest = <T>(endpoint: string, data: unknown): Promise<T> => {
    const url = createApiUrl(endpoint);
    return createApiRequest<T>(url, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

export const createPatchRequest = <T>(endpoint: string, data: unknown): Promise<T> => {
    const url = createApiUrl(endpoint);
    return createApiRequest<T>(url, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
};

export const createDeleteRequest = <T>(endpoint: string): Promise<T> => {
    const url = createApiUrl(endpoint);
    return createApiRequest<T>(url, { method: 'DELETE' });
};

export const createFormDataRequest = <T>(
    endpoint: string,
    formData: FormData
): Promise<T> => {
    const url = createApiUrl(endpoint);
    const token = getAuthToken();

    return createApiRequest<T>(url, {
        method: 'POST',
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
    });
};

export const createUploadRequest = <T>(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void
): Promise<T> => {
    const url = createApiUrl(endpoint);
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable && onProgress) {
                const progress = (event.loaded / event.total) * 100;
                onProgress(progress);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                } catch {
                    resolve(xhr.responseText as any);
                }
            } else {
                reject(new Error(`HTTP ${xhr.status}`));
            }
        });

        xhr.addEventListener('error', () => {
            reject(new Error('Network error'));
        });

        xhr.open('POST', url);
        if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        xhr.send(formData);
    });
};


