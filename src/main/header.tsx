import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { useHeaderTitle } from './HeaderContext';
import useStyles from './home/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts } from '../../styles';

interface HeaderProps {
  style?: ViewStyle;
}

const Header: React.FC<HeaderProps> = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { title } = useHeaderTitle();
  const insets = useSafeAreaInsets();

  // Geri gidilip gidilemeyeceğini kontrol eden React Navigation hook'u
  const canGoBack = navigation.canGoBack();

  const handleGoBack = () => {
    if (canGoBack) {
      navigation.goBack();
    }
  };

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        paddingTop: insets.top,
      }}
    >
      <View style={styles.title}>
        {canGoBack ? (
          <TouchableOpacity
            onPress={handleGoBack}
            style={{ position: 'absolute', left: 16, zIndex: 10 }}
          >
            <FontAwesomeIcon
              icon={faChevronLeft as IconProp}
              size={28}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
        ) : null}
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            height: 50,
          }}
        >
          <Text style={[styles.greeting, { fontFamily: fonts.fredoka }]}>
            {title || 'Fitspace'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Header;
