import { api } from '@/services/api';
import type {
    UpdateProfileRequest,
    UpdateProfileResponse,
} from '@/types/profile';

export const profileService = {
    async updateProfile(
        payload: UpdateProfileRequest
    ): Promise<UpdateProfileResponse> {
        const response = await api.put<UpdateProfileResponse>(
            '/profile/update',
            payload
        );
        return response.data;
    },
};