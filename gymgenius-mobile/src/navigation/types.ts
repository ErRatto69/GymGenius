import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
    Main: undefined;
    Login: undefined;
    Register: undefined;
    Home: undefined;
    Splits: { openModalForSplitId?: string | null } | undefined;
    CreateSplit: undefined;
    SplitDetail: { splitId: string; splitTitle: string };
    WorkoutDetail: { splitId: string; workoutId: string; workoutName: string; dayOrder: number };
    Profile: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type SplitsScreenProps = NativeStackScreenProps<RootStackParamList, 'Splits'>;
export type CreateSplitScreenProps = NativeStackScreenProps<RootStackParamList, 'CreateSplit'>;
export type SplitDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'SplitDetail'>;
export type WorkoutDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'WorkoutDetail'>;
export type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList {}
    }
}