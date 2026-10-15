import axios, {
    AxiosError,
    AxiosInstance,
    InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import type { RefreshTokenResponse } from '@/types/auth';

const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5203/api';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

interface FailedQueueItem {
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null): void => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else if (token) {
            promise.resolve(token);
        }
    });
    failedQueue = [];
};

export const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const accessToken = useAuthStore.getState().accessToken;
        const language = useLanguageStore.getState().language || 'it';

        config.headers.set('Accept-Language', language);

        if (accessToken) {
            config.headers.set('Authorization', `Bearer ${accessToken}`);
        }

        return config;
    },
    (error: unknown) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequestConfig | undefined;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        const isAuthEndpoint =
            originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/register') ||
            originalRequest.url?.includes('/auth/refresh');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((newToken) => {
                    originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const currentRefreshToken = useAuthStore.getState().refreshToken;

            if (!currentRefreshToken) {
                isRefreshing = false;
                useAuthStore.getState().logout();
                return Promise.reject(error);
            }

            try {
                const refreshResponse = await axios.post<RefreshTokenResponse>(
                    `${BASE_URL}/auth/refresh`,
                    { refreshToken: currentRefreshToken },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept-Language': useLanguageStore.getState().language || 'it',
                        },
                    }
                );

                const { accessToken, refreshToken } = refreshResponse.data;
                useAuthStore.getState().setTokens(accessToken, refreshToken);
                processQueue(null, accessToken);

                originalRequest.headers.set('Authorization', `Bearer ${accessToken}`);
                return api(originalRequest);
            } catch (refreshError: unknown) {
                processQueue(refreshError, null);
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

interface BackendErrorPayload {
    message?: string;
    detail?: string;
    title?: string;
    errors?: Record<string, string[]>;
}

export function getHumanErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const axiosErr = error as AxiosError<BackendErrorPayload>;

        if (!axiosErr.response) {
            return 'Impossibile contattare il server. Verifica che la tua connessione sia attiva.';
        }

        const data = axiosErr.response.data;
        if (data) {
            if (typeof data.message === 'string' && data.message.trim().length > 0) {
                return data.message;
            }
            if (typeof data.detail === 'string' && data.detail.trim().length > 0) {
                return data.detail;
            }
            if (data.errors && typeof data.errors === 'object') {
                const firstKey = Object.keys(data.errors)[0];
                if (firstKey && Array.isArray(data.errors[firstKey]) && data.errors[firstKey].length > 0) {
                    return data.errors[firstKey][0];
                }
            }
        }

        const status = axiosErr.response.status;
        if (status === 400) {
            return 'I dati inseriti non sono validi. Controlla i campi compilati.';
        }
        if (status === 401) {
            return 'Credenziali non valide o sessione scaduta.';
        }
        if (status === 403) {
            return 'Non disponi dei permessi necessari per completare questa azione.';
        }
        if (status === 404) {
            return 'L’elemento richiesto non è più disponibile.';
        }
        if (status === 409) {
            return 'Username o indirizzo email già associati a un altro profilo.';
        }
        if (status >= 500) {
            return 'Il servizio è temporaneamente occupato. Riprova tra qualche istante.';
        }
    }

    return 'Si è verificato un imprevisto durante l’operazione. Riprova.';
}