import { api } from './api';
import { SplitSummary, SplitDetail, WorkoutItem, ExerciseItem, SetItem } from '@/types/workouts';

export const workoutService = {
    // SPLITS: con baseURL ".../api", punta a "/api/workouts/splits"
    getSplits: async () => (await api.get<SplitSummary[]>('/workouts/splits')).data,
    getSplitById: async (id: string) => (await api.get<SplitDetail>(`/workouts/splits/${id}`)).data,
    createSplit: async (data: { name: string; description?: string }) =>
        (await api.post<SplitSummary>('/workouts/splits', data)).data,
    updateSplit: async (id: string, data: { name: string; description?: string }) =>
        (await api.put(`/workouts/splits/${id}`, data)).data,
    deleteSplit: async (id: string) => (await api.delete(`/workouts/splits/${id}`)).data,

    // WORKOUTS
    addWorkout: async (splitId: string, data: { name: string; dayOrder: number; notes?: string }) =>
        (await api.post<WorkoutItem>(`/workouts/splits/${splitId}/workouts`, data)).data,
    updateWorkout: async (splitId: string, workoutId: string, data: { name: string; dayOrder: number; notes?: string }) =>
        (await api.put(`/workouts/splits/${splitId}/workouts/${workoutId}`, data)).data,
    deleteWorkout: async (splitId: string, workoutId: string) =>
        (await api.delete(`/workouts/splits/${splitId}/workouts/${workoutId}`)).data,

    // EXERCISES & SETS
    addExercise: async (splitId: string, workoutId: string, data: { name: string; order: number; notes?: string }) =>
        (await api.post<ExerciseItem>(`/workouts/splits/${splitId}/workouts/${workoutId}/exercises`, data)).data,
    deleteExercise: async (splitId: string, workoutId: string, exerciseId: string) =>
        (await api.delete(`/workouts/splits/${splitId}/workouts/${workoutId}/exercises/${exerciseId}`)).data,
    addSet: async (splitId: string, workoutId: string, exerciseId: string, data: Partial<SetItem>) =>
        (await api.post<SetItem>(`/workouts/splits/${splitId}/workouts/${workoutId}/exercises/${exerciseId}/sets`, data)).data,
    deleteSet: async (splitId: string, workoutId: string, exerciseId: string, setId: string) =>
        (await api.delete(`/workouts/splits/${splitId}/workouts/${workoutId}/exercises/${exerciseId}/sets/${setId}`)).data,
};