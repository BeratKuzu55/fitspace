import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native';
import { getHeaderFor } from '../../constants/navigation';
import { useTheme } from '../../theme';
import EquipmentOverride from './equipmentOverride';
import ExerciseConfigure from './exerciseConfigure';
import CameraScreen from './index';
import useStyles from './styles';

const Stack = createNativeStackNavigator();

type ExereyesLayoutProps = Record<string, never>;

const ExereyesLayout: React.FC<ExereyesLayoutProps> = () => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  return (
    <View style={styles.stackContainer}>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        <Stack.Screen
          name="PhotoDetectionScreen"
          component={CameraScreen}
          options={{ header: getHeaderFor('PhotoDetectionScreen') }}
        />
        <Stack.Screen
          name="EquipmentOverride"
          component={EquipmentOverride}
          options={{ header: getHeaderFor('EquipmentOverride') }}
        />
        <Stack.Screen
          name="ExerciseConfigure"
          component={ExerciseConfigure}
          options={{ header: getHeaderFor('ExerciseConfigure') }}
        />
      </Stack.Navigator>
    </View>
  );
};

export default ExereyesLayout;
