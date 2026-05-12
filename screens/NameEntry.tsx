import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackScreenProps } from '../navigation/types';
import { Button } from '../src/components/Button';
import { Body, Heading, Label } from '../src/components/typography';
import { colors, typography } from '../src/theme';

export default function NameEntry({ navigation }: RootStackScreenProps<'NameEntry'>) {
  // TODO: Phase 4 — pass player1 / player2 via navigation params to
  // FirstPlayerSelection and beyond. Downstream screens use the FIRST LETTER
  // of each name as the player's avatar initial, so do NOT truncate or set
  // maxLength here — names must keep their first character intact.
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');

  const player2Ref = useRef<TextInput>(null);

  const canContinue = player1.trim().length > 0 && player2.trim().length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          <Heading variant="app-title" style={styles.centerText}>
            if you ask
          </Heading>

          <View style={styles.headingGroup}>
            <Heading style={styles.centerText}>Who&apos;s playing?</Heading>
            <Body variant="subheading" style={styles.subheading}>
              First, your names
            </Body>
          </View>

          <View style={styles.inputsGroup}>
            <View style={styles.inputBlock}>
              <Label style={styles.inputLabel}>PLAYER 1</Label>
              <TextInput
                style={styles.input}
                value={player1}
                onChangeText={setPlayer1}
                placeholder="Name"
                placeholderTextColor={colors.text.tertiary}
                returnKeyType="next"
                onSubmitEditing={() => player2Ref.current?.focus()}
                blurOnSubmit={false}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputBlock}>
              <Label style={styles.inputLabel}>PLAYER 2</Label>
              <TextInput
                ref={player2Ref}
                style={styles.input}
                value={player2}
                onChangeText={setPlayer2}
                placeholder="Name"
                placeholderTextColor={colors.text.tertiary}
                returnKeyType="done"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.spacer} />

          <Button
            label="Continue"
            disabled={!canContinue}
            onPress={() =>
              navigation.navigate('FirstPlayerSelection', {
                player1: player1.trim(),
                player2: player2.trim(),
              })
            }
            style={styles.cta}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.cream,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 43,
    paddingBottom: 40,
    alignItems: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  headingGroup: {
    alignItems: 'center',
    marginTop: 72,
    gap: 12,
  },
  subheading: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
  inputsGroup: {
    width: '100%',
    maxWidth: 300,
    marginTop: 72,
    gap: 24,
  },
  inputBlock: {
    gap: 8,
  },
  inputLabel: {
    color: colors.text.secondary,
  },
  input: {
    ...typography.inputDefault,
    color: colors.text.primary,
    height: 56,
    paddingHorizontal: 24,
    backgroundColor: colors.card.bgWhite,
    borderWidth: 1.5,
    borderColor: colors.border.input,
    borderRadius: 999,
  },
  spacer: {
    flex: 1,
  },
  cta: {
    width: '100%',
    maxWidth: 300,
  },
});
