import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackScreenProps } from '../navigation/types';
import { Button } from '../src/components/Button';
import { IconButton } from '../src/components/IconButton';
import { Body, Heading } from '../src/components/typography';
import { useGame } from '../src/context/GameContext';
import { STARTER_QUESTIONS } from '../src/data/questions';
import { colors, typography } from '../src/theme';

export default function FirstPlayerSelection({
  navigation,
}: RootStackScreenProps<'FirstPlayerSelection'>) {
  const { player1, player2, setFirstAsker } = useGame();

  // Lazy initializer runs once on mount, so the random pick is stable across
  // re-renders (e.g., when the user taps a circle and selectedPlayer updates).
  const [question] = useState(
    () => STARTER_QUESTIONS[Math.floor(Math.random() * STARTER_QUESTIONS.length)]
  );

  const [selectedPlayer, setSelectedPlayer] = useState<1 | 2 | null>(null);

  const selectedName = selectedPlayer === 1 ? player1 : selectedPlayer === 2 ? player2 : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <IconButton icon="←" label="Back" onPress={() => navigation.goBack()} />
      </View>

      <View style={styles.container}>
        <Heading variant="app-title" style={styles.centerText}>
          if you ask
        </Heading>

        <View style={styles.headingGroup}>
          <Heading style={styles.centerText}>To start —</Heading>
          <Body variant="subheading" style={styles.subheading}>
            {question}
          </Body>
        </View>

        <View style={styles.circlesRow}>
          <PlayerCircle
            name={player1}
            initial={player1[0].toUpperCase()}
            selected={selectedPlayer === 1}
            onPress={() => setSelectedPlayer(1)}
          />
          <Divider />
          <PlayerCircle
            name={player2}
            initial={player2[0].toUpperCase()}
            selected={selectedPlayer === 2}
            onPress={() => setSelectedPlayer(2)}
          />
        </View>

        <View style={styles.messageSlot}>
          {selectedName !== null && (
            <Body variant="subheading" style={styles.subheading}>
              {selectedName} asks the first question :)
            </Body>
          )}
        </View>

        <View style={styles.spacer} />

        <Button
          label="Continue"
          disabled={selectedPlayer === null}
          onPress={() => {
            // Disabled until selectedPlayer is set, so the assertion is safe.
            if (selectedPlayer === null) return;
            setFirstAsker(selectedPlayer);
            navigation.navigate('CategorySelection');
          }}
          style={styles.cta}
        />
      </View>
    </SafeAreaView>
  );
}

type PlayerCircleProps = {
  name: string;
  initial: string;
  selected: boolean;
  onPress: () => void;
};

function PlayerCircle({ name, initial, selected, onPress }: PlayerCircleProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={selected}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`Pick ${name} to go first`}
      style={styles.playerButton}
      hitSlop={8}
    >
      <View style={styles.circleWrap}>
        {selected && <View style={styles.halo} pointerEvents="none" />}
        <View style={styles.circle}>
          <Heading style={styles.initial}>{initial}</Heading>
        </View>
      </View>
      <Body style={styles.playerName}>{name}</Body>
    </Pressable>
  );
}

function Divider() {
  return (
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      <Body style={styles.dividerLabel}>or</Body>
      <View style={styles.dividerLine} />
    </View>
  );
}

const CIRCLE_SIZE = 96;
const HALO_SIZE = 112;
const HALO_OFFSET = (HALO_SIZE - CIRCLE_SIZE) / 2;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.cream,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: 'flex-start',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
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
  circlesRow: {
    marginTop: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  playerButton: {
    width: CIRCLE_SIZE,
    alignItems: 'center',
    gap: 12,
  },
  circleWrap: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Two-color halo from Figma node 267:143: a 112px orange disk with a 6px
  // cream stroke drawn inside it, sitting -8/-8 behind the 96px cream circle.
  // Visible from outside in: 6px cream ring + 2px orange ring + cream center.
  halo: {
    position: 'absolute',
    width: HALO_SIZE,
    height: HALO_SIZE,
    top: -HALO_OFFSET,
    left: -HALO_OFFSET,
    borderRadius: HALO_SIZE / 2,
    backgroundColor: colors.accent.primary,
    borderWidth: 4,
    borderColor: colors.accent.secondary,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: colors.accent.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    ...typography.playerInitialLarge,
    textAlign: 'center',
  },
  playerName: {
    ...typography.playerName,
    textAlign: 'center',
  },
  divider: {
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dividerLine: {
    flex: 1,
    width: 1.4,
    backgroundColor: colors.text.tertiary,
  },
  dividerLabel: {
    color: colors.text.tertiary,
    lineHeight: 16,
  },
  messageSlot: {
    height: 24,
    marginTop: 72,
    justifyContent: 'center',
  },
  spacer: {
    flex: 1,
  },
  cta: {
    width: '100%',
    maxWidth: 300,
  },
});
