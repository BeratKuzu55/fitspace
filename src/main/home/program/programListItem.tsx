import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faClock, faFire } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { memo, useMemo } from 'react';
import FastImage from '@d11/react-native-fast-image';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { programImages, PLACEHOLDER_IMAGE } from '../../../assets/imageMaps';
import { ProgramProps } from './types';

export const ProgramListItem = memo(function ProgramListItem({
  item,
  onPress,
  theme,
  styles,
}: ProgramProps) {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  const imageSource = useMemo(() => {
    return programImages[item.id];
  }, [item.id]);

  const cardColor = useMemo(() => {
    switch (item.level) {
      case 'beginner':
        return theme.colors.green;
      case 'intermediate':
        return theme.colors.warning;
      case 'advanced':
        return theme.colors.primaryVariant;
      default:
        return theme.colors.surfaceVariant;
    }
  }, [item.level, theme.colors]);

  const regionLabel = useMemo(() => {
    return t(`workout.mapping.${item.body_region}`, {
      defaultValue: item.body_region,
    });
  }, [item.body_region, t]);

  const displayTitle = isEnglish ? item.name_en : item.name;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.newCardContainer,
        { backgroundColor: cardColor },
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={styles.newCardContentLeft}>
        <View style={styles.newCardPill}>
          <Text style={styles.newCardPillText}>{regionLabel}</Text>
        </View>

        <Text style={styles.newCardTitle} numberOfLines={2}>
          {displayTitle}
        </Text>

        <View style={styles.newCardStatsRow}>
          <View style={styles.newCardStatItem}>
            <FontAwesomeIcon
              icon={faFire as IconProp}
              size={14}
              color={theme.colors.black}
            />
            <Text style={styles.newCardStatText}>
              {t(`activityLevel.options.${item.level}`, {
                defaultValue: item.level,
              })}
            </Text>
          </View>

          <View style={styles.newCardStatItem}>
            <FontAwesomeIcon
              icon={faClock as IconProp}
              size={14}
              color={theme.colors.black}
            />
            <Text style={styles.newCardStatText}>
              {item.duration} {t('programSelect.week')}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.newCardImageWrapper}>
        <FastImage
          source={imageSource || PLACEHOLDER_IMAGE}
          style={styles.newCardImagePerson}
          resizeMode={FastImage.resizeMode.cover}
        />
      </View>
    </Pressable>
  );
});
