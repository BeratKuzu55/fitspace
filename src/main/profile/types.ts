import { ThemeType } from '../../theme';
import useStyles from './styles';

type StylesType = ReturnType<typeof useStyles>;

interface FAQItem {
  question: string;
  answer: string;
}

interface AccountActionsConfig {
  deactivateTitle: string;
  deactivateDescription: string;
  deactivateButton: string;
  deleteTitle: string;
  deleteDescription: string;
  deleteButton: string;
}

interface ContactConfig {
  email: {
    heading: string;
    values: string[];
  };
}

interface AccountActionItemProps {
  title: string;
  description: string;
  buttonText: string;
  onPress: () => void;
  isExpanded: boolean;
  setExpanded: (val: boolean) => void;
  theme: ThemeType;
  styles: StylesType;
}

interface ContactSectionProps {
  contactInfo: ContactConfig;
  handleOpenLink: (appUrl: string, webUrl: string) => Promise<void>;
  theme: ThemeType;
  styles: StylesType;
}

export type {
  FAQItem,
  AccountActionsConfig,
  ContactConfig,
  AccountActionItemProps,
  ContactSectionProps,
};
