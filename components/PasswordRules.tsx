import { useTranslation } from 'react-i18next';
import type React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../src/theme';
import useGlobalStyles from '../styles/styles';
import useStyles from './component_styles';
import { usePasswordRules } from '../src/utils/usePasswordRules';
interface Props {
  rules: ReturnType<typeof usePasswordRules>;
}

const PasswordRules: React.FC<Props> = ({ rules }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const globalStyles = useGlobalStyles(theme);

  return (
    <View style={styles.passwordRulesContainer}>
      <Text style={[styles.passwordRulesTitle, globalStyles.buttonFont]}>
        {t('auth:register.passwordRules.title')}
      </Text>

      {/* Min / Max Length */}
      <View style={styles.passwordRuleItem}>
        <View style={styles.passwordRuleIcon} />
        <Text style={[styles.passwordRuleText, globalStyles.buttonFont]}>
          {t('auth:register.passwordRules.minMaxLength')}
        </Text>
      </View>
    </View>
  );
};

export default PasswordRules;
