import { api } from '@/services/api';
import type { User } from '@/types';

type TokenResponse = { token: string; user: User };

export type RegisterPayload = {
    name: string;
    email: string;
    phone?: string;
    password: string;
    password_confirmation: string;
};

export const authService = {
    async login(email: string, password: string): Promise<TokenResponse> {
        const response = await api.post<TokenResponse>('/login', {
            email,
            password,
            device_name: navigator.userAgent.slice(0, 100),
        });

        return response.data;
    },

    async register(payload: RegisterPayload): Promise<TokenResponse> {
        const response = await api.post<TokenResponse>('/register', payload);

        return response.data;
    },

    async me(): Promise<User> {
        const response = await api.get<User>('/user');

        return response.data;
    },

    async logout(): Promise<void> {
        await api.post('/logout');
    },
};
