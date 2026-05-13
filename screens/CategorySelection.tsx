import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackScreenProps } from '../navigation/types';
import { CategoryIcon, type CategoryIconName } from '../src/components/CategoryIcon';
import { IconButton } from '../src/components/IconButton';
import { Body, Heading, Label } from '../src/components/typography';
import { colors, shadows, typography } from '../src/theme';

// Phase 3: hardcoded category metadata. Phase 4 will move this (and the
// per-category question pools) into src/data/categories.ts.
type Category = {
  id: CategoryIconName;
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
  route,
}: RootStackScreenProps<'CategorySelection'>) {
  const { player1, player2, askingPlayer, round } = route.params;

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
          <PlayerAvatar
            name={player1}
            initial={player1[0].toUpperCase()}
            role={askingPlayer === 1 ? 'asks' : 'shares'}
          />
          <PlayerAvatar
            name={player2}
            initial={player2[0].toUpperCase()}
            role={askingPlayer === 2 ? 'asks' : 'shares'}
          />
        </View>

        <Body style={styles.subheading}>What are you curious about?</Body>

        <View style={styles.cards}>
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              // Phase 3: only the category is wired through. Phase 4 will also
              // forward { player1, player2, askingPlayer, round } so QuestionCard
              // can render the asker + round counter + pick a real question.
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
};

function PlayerAvatar({ name, initial, role }: PlayerAvatarProps) {
  const isAsker = role === 'asks';
  return (
    <View style={styles.playerColumn}>
      <View style={styles.avatarWrap}>
        {isAsker && <View style={styles.halo} pointerEvents="none" />}
        <View style={styles.circle}>
          <Heading style={styles.initial}>{initial}</Heading>
        </View>
        {isAsker && <View style={styles.askerDot} pointerEvents="none" />}
      </View>
      <Body style={styles.playerName}>{name}</Body>
      <View style={[styles.rolePill, isAsker ? styles.askPill : styles.sharesPill]}>
        <Label style={styles.roleLabel}>{role}</Label>
      </View>
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
// 267:20 (76 avatar, 92 halo). Same construction: orange disk with an
// inner cream stroke; here a 3px stroke keeps the ring visually consistent.
const CIRCLE_SIZE = 76;
const HALO_SIZE = 92;
const HALO_OFFSET = (HALO_SIZE - CIRCLE_SIZE) / 2;
const DOT_SIZE = 24;

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
  // Orange disk inset behind the cream avatar with a cream inner stroke.
  // borderWidth 4 with HALO=92 / AVATAR=76 yields equal weights: 4px cream
  // stroke outside + 4px orange ring visible around the avatar (same ratio
  // as FirstPlayerSelection's 112/96/4 halo).
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
  // Asker "active turn" indicator (Figma node 267:49). Sits on the top-right
  // corner of the 76px avatar, peeking just outside the halo. The 3px cream
  // border separates the dot from the halo behind it.
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
    ...typography.playerInitialSmall,
    textAlign: 'center',
  },
  playerName: {
    ...typography.playerName,
    textAlign: 'center',
    marginTop: 12,
  },
  rolePill: {
    width: CIRCLE_SIZE,
    height: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  sharesPill: {
    backgroundColor: colors.accent.secondary,
  },
  askPill: {
    backgroundColor: colors.accent.primary,
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
