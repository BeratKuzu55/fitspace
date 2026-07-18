import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faBullseye,
  faChartLine,
  faDumbbell,
  faHeartbeat,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import ProfileButton from '../../../components/ProfileButton';
import { useTheme } from '../../theme';
import { ProfileStackParamList } from '../../types/navigation';
import useStyles from './styles';

type PhysicalProfileProps = Record<string, never>;

const PhysicalProfile: React.FC<PhysicalProfileProps> = () => {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('physicalProfile.title')}</Text>
      <ProfileButton
        title={t('physicalProfile.buttons.exerciseGoal')}
        icon={faBullseye as IconProp}
        onPress={() => navigation.navigate('ExerciseGoal')}
      />
      <ProfileButton
        title={t('physicalProfile.buttons.exerciseExperience')}
        icon={faDumbbell as IconProp}
        onPress={() => navigation.navigate('ExerciseExperience')}
      />
      <ProfileButton
        title={t('physicalProfile.buttons.activityLevel')}
        icon={faChartLine as IconProp}
        onPress={() => navigation.navigate('ActivityLevel')}
      />
      <ProfileButton
        title={t('physicalProfile.buttons.healthHistory')}
        icon={faHeartbeat as IconProp}
        onPress={() => navigation.navigate('HealthProblems')}
      />
    </View>
  );
};

export default PhysicalProfile;
