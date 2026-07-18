import { primitives } from './colors';

export const lightShadow = {
  shadowColor: primitives.black,
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
};

export const darkShadow = {
  shadowColor: primitives.white,
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.7,
  shadowRadius: 4,
  elevation: 6,
};
