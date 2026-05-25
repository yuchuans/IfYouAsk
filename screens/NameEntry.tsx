import { useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackScreenProps } from '../navigation/types';
import { Button } from '../src/components/Button';
import { Body, Heading, Label } from '../src/components/typography';
import { useGame } from '../src/context/GameContext';
import { colors, typography } from '../src/theme';

export default function NameEntry({ navigation }: RootStackScreenProps<'NameEntry'>) {
  const { startGame } = useGame();

  // Names are written to GameContext on Continue (not passed via nav params).
  // Downstream screens use the FIRST LETTER of each name as the player's
  // avatar initial, so the first character is always preserved — maxLength
  // caps total input, not the leading letter.
  //
  // NAME_MAX_LENGTH: caps display name so it wraps to at most 3 lines in
  // the 76px column on CategorySelection (which reserves a 3-line slot to
  // match). Without this cap, very long names (10+ lines) blow out the
  // players row and squeeze the category cards below.
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
                maxLength={NAME_MAX_LENGTH}
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
                maxLength={NAME_MAX_LENGTH}
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
            onPress={() => {
              startGame(player1.trim(), player2.trim());
              navigation.navigate('FirstPlayerSelection');
            }}
            style={styles.cta}
          />
        </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Caps display name to fit in the 3-line slot reserved on CategorySelection
// and FirstPlayerSelection. Accommodates real names ("Christopher Smith" = 17,
// "Maria de la Cruz" = 16) while preventing extreme inputs from blowing out
// the players row. If you bump this, also bump NAME_SLOT_LINES on both
// screens — the input cap and the display slot have to agree.
const NAME_MAX_LENGTH = 20;

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
