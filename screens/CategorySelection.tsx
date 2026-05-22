import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  type AnimatedStyle,
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';

import type { RootStackScreenProps } from '../navigation/types';
import { CategoryIcon } from '../src/components/CategoryIcon';
import { IconButton } from '../src/components/IconButton';
import { Body, Heading, Label } from '../src/components/typography';
import { useGame } from '../src/context/GameContext';
import type { CategoryId } from '../src/data/questions';
import { colors, shadows, typography } from '../src/theme';

// Category-card metadata for the three picker cards: display name, body
// copy, and per-card colors. UI-presentation data only — the question
// pools live in src/data/questions.ts and are looked up by CategoryId.
type Category = {
  id: CategoryId;
  name: string;
  body: string;
  bg: string;
  textColor: string;
};

const CATEGORIES: readonly Category[] = [
  {
    id: 'justVibing',
    name: 'Just Vibing',
    body: 'Low stakes, warm energy, effortless fun',
    bg: colors.card.justVibing,
    textColor: colors.text.justVibingCard,
  },
  {
    id: 'digDeep',
    name: 'Dig Deep',
    body: 'Real talk, some feelings might be required',
    bg: colors.card.digDeep,
    textColor: colors.text.digDeepCard,
  },
  {
    id: 'waitWhat',
    name: 'Wait, What?',
    body: 'Fairly random, reasonably unexpected',
    bg: colors.card.waitWhat,
    textColor: colors.text.waitWhatCard,
  },
] as const;

export default function CategorySelection({
  navigation,
}: RootStackScreenProps<'CategorySelection'>) {
  const { player1, player2, askingPlayer, round } = useGame();

  // askingPlayer flips inside nextRound() which is called from QuestionCard —
  // i.e. while this screen is *not* on top of the stack. Without a focus
  // gate the handoff animation would run invisibly behind QuestionCard, so
  // by the time the user navigates back the ring would have already moved
  // and they'd see no transition. Gating on isFocused + a prev-asker ref
  // defers the animation until the screen is actually on top.
  const isFocused = useIsFocused();
  const prevAskerRef = useRef(askingPlayer);

  // handoffProgress: 0 = orange ring on player 1, 1 = on player 2. Same
  // shared value drives the orange ring translateX AND both pill background
  // crossfades, so all 700ms layers are guaranteed to land on the same
  // frame.
  const handoffProgress = useSharedValue(askingPlayer === 1 ? 0 : 1);

  // Per-player layered indicators. Initial value = 1 if this player is
  // currently the asker, else 0 — so the first render shows the settled
  // state with no animation.
  const player1Cream = useSharedValue(askingPlayer === 1 ? 1 : 0);
  const player2Cream = useSharedValue(askingPlayer === 2 ? 1 : 0);
  const player1Dot = useSharedValue(askingPlayer === 1 ? 1 : 0);
  const player2Dot = useSharedValue(askingPlayer === 2 ? 1 : 0);

  useEffect(() => {
    if (!isFocused) return;
    if (prevAskerRef.current === askingPlayer) return;
    prevAskerRef.current = askingPlayer;

    handoffProgress.value = withTiming(askingPlayer === 1 ? 0 : 1, {
      duration: HANDOFF_DURATION,
      easing: handoffEasing,
    });

    // Alias the four progress values into "new" / "old" so the four lines
    // below read like the spec ("old asker exits immediately, new asker
    // enters after a delay") rather than a tangle of if/else.
    const newCream = askingPlayer === 1 ? player1Cream : player2Cream;
    const oldCream = askingPlayer === 1 ? player2Cream : player1Cream;
    const newDot = askingPlayer === 1 ? player1Dot : player2Dot;
    const oldDot = askingPlayer === 1 ? player2Dot : player1Dot;

    oldCream.value = withTiming(0, {
      duration: CREAM_RING_DURATION,
      easing: handoffEasing,
    });
    newCream.value = withDelay(
      CREAM_RING_DELAY,
      withTiming(1, { duration: CREAM_RING_DURATION, easing: handoffEasing })
    );

    oldDot.value = withTiming(0, {
      duration: DOT_DURATION,
      easing: handoffEasing,
    });
    newDot.value = withDelay(
      DOT_DELAY,
      withTiming(1, { duration: DOT_DURATION, easing: handoffEasing })
    );
  }, [
    askingPlayer,
    isFocused,
    handoffProgress,
    player1Cream,
    player2Cream,
    player1Dot,
    player2Dot,
  ]);

  // The orange ring is the *only* element that moves between players. Its
  // resting position (translateX 0 with the marginLeft offset in
  // styles.orangeRing) sits exactly on the row's horizontal center; the
  // ±73 here lands it on each 76px avatar (centers are 146 apart).
  const orangeRingStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          handoffProgress.value,
          [0, 1],
          [-HANDOFF_DISTANCE / 2, HANDOFF_DISTANCE / 2]
        ),
      },
    ],
  }));

  // Cream rings + dots — opacity rides progress 1:1; scale grows from the
  // ring/dot's "collapsed" size at progress 0 to full size at progress 1.
  const player1CreamRingStyle = useAnimatedStyle(() => ({
    opacity: player1Cream.value,
    transform: [
      {
        scale: interpolate(
          player1Cream.value,
          [0, 1],
          [CREAM_RING_SCALE_FROM, 1]
        ),
      },
    ],
  }));
  const player2CreamRingStyle = useAnimatedStyle(() => ({
    opacity: player2Cream.value,
    transform: [
      {
        scale: interpolate(
          player2Cream.value,
          [0, 1],
          [CREAM_RING_SCALE_FROM, 1]
        ),
      },
    ],
  }));
  const player1DotStyle = useAnimatedStyle(() => ({
    opacity: player1Dot.value,
    transform: [
      { scale: interpolate(player1Dot.value, [0, 1], [DOT_SCALE_FROM, 1]) },
    ],
  }));
  const player2DotStyle = useAnimatedStyle(() => ({
    opacity: player2Dot.value,
    transform: [
      { scale: interpolate(player2Dot.value, [0, 1], [DOT_SCALE_FROM, 1]) },
    ],
  }));

  // Pill backgrounds — both pills crossfade on the same handoffProgress
  // (700ms). They swap colors symmetrically so e.g. P1 going from "asks"
  // (orange) to "shares" (cream) is exactly mirrored by P2 going cream →
  // orange.
  const player1PillStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      handoffProgress.value,
      [0, 1],
      [colors.accent.primary, colors.accent.secondary]
    ),
  }));
  const player2PillStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      handoffProgress.value,
      [0, 1],
      [colors.accent.secondary, colors.accent.primary]
    ),
  }));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <View style={styles.topBarSide} />
        <View style={styles.roundPill}>
          <Label style={styles.roundLabel}>Round {round}</Label>
        </View>
        <View style={[styles.topBarSide, styles.topBarRight]}>
          <IconButton
            icon="✕"
            onPress={() => navigation.navigate('Reflection')}
            hitSlop={12}
            accessibilityLabel="End session"
            // ✕'s cap-height reads shorter than ← at the same font size; bump
            // it up so the close button visually matches the back-arrow on
            // FirstPlayerSelection / Reflection.
            iconStyle={styles.closeIcon}
          />
        </View>
      </View>

      <View style={styles.container}>
        <View style={styles.playersRow}>
          {/* Floating orange ring — single shared element that translates
              between the two avatar positions. Rendered FIRST in playersRow
              so it sits in DOM order below the two player columns. With
              every node at default zIndex 0, paint order = DOM order, which
              puts this ring visually behind the cream rings (which are at
              zIndex 0 inside their avatarWrap). The ring is visible only
              through each cream ring's transparent center. */}
          <Animated.View
            pointerEvents="none"
            style={[styles.orangeRing, orangeRingStyle]}
          />

          <PlayerAvatar
            name={player1}
            initial={player1[0].toUpperCase()}
            role={askingPlayer === 1 ? 'asks' : 'shares'}
            creamRingStyle={player1CreamRingStyle}
            dotStyle={player1DotStyle}
            pillStyle={player1PillStyle}
          />
          <PlayerAvatar
            name={player2}
            initial={player2[0].toUpperCase()}
            role={askingPlayer === 2 ? 'asks' : 'shares'}
            creamRingStyle={player2CreamRingStyle}
            dotStyle={player2DotStyle}
            pillStyle={player2PillStyle}
          />
        </View>

        <Body style={styles.subheading}>What are you curious about?</Body>

        <View style={styles.cards}>
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onPress={() => navigation.navigate('QuestionCard', { category: cat.id })}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

// ----- subcomponents -----

type PlayerAvatarProps = {
  name: string;
  initial: string;
  role: 'asks' | 'shares';
  // useAnimatedStyle() return values from the parent. The parent owns the
  // shared values + interpolations so the orange ring (shared between both
  // avatars) can stay in sync with each per-player layer.
  creamRingStyle: AnimatedStyle<ViewStyle>;
  dotStyle: AnimatedStyle<ViewStyle>;
  pillStyle: AnimatedStyle<ViewStyle>;
};

function PlayerAvatar({
  name,
  initial,
  role,
  creamRingStyle,
  dotStyle,
  pillStyle,
}: PlayerAvatarProps) {
  return (
    <View style={styles.playerColumn}>
      <View style={styles.avatarWrap}>
        {/* Cream ring is now always mounted (instead of conditional on
            isAsker) — visibility is driven by the animated opacity in
            creamRingStyle. zIndex 0 keeps it below the avatar circle. */}
        <Animated.View
          pointerEvents="none"
          style={[styles.creamRing, creamRingStyle]}
        />
        <View style={styles.circle}>
          <Heading style={styles.initial}>{initial}</Heading>
        </View>
        <Animated.View
          pointerEvents="none"
          style={[styles.askerDot, dotStyle]}
        />
      </View>
      <Body style={styles.playerName}>{name}</Body>
      {/* Pill background is animated via interpolateColor; the label text
          still swaps instantly via React props (see judgment-calls note in
          the chat). */}
      <Animated.View style={[styles.rolePill, pillStyle]}>
        <Label style={styles.roleLabel}>{role}</Label>
      </Animated.View>
    </View>
  );
}

type CategoryCardProps = {
  category: Category;
  onPress: () => void;
};

function CategoryCard({ category, onPress }: CategoryCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Choose ${category.name}`}
      style={({ pressed }) => [
        styles.card,
        shadows.cardButton,
        { backgroundColor: category.bg },
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.cardCopy}>
        <Heading variant="bold" style={{ color: category.textColor }}>
          {category.name}
        </Heading>
        <Body style={[styles.cardBody, { color: category.textColor }]}>
          {category.body}
        </Body>
      </View>
      <View style={styles.cardIconSlot}>
        <CategoryIcon name={category.id} />
      </View>
    </Pressable>
  );
}

// ----- constants & styles -----

// Sized down from FirstPlayerSelection's 96/112 halo to match Figma node
// 267:20 (76 avatar, 92 halo). Construction is now three INDEPENDENT layers
// (see handoff animation block below) instead of a single filled View:
//   - Cream ring  (92, anchored to each avatarWrap)
//   - Orange ring (84, floating in playersRow — only the orange ring moves)
//   - Asker dot   (24, anchored to each avatarWrap)
const CIRCLE_SIZE = 76;
const HALO_SIZE = 92;
const HALO_OFFSET = (HALO_SIZE - CIRCLE_SIZE) / 2;
const DOT_SIZE = 24;
const ORANGE_RING_SIZE = 84;
const ORANGE_RING_OFFSET = (ORANGE_RING_SIZE - CIRCLE_SIZE) / 2;

// ----- handoff animation -----
// When askingPlayer flips, every visible piece of the indicator moves on the
// same easing curve, but with overlapping timings so the eye can follow the
// orange ring across, see it "land", and then see the cream ring breathe
// outward + the dot light up around the new asker. Old asker's cream + dot
// exit immediately (no delay) so they look like they're collapsing into the
// orange ring as it leaves.
const HANDOFF_DURATION = 350;
const CREAM_RING_DURATION = 360;
const CREAM_RING_DELAY = 175;
const DOT_DURATION = 280;
const DOT_DELAY = 370;

// Center-to-center distance between the two avatars (CIRCLE_SIZE 76 + row
// gap 70). Orange ring translates ±HANDOFF_DISTANCE/2 from row center.
const HANDOFF_DISTANCE = 146;

// Cream-ring scale-from = 84/92 (matches ORANGE_RING_SIZE / HALO_SIZE), so
// at scale 0.913 the cream ring's outer edge sits exactly on the orange
// ring's outer edge — i.e. it grows out of the orange ring's footprint.
const CREAM_RING_SCALE_FROM = 0.913;
const DOT_SCALE_FROM = 0.85;

const handoffEasing = Easing.linear;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.cream,
  },
  // ----- topBar -----
  // Figma container1 is 84 tall (top padding 20 + topbar 64). We collapse
  // that into a single 64-tall row sitting just below the safe-area inset.
  topBar: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarSide: {
    width: 48,
  },
  topBarRight: {
    alignItems: 'flex-end',
  },
  roundPill: {
    backgroundColor: colors.accent.tertiary,
    height: 28,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundLabel: {
    ...typography.round,
    // typography.round sets lineHeight === fontSize (12), which crushes the
    // text against the pill's vertical center. Override to give breathing room.
    lineHeight: 16,
    color: colors.text.secondary,
    textTransform: 'uppercase',
  },
  closeIcon: {
    fontSize: 22,
    lineHeight: 22,
  },
  // ----- main container -----
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  // ----- players row -----
  // Figma puts the two 76px avatars 146px center-to-center (gap of 70px
  // between visual edges). A row with gap:70 reproduces that spacing while
  // letting flex centering handle screen-width math.
  //
  // marginTop was 24 (Figma's literal spec); pulled down to 12 so the avatars
  // sit closer to the topBar — on real devices the safe-area inset already
  // adds visual room above the topBar that Figma's 20px stub doesn't.
  playersRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 70,
  },
  playerColumn: {
    width: CIRCLE_SIZE,
    alignItems: 'center',
    // No uniform gap — Figma uses 12 between avatar and name, 8 between
    // name and pill. See playerName / rolePill marginTop below.
  },
  avatarWrap: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Outermost cream ring — transparent center, 4px cream stroke. The
  // original `halo` (filled orange disk + cream stroke) was split here: the
  // ORANGE is now provided by the floating ring (styles.orangeRing, sibling
  // of the player columns), and this view just contributes the outer cream
  // stroke that sits 4px past the orange ring.
  creamRing: {
    position: 'absolute',
    width: HALO_SIZE,
    height: HALO_SIZE,
    top: -HALO_OFFSET,
    left: -HALO_OFFSET,
    borderRadius: HALO_SIZE / 2,
    borderWidth: 4,
    borderColor: colors.accent.secondary,
    zIndex: 0,
  },
  // Floating orange ring — the one element that translates between players.
  // Sized so its inner hollow (84 - 4*2 = 76) hugs the 76px avatar; sized
  // so its outer edge (84) touches the cream ring's inner edge (92 - 4*2 =
  // 84). Both edges of the orange ring are flush with the two surrounding
  // surfaces.
  //
  // Centered horizontally on playersRow via left:50% + marginLeft:-42 (half
  // ORANGE_RING_SIZE). The animated transform then translates ±73 to land
  // on each avatar's center.
  orangeRing: {
    position: 'absolute',
    width: ORANGE_RING_SIZE,
    height: ORANGE_RING_SIZE,
    top: -ORANGE_RING_OFFSET,
    left: '50%',
    marginLeft: -ORANGE_RING_SIZE / 2,
    borderRadius: ORANGE_RING_SIZE / 2,
    borderWidth: 4,
    borderColor: colors.accent.primary,
    zIndex: 0,
  },
  // Asker "active turn" indicator (Figma node 267:49). Sits on the top-right
  // corner of the 76px avatar, peeking just outside the cream ring. The 3px
  // cream border separates the dot from whatever's behind it.
  askerDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.accent.primary,
    borderWidth: 3,
    borderColor: colors.accent.secondary,
    zIndex: 3,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: colors.accent.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  initial: {
    ...typography.playerInitialSmall,
    textAlign: 'center',
  },
  playerName: {
    ...typography.playerName,
    textAlign: 'center',
    marginTop: 12,
  },
  // backgroundColor is provided per-render by the animated pillStyle (an
  // interpolateColor between accent.primary and accent.secondary tied to
  // handoffProgress), so the static sharesPill / askPill variants from the
  // pre-handoff version are gone.
  rolePill: {
    width: CIRCLE_SIZE,
    height: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  roleLabel: {
    ...typography.sharesAsks,
    color: colors.text.primary,
  },
  // ----- subheading -----
  // Tighter than Figma's effective ~42 to free up vertical room for the
  // cards on smaller phones. Still bigger than the cards.marginTop below,
  // so the subheading visually belongs to the cards.
  subheading: {
    ...typography.subheading,
    color: colors.text.tertiary,
    marginTop: 28,
  },
  // ----- cards -----
  // The cards container fills whatever vertical space remains below the
  // subheading. Each card uses flex: 1 (equal share) with a maxHeight cap
  // at Figma's 148, so on bigger phones the cards top out at the spec'd
  // height (leftover space falls to the bottom of the container) and on
  // smaller phones the cards shrink uniformly so all three stay visible
  // without scrolling.
  cards: {
    // Slightly tighter than the cards' inter-card gap (16) to compensate
    // for the subheading's lineHeight padding (~2-4px below the glyph
    // descender), so the *visible* gap matches what's between cards.
    marginTop: 12,
    gap: 16,
    flex: 1,
    // Bottom breathing room so Wait, What? doesn't sit right against the
    // safe-area-bottom. Takes a few px out of the cards' flex-fill space.
    paddingBottom: 28,
  },
  card: {
    flex: 1,
    maxHeight: 148,
    borderRadius: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'center' lets the row center its children vertically as
    // HUG blocks, so the heading/body column and the icon both get equal
    // top/bottom margins at any card height. Figma's fixed 148px card with
    // paddingTop:32 was top-anchored; we drop that in favor of dynamic
    // centering because our cards flex-shrink on smaller phones.
    alignItems: 'center',
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardCopy: {
    flex: 1,
    gap: 12,
  },
  cardBody: {
    ...typography.body,
    // No fixed width — let the body fill cardCopy's flex width so it adapts
    // to whatever the card width ends up being on the device. (Figma spec'd
    // 210 against a 354-wide card; real device cardCopy is slightly narrower.)
  },
  // 88×88 slot reserved for the SVG icon — filled once
  // assets/categories/{id}.svg are exported and inlined as <Svg> components.
  cardIconSlot: {
    width: 88,
    height: 88,
  },
});
