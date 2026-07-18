import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faCheckDouble,
  faCircleXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import Loader from '../../../../components/Loader';
import { api } from '../../../services/api';
import { useTheme } from '../../../theme';
import { Config } from '../../../utils';
import { localStorage } from '../../../utils/localStorage';
import useStyles from '../styles';

type Notification = {
  id: number;
  title: string;
  message: string;
  send_date: string;
};

type NotificationsFrontProps = Record<string, never>;

const NotificationsFront: React.FC<NotificationsFrontProps> = () => {
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const styles = useStyles(theme);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getString('authToken');

      const response = await axios.get(`${Config.API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: s => s < 500,
      });
      if (response.status === 200) {
        setNotifications(Array.isArray(response.data) ? response.data : []);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Bildirimler alınırken hata:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReadNotification = async (all: boolean, not_id?: number) => {
    try {
      await api.post(
        '/api/notification/read',
        { not_id, all },
        { validateStatus: s => s < 500, requiresAuth: true },
      );
      await fetchNotifications();
    } catch (error) {
      console.error('Bildirim okundu işaretlenirken hata:', error);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const storedUserId = localStorage.getString('user_id');

        if (storedUserId) {
          await fetchNotifications();
        } else {
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
      }
    })();
  }, []);

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      const ta = new Date(a.send_date).getTime();
      const tb = new Date(b.send_date).getTime();
      return tb - ta;
    });
  }, [notifications]);

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.notificationsContainer}>
      {sortedNotifications.length === 0 ? (
        <Text style={styles.emptyStateText}>
          {t('notificationsFront.emptyText')}
        </Text>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.notificationHeaderContainer}>
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={() => handleReadNotification(true)}
            >
              <FontAwesomeIcon
                icon={faCheckDouble as IconProp}
                size={16}
                color={theme.colors.black}
              />
              <Text style={styles.markAllText}>
                {t('notificationsFront.markAllRead')}
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={sortedNotifications}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (
              <View style={styles.notificationCard}>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{item.title}</Text>
                  <Text style={styles.notificationMessage}>{item.message}</Text>
                  <Text style={styles.notificationDate}>
                    {new Date(item.send_date).toLocaleString(
                      i18n.language === 'tr' ? 'tr-TR' : 'en-US',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    )}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.readButton}
                  onPress={() => handleReadNotification(false, item.id)}
                >
                  <FontAwesomeIcon
                    icon={faCircleXmark as IconProp}
                    size={18}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};

export default NotificationsFront;
