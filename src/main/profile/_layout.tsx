import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native';
import { getHeaderFor } from '../../constants/navigation';
import { useTheme } from '../../theme';
import ActivityLevel from './activityLevel';
import AppSettings from './appSettings';
import ExerciseExperience from './exerciseExperience';
import ExerciseGoal from './exerciseGoal';
import FitnessTests from './fitnessTests';
import HealthProblems from './healthProblems';
import HelpContact from './helpContact';
import ProfileFront from './index';
import LanguageSettings from './languageSettings';
import NotificationSettings from './notificationSettings';
import PhysicalProfile from './physicalProfile';
import PrivacyPolicy from './privacyPolicy';
import ResetPassword from './resetPassword';
import useStyles from './styles';
import ThemeSettings from './themeSettings';
import UpdateProfile from './updateProfile';

const Stack = createNativeStackNavigator();

type ProfileLayoutProps = Record<string, never>;

const ProfileLayout: React.FC<ProfileLayoutProps> = () => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  return (
    <View style={styles.layoutContainer}>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        <Stack.Screen
          name="ProfileFront"
          component={ProfileFront}
          options={{ header: getHeaderFor('ProfileFront') }}
        />
        <Stack.Screen
          name="AppSettings"
          component={AppSettings}
          options={{ header: getHeaderFor('AppSettings') }}
        />
        <Stack.Screen
          name="PhysicalProfile"
          component={PhysicalProfile}
          options={{ header: getHeaderFor('PhysicalProfile') }}
        />
        <Stack.Screen
          name="ExerciseGoal"
          component={ExerciseGoal}
          options={{ header: getHeaderFor('ExerciseGoal') }}
        />
        <Stack.Screen
          name="ExerciseExperience"
          component={ExerciseExperience}
          options={{ header: getHeaderFor('ExerciseExperience') }}
        />
        <Stack.Screen
          name="ActivityLevel"
          component={ActivityLevel}
          options={{ header: getHeaderFor('ActivityLevel') }}
        />
        <Stack.Screen
          name="HealthProblems"
          component={HealthProblems}
          options={{ header: getHeaderFor('HealthProblems') }}
        />
        <Stack.Screen
          name="FitnessTests"
          component={FitnessTests}
          options={{ header: getHeaderFor('FitnessTests') }}
        />
        <Stack.Screen
          name="HelpContact"
          component={HelpContact}
          options={{ header: getHeaderFor('HelpContact') }}
        />
        <Stack.Screen
          name="NotificationSettings"
          component={NotificationSettings}
          options={{ header: getHeaderFor('NotificationSettings') }}
        />
        <Stack.Screen
          name="LanguageSettings"
          component={LanguageSettings}
          options={{ header: getHeaderFor('LanguageSettings') }}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicy}
          options={{ header: getHeaderFor('PrivacyPolicy') }}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPassword}
          options={{ header: getHeaderFor('ResetPassword') }}
        />
        <Stack.Screen
          name="ThemeSettings"
          component={ThemeSettings}
          options={{ header: getHeaderFor('ThemeSettings') }}
        />
        <Stack.Screen
          name="UpdateProfile"
          component={UpdateProfile}
          options={{ header: getHeaderFor('UpdateProfile') }}
        />
      </Stack.Navigator>
    </View>
  );
};

export default ProfileLayout;
