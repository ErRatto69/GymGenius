import { api } from './api';
import { LoginRequest, AuthResponse, RegisterRequest } from '@/types/auth';
import { useAuthStore } from '@/store/useAuthStore';

export const authService = {
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', credentials); // Matches api/auth/login
        const { accessToken, refreshToken, ...user } = response.data;

        useAuthStore.getState().setAuth(user, accessToken, refreshToken);

        return response.data;
    },

    async register(data: RegisterRequest): Promise<{ message: string }> {
        const response = await api.post<{ message: string }>('/auth/register', data); // Matches api/auth/register
        return response.data;
    },

    async logout(): Promise<void> {
        useAuthStore.getState().logout();
    }
};