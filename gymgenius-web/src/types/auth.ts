export interface UserProfile {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    preferredFoods?: string[];
    dislikedFoods?: string[];
    allergies?: string[];
    injuries?: string[];
    fitnessGoal?: string | null;
    availableEquipment?: string | null;
}

export interface AuthResponse extends UserProfile {
    accessToken: string;
    refreshToken: string;
}

export interface LoginRequest {
    usernameOrEmail: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    preferredFoods?: string[];
    dislikedFoods?: string[];
    allergies?: string[];
    injuries?: string[];
    fitnessGoal?: string | null;
    availableEquipment?: string | null;
}