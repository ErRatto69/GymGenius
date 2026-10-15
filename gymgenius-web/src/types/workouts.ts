export interface ExerciseSet {
    id: string;
    setNumber: number;
    reps: number;
    weight: number;
    restTimeSeconds: number;
}

export interface WorkoutExercise {
    id: string;
    name: string;
    order: number;
    notes: string;
    sets: ExerciseSet[];
}

export interface WorkoutDay {
    id: string;
    name: string;
    dayOrder: number;
    notes: string;
    exercises: WorkoutExercise[];
}

export interface SplitSummary {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    totalWorkouts: number;
}

export interface SplitDetail {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    workouts: WorkoutDay[];
}

export interface CreateOrUpdateSplitRequest {
    name: string;
    description: string;
}

export interface CreateOrUpdateWorkoutRequest {
    name: string;
    dayOrder: number;
    notes: string;
}

export interface CreateExerciseRequest {
    name: string;
    order: number;
    notes: string;
}

export interface CreateSetRequest {
    setNumber: number;
    reps: number;
    weight: number;
    restTimeSeconds: number;
}

export type AiSplitType = 'PPL' | 'UPPER_LOWER' | 'FULL_BODY' | 'BRO_SPLIT';
export type AiFitnessGoal = 'STRENGTH' | 'HYPERTROPHY' | 'RECOMPOSITION' | 'ENDURANCE';

export interface AiGeneratorConfig {
    splitType: AiSplitType;
    daysPerWeek: number;
    goal: AiFitnessGoal;
    sessionDurationMinutes: number;
    focusNotes: string;
}