import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  RouteProp,
  getFocusedRouteNameFromRoute,
} from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';
import { HIDDEN_ROUTES } from '../constants/navigation';
import { useTheme } from '../theme';
import ExereyesLayout from './exereyes/_layout';
import FavoritesLayout from './favorites/_layout';
import Footer from './footer';
import HomeLayout from './home/_layout';
import ProfileLayout from './profile/_layout';
import useStyles from './styles';
import WorkoutLayout from './workout/_layout';
import ActivityManager from './activity/activityManager';

const Tab = createBottomTabNavigator();

type MainLayoutProps = Record<string, never>;

const MainLayout: React.FC<MainLayoutProps> = () => {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const renderTabBar = (props: any) => <Footer {...props} />;

  function shouldHideFooter(route: Partial<RouteProp<any, any>>) {
    const nestedRoute = getFocusedRouteNameFromRoute(route) ?? '';
    return HIDDEN_ROUTES.includes(nestedRoute);
  }

  return (
    <View style={[styles.container]} collapsable={false}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: shouldHideFooter(route)
            ? { display: 'none' }
            : { backgroundColor: theme.colors.surface, borderTopWidth: 0 },
        })}
        tabBar={renderTabBar}
      >
        <Tab.Screen name="Home" component={HomeLayout} />
        <Tab.Screen name="Workout" component={WorkoutLayout} />
        <Tab.Screen name="Favorites" component={FavoritesLayout} />
        <Tab.Screen name="Profile" component={ProfileLayout} />
        <Tab.Screen name="ActivityManager" component={ActivityManager} />
      </Tab.Navigator>
    </View>
  );
};

export default MainLayout;
