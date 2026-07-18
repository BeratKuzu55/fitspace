import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import Loader from '../../../components/Loader';
import { api } from '../../services/api';
import ActivitySummary from './activitySummary';
import ActivityExercise from './activityExercise';
import ActivityFinish from './activityFinish';
import ActivityRest from './activityRest';
import useStyles from './styles';
import { useTheme } from '../../theme';
import { Exercise, ExerciseType, WorkoutDetails } from './types';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../../../firebaseConfig';
import { MainTabParamList } from '../../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type ActivityState = 'summary' | 'exercise' | 'rest' | 'finish';
type ActivityManagerRouteProp = RouteProp<MainTabParamList, 'ActivityManager'>;
type ActivityManagerNavigationProp =
  NativeStackNavigationProp<MainTabParamList>;

type ActivityManagerProps = Record<string, never>;

const ActivityManager: React.FC<ActivityManagerProps> = () => {
  const route = useRoute<ActivityManagerRouteProp>();
  const navigation = useNavigation<ActivityManagerNavigationProp>();
  const { workoutId, customWorkout } = route.params;
  const { theme } = useTheme();
  const styles = useStyles(theme);
  
  // --- MERKEZİ STATE YÖNETİMİ ---
  const [currentView, setCurrentView] = useState<ActivityState>('summary');
  const [workoutData, setWorkoutData] = useState<WorkoutDetails>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);

  // 1. Veriyi Çekme
  useEffect(() => {
    setLoading(true);
    setCurrentView('summary');
    setCurrentIndex(0);
    setCurrentVideoUrl(null);
    setIsStarting(false);

    const calculateAndSetWorkout = (data: any) => {
      // Egzersizleri warmup → main → cool_down sırasına göre sırala
      const typeOrder: Record<ExerciseType, number> = {
        warmup: 1,
        main: 2,
        cool_down: 3,
      };
      
      const sortedExercises = [...(data.exercises || [])].sort((a, b) => {
        const orderA = typeOrder[a.exercise_type as ExerciseType] || 999;
        const orderB = typeOrder[b.exercise_type as ExerciseType] || 999;
        return orderA - orderB;
      });

      // Toplam süre hesabı
      const calculatedTime = sortedExercises.reduce(
        (acc: number, ex: Exercise) => {
          const reps = Number(ex.repetitions) || 0;
          const sets = Number(ex.setcount) || 1;
          const dur = Number(ex.duration) || 0;
          const restDur = Number(ex.rest_duration) || 20;
          
          // duration > 0 ve repetitions > 0 → duration öncelikli (süre bazlı)
          // duration = 0 ve repetitions > 0 → tekrar bazlı
          // duration > 0 ve repetitions = 0 → süre bazlı
          const isRepBased = reps > 0 && dur === 0;
          const exerciseTime = isRepBased
            ? reps * sets * 3 // Tekrar bazlı: varsayılan olarak her tekrar 3 saniye (veya 0 kabul edilebilir)
            : dur * sets; // Süre bazlı (duration öncelikli)
          
          // Setler arası dinlenme (son set hariç)
          const restTime = Math.max(sets - 1, 0) * restDur;
          
          return acc + exerciseTime + restTime;
        },
        0,
      );

      setWorkoutData({ ...data, exercises: sortedExercises, time: calculatedTime });
      setLoading(false);
    };

    // SENARYO A: Exereyes Modülü (On-the-fly veri geldi)
    if (customWorkout) {
      calculateAndSetWorkout({
        ...customWorkout.workoutInformations,
        exercises: customWorkout.exercises,
      });
    }
    // SENARYO B: Standart Modül (Sadece ID geldi)
    else if (workoutId) {
      const fetchWorkout = async () => {
        try {
          const res = await api.get<Omit<WorkoutDetails, 'time'>>(
            '/api/workout',
            {
              params: { id: workoutId },
              requiresAuth: true,
            },
          );

          if (res.status === 200 && res.data) {
            const rawData = res.data;

            // Egzersizleri warmup → main → cool_down sırasına göre sırala
            const typeOrder: Record<ExerciseType, number> = {
              warmup: 1,
              main: 2,
              cool_down: 3,
            };
            
            const sortedExercises = [...(rawData.exercises || [])].sort((a, b) => {
              const orderA = typeOrder[a.exercise_type as ExerciseType] || 999;
              const orderB = typeOrder[b.exercise_type as ExerciseType] || 999;
              return orderA - orderB;
            });

            // Toplam süre hesabı (Saniye cinsinden)
            const calculatedTime = sortedExercises.reduce(
              (acc: number, ex: Exercise) => {
                const reps = Number(ex.repetitions) || 0;
                const sets = Number(ex.setcount) || 1;
                const dur = Number(ex.duration) || 0;
                const restDur = Number(ex.rest_duration) || 20;
                
                // duration > 0 ve repetitions > 0 → duration öncelikli (süre bazlı)
                // duration = 0 ve repetitions > 0 → tekrar bazlı
                // duration > 0 ve repetitions = 0 → süre bazlı
                const isRepBased = reps > 0 && dur === 0;
                const exerciseTime = isRepBased
                  ? reps * sets * 3 // Tekrar bazlı: varsayılan olarak her tekrar 3 saniye (veya 0 kabul edilebilir)
                  : dur * sets; // Süre bazlı (duration öncelikli)
                
                // Setler arası dinlenme (son set hariç)
                const restTime = Math.max(sets - 1, 0) * restDur;
                
                return acc + exerciseTime + restTime;
              },
              0,
            );

            setWorkoutData({ ...rawData, exercises: sortedExercises, time: calculatedTime });
          }
        } catch (error) {
          console.error('Workout Fetch Error:', error);
          navigation.goBack();
        } finally {
          setLoading(false);
        }
      };
      fetchWorkout();
    }
  }, [customWorkout, navigation, workoutId]);

  // --- NAVİGASYON FONKSİYONLARI ---
  const handleStart = async () => {
    if (!workoutData || workoutData.exercises.length === 0) return;

    setIsStarting(true);
    try {
      const firstEx = workoutData.exercises[0];
      const videoRef = ref(storage, `exercise-videos/${firstEx.id}.mp4`);
      const url = await getDownloadURL(videoRef);

      setCurrentVideoUrl(url); // Videoyu hazırla
      setCurrentView('exercise'); // Sahneyi değiştir
    } catch (error) {
      console.error('Video pre-fetch hatası:', error);
      // Video yüklenemese de antrenmanı başlatıyoruz (fallback)
      setCurrentView('exercise');
    } finally {
      setIsStarting(false);
    }
  };

  const handleNext = useCallback(() => {
    if (!workoutData) return;

    const exercise = workoutData.exercises[currentIndex];
    const totalSets = Number(exercise.setcount) || 1;
    
    // 1. Durum: Egzersizin setleri henüz bitmediyse
    if (currentSet < totalSets) {
      // Aynı egzersizde kal, dinlenmeye geç (set artırma handleRestEnd'de yapılacak)
      setCurrentView('rest');
    }
    // 2. Durum: Egzersizin son seti bittiyse
    else {
      // Bir sonraki egzersiz var mı?
      if (currentIndex < workoutData.exercises.length - 1) {
        // Yeni egzersize geç, dinlenmeye geç
        setCurrentView('rest');
      } else {
        // Antrenman tamamen bitti - finish ekranına geç
        setCurrentView('finish');
      }
    }
  }, [currentIndex, currentSet, workoutData]);

  const handleRestEnd = async (videoUrlFromRest: string | null) => {
    const exercise = workoutData!.exercises[currentIndex];
    const totalSets = Number(exercise.setcount) || 1;

    // Eğer aynı egzersizin yeni setine başlıyorsak video zaten elimizde
    if (currentSet < totalSets) {
      setCurrentSet(prev => prev + 1);
      // Video URL'i değişmiyor, mevcut olanı koru
      setCurrentView('exercise');
    }
    // Eğer tamamen yeni bir egzersize geçiyorsak
    else {
      setCurrentIndex(prev => prev + 1);
      setCurrentSet(1);
      setCurrentVideoUrl(videoUrlFromRest); // Rest'in indirdiği yeni videoyu al
      setCurrentView('exercise');
    }
  };

  const handleExit = () => {
    navigation.navigate('Home', { screen: 'HomeFront' });
  };

  if (loading || !workoutData) return <Loader />;

  const currentExercise = workoutData.exercises[currentIndex];
  const totalSets = Number(currentExercise.setcount) || 1;
  const isLastSet = currentSet >= totalSets;
  const nextExercise = isLastSet
    ? workoutData.exercises[currentIndex + 1]
    : currentExercise;

  // --- STATE-BASED RENDERING ---
  return (
    <View style={styles.container} key={workoutId}>
      {currentView === 'summary' && (
        <ActivitySummary
          data={workoutData}
          onStart={handleStart}
          isStarting={isStarting}
        />
      )}

      {currentView === 'exercise' && (
        <ActivityExercise
          exercise={currentExercise}
          currentSet={currentSet}
          videoUrl={currentVideoUrl}
          onNext={handleNext}
          onPrev={() => {
            if (currentSet > 1) setCurrentSet(prev => prev - 1);
            else setCurrentIndex(Math.max(0, currentIndex - 1));
          }}
          onExit={handleExit}
          allExercises={workoutData.exercises}
        />
      )}

      {currentView === 'rest' && (
        <ActivityRest
          nextExercise={nextExercise}
          isNextSet={!isLastSet}
          onRestEnd={handleRestEnd}
          onSkip={handleRestEnd}
        />
      )}

      {currentView === 'finish' && (
        <ActivityFinish
          onDone={() => navigation.navigate('Home', { screen: 'HomeFront' })}
          workoutData={workoutData}
          isCustomWorkout={customWorkout ? true : false}
        />
      )}
    </View>
  );
};

export default ActivityManager;
