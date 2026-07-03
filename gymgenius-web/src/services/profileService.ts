import { api } from './api';

export interface UpdateProfileRequest {
    firstName: string;
    lastName: string;
    preferredFoods: string[];
    dislikedFoods: string[];
    allergies: string[];
    injuries: string[];
    fitnessGoal: string | null;
    availableEquipment: string | null;
}

export const profileService = {
    async updateProfile(data: UpdateProfileRequest) {
        const response = await api.put('/api/profile/update', data);
        return response.data;
    },
};