import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import React, { SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { ProgressIndicator } from '../../components/ProgressIndicator';
import RoundedButton from '../../components/RoundedButton';
import { useTheme } from '../theme';
import { localStorage } from '../utils/localStorage';
import useStyles from './styles';

type AgeScreenProps = Record<string, never>;

const AgeScreen: React.FC<AgeScreenProps> = () => {
  const navigation = useNavigation();
  const [selectedAge, setSelectedAge] = useState(45); // Görselde 45 gösterilmiş.
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  const handleNext = async () => {
    try {
      localStorage.set('profile_age', selectedAge.toString());

      navigation.navigate('Weight');
    } catch (error) {
      console.error('Error saving age:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ProgressIndicator step={2} totalSteps={9} />

      <Text style={styles.title}>{t('setup.age.title')}</Text>
      <Text style={styles.subtitle}>{t('setup.age.subtitle')}</Text>

      <Text style={styles.ageDisplay}>{selectedAge}</Text>

      <Slider
        style={styles.slider}
        minimumValue={15}
        maximumValue={80}
        step={1}
        value={selectedAge}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor={theme.colors.onSurface}
        thumbTintColor={theme.colors.primary}
        onValueChange={(value: SetStateAction<number>) => setSelectedAge(value)}
      />
      <RoundedButton text={t('setup.next')} onPress={handleNext} />
    </View>
  );
};

export default AgeScreen;
