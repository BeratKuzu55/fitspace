import Header from '../main/header';

export const HIDDEN_ROUTES = ['CameraScreen', 'ActivityManager'];

export const getHeaderFor = (routeName: string) =>
  HIDDEN_ROUTES.includes(routeName) ? () => null : () => <Header />;
