import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faHouse, faUser, faVideo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import FastImage from '@d11/react-native-fast-image';
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import useStyles from './home/styles';

const icons = {
  Home: faHouse,
  WorkoutLight: require('../assets/images/muscle_white.png'),
  WorkoutDark: require('../assets/images/muscle.png'),
  WorkoutHovered: require('../assets/images/muscle_purple.png'),
  ExereyesLight: require('../assets/images/exereyes_white.png'),
  ExereyesDark: require('../assets/images/exereyes_black.png'),
  ExereyesHovered: require('../assets/images/exereyes_purple.png'),
  Favorites: faVideo,
  Profile: faUser,
};

const IMAGE_TABS = ['Exereyes', 'Workout'] as const;

const HomeFooter: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const insets = useSafeAreaInsets();

  const renderButton = (
    route: (typeof state.routes)[number],
    index: number,
  ) => {
    const isFocused = state.index === index;
    const { options } = descriptors[route.key];
    const routeName = route.name as keyof typeof icons;

    let iconSource;
    if (!(IMAGE_TABS as readonly string[]).includes(route.name)) {
      iconSource = icons[routeName];
    }

    if (!(IMAGE_TABS as readonly string[]).includes(route.name) && !iconSource)
      return null;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    const iconStyle =
      route.name === 'Exereyes' ? styles.centralIcon : styles.iconButton;

    const isImageTab = (IMAGE_TABS as readonly string[]).includes(route.name);

    // Workout tabı için görsel kaynağını belirleme
    let workoutImageSource = null;
    if (route.name === 'Workout') {
      if (isFocused) {
        // Seçiliyse mor görseli kullan
        workoutImageSource = icons.WorkoutHovered;
      } else {
        // Seçili değilse temaya göre açık veya koyu görseli kullan
        workoutImageSource = theme.dark
          ? icons.WorkoutLight
          : icons.WorkoutDark;
      }
    }

    // Workout tabı için görsel kaynağını belirleme
    let exereyesImageSource = null;
    if (route.name === 'Exereyes') {
      if (isFocused) {
        // Seçiliyse mor görseli kullan
        exereyesImageSource = icons.ExereyesHovered;
      } else {
        // Seçili değilse temaya göre açık veya koyu görseli kullan
        exereyesImageSource = theme.dark
          ? icons.ExereyesLight
          : icons.ExereyesDark;
      }
    }

    return (
      <TouchableOpacity
        key={route.key}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        onPress={onPress}
      >
        {isImageTab ? (
          <View style={styles.iconBg}>
            <FastImage
              source={
                // Exereyes için doğrudan icons[routeName], Workout için belirlenen workoutImageSource kullanılır
                route.name === 'Workout'
                  ? workoutImageSource
                  : route.name === 'Exereyes'
                    ? exereyesImageSource
                    : (icons[routeName] as IconProp)
              }
              style={iconStyle}
              resizeMode={FastImage.resizeMode.contain}
            />
          </View>
        ) : (
          <FontAwesomeIcon
            icon={iconSource as IconProp}
            size={30}
            color={
              isFocused ? theme.colors.primary : theme.colors.textPrimary
            }
            style={iconStyle}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => renderButton(route, index))}
    </View>
  );
};

export default HomeFooter;
