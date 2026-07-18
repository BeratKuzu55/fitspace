import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type React from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Loader from '../../../components/Loader';
import { api } from '../../services/api.ts';
import { fetchFavoriteWorkouts } from '../../services/favorite.ts';
import { check_fcm_token } from '../../services/notification.ts';
import { useAppDispatch } from '../../store';
import { setExerciseLibrary } from '../../store/slices/exerciseSlice.ts';
import { useTheme } from '../../theme';
import { showNotification } from '../../utils/notificationHelper.ts';
import HomeArticles from './homeArticles.tsx';
import HomeExercises from './homeExercises.tsx';
import HomeNavbar from './homeNavbar.tsx';
import HomeQuickStart from './homeQuickStart.tsx';
import useStyles from './styles.ts';
import TopTWorkouts from './topTWorkouts.tsx';

type Props = Record<string, never>;

const HomeFront: React.FC<Props> = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const dispatch = useAppDispatch();
  const [articles, setArticles] = useState<Article[]>([]);
  const [pendingFetchCount, setPendingFetchCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isReadyForFocus, setIsReadyForFocus] = useState(false);

  // 1. BELLEK YÖNETİMİ: Merkezi Kontrol
  const isMounted = useRef(true);
  const abortController = useRef(new AbortController());

  const startFetch = useCallback(
    () => setPendingFetchCount(prev => prev + 1),
    [],
  );
  const endFetch = useCallback(
    () => setPendingFetchCount(prev => Math.max(prev - 1, 0)),
    [],
  );

  useEffect(() => {
    const controller = abortController.current;
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const syncUserStreak = async () => {
      try {
        const response = await api.get('/api/user/statistics', {
          requiresAuth: true,
          validateStatus: s => s < 500,
        });

        await api.post(
          '/api/user/statistics',
          { userEnterenceCount: true },
          { requiresAuth: true, validateStatus: s => s < 500 },
        );

        if (isMounted.current) {
          setStreak(response.data.login_streak ?? 0);
        }
      } catch (e) {
        console.log('Streak sync error:', e);
      }
    };

    syncUserStreak();
  }, []);

  // 3. BLOG VE KÜTÜPHANE FETCH (Güvenli Hale Getirildi)
  useEffect(() => {
    const controller = abortController.current;

    const fetchBlogPosts = async () => {
      try {
        startFetch();
        const response = await api.get('/api/articles', {
          signal: controller.signal,
          requiresAuth: true,
        });

        if (isMounted.current && Array.isArray(response.data)) {
          const activeArticles = response.data.filter(
            (a: Article) => a?.is_active,
          );
          setArticles(activeArticles);
        }
      } catch (error: any) {
        if (error.name === 'AbortError' || error.__CANCEL__) {
          return;
        }
        console.error('Blog fetch failed:', error);
      } finally {
        if (isMounted.current) endFetch();
      }
    };

    const getExercisesLibrary = async () => {
      try {
        const response = await api.get('/api/exercises', {
          signal: controller.signal,
          requiresAuth: true,
        });
        if (isMounted.current) {
          dispatch(setExerciseLibrary(response.data));
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        showNotification(t('homeFront.notifications.errorTitle'), 'warning');
      }
    };

    fetchBlogPosts();
    getExercisesLibrary();
  }, [dispatch, navigation, t, startFetch, endFetch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReadyForFocus(true);
    }, 1000); // 1 saniye sonra odaklanmaya izin ver
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFavoriteWorkouts();

      check_fcm_token();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (pendingFetchCount > 0) return <Loader />;

  return (
    <SafeAreaProvider style={styles.homeContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        focusable={isReadyForFocus}
        accessible={isReadyForFocus}
        descendantFocusability={
          isReadyForFocus ? 'afterDescendants' : 'blocksDescendants'
        }
      >
        <HomeNavbar streakCount={streak} />
        {/*   <HomeQuickStart /> */}
        <HomeExercises />
        <Pressable
          style={({ pressed }) => [
            styles.exerAiAnalyseButton,
            { transform: [{ scale: pressed ? 0.98 : 1 }] }, // Basılma hissi
          ]}
          onPress={() => navigation.navigate('AiAnalyseFront')}
        >
          {/* Arka Plan Görseli */}
          <FastImage
            source={require('../../assets/images/ai_background.png')}
            style={styles.absoluteImage}
            resizeMode={FastImage.resizeMode.cover}
          />

          {/* İçerik Katmanı (Overlay) */}
          <View style={styles.buttonContent}>
            <Text style={styles.selectProgramText}>
              {t('homeFront.exerAiAnalysis')}
            </Text>
          </View>
        </Pressable>
       
        <TopTWorkouts />
        <HomeArticles articles={articles} />
      </ScrollView>
    </SafeAreaProvider>
  );
};

export default HomeFront;
