import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {useTheme} from '../../theme';
import useStyles from './styles';

type PhysicalTestsProps = Record<string, never>;

const PhysicalTests: React.FC<PhysicalTestsProps> = () => {
  const {theme} = useTheme();
  const styles = useStyles(theme);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.container}>
        <Text style={styles.title}>Fitness Testleri</Text>
        <Text style={styles.subtitle}>Güncelleniyor.. Takipte kalın :)</Text>
      </View>
    </ScrollView>
  );
};

export default PhysicalTests;
