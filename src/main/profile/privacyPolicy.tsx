import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import useStyles from './styles';

interface PrivacyPolicyProps {
  showContainer?: boolean;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({
  showContainer = true,
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  const content = (
    <View style={styles.content}>
      <Text style={styles.title}>{t('privacyPolicy.title')}</Text>

      <Text style={styles.paragraph}>{t('privacyPolicy.intro')}</Text>

      <Text style={styles.paragraph}>{t('privacyPolicy.dataSharing')}</Text>

      <Text style={styles.heading}>{t('privacyPolicy.cookiePolicyTitle')}</Text>

      <Text style={styles.paragraph}>
        {t('privacyPolicy.cookiePolicyIntro')}
      </Text>

      <Text style={styles.subHeading}>
        {t('privacyPolicy.whatAreCookies.title')}
      </Text>
      <Text style={styles.paragraph}>
        {t('privacyPolicy.whatAreCookies.content')}
      </Text>
      <Text style={styles.subHeading}>
        {t('privacyPolicy.whatCookiesCannotDo.title')}
      </Text>
      <Text style={styles.paragraph}>
        {t('privacyPolicy.whatCookiesCannotDo.content')}
      </Text>
      <Text style={styles.subHeading}>
        {t('privacyPolicy.howCookiesCollected.title')}
      </Text>
      <Text style={styles.paragraph}>
        {t('privacyPolicy.howCookiesCollected.content')}
      </Text>
      <Text style={styles.subHeading}>
        {t('privacyPolicy.whyUseCookies.title')}
      </Text>
      <Text style={styles.paragraph}>
        {t('privacyPolicy.whyUseCookies.content')}
      </Text>
      <Text style={styles.subHeading}>
        {t('privacyPolicy.cookieTypes.title')}
      </Text>
      <Text style={styles.paragraph}>
        {t('privacyPolicy.cookieTypes.content')}
      </Text>
      <Text style={styles.subHeading}>
        {t('privacyPolicy.contactUs.title')}
      </Text>
      <Text style={styles.paragraph}>
        {t('privacyPolicy.contactUs.content')}
      </Text>
    </View>
  );

  if (showContainer) {
    return <ScrollView style={styles.container}>{content}</ScrollView>;
  }

  return content;
};

export default PrivacyPolicy;
