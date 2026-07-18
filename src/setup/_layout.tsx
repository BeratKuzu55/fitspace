import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Age from './age';
import Experience from './experience';
import FitnessGoal from './fitness_goal';
import Gender from './gender';
import HealthProblems from './health_problems';
import Height from './height';
import Injuries from './injuries';
import PhysicalActivityLevel from './physical_activity_level';
import Weight from './weight';

const Stack = createNativeStackNavigator();

type SetupLayoutProps = Record<string, never>;

const SetupLayout: React.FC<SetupLayoutProps> = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Gender" component={Gender} />
      <Stack.Screen name="Age" component={Age} options={{ title: 'Age' }} />
      <Stack.Screen name="Weight" component={Weight} />
      <Stack.Screen name="Height" component={Height} />
      <Stack.Screen name="FitnessGoal" component={FitnessGoal} />
      <Stack.Screen name="Experience" component={Experience} />
      <Stack.Screen
        name="PhysicalActivityLevel"
        component={PhysicalActivityLevel}
      />
      <Stack.Screen name="HealthProblems" component={HealthProblems} />
      <Stack.Screen name="Injuries" component={Injuries} />
    </Stack.Navigator>
  );
};

export default SetupLayout;
