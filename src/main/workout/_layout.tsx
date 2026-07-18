import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {getHeaderFor} from '../../constants/navigation';
import WorkoutScreen from './index';

const Stack = createNativeStackNavigator();

type WorkoutLayoutProps = Record<string, never>;

const WorkoutLayout: React.FC<WorkoutLayoutProps> = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: true}}>
      <Stack.Screen
        name="WorkoutScreen"
        component={WorkoutScreen}
        options={{header: getHeaderFor('WorkoutScreen')}}
      />
    </Stack.Navigator>
  );
};

export default WorkoutLayout;
