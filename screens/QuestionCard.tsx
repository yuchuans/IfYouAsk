import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackScreenProps } from '../navigation/types';
import { Button } from '../src/components/Button';
import { Flourish } from '../src/components/Flourish';
import { IconButton } from '../src/components/IconButton';
import { colors, typography } from '../src/theme';

// Phase 3 hardcoded per-category data. Phase 4 will:
//   - replace `question` with a pick from a real per-category question pool
//   - extend route.params to include { player1, player2, askingPlayer, round }
//   - wire Next Round to increment + swap askingPlayer + pick a fresh question
type CategoryId = 'justVibing' | 'digDeep' | 'waitWhat';

const CATEGORY_DATA: Record<
  CategoryId,
  {
    name: string;
    question: string;
    stack: { lighter: string; base: string; deeper: string };
  }
> = {
  justVibing: {
    name: 'Just Vibing',
    question: 'Low stakes, warm energy, effortless fun',
    stack: {
      lighter: colors.card.justVibingLighter,
      base: colors.card.justVibing,
      deeper: colors.card.justVibingDeeper,
    },
  },
  digDeep: {
    name: 'Dig Deep',
    question: 'Real talk, some feelings might be required',
    stack: {
      lighter: colors.card.digDeepLighter,
      base: colors.card.digDeep,
      // Theme spelling quirk: digDeep uses "Darker" while the others use "Deeper".
      deeper: colors.card.digDeepDarker,
    },
  },
  waitWhat: {
    name: 'Wait, What?',
    question: 'Fairly random, reasonably unexpected',
    stack: {
      lighter: colors.card.waitWhatLighter,
      base: colors.card.waitWhat,
      deeper: colors.card.waitWhatDeeper,
    },
  },
};

export default function QuestionCard({
  navigation,
  route,
}: RootStackScreenProps<'QuestionCard'>) {
  const { category } = route.params;
  const data = CATEGORY_DATA[category];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <IconButton
          icon="←"
          label={data.name}
          onPress={() => navigation.goBack()}
          hitSlop={12}
          accessibilityLabel={`Back to category selection`}
        />
      </View>

      <View style={styles.body}>
        <View style={styles.display}>
          {/* Back cards, rendered first → sit behind. Order: most-rotated and
              furthest-down at the back; least-rotated and closest-up at the front. */}
          <View
            style={[
              styles.cardBase,
              {
                backgroundColor: data.stack.lighter,
                top: 16,
                transform: [{ translateX: -CARD_W / 2 + 14 }, { rotate: '2.8deg' }],
              },
            ]}
          />
          <View
            style={[
              styles.cardBase,
              {
                backgroundColor: data.stack.base,
                top: 10,
                transform: [{ translateX: -CARD_W / 2 + 9 }, { rotate: '1.7deg' }],
              },
            ]}
          />
          <View
            style={[
              styles.cardBase,
              {
                backgroundColor: data.stack.deeper,
                top: 4,
                transform: [{ translateX: -CARD_W / 2 + 4 }, { rotate: '0.7deg' }],
              },
            ]}
          />
          <View style={[styles.cardBase, styles.whiteCard]}>
            <View style={styles.questionWrap}>
              <Text style={styles.questionText}>{data.question}</Text>
            </View>
            <View style={styles.flourishWrap}>
              <Flourish />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bottomBar}>
        <Button
          label="Next Round"
          // Phase 3 stub: goBack() returns to CategorySelection with its
          // original params (round stays at 1, asker stays the same), so
          // visually it does the same thing as the top-left ← button right
          // now. Phase 4 will replace this with:
          //   navigation.navigate('CategorySelection', {
          //     ...route.params,  // (QuestionCard will receive the full set then)
          //     round: round + 1,
          //     askingPlayer: askingPlayer === 1 ? 2 : 1,
          //   })
          // so Next Round advances game state while ← does not.
          onPress={() => navigation.goBack()}
          style={styles.cta}
        />
      </View>
    </SafeAreaView>
  );
}

// Stacked-card dimensions from Figma (file IfYouAsk, screen nodes 267:188 /
// 267:166 / 267:210). All four cards are 300×340 before rotation — the Figma
// hypot()-based bounding boxes resolve back to 300×340 when you reverse the
// rotation math. Back cards fan out down-and-to-the-right from behind the
// white card. Per-card top + translateX offsets are the *pre-rotation* values
// (Figma reports bbox values; a rotated 300×340 card has a slightly taller
// bbox, so bbox-top + half-of-extra-height = pre-rotation top):
//   deeper (0.7°): pre-top 4,  translateX +4
//   base   (1.7°): pre-top 10, translateX +9
//   lighter(2.8°): pre-top 16, translateX +14
// Bumped up from Figma's 300×340 so the cards feel more visually anchored on
// real iPhone widths. Internal content positions (questionWrap, flourishWrap)
// scaled proportionally to keep the layout balanced inside the bigger card.
const CARD_W = 320;
const CARD_H = 360;
const CARD_RADIUS = 22;
const FLOURISH_W = 92;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.cream,
  },
  // Match Reflection / FirstPlayerSelection's standardized topBar.
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: 'flex-start',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  // The display is the centered "stage" for the card stack. Its only purpose
  // is to provide a known center for the absolutely-positioned cards (via
  // `left: '50%'` + a translateX of -CARD_W/2 inside each card's transform).
  display: {
    width: '100%',
    height: CARD_H + 28,
    position: 'relative',
  },
  cardBase: {
    position: 'absolute',
    width: CARD_W,
    height: CARD_H,
    left: '50%',
    // Each card carries its own translateX:-CARD_W/2 in its transform so the
    // translate composes correctly with the rotate (RN applies transforms in
    // order, and we want the centering to happen before the rotation).
    borderRadius: CARD_RADIUS,
    borderWidth: 0.5,
    borderColor: 'rgba(61, 53, 48, 0.15)',
    // Matches Figma's drop-shadow recipe more closely than shadows.cardButton:
    // Figma uses two stacked shadows, the dominant one being offset (0,1) with
    // blur 2 at 24% black. RN can't do multi-layer shadows on a single View,
    // so we approximate with the sharper of the two — offset only DOWN (not
    // diagonal), a small radius (2 instead of cardButton's 3), and slightly
    // reduced opacity to compensate for the missing softer second layer.
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  whiteCard: {
    backgroundColor: colors.card.bgWhite,
    top: 0,
    transform: [{ translateX: -CARD_W / 2 }],
  },
  // Bounded vertical area for the question (Figma: top 78.6 / bottom 96.6
  // on a 340-tall card, scaled to a 360-tall card). Wrapping the Text in a
  // flex-centered View lets short or long questions sit visually balanced.
  questionWrap: {
    position: 'absolute',
    left: 36,
    right: 36,
    top: 82,
    bottom: 102,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionText: {
    ...typography.question,
    color: colors.text.primary,
    textAlign: 'center',
  },
  flourishWrap: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -FLOURISH_W / 2 }],
    // Figma had the flourish at top 284 on a 340-tall card (≈84%); kept the
    // same relative position on the bigger card.
    top: 304,
  },
  bottomBar: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 40,
  },
  cta: {
    width: '100%',
    maxWidth: 300,
  },
});
