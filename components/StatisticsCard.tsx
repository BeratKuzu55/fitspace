import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faClock,
  faDoorOpen,
  faDumbbell,
  faFire,
  faStar,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../src/theme';
import useStyles from './component_styles';
import { StatisticsCardProps, StatType } from './types';

const hexToRGBA = (hex: string, opacity: number) => {
  if (!hex || !hex.startsWith('#')) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const StatisticsCard: React.FC<StatisticsCardProps> = ({
  type,
  value,
  title,
  suffix,
  backgroundColor,
  textColor,
  iconContainerColor,
}) => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles(theme);

  const meta = useMemo(() => {
    const config: Record<
      StatType,
      { title: string; icon: IconDefinition; suffix: string }
    > = {
      calorie: {
        title: t('statisticsCard.calorie.title'),
        icon: faFire,
        suffix: t('statisticsCard.calorie.suffix'),
      },
      duration: {
        title: t('statisticsCard.duration.title'),
        icon: faClock,
        suffix: t('statisticsCard.duration.suffix'),
      },
      loginStreak: {
        title: t('statisticsCard.loginStreak.title'),
        icon: faDoorOpen,
        suffix: t('statisticsCard.loginStreak.suffix'),
      },
      score: {
        title: t('statisticsCard.score.title'),
        icon: faStar,
        suffix: t('statisticsCard.score.suffix'),
      },
      workouts: {
        title: t('statisticsCard.workouts.title'),
        icon: faDumbbell,
        suffix: t('statisticsCard.workouts.suffix'),
      },
    };
    return config[type];
  }, [type, t]);

  const formattedValue = useMemo(() => {
    const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(
      value,
    );
  }, [value, i18n.language]);

  const label = title ?? meta.title;
  const unit = suffix ?? meta.suffix;
  const activeTextColor = textColor ?? theme.colors.textPrimary;

  const containerStyle = StyleSheet.flatten([
    styles.card,
    { backgroundColor: backgroundColor ?? theme.colors.backgroundOverlay },
  ]);

  const iconWrapStyle = StyleSheet.flatten([
    styles.iconWrap,
    { backgroundColor: iconContainerColor ?? theme.colors.surfaceVariant },
  ]);

  return (
    <View style={containerStyle}>
      <View style={iconWrapStyle}>
        <FontAwesomeIcon
          icon={meta.icon as IconProp}
          size={24}
          color={activeTextColor}
        />
      </View>

      <View style={styles.textCol}>
        <Text
          style={[styles.title, { color: hexToRGBA(activeTextColor, 0.8) }]}
          numberOfLines={1}
        >
          {label}
        </Text>
        <View style={styles.valueRow}>
          <Text style={[styles.value, { color: activeTextColor }]}>
            {formattedValue}
          </Text>
          {unit ? (
            <Text
              style={[
                styles.suffix,
                { color: hexToRGBA(activeTextColor, 0.6) },
              ]}
            >
              {unit}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
};

export default React.memo(StatisticsCard);
