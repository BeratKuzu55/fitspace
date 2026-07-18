// src/types/navigation.ts
import { NavigatorScreenParams } from '@react-navigation/native';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

interface UserProgramData {
  id: number;
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  body_region: string;
  duration: number;
  program_start_date: string;
  userHasProgram: boolean;
  dayWorkouts: unknown[];
  created_at: string;
  updated_at: string;
}

type ActivityManagerParams = {
  workoutId?: string;
  customWorkout?: {
    exercises: Exercise[];
    workoutInformations: any;
  };
};

// 1. Auth Stack Ekranları
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  FPScreen: undefined;
  VerifySms: {
    phoneNumber: string;
    password: string;
    dialCode: string;
    confirm?: FirebaseAuthTypes.ConfirmationResult | null;
  };
};

// 2. Setup Stack Ekranları
export type SetupStackParamList = {
  Gender: undefined;
  Age: undefined;
  Weight: undefined;
  Height: undefined;
  FitnessGoal: undefined;
  Experience: undefined;
  PhysicalActivityLevel: undefined;
  HealthProblems: undefined;
  Injuries: undefined;
};

// 3. Home Stack Ekranları (Home Tab'ının içindeki Stack)
export type HomeStackParamList = {
  HomeFront: undefined;
  Details: { id: string | number };
  AllArticlesFront: undefined;
  Articles: undefined;
  SingleArticle: { articleId: number };
  QuickStart: { place: string };
  ProgramFront: undefined;
  ProgramSelect: { program: UserProgramData };
  FriendshipFront: undefined;
  FriendDetail: { userId: number };
  StatisticsFront: undefined;
  NotificationsFront: undefined;
  ChallengesFront: undefined;
  ExerciseLibraryFront: { exerciseId?: number };
  AiAnalyseFront: undefined;
};

export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Workout: undefined;
  Exereyes: undefined;
  Favorites: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
  ActivityManager: ActivityManagerParams;
};

// 5. Profile Stack Navigator
export type ProfileStackParamList = {
  ProfileFront: undefined;
  UpdateProfile: undefined;
  PhysicalProfile: undefined;
  AppSettings: undefined;
  NotificationSettings: undefined;
  ThemeSettings: undefined;
  LanguageSettings: undefined;
  PrivacyPolicy: undefined;
  HelpContact: undefined;
  ResetPassword: { phoneNumber?: string };
  ExerciseGoal: undefined;
  ExerciseExperience: undefined;
  ActivityLevel: undefined;
  HealthProblems: undefined;
};

// 8. Root Parametres
export type RootStackParamList = AuthStackParamList &
  SetupStackParamList &
  MainTabParamList &
  ProfileStackParamList &
  HomeStackParamList & { Main: NavigatorScreenParams<MainTabParamList> };
