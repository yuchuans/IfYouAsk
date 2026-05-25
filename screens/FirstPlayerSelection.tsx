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
      {/* Fixed-height slot for the player name. circlesRow uses
          alignItems: 'center', so without a constant-height name area the
          column with the taller name would pull its circle upward relative
          to the other — visually misaligning the two circles. The slot
          reserves the same vertical space in both columns. */}
      <View style={styles.nameSlot}>
        <Body style={styles.playerName} numberOfLines={NAME_SLOT_LINES}>
          {name}
        </Body>
      </View>
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

// Width of each player's column. Wider than CIRCLE_SIZE (96) so common
// 10–11-char names ("Catherine", "Christopher") fit on a single line of
// typography.playerName (Lora Medium 18 — wide serif, ~9.5px/char). The
// CIRCLE_SIZE avatar stays centered inside this 108-wide column via
// playerButton's alignItems: 'center', so the avatar / halo themselves
// don't move — only the invisible column boundary (= the name's wrap
// width) grows outward by 6px on each side.
//
// Side effect: each circle's outer edge ends up ~6px further from the
// "or" divider that sits between the two columns (circlesRow.gap stays
// 24, so the divider's breathing room is preserved; the visible
// circle-to-circle space grows by ~12px total). This is a deliberate
// trade — keeping the divider comfortable is more important than holding
// the exact original circle-to-circle distance, since nothing animates
// across that distance on this screen.
const NAME_SLOT_WIDTH = 108;

// Reserve a 3-line slot for the player name so both columns are the same
// height — keeps the two circles aligned even if one name wraps and the
// other doesn't. 3 lines matches the worst-case wrap for a NAME_MAX_LENGTH
// (20) name; the input cap and the slot must agree so any accepted name
// renders in full.
const NAME_SLOT_LINES = 3;
const NAME_SLOT_HEIGHT = typography.playerName.lineHeight * NAME_SLOT_LINES;

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
    // 108 (not CIRCLE_SIZE) so 10–11-char names wrap-free. The CIRCLE_SIZE
    // avatar still sits centered via alignItems: 'center', so its visible
    // pixel position only shifts ~6px outward from the divider.
    width: NAME_SLOT_WIDTH,
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
  // Fixed-height box below the circle. Spacing from the circle is handled
  // by playerButton's gap:12, so this only owns its own height + centering.
  nameSlot: {
    height: NAME_SLOT_HEIGHT,
    justifyContent: 'center',
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
