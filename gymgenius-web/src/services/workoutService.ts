import { api } from '@/services/api';
import type {
    SplitSummary,
    SplitDetail,
    CreateOrUpdateSplitRequest,
    CreateOrUpdateWorkoutRequest,
    CreateExerciseRequest,
    CreateSetRequest,
    WorkoutDay,
    WorkoutExercise,
    ExerciseSet,
} from '@/types/workouts';

export const workoutService = {
    // 1. Splits
    async getSplits(): Promise<SplitSummary[]> {
        const response = await api.get<SplitSummary[]>('/workouts/splits');
        return response.data;
    },

    async getSplitById(splitId: string): Promise<SplitDetail> {
        const response = await api.get<SplitDetail>(`/workouts/splits/${splitId}`);
        return response.data;
    },

    async createSplit(payload: CreateOrUpdateSplitRequest): Promise<SplitDetail> {
        const response = await api.post<SplitDetail>('/workouts/splits', payload);
        return response.data;
    },

    async updateSplit(
        splitId: string,
        payload: CreateOrUpdateSplitRequest
    ): Promise<void> {
        await api.put(`/workouts/splits/${splitId}`, payload);
    },

    async deleteSplit(splitId: string): Promise<void> {
        await api.delete(`/workouts/splits/${splitId}`);
    },

    // 2. Workouts (Giorni)
    async addWorkout(
        splitId: string,
        payload: CreateOrUpdateWorkoutRequest
    ): Promise<WorkoutDay> {
        const response = await api.post<WorkoutDay>(
            `/workouts/splits/${splitId}/workouts`,
            payload
        );
        return response.data;
    },

    async updateWorkout(
        splitId: string,
        workoutId: string,
        payload: CreateOrUpdateWorkoutRequest
    ): Promise<void> {
        await api.put(
            `/workouts/splits/${splitId}/workouts/${workoutId}`,
            payload
        );
    },

    async deleteWorkout(splitId: string, workoutId: string): Promise<void> {
        await api.delete(`/workouts/splits/${splitId}/workouts/${workoutId}`);
    },

    // 3. Exercises
    async addExercise(
        splitId: string,
        workoutId: string,
        payload: CreateExerciseRequest
    ): Promise<WorkoutExercise> {
        const response = await api.post<WorkoutExercise>(
            `/workouts/splits/${splitId}/workouts/${workoutId}/exercises`,
            payload
        );
        return response.data;
    },

    async deleteExercise(
        splitId: string,
        workoutId: string,
        exerciseId: string
    ): Promise<void> {
        await api.delete(
            `/workouts/splits/${splitId}/workouts/${workoutId}/exercises/${exerciseId}`
        );
    },

    // 4. Sets
    async addSet(
        splitId: string,
        workoutId: string,
        exerciseId: string,
        payload: CreateSetRequest
    ): Promise<ExerciseSet> {
        const response = await api.post<ExerciseSet>(
            `/workouts/splits/${splitId}/workouts/${workoutId}/exercises/${exerciseId}/sets`,
            payload
        );
        return response.data;
    },

    async deleteSet(
        splitId: string,
        workoutId: string,
        exerciseId: string,
        setId: string
    ): Promise<void> {
        await api.delete(
            `/workouts/splits/${splitId}/workouts/${workoutId}/exercises/${exerciseId}/sets/${setId}`
        );
    },
};