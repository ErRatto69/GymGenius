export type SupportedLanguage = 'it' | 'en' | 'de' | 'fr' | 'es';

export interface UpdateProfileRequest {
    firstName: string;
    lastName: string;
    fitnessGoal: string;
    availableEquipment: string;
    allergies: string[];
    injuries: string[];
    preferredFoods: string[];
    dislikedFoods: string[];
}

export interface UpdateProfileResponse {
    message?: string;
}