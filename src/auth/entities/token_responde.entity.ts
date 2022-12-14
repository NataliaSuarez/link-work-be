import { Role } from "src/users/entities/user.entity";

export interface TokenResponse {
    tokens?: AccessTokens;
    userData?: UserData;
    error?: ErrorResponse;
}

export interface ErrorResponse {
    error: string;
}

export interface UserData {
    id: string;
    role: Role;
}

export interface AccessTokens {
    accessToken: string;
    refreshToken: string;
}