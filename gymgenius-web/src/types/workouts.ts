export interface SetItem {
    id: string;
    setNumber: number;
    reps?: number;
    weight?: number;
    rpe?: number;
    restTimeSeconds?: number;
}

export interface ExerciseItem {
    id: string;
    name: string;
    notes?: string;
    order: number;
    sets: SetItem[];
}

export interface WorkoutItem {
    id: string;
    name: string;
    dayOrder: number;
    notes?: string;
    exercises: ExerciseItem[];
}

export interface SplitSummary {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    totalWorkouts?: number;
}

export interface SplitDetail {
    id: string;
    name: string;
    description?: string;
    workouts: WorkoutItem[];
}