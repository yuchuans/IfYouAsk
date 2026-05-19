import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackScreenProps } from '../navigation/types';
import { Button } from '../src/components/Button';
import { Flourish } from '../src/components/Flourish';
import { IconButton } from '../src/components/IconButton';
import { useGame } from '../src/context/GameContext';
import { type CategoryId, QUESTIONS } from '../src/data/questions';
import { colors, typography } from '../src/theme';

// Per-category card metadata: the display name (used in the back-button label
// and accessibility text) and the four-card color stack. The actual question
// text is picked at render time from QUESTIONS[category] via the GameContext
// (see pickQuestion below). Round + askingPlayer also live in GameContext;
// route.params only carries { category } since that's the per-navigation
// choice the user made when tapping into this screen.

const CATEGORY_DATA: Record<
  CategoryId,
  {
    name: string;
    stack: { lighter: string; base: string; deeper: string };
  }
> = {
  justVibing: {
    name: 'Just Vibing',
    stack: {
      lighter: colors.card.justVibingLighter,
      base: colors.card.justVibing,
      deeper: colors.card.justVibingDeeper,
    },
  },
  digDeep: {
    name: 'Dig Deep',
    stack: {
      lighter: colors.card.digDeepLighter,
      base: colors.card.digDeep,
      // Theme spelling quirk: digDeep uses "Darker" while the others use "Deeper".
      deeper: colors.card.digDeepDarker,
    },
  },
  waitWhat: {
    name: 'Wait, What?',
    stack: {
      lighter: colors.card.waitWhatLighter,
      base: colors.card.waitWhat,
      deeper: colors.card.waitWhatDeeper,
    },
  },
};

/**
 * Pick a random question from the category's pool that hasn't appeared this
 * session. If every question has already been used (marathon session), the
 * used list is effectively ignored and we pick from the full pool — game
 * continues silently instead of stalling. usedQuestions[category] resets on
 * "New Game" via resetGame() (see GameContext).
 */
function pickQuestion(category: CategoryId, used: readonly string[]): string {
  const pool = QUESTIONS[category];
  const available = pool.filter((q) => !used.includes(q));
  const candidates = available.length > 0 ? available : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Length-based font-size tiers for the question text. The card has a fixed
 * height, so very long questions need a smaller size to fit comfortably.
 * Char count is an approximation of how text wraps but is plenty for three
 * tiers — tune the thresholds and sizes here when calibrating on-device.
 *   ≤ 60 chars  → use typography.question defaults (26 / 34)
 *   61–95 chars → 22 / 28
 *   96+ chars   → 19 / 24
 */
function getSizedTextStyle(len: number): { fontSize: number; lineHeight: number } | null {
  if (len <= 60) return null;
  if (len <= 95) return { fontSize: 22, lineHeight: 28 };
  return { fontSize: 19, lineHeight: 24 };
}

export default function QuestionCard({
  navigation,
  route,
}: RootStackScreenProps<'QuestionCard'>) {
  const { category } = route.params;
  const data = CATEGORY_DATA[category];

  const { usedQuestions, markQuestionUsed, nextRound } = useGame();

  // Lazy initializer runs once on mount, picking the FIRST question for this
  // entry into QuestionCard. Subsequent re-rolls (from swipe) call setQuestion
  // directly via rollNewQuestion below.
  const [question, setQuestion] = useState(() =>
    pickQuestion(category, usedQuestions[category])
  );

  // Register every question that lands as used so future picks skip it.
  // Runs on initial mount AND after every setQuestion call from a swipe.
  // markQuestionUsed dedupes in the Provider if the same question reappears
  // (e.g., when pickQuestion's exhausted-pool fallback picks a previously-seen
  // question).
  useEffect(() => {
    markQuestionUsed(category, question);
  }, [category, question, markQuestionUsed]);

  const sizedTextStyle = getSizedTextStyle(question.length);

  // ----- swipe-to-skip animation -----
  // Shared values drive the white card's transform + opacity from the UI
  // thread (no JS round-trips during the gesture). translateX and cardRotate
  // update live as the user pans. opacity, cardScale, and topOffset animate
  // during the swipe-off → new-card-emerge transition.
  const translateX = useSharedValue(0);
  const cardRotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const cardScale = useSharedValue(1);
  const topOffset = useSharedValue(0);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    top: topOffset.value,
    transform: [
      // -CARD_W/2 preserves the static centering from styles.whiteCard's
      // transform array (which gets fully replaced when this animated style
      // applies — RN transforms don't merge across style sources).
      { translateX: -CARD_W / 2 + translateX.value },
      { rotate: `${cardRotate.value}deg` },
      { scale: cardScale.value },
    ],
  }));

  // Called via runOnJS after the swipe-off animation completes. Picks a new
  // question (which will exclude the just-swiped one because that one was
  // already markQuestionUsed'd on first render) and snaps the card to a
  // "behind the back stack" starting position, then animates it forward.
  const rollNewQuestion = () => {
    setQuestion(pickQuestion(category, usedQuestions[category]));
    // Reset to centered horizontally, no tilt; then jump to the emerging
    // start state (slightly smaller, transparent, pushed down a touch) and
    // animate toward the final at-rest position.
    translateX.value = 0;
    cardRotate.value = 0;
    cardScale.value = 0.94;
    opacity.value = 0;
    topOffset.value = 10;
    cardScale.value = withSpring(1, { damping: 14, stiffness: 130 });
    opacity.value = withTiming(1, { duration: 220 });
    topOffset.value = withTiming(0, { duration: 220 });
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      // Subtle physical tilt tied to pan distance — ~1° per 30px swiped.
      cardRotate.value = e.translationX / 30;
    })
    .onEnd((e) => {
      const passedDistance = Math.abs(e.translationX) > SWIPE_DISTANCE;
      const fastFlick = Math.abs(e.velocityX) > SWIPE_VELOCITY;
      if (passedDistance || fastFlick) {
        // Commit dismiss. Fly the card off in the swipe direction with a
        // pronounced tilt, fade it out, then trigger the emerge animation.
        const direction = e.translationX > 0 ? 1 : -1;
        translateX.value = withTiming(direction * OFFSCREEN_X, { duration: 200 });
        cardRotate.value = withTiming(direction * 18, { duration: 200 });
        opacity.value = withTiming(0, { duration: 180 }, (finished) => {
          if (finished) runOnJS(rollNewQuestion)();
        });
      } else {
        // Not enough — spring back to rest.
        translateX.value = withSpring(0);
        cardRotate.value = withSpring(0);
      }
    });

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
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[styles.cardBase, styles.whiteCard, cardAnimatedStyle]}
            >
              <View style={styles.questionWrap}>
                <Text style={[styles.questionText, sizedTextStyle]}>{question}</Text>
              </View>
              <View style={styles.flourishWrap}>
                <Flourish />
              </View>
            </Animated.View>
          </GestureDetector>
        </View>
      </View>

      <View style={styles.bottomBar}>
        <Button
          label="Next Round"
          // Next Round commits the current question and advances game state:
          // nextRound() bumps the round counter and swaps the asker, then
          // goBack() returns to CategorySelection which re-reads from Context.
          // The ← back-arrow above and the swipe-to-skip gesture on the card
          // do NOT call nextRound — they preserve round/asker by design.
          onPress={() => {
            nextRound();
            navigation.goBack();
          }}
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

// Swipe-to-skip thresholds.
//   SWIPE_DISTANCE  — horizontal pan distance (px) needed to commit a re-roll.
//   SWIPE_VELOCITY  — alternative trigger so quick flicks dismiss even with
//                     short travel (px/sec).
//   OFFSCREEN_X     — how far to fly the dismissed card; well beyond any
//                     phone's viewport width.
const SWIPE_DISTANCE = 80;
const SWIPE_VELOCITY = 500;
const OFFSCREEN_X = 500;

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
