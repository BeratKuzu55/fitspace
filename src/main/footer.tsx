import React from 'react';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import HomeFooter from './HomeFooter';

const HIDE_FOOTER_SCREENS = ['ActivityManager'];

const Footer: React.FC<BottomTabBarProps> = props => {
  const { state } = props;
  const currentTabRoute = state.routes[state.index];
  const currentTab = currentTabRoute.name;

  if (HIDE_FOOTER_SCREENS.includes(currentTab)) {
    return null;
  }

  return <HomeFooter {...props} />;
};

export default Footer;
