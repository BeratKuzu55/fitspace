import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {getHeaderFor} from '../../constants/navigation';
import FavoritesScreen from './index';

const Stack = createNativeStackNavigator();

type FavoritesLayoutProps = Record<string, never>;

const FavoritesLayout: React.FC<FavoritesLayoutProps> = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: true}}>
      <Stack.Screen
        name="FavoritesScreen"
        component={FavoritesScreen}
        options={{header: getHeaderFor('FavoritesScreen')}}
      />
    </Stack.Navigator>
  );
};

export default FavoritesLayout;
