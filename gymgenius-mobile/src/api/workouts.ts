import apiClient from './client';

export interface SetDetail {
    id: string;
    number: number;
    targetReps: string;
    targetRestSeconds: number;
    targetWeight?: string;
    notes?: string;
}

export interface ExerciseDetail {
    id: string;
    name: string;
    order: number;
    notes?: string;
    gifUrl?: string;
    targetMuscle?: string;
    equipment?: string;
    sets: SetDetail[];
}

export interface WorkoutDetail {
    id: string;
    name: string;
    dayOrder: number;
    notes?: string;
    exercises: ExerciseDetail[];
}

export interface SplitDetail {
    id: string;
    title: string;
    description?: string;
    goal: string;
    cycleLengthDays: number;
    isAiGenerated: boolean;
    createdAt: string;
    workouts: WorkoutDetail[];
}

export interface SplitSummary {
    id: string;
    title: string;
    goal: string;
    cycleLengthDays: number;
    isAiGenerated: boolean;
    createdAt: string;
}

export interface ExerciseLibraryItem {
    id: string;
    name: string;
    targetMuscle: string;
    equipment: string;
    imageUrl: string;
    instructions?: string[];
}

export const getMySplits = async (): Promise<SplitSummary[]> => {
    const { data } = await apiClient.get('/workouts/splits');
    return data;
};

export const getSplitDetails = async (splitId: string): Promise<SplitDetail> => {
    const { data } = await apiClient.get(`/workouts/splits/${splitId}`);
    return data;
};

export const deleteSplit = async (id: string): Promise<void> => {
    await apiClient.delete(`/workouts/splits/${id}`);
};

export const createSplit = async (data: { title: string; goal: string; cycleLengthDays: number; workouts: any[] }) => {
    const { data: response } = await apiClient.post('/workouts/splits', data);
    return response;
};

// Cerca nel catalogo in Italiano con immagini
export const getExerciseLibrary = async (search?: string): Promise<ExerciseLibraryItem[]> => {
    const { data } = await apiClient.get('/workouts/library', {
        params: { search: search || undefined }
    });
    return data;
};

// Aggiunge esercizio alla routine
export const addExerciseToWorkout = async (
    splitId: string,
    workoutId: string,
    payload: {
        name: string;
        order: number;
        gifUrl?: string;
        targetMuscle?: string;
        equipment?: string;
    }
) => {
    const { data } = await apiClient.post(`/workouts/splits/${splitId}/workouts/${workoutId}/exercises`, payload);
    return data;
};

// Elimina esercizio
export const deleteExerciseFromWorkout = async (
    splitId: string,
    workoutId: string,
    exerciseId: string
) => {
    const { data } = await apiClient.delete(`/workouts/splits/${splitId}/workouts/${workoutId}/exercises/${exerciseId}`);
    return data;
};