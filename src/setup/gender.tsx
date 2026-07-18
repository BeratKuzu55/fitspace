import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faMars, faVenus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { ProgressIndicator } from '../../components/ProgressIndicator';
import { useTheme } from '../theme';
import { localStorage } from '../utils/localStorage';
import useStyles from './styles';

type GenderScreenProps = Record<string, never>;

const GenderScreen: React.FC<GenderScreenProps> = () => {
  const navigation = useNavigation();
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  const handleGenderSelection = async (gender: string) => {
    setSelectedGender(gender);
    try {
      localStorage.set('profile_gender', gender);
      navigation.navigate('Age');
    } catch (error) {
      console.error('Error saving gender:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ProgressIndicator step={1} totalSteps={9} />

      <Text style={styles.title}>{t('setup.gender.title')}</Text>
      <Text style={styles.subtitle}>{t('setup.gender.subtitle')}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.genderCircle,
            selectedGender === 'male' && styles.selectedGenderCircle,
          ]}
          onPress={() => handleGenderSelection('male')}
        >
          <FontAwesomeIcon
            icon={faMars as IconProp}
            size={50}
            color={theme.colors.onPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.genderLabel}>{t('setup.gender.male')}</Text>

        <TouchableOpacity
          style={[
            styles.genderCircle,
            selectedGender === 'female' && styles.selectedGenderCircle,
          ]}
          onPress={() => handleGenderSelection('female')}
        >
          <FontAwesomeIcon
            icon={faVenus as IconProp}
            size={50}
            color={theme.colors.onPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.genderLabel}>{t('setup.gender.female')}</Text>
      </View>
    </View>
  );
};

export default GenderScreen;
