import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faCircleInfo,
  faDumbbell,
  faHeartbeat,
  faPersonRunning,
  faRunning,
  faStar,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemeType } from '../../theme';

const options = [
  {
    id: '1',
    label: 'workout.options.endurance',
    icon: faRunning,
    typeName: 'endurance',
  },
  {
    id: '2',
    label: 'workout.options.strength',
    icon: faDumbbell,
    typeName: 'strength',
  },
  {
    id: '3',
    label: 'workout.options.cardio',
    icon: faHeartbeat,
    typeName: 'cardio',
  },
];

const equipmentOptions = [
  {
    id: '4',
    label: 'workout.equipment.withEquipment',
    icon: faDumbbell,
    withEquipment: true,
  },
  {
    id: '5',
    label: 'workout.equipment.bodyweight',
    icon: faPersonRunning,
    withEquipment: false,
  },
];

const mapping: Record<string, string> = {
  leg: 'workout.mapping.leg',
  arm: 'workout.mapping.arm',
  abdomen: 'workout.mapping.abdomen',
  chest: 'workout.mapping.chest',
  shoulder: 'workout.mapping.shoulder',
  back: 'workout.mapping.back',
};

interface BodyRegion {
  id: number;
  name: string;
}

interface FilterProps {
  selectedGoal: string;
  setSelectedGoal: (val: string | ((prev: string) => string)) => void;
  selectedEquipment: string;
  setSelectedEquipment: (val: string | ((prev: string) => string)) => void;
  selectedRegion: string;
  setSelectedRegion: (val: string | ((prev: string) => string)) => void;
  showOnlyFavorites: boolean;
  setShowOnlyFavorites: (val: boolean | ((prev: boolean) => boolean)) => void;
  bodyRegions: BodyRegion[];
  getImageForRegion: (name: string) => ImageSourcePropType;
  theme: ThemeType;
  styles: any;
}

const WorkoutScreenFilter = ({
  selectedGoal,
  setSelectedGoal,
  selectedEquipment,
  setSelectedEquipment,
  selectedRegion,
  setSelectedRegion,
  showOnlyFavorites,
  setShowOnlyFavorites,
  bodyRegions,
  getImageForRegion,
  theme,
  styles,
}: FilterProps) => {
  const { t } = useTranslation();

  return (
    <View>
      <View style={styles.infoRow}>
        <FontAwesomeIcon
          icon={faCircleInfo as IconProp}
          size={16}
          style={styles.infoIcon}
          color={theme.colors.border}
        />
        <Text style={styles.infoText}>
          {t('workout.info.selectGoalEquipment')}
        </Text>
      </View>

      {/* Goal Selection */}
      <View style={styles.buttonGroup}>
        {options.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              selectedGoal === option.typeName && styles.optionSelected,
            ]}
            onPress={() => {
                setSelectedGoal(prev => {
                  const nextGoal = prev === option.typeName ? '' : option.typeName;
                  if (nextGoal !== 'strength') {
                    setSelectedRegion('');
                  }

                  return nextGoal;
                });
              }
            }
          >
            <FontAwesomeIcon
              icon={option.icon as IconProp}
              color={theme.colors.black}
              style={styles.optionIcon}
            />
            <Text style={styles.optionLabel}>
              {t(option.label)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Equipment Selection */}
      <View style={styles.buttonGroup}>
        {equipmentOptions.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.equipmentOptions,
              selectedEquipment === option.id && styles.optionSelected,
            ]}
            onPress={() =>
              setSelectedEquipment(prev =>
                prev === option.id ? '' : option.id,
              )
            }
          >
            <FontAwesomeIcon
              icon={option.icon as IconProp}
              style={styles.optionIcon}
            />
            <Text style={styles.optionLabel}>
              {t(option.label)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Target Region Header */}
      <View style={styles.infoRow}>
        <View style={styles.infoRowLeft}>
          <FontAwesomeIcon
            icon={faCircleInfo as IconProp}
            size={16}
            style={styles.infoIcon}
            color={theme.colors.border}
          />
          <Text style={styles.infoText}>
            {t('workout.info.selectTargetRegion')}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.favoriteFilterButton,
            showOnlyFavorites && styles.favoriteFilterButtonActive,
          ]}
          onPress={() => setShowOnlyFavorites(prev => !prev)}
        >
          <FontAwesomeIcon
            icon={faStar as IconProp}
            size={16}
            color={
              showOnlyFavorites ? theme.colors.onPrimary : theme.colors.textPrimary
            }
          />
        </TouchableOpacity>
      </View>

      {/* Body Regions Grid */}
      {selectedGoal === 'strength' && (
        <View style={styles.regionGrid}>
          {bodyRegions.map(region => {
            const regionKey = region.name.toLowerCase();
            const isSelected = selectedRegion === regionKey;

            return (
              <TouchableOpacity
                key={region.id}
                style={[styles.regionCard, isSelected && styles.selectedCard]}
                onPress={() =>
                  setSelectedRegion(prev =>
                    prev === regionKey ? '' : regionKey,
                  )
                }
              >
                <Image
                  source={getImageForRegion(region.name)}
                  style={styles.cardImage}
                />
                <View style={[styles.cardTextContainer, isSelected && styles.selectedCardTextContainer]}>
                  <Text
                    style={[
                      styles.cardText,
                      isSelected && styles.selectedCardText,
                    ]}
                  >
                    {mapping[regionKey] ? t(mapping[regionKey]) : region.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default memo(WorkoutScreenFilter);
