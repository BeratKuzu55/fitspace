import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, View } from 'react-native';
import RoundedButton from '../../../components/RoundedButton';
import SegmentedRadioButton from '../../../components/SegmentedRadioButton';
import { api } from '../../services/api';
import { useTheme } from '../../theme';
import { showNotification } from '../../utils/notificationHelper';
import useStyles from './styles';

type ActivityLevelProps = Record<string, never>;

const ActivityLevel: React.FC<ActivityLevelProps> = () => {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);

  const options = [
    'activityLevel.options.beginner',
    'activityLevel.options.intermediate',
    'activityLevel.options.advanced',
  ];
  const [selected, setSelected] = useState<string | null>(
    'activityLevel.options.intermediate',
  );

  const fetchActivityLevel = useCallback(async () => {
    try {
      const response = await api.get('/api/user', {
        requiresAuth: true,
        validateStatus: s => s < 500,
      });

      if (!isMounted.current) return;

      if (response.status === 200) {
        const level = response.data?.user?.activity_level;
        const mapped =
          level === 'beginner'
            ? 'activityLevel.options.beginner'
            : level === 'intermediate'
              ? 'activityLevel.options.intermediate'
              : level === 'advanced'
                ? 'activityLevel.options.advanced'
                : null;
        setSelected(mapped);
      } else {
        showNotification(
          t('activityLevel.notifications.errorTitle'),
          t('activityLevel.notifications.infoFetchFailed'),
          'danger',
        );
      }
    } catch (error) {
      console.error(error);
      showNotification(
        t('activityLevel.notifications.errorTitle'),
        t('activityLevel.notifications.generic'),
        'danger',
      );
    }
  }, [t]);

  useEffect(() => {
    isMounted.current = true;
    fetchActivityLevel();
    return () => {
      isMounted.current = false;
    };
  }, [fetchActivityLevel]);

  const handleSubmit = async () => {
    if (!selected) {
      Alert.alert(t('activityLevel.notifications.missingSelection'));
      return;
    }
    setLoading(true);

    const payload = {
      activity_level:
        selected === 'activityLevel.options.beginner'
          ? 'beginner'
          : selected === 'activityLevel.options.intermediate'
            ? 'intermediate'
            : 'advanced',
    };

    try {
      const response = await api.post('/api/user', payload, {
        requiresAuth: true,
        validateStatus: s => s < 500,
      });

      if (response.status >= 200 && response.status < 300) {
        showNotification(
          t('activityLevel.notifications.updateSuccessTitle'),
          t('activityLevel.notifications.updateSuccessMessage'),
          'success',
        );
      } else {
        showNotification(
          t('activityLevel.notifications.errorTitle'),
          t('activityLevel.notifications.updateFailed'),
          'danger',
        );
      }
    } catch (error) {
      console.error(error);
      showNotification(
        t('activityLevel.notifications.errorTitle'),
        t('activityLevel.notifications.updateError'),
        'danger',
      );
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('activityLevel.title')}</Text>
      <View style={styles.segmentedGroup}>
        {options.map(option => (
          <SegmentedRadioButton
            key={option}
            title={t(option)}
            selected={selected === option}
            onPress={() => setSelected(option)}
          />
        ))}
      </View>
      <RoundedButton
        text={t('activityLevel.buttons.confirm')}
        onPress={handleSubmit}
        loading={loading}
      />
    </View>
  );
};

export default ActivityLevel;
