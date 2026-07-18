import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faBolt,
  faCalendarAlt,
  faClock,
  faDumbbell,
  faFire,
  faHourglassHalf,
  faTrophy,
  faUserMinus,
  faUserPlus,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useRoute } from '@react-navigation/native';
import { getDownloadURL, listAll, ref } from 'firebase/storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { storage } from '../../../../firebaseConfig';
import { api } from '../../../services/api';
import { useTheme } from '../../../theme';
import { localStorage } from '../../../utils/localStorage';
import { showNotification } from '../../../utils/notificationHelper';
import useStyles from './styles';

type UserStats = {
  total_score: number;
  login_streak: number;
  completed_workouts: number;
  total_exercise_duration: number; // dakika
  total_calories: number;
  last_login: string; // ISO
};

interface FriendDetailRouteParams {
  friend: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    profile_image_url?: string | null;
    stats?: UserStats[];
  };
  isFriend?: boolean;
}

type OutgoingForThisUser = { requestId: number; status: string } | null;

type FriendDetailProps = Record<string, never>;

const FriendDetail: React.FC<FriendDetailProps> = () => {
  const route = useRoute();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles(theme);

  const { friend, isFriend: isFriendParam } =
    route.params as FriendDetailRouteParams;
  const [isFriend, setIsFriend] = useState<boolean>(isFriendParam ?? true);

  const stat: UserStats | undefined = useMemo(
    () =>
      friend.stats && friend.stats.length > 0 ? friend.stats[0] : undefined,
    [friend.stats],
  );

  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(
    friend.profile_image_url || null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // YENİ: Bu kişiye atılmış outgoing pending var mı?
  const [outgoing, setOutgoing] = useState<OutgoingForThisUser>(null);
  const [myId, setMyId] = useState<number | null>(null);

  const loadMyId = useCallback(async () => {
    const uid = localStorage.getString('user_id');

    if (uid) setMyId(parseInt(uid, 10));
  }, []);

  const refreshOutgoingForThisFriend = useCallback(async () => {
    try {
      if (!myId) return;
      const resp = await api.get('/api/friendships/requests/outgoing', {
        requiresAuth: true,
        validateStatus: s => s < 500,
      });
      if (resp.status === 200) {
        const rows = (resp.data || []) as Array<{
          id: number;
          status: string;
          user_a: { id: number };
          user_b: { id: number };
          requested_by: { id: number };
        }>;
        const mine = rows.find(
          r =>
            r.requested_by?.id === myId &&
            (r.user_a?.id === friend.id || r.user_b?.id === friend.id),
        );
        if (mine) setOutgoing({ requestId: mine.id, status: mine.status });
        else setOutgoing(null);
      }
    } catch (error) {
      console.error('Outgoing istekleri çekilirken hatası:', error);
    }
  }, [myId, friend.id]);

  useEffect(() => {
    loadMyId();
  }, [loadMyId]);

  useEffect(() => {
    if (myId) refreshOutgoingForThisFriend();
  }, [myId, refreshOutgoingForThisFriend]);

  const formatMinutes = (secs?: number) => {
    const totalMinutes = Math.max(0, Math.floor((secs || 0) / 60)); // saniyeyi dakikaya çevir
    const h = Math.floor(totalMinutes / 60);
    const r = totalMinutes % 60;

    if (h === 0) return `${r} dk`;
    return `${h} sa ${r} dk`;
  };

  const timeAgo = (iso?: string) => {
    if (!iso) return '—';
    const now = new Date().getTime();
    const time = new Date(iso).getTime();
    const diffMin = Math.max(0, Math.floor((now - time) / 60000));
    if (diffMin < 60) return `${diffMin} dk önce`;
    const h = Math.floor(diffMin / 60);
    if (h < 24) return `${h} sa önce`;
    const d = Math.floor(h / 24);
    return `${d} gün önce`;
  };

  const fetchUserProfileImage = useCallback(
    async (userId: number): Promise<string | null> => {
      try {
        const folderRef = ref(storage, 'user-images');
        const listResult = await listAll(folderRef);
        const userFile = listResult.items.find(item =>
          item.name.startsWith(`${userId}`),
        );
        if (!userFile) return null;
        const url = await getDownloadURL(userFile);
        return url;
      } catch (error) {
        console.error('Profil fotoğrafı çekme hatası:', error);
        return null;
      }
    },
    [],
  );

  useEffect(() => {
    if (!friend.profile_image_url) {
      fetchUserProfileImage(friend.id).then(url => {
        if (url) setProfileImageUrl(url);
      });
    }
  }, [friend.id, friend.profile_image_url, fetchUserProfileImage]);

  const handleRemoveFriend = async () => {
    Alert.alert(
      t('friendDetail.alerts.removeFriendTitle'),
      t('friendDetail.alerts.removeFriendMessage', {
        fullName: `${friend.first_name} ${friend.last_name}`,
      }),
      [
        { text: t('friendDetail.alerts.cancel'), style: 'cancel' },
        {
          text: t('friendDetail.alerts.remove'),
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const response = await api.delete('/api/friendships', {
                params: { other_user_id: friend.id },
                requiresAuth: true,
                validateStatus: s => s < 500,
              });
              if (response.status === 200) {
                showNotification(
                  'Başarılı',
                  t('friendship.notifications.friendRemoved'),
                  'success',
                );
                setIsFriend(false);
              } else {
                showNotification(
                  'Hata',
                  t('friendship.notifications.friendRemoveFailed'),
                  'danger',
                );
              }
            } catch (error) {
              console.error('Arkadaş kaldırma hatası:', error);
              showNotification(
                'Hata',
                t('friendship.notifications.friendRemoveFailed'),
                'danger',
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleSendFriendRequest = async () => {
    try {
      setIsSending(true);
      const response = await api.post(
        '/api/friendships',
        { target_user_id: friend.id },
        { requiresAuth: true, validateStatus: s => s < 500 },
      );
      if (response.status === 200 || response.status === 201) {
        showNotification(
          'Başarılı',
          t('friendship.notifications.requestSent'),
          'success',
        );
        await refreshOutgoingForThisFriend(); // YENİ
      } else {
        showNotification(
          'Hata',
          t('friendship.notifications.requestSendFailed'),
          'danger',
        );
      }
    } catch (error) {
      console.error('Arkadaşlık isteği gönderme hatası:', error);
      showNotification(
        'Hata',
        t('friendship.notifications.requestSendFailed'),
        'danger',
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!outgoing) return;
    try {
      const resp = await api.post(
        '/api/friendships/cancel',
        { id: outgoing.requestId },
        { requiresAuth: true, validateStatus: s => s < 500 },
      );
      if (resp.status === 200) {
        showNotification(
          'Bilgi',
          t('friendship.notifications.requestCanceled'),
          'info',
        );
        await refreshOutgoingForThisFriend();
      } else {
        showNotification(
          'Hata',
          t('friendship.notifications.requestCancelFailed'),
          'danger',
        );
      }
    } catch (e) {
      showNotification(
        'Hata',
        t('friendship.notifications.requestCancelFailed'),
        'danger',
      );
    }
  };

  const accent = {
    score: theme.colors.accent,
    workouts: theme.colors.secondary,
    duration: theme.colors.textSecondary,
    calories: theme.colors.accent,
    streak: theme.colors.secondary,
    calendar: theme.colors.textSecondary,
  };

  const renderAction = () => {
    if (isFriend) {
      return (
        <TouchableOpacity
          style={styles.subtleDangerButton}
          onPress={handleRemoveFriend}
          disabled={isLoading}
        >
          <FontAwesomeIcon
            icon={faUserMinus as IconProp}
            size={14}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.subtleDangerText}>
            {isLoading
              ? t('friendDetail.actions.removing')
              : t('friendDetail.actions.removeFriend')}
          </Text>
        </TouchableOpacity>
      );
    }

    // Arkadaş değilse: pending var mı?
    if (outgoing?.status === 'pending') {
      return (
        <TouchableOpacity
          style={styles.subtleDangerButton}
          onPress={handleCancelRequest}
        >
          <FontAwesomeIcon
            icon={faHourglassHalf as IconProp}
            size={14}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.subtleDangerText}>
            {t('friendDetail.actions.requestPendingCancel')}
          </Text>
          <FontAwesomeIcon
            icon={faXmark as IconProp}
            size={14}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      );
    }

    // Normal "Arkadaş ekle"
    return (
      <TouchableOpacity
        style={styles.subtleDangerButton}
        onPress={handleSendFriendRequest}
        disabled={isSending}
      >
        <FontAwesomeIcon
          icon={faUserPlus as IconProp}
          size={14}
          color={theme.colors.textSecondary}
        />
        <Text style={styles.subtleDangerText}>
          {isSending
            ? t('friendDetail.actions.sending')
            : t('friendDetail.actions.addFriend')}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.profileImageContainer}>
              <Image
                source={
                  profileImageUrl
                    ? { uri: profileImageUrl }
                    : require('../../../assets/images/profil_foto_default.png')
                }
                style={styles.profileImage}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>
                {friend.first_name} {friend.last_name}
              </Text>

              <View style={styles.chipRow}>
                <View style={[styles.chip, styles.chipMuted]}>
                  <FontAwesomeIcon
                    icon={faBolt as IconProp}
                    size={12}
                    color={accent.streak}
                  />
                  <Text style={styles.chipText}>
                    {t('friendDetail.chips.streak', {
                      count: stat?.login_streak ?? 0,
                    })}
                  </Text>
                </View>
                <View style={styles.chip}>
                  <FontAwesomeIcon
                    icon={faCalendarAlt as IconProp}
                    size={12}
                    color={accent.calendar}
                  />
                  <Text style={styles.chipText}>
                    {t('friendDetail.chips.lastLogin', {
                      time: timeAgo(stat?.last_login),
                    })}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <Text style={styles.sectionTitle}>
          {t('friendDetail.sections.stats')}
        </Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderColor: accent.score }]}>
            <View
              style={[styles.accentBar, { backgroundColor: accent.score }]}
            />
            <View style={[styles.statIconWrap, { borderColor: accent.score }]}>
              <FontAwesomeIcon
                icon={faTrophy as IconProp}
                size={16}
                color={accent.score}
              />
            </View>
            <Text style={styles.statValue}>{stat?.total_score ?? 0}</Text>
            <Text style={styles.statLabel}>
              {t('friendDetail.stats.totalScore')}
            </Text>
          </View>

          <View style={[styles.statCard, { borderColor: accent.workouts }]}>
            <View
              style={[styles.accentBar, { backgroundColor: accent.workouts }]}
            />
            <View
              style={[styles.statIconWrap, { borderColor: accent.workouts }]}
            >
              <FontAwesomeIcon
                icon={faDumbbell as IconProp}
                size={16}
                color={accent.workouts}
              />
            </View>
            <Text style={styles.statValue}>
              {stat?.completed_workouts ?? 0}
            </Text>
            <Text style={styles.statLabel}>
              {t('friendDetail.stats.completedWorkouts')}
            </Text>
          </View>

          <View style={[styles.statCard, { borderColor: accent.duration }]}>
            <View
              style={[styles.accentBar, { backgroundColor: accent.duration }]}
            />
            <View
              style={[styles.statIconWrap, { borderColor: accent.duration }]}
            >
              <FontAwesomeIcon
                icon={faClock as IconProp}
                size={16}
                color={accent.duration}
              />
            </View>
            <Text style={styles.statValue}>
              {formatMinutes(stat?.total_exercise_duration)}
            </Text>
            <Text style={styles.statLabel}>
              {t('friendDetail.stats.totalDuration')}
            </Text>
          </View>

          <View style={[styles.statCard, { borderColor: accent.calories }]}>
            <View
              style={[styles.accentBar, { backgroundColor: accent.calories }]}
            />
            <View
              style={[styles.statIconWrap, { borderColor: accent.calories }]}
            >
              <FontAwesomeIcon
                icon={faFire as IconProp}
                size={16}
                color={accent.calories}
              />
            </View>
            <Text style={styles.statValue}>{stat?.total_calories ?? 0}</Text>
            <Text style={styles.statLabel}>
              {t('friendDetail.stats.totalCalories')}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>{renderAction()}</View>
      </ScrollView>
    </View>
  );
};

export default FriendDetail;
