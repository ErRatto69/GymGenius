import apiClient from './client';

export interface SplitSummary {
    id: string;
    title: string;
    goal: string;
    cycleLengthDays: number;
    isAiGenerated: boolean;
    createdAt: string;
}

export const getMySplits = async (): Promise<SplitSummary[]> => {
    const { data } = await apiClient.get('/workouts/splits');
    return data;
};

export const deleteSplit = async (id: string): Promise<void> => {
    await apiClient.delete(`/workouts/splits/${id}`);
};

export const createSplit = async (data: { title: string; goal: string; cycleLengthDays: number; workouts: any[] }) => {
    const { data: response } = await apiClient.post('/workouts/splits', data);
    return response; // { message, splitId }
};

export const addWorkoutToSplit = async (splitId: string, data: { name: string; dayOrder: number; notes?: string }) => {
    const { data: response } = await apiClient.post(`/workouts/splits/${splitId}/workouts`, data);
    return response;
};