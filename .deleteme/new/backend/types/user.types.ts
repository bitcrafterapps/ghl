export type UserRole = 'Admin' | 'User' | 'Site Admin';
export type ThemeType = 'light' | 'dark' | 'system';
export type UserStatus = 'active' | 'pending' | 'rejected';

export interface UserDto {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    password?: string;
    roles?: UserRole[];
    emailNotify?: boolean;
    smsNotify?: boolean;
    phoneNumber?: string | null;
    theme?: ThemeType;
    companyId?: number;
    status?: UserStatus;
    company?: {
        name: string;
        size?: string;
        industry?: string;
    };
    jobTitle?: string | null;
    selectedPlan?: string | null;
    maxProjects?: number | null;
    maxGenerations?: number | null;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: {
        id: number;
        email: string;
        firstName?: string | null;
        lastName?: string | null;
        roles: UserRole[];
        emailNotify: boolean;
        smsNotify: boolean;
        phoneNumber?: string | null;
        theme: ThemeType;
        status?: UserStatus;
    }
}

export interface UserResponse {
    id: number;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    roles: UserRole[];
    emailNotify: boolean;
    smsNotify: boolean;
    phoneNumber?: string | null;
    theme: ThemeType;
    status?: UserStatus;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export interface UserPreferencesDto {
    emailNotify?: boolean;
    smsNotify?: boolean;
    phoneNumber?: string | null;
    theme?: ThemeType;
}

export interface PendingUserResponse {
    id: number;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    roles: UserRole[];
    companyName?: string | null;
    jobTitle?: string | null;
    selectedPlan?: string | null;
    status?: UserStatus;
    createdAt: Date | null;
} 