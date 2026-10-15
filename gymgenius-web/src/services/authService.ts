import { api } from '@/services/api';
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
} from '@/types/auth';

export const authService = {
    async login(payload: LoginRequest): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>('/auth/login', payload);
        return response.data;
    },

    async register(payload: RegisterRequest): Promise<RegisterResponse> {
        const response = await api.post<RegisterResponse>('/auth/register', payload);
        return response.data;
    },

    async refresh(payload: RefreshTokenRequest): Promise<RefreshTokenResponse> {
        const response = await api.post<RefreshTokenResponse>(
            '/auth/refresh',
            payload
        );
        return response.data;
    },
};