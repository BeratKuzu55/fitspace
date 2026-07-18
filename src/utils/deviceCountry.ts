import { getLocales } from 'react-native-localize';
import { COUNTRIES } from './enums/enums';

export const detectDeviceCountry = (): string => {
  try {
    const locales = getLocales();

    if (locales && locales.length > 0) {
      const countryCode = locales[0].countryCode?.toUpperCase();
      return countryCode || 'TR';
    }
    return 'TR';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return 'TR';
  }
};

export const countryCodeToDialCode = (code: string): string | null => {
  const country = COUNTRIES.find(c => c.code === code);
  return country ? country.dialCode : null;
};
