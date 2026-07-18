import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Loader from '../../../components/Loader.tsx';
import TopFiveCard from '../../../components/topfivecard.tsx';
import { PLACEHOLDER_IMAGE, workoutImages } from '../../assets/imageMaps';
import { api } from '../../services/api.ts';
import { useTheme } from '../../theme';
import useStyles from './styles.ts';

type TopTWorkoutsProps = Record<string, never>;

const TopTWorkouts: React.FC<TopTWorkoutsProps> = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useStyles(theme);

  // 2. BELLEK YÖNETİMİ: Mount ve Abort Kontrolleri
  const isMounted = useRef(true);
  const abortController = useRef(new AbortController());

  const [topFiveWorkouts, setTopFiveWorkouts] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = abortController.current;
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      controller.abort();
    };
  }, []);

  // 3. API VERİ ÇEKME
  useEffect(() => {
    const fetchTopFiveWorkouts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/top5workouts', {
          requiresAuth: true,
          signal: abortController.current.signal,
          validateStatus: s => s < 500,
        });

        if (!isMounted.current) return;

        if (response.status === 200 && Array.isArray(response.data)) {
          setTopFiveWorkouts(response.data);
        }
      } catch (error: unknown) {
        if (axios.isCancel(error)) return;

        if (isMounted.current) {
          console.error(
            'Top five workouts fetch failed:',
            error instanceof Error ? error.message : error,
          );
        }
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchTopFiveWorkouts();
  }, [t]);

  const handlePress = useCallback(
    (id: number) => {
      if (isMounted.current) {
        navigation.navigate('ActivityManager', { workoutId: String(id) });
      }
    },
    [navigation],
  );

  if (loading) return <Loader />;

  return (
    <SafeAreaProvider>
      <Text style={styles.header}>{t('homeFront.topFive')}</Text>
      <View style={styles.cardContainer}>
        {topFiveWorkouts.slice(0, 3).map((item, index) => (
          <TopFiveCard
            key={item.id}
            workout={item}
            image={workoutImages[item.id] || PLACEHOLDER_IMAGE}
            rank={index + 1}
            onPress={() => handlePress(item.id)}
          />
        ))}
      </View>
    </SafeAreaProvider>
  );
};

export default TopTWorkouts;
