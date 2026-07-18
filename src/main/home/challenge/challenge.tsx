import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { api } from '../../../services/api';
import { useTheme } from '../../../theme';
import { showNotification } from '../../../utils/notificationHelper';
import useStyles from './styles';
import { localStorage } from '../../../utils/localStorage';
import { useAppDispatch } from '../../../store';
import { setToken } from '../../../store/slices/authSlice';

interface Challenge {
  total_score: number;
  userName: string;
  login_streak: number;
  completed_workouts: number;
  total_exercise_duration: number;
  total_calories: number;
  userId: number;
  id: number;
  last_login: string;
  program_id?: number;
}

type ChallengeProps = Record<string, never>;

const Challenge: React.FC<ChallengeProps> = () => {
  const { t } = useTranslation();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const isMounted = useRef(true);
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const dispatch = useAppDispatch();

  const handleUnauthorized = useCallback(() => {
    showNotification(
      t('challenge.notifications.errorTitle'),
      t('challenge.notifications.authError'),
      'danger',
    );

    localStorage.remove('authToken');
    dispatch(setToken(null));
  }, [dispatch, t]);

  const fetchChallenges = useCallback(async () => {
    try {
      const storedUserId = localStorage.getNumber('user_id');
      if (storedUserId && isMounted.current) setUserId(storedUserId);

      const response = await api.get('/api/challenge/order', {
        requiresAuth: true,
        validateStatus: s => s < 500,
      });

      if (!isMounted.current) return;

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.status === 200 && Array.isArray(response.data)) {
        const sortedChallenges = [...response.data].sort(
          (a: Challenge, b: Challenge) =>
            (b?.total_score ?? 0) - (a?.total_score ?? 0),
        );
        setChallenges(sortedChallenges);
      }
    } catch (error: any) {
      if (!isMounted.current) return;

      const isAuthError =
        error?.status === 401 ||
        error?.message?.toLowerCase().includes('no auth token');

      if (isAuthError) {
        handleUnauthorized();
      } else {
        console.log('Challenge fetch error:', error);
        showNotification(
          t('challenge.notifications.errorTitle'),
          t('challenge.notifications.fetchListGenericError'),
          'danger',
        );
      }
    }
  }, [handleUnauthorized, t]);

  useEffect(() => {
    isMounted.current = true;

    fetchChallenges();

    return () => {
      isMounted.current = false; // Bileşen kapandığında asenkron işlemleri durdurur
    };
  }, [fetchChallenges]);

  const getRankEmoji = (index: number) => {
    switch (index) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return `${index + 1}.`;
    }
  };

  // İlk 100 kişiyi göster
  const top100 = challenges.slice(0, 100);
  // Kullanıcı kendi sıralamasını bulsun
  const userIndex = challenges.findIndex(c => c.userId === userId);
  const userChallenge = userIndex !== -1 ? challenges[userIndex] : null;
  // Kullanıcı ilk 100'de değilse banner göster
  const shouldShowBanner = userChallenge && userIndex >= 100;

  // Motivasyon mesajı
  const getMotivationMessage = (rank: number, total: number) => {
    const firstGroupLimit = Math.floor(total / 3);
    const secondGroupLimit = Math.floor((total * 2) / 3);

    const topMessages = t('challenge.motivation.top', {
      returnObjects: true,
    }) as string[];
    const middleMessages = t('challenge.motivation.middle', {
      returnObjects: true,
    }) as string[];
    const bottomMessages = t('challenge.motivation.bottom', {
      returnObjects: true,
    }) as string[];

    if (rank < firstGroupLimit) {
      return topMessages[Math.floor(Math.random() * topMessages.length)];
    } else if (rank < secondGroupLimit) {
      return middleMessages[Math.floor(Math.random() * middleMessages.length)];
    } else {
      return bottomMessages[Math.floor(Math.random() * bottomMessages.length)];
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('challenge.title')}</Text>
      {shouldShowBanner && (
        <View style={styles.userRankBanner}>
          <View style={styles.userRankRow}>
            <Text style={{ fontSize: 22, marginRight: 8 }}>
              {userIndex === 0 ? '🏆' : userIndex < 3 ? '🥇' : '⭐️'}
            </Text>
            <View>
              <Text style={styles.userRankName}>
                {userChallenge.userName} {t('challenge.you')}
              </Text>
              <Text style={styles.userRankOrder}>
                {t('challenge.rank')}
                <Text style={{ fontWeight: 'bold' }}>{userIndex + 1}</Text>
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.userRankScore}>
              {userChallenge.total_score} {t('challenge.points')}
            </Text>
            <Text style={styles.userRankMotivation}>
              {getMotivationMessage(userIndex, challenges.length)}
            </Text>
          </View>
        </View>
      )}
      <ScrollView style={styles.scrollView}>
        {top100.map((challenge, index) => (
          <View
            key={challenge.id}
            style={[
              styles.rankItem,
              userId === challenge.userId
                ? { borderWidth: 3, borderColor: theme.colors.primary }
                : {},
            ]}
          >
            <View style={styles.rankInfo}>
              <Text
                style={[
                  styles.rankNumber,
                  !['🥇', '🥈', '🥉'].includes(getRankEmoji(index)) && {
                    color: theme.colors.primary,
                  },
                ]}
              >
                {getRankEmoji(index)}
              </Text>
              <Text style={styles.userId}>{challenge.userName}</Text>
            </View>
            <View style={styles.statsContainer}>
              <Text style={styles.points}>
                {challenge.total_score} {t('challenge.points')}
              </Text>
              <Text style={styles.workoutCount}>
                {challenge.completed_workouts} {t('challenge.workouts')}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default Challenge;
