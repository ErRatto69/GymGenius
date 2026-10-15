export interface UserProfile {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
}

export interface LoginRequest {
    usernameOrEmail: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
}

export interface RegisterResponse {
    message: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}