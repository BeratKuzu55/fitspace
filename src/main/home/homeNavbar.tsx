import FastImage from '@d11/react-native-fast-image';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faCalendarAlt,
  faChartLine,
  faMedal,
  faUserFriends,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import type React from 'react';
import { Pressable, Text, View } from 'react-native';
import { primitives } from '../../../styles/colors';
import { api } from '../../services/api';
import { useTheme } from '../../theme';
import { HomeStackParamList } from '../../types/navigation.ts';
import useStyles from './styles.ts';

interface NavbarProps {
  streakCount: number;
}

interface NavItem {
  id: string;
  icon?: IconProp;
  color?: string;
  // Sadece HomeStack içindeki geçerli ekran isimlerini kabul eder
  route?: keyof HomeStackParamList;
  action?: () => void;
  isCustom?: boolean;
}

const HomeNavbar: React.FC<NavbarProps> = ({ streakCount }) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useStyles(theme);

  const navigateToProgram = async function name() {
    const response = await api.get('/api/program/user', {
      requiresAuth: true,
      validateStatus: s => s < 500,
    });

    if (response.status === 200) {
      if (!response.data?.userHasProgram) {
        navigation.navigate('Home', {
          screen: 'ProgramFront',
        });
      } else {
        navigation.navigate('Home', {
          screen: 'ProgramSelect',
          params: { program: response.data },
        });
      }
    } else {
      console.log('error: the query to fetch programs failed.');
    }
  };

  const navItems: NavItem[] = [
    {
      id: 'calendar',
      icon: faCalendarAlt as IconProp,
      color: primitives.pink400,
      action: navigateToProgram,
    },
    {
      id: 'friends',
      icon: faUserFriends as IconProp,
      color: primitives.blue500,
      route: 'FriendshipFront',
    },
    { id: 'streak', isCustom: true, route: 'NotificationsFront' },
    {
      id: 'stats',
      icon: faChartLine as IconProp,
      color: primitives.pink500,
      route: 'StatisticsFront',
    },
    {
      id: 'challenges',
      icon: faMedal as IconProp,
      color: primitives.orange600,
      route: 'ChallengesFront',
    },
  ];

  return (
    <View style={styles.navBar}>
      {navItems.map(item => (
        <Pressable
          key={item.id}
          style={({ pressed }) => [
            styles.navButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
          onPress={() => {
            if (item.route) {
              navigation.navigate(item.route as any);
            } else if (item.action) {
              item.action();
            }
          }}
        >
          {item.isCustom ? (
            <View style={styles.streakContainer}>
              <FastImage
                source={require('../../assets/images/kettlebell.png')}
                style={styles.iconKettlebellImage}
                resizeMode={FastImage.resizeMode.contain}
              />
              <View style={styles.streakTextWrapper}>
                <Text style={styles.kettlebellText}>{streakCount}</Text>
              </View>
            </View>
          ) : (
            <FontAwesomeIcon
              icon={item.icon as IconProp}
              size={28}
              color={item.color}
            />
          )}
        </Pressable>
      ))}
    </View>
  );
};

export default HomeNavbar;
