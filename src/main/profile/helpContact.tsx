import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import AccordionItem from '../../../components/AccordionItem';
import Alert from '../../../components/Alert';
import SegmentSwitch from '../../../components/SegmentSwitch';
import { api } from '../../services/api';
import { logoutUser } from '../../services/auth';
import { useTheme } from '../../theme';
import { showNotification } from '../../utils/notificationHelper';
import useStyles from './styles';
import {
  AccountActionItemProps,
  AccountActionsConfig,
  ContactConfig,
  ContactSectionProps,
  FAQItem,
} from './types';

type MainTabKey = 'faq' | 'contact';
type SubTabKey = 'general' | 'account' | 'services';
type ActionType = 'delete' | 'deactivate' | null;

type HelpCenterProps = Record<string, never>;

const HelpCenter: React.FC<HelpCenterProps> = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const isMounted = useRef(true);

  const [activeMainTab, setActiveMainTab] = useState<MainTabKey>('faq');
  const [activeSubTab, setActiveSubTab] = useState<SubTabKey>('general');
  const [searchText, setSearchText] = useState('');
  const [deactivateExpanded, setDeactivateExpanded] = useState(false);
  const [deleteExpanded, setDeleteExpanded] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<ActionType>(null);

  const mainTabConfig = useMemo(
    () => [
      { key: 'faq' as MainTabKey, label: t('helpContact.tabs.faq') },
      { key: 'contact' as MainTabKey, label: t('helpContact.tabs.contact') },
    ],
    [t],
  );

  const subTabConfig = useMemo(
    () => [
      { key: 'general' as SubTabKey, label: t('helpContact.subTabs.general') },
      { key: 'account' as SubTabKey, label: t('helpContact.subTabs.account') },
      {
        key: 'services' as SubTabKey,
        label: t('helpContact.subTabs.services'),
      },
    ],
    [t],
  );

  const faqContent = useMemo(
    () =>
      (t('helpContact.faq', { returnObjects: true }) || {}) as Record<
        SubTabKey,
        FAQItem[]
      >,
    [t],
  );
  const contactInfo = useMemo(
    () =>
      (t('helpContact.contact', { returnObjects: true }) ||
        {}) as ContactConfig,
    [t],
  );
  const accountActions = useMemo(
    () =>
      (t('helpContact.accountActions', { returnObjects: true }) ||
        {}) as AccountActionsConfig,
    [t],
  );

  const performAccountAction = async () => {
    if (!currentAction) return;
    setIsAlertOpen(false);

    try {
      const endpoint =
        currentAction === 'delete' ? '/user/delete' : '/user/deactivate';
      const res = await api[currentAction === 'delete' ? 'delete' : 'post'](
        endpoint,
        {},
        { requiresAuth: true },
      );

      if (isMounted.current && res.status >= 200 && res.status < 300) {
        showNotification(
          t(`helpContact.notifications.${currentAction}SuccessTitle`),
          t(`helpContact.notifications.${currentAction}SuccessMessage`),
          'success',
        );
        logoutUser();
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      showNotification(
        t('helpContact.notifications.errorTitle'),
        t('helpContact.notifications.generic'),
        'danger',
      );
    }
  };

  const handleOpenLink = useCallback(async (appUrl: string, webUrl: string) => {
    try {
      const canOpen = await Linking.canOpenURL(appUrl);
      await Linking.openURL(canOpen ? appUrl : webUrl);
    } catch {
      await Linking.openURL(webUrl);
    }
  }, []);

  const filteredFaqItems = useMemo(() => {
    const items = faqContent[activeSubTab] || [];
    return items.filter(item =>
      item.question.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [faqContent, activeSubTab, searchText]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('helpContact.title')}</Text>
      <SegmentSwitch
        options={mainTabConfig.map(c => c.label)}
        selected={mainTabConfig.find(c => c.key === activeMainTab)?.label || ''}
        onSelect={label => {
          const key = mainTabConfig.find(c => c.label === label)
            ?.key as MainTabKey;
          setActiveMainTab(key);
        }}
      />
      {activeMainTab === 'faq' && (
        <View style={styles.faqHeaderContainer}>
          <SegmentSwitch
            options={subTabConfig.map(c => c.label)}
            selected={
              subTabConfig.find(c => c.key === activeSubTab)?.label || ''
            }
            onSelect={label => {
              const key = subTabConfig.find(c => c.label === label)
                ?.key as SubTabKey;
              setActiveSubTab(key);
            }}
          />
          <TextInput
            style={styles.searchBox}
            placeholder={t('helpContact.searchPlaceholder')}
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {activeMainTab === 'faq' ? (
          <View style={styles.faqListContainer}>
            {filteredFaqItems.map((item, index) => (
              <AccordionItem
                key={index}
                question={item.question}
                answer={item.answer}
              />
            ))}
            {activeSubTab === 'account' && (
              <View>
                <AccountActionItem
                  title={accountActions.deactivateTitle}
                  description={accountActions.deactivateDescription}
                  buttonText={accountActions.deactivateButton}
                  onPress={() => {
                    setCurrentAction('deactivate');
                    setIsAlertOpen(true);
                  }}
                  isExpanded={deactivateExpanded}
                  setExpanded={setDeactivateExpanded}
                  theme={theme}
                  styles={styles}
                />
                <AccountActionItem
                  title={accountActions.deleteTitle}
                  description={accountActions.deleteDescription}
                  buttonText={accountActions.deleteButton}
                  onPress={() => {
                    setCurrentAction('delete');
                    setIsAlertOpen(true);
                  }}
                  isExpanded={deleteExpanded}
                  setExpanded={setDeleteExpanded}
                  theme={theme}
                  styles={styles}
                />
              </View>
            )}
          </View>
        ) : (
          <ContactSection
            contactInfo={contactInfo}
            handleOpenLink={handleOpenLink}
            theme={theme}
            styles={styles}
          />
        )}
      </ScrollView>

      <Alert
        visible={isAlertOpen}
        title={
          currentAction ? t(`helpContact.alerts.${currentAction}Title`) : ''
        }
        message={
          currentAction ? t(`helpContact.alerts.${currentAction}Message`) : ''
        }
        theme={theme}
        t={t}
        type="googleRed"
        onConfirm={performAccountAction}
        onCancel={() => {
          setIsAlertOpen(false);
          setCurrentAction(null);
        }}
        styles={styles}
      />
    </View>
  );
}

const AccountActionItem = memo(
  ({
    title,
    description,
    buttonText,
    onPress,
    isExpanded,
    setExpanded,
    theme,
    styles,
  }: AccountActionItemProps) => (
    <View style={styles.accordionItem}>
      <Pressable
        style={({ pressed }) => [
          styles.accordionHeader,
          pressed && styles.pressedState,
        ]}
        onPress={() => setExpanded(!isExpanded)}
      >
        <Text style={styles.accordionQuestion}>{title}</Text>
        <FontAwesomeIcon
          icon={(isExpanded ? faChevronUp : faChevronDown) as IconProp}
          size={16}
          color={theme.colors.textPrimary}
        />
      </Pressable>
      {isExpanded && (
        <View style={styles.deactivateContent}>
          <Text style={styles.accordionAnswer}>{description}</Text>
          <Pressable
            style={({ pressed }) => [
              styles.deactivateButton,
              pressed && styles.pressedState,
            ]}
            onPress={onPress}
          >
            <Text style={styles.deactivateButtonText}>{buttonText}</Text>
          </Pressable>
        </View>
      )}
    </View>
  ),
);

const ContactSection = ({
  contactInfo,
  handleOpenLink,
  theme,
  styles,
}: ContactSectionProps) => (
  <View style={styles.contactContainer}>
    <Text style={styles.contactHeading}>{contactInfo.email.heading}</Text>
    {contactInfo.email.values.map((email: string) => (
      <Text
        key={email}
        style={styles.contactLink}
        onPress={() => Linking.openURL(`mailto:${email}`)}
      >
        {email}
      </Text>
    ))}
    <View style={styles.socialIconsRow}>
      <SocialIcon
        icon={faInstagram as IconProp}
        color={theme.colors.googleRed}
        onPress={() =>
          handleOpenLink(
            'instagram://user?username=exer_eyes',
            'https://www.instagram.com/exer_eyes/',
          )
        }
      />
      <SocialIcon
        icon={faLinkedin as IconProp}
        color={theme.colors.facebookBlue}
        onPress={() =>
          handleOpenLink(
            'linkedin://company/lotussporttech',
            'https://www.linkedin.com/company/lotussporttech/',
          )
        }
      />
    </View>
  </View>
);

const SocialIcon = memo(
  ({
    icon,
    color,
    onPress,
  }: {
    icon: IconProp;
    color: string;
    onPress: () => void;
  }) => {
    const { theme } = useTheme();
    const styles = useStyles(theme);

    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.socialIconBase,
          { backgroundColor: color },
          pressed && styles.pressedState,
        ]}
      >
        <FontAwesomeIcon icon={icon} size={24} color="white" />
      </Pressable>
    );
  },
);

export default HelpCenter;
