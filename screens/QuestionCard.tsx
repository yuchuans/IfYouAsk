import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
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
 * Seed the 5-deep question queue that backs the visible card stack. Index
 * meaning at any moment:
 *   [0] — top white card's question (currently visible)
 *   [1] — slot 1 (deeper back) FRONT-face question, preloaded for the next flip
 *   [2] — slot 2 (middle back) eventual question
 *   [3] — slot 3 (bottom back) eventual question
 *   [4] — slot NEW, the card currently emerging from below
 *
 * localUsed grows as we pick, so the five initial questions are guaranteed
 * distinct from each other AND from anything already shown this session.
 * Exhaustion fallback inside pickQuestion still applies if a category's pool
 * has been heavily used.
 */
function buildInitialStack(category: CategoryId, used: readonly string[]): string[] {
  const stack: string[] = [];
  const localUsed = [...used];
  for (let i = 0; i < 5; i++) {
    const q = pickQuestion(category, localUsed);
    stack.push(q);
    localUsed.push(q);
  }
  return stack;
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

  // Lazy initializer runs once per QuestionCard mount, drawing the five
  // distinct questions that back the visible stack. Subsequent advances
  // (from swipe commits) call setQuestionStack via advanceStack
  // below — never re-running this initializer.
  const [questionStack, setQuestionStack] = useState<string[]>(() =>
    buildInitialStack(category, usedQuestions[category])
  );

  // Text on slot 1's white (front) face during a flip. Locked at swipe
  // commit so React-driven setQuestionStack at cycle end doesn't change it
  // while the front face is still visible.
  const [flipFaceText, setFlipFaceText] = useState(questionStack[1]);

  // What the top white card (slot 0) shows. Set in advanceStack BEFORE the
  // stack rotates so slot 0 is already showing the new top question by the
  // time animations reset.
  const [displayedTopQuestion, setDisplayedTopQuestion] = useState(
    questionStack[0]
  );

  const pendingAnimReset = useRef(false);

  const topQuestion = questionStack[0];

  // Register the currently visible top question as used. Fires on initial
  // mount AND every time the stack rotates (since topQuestion changes).
  // advanceStack also explicitly marks the just-dismissed question
  // before rotating, so for the rotation case the Provider's dedupe makes
  // this a no-op. Belt-and-suspenders, but covers the initial-mount case
  // cleanly without a separate effect.
  useEffect(() => {
    markQuestionUsed(category, topQuestion);
  }, [category, topQuestion, markQuestionUsed]);

  useLayoutEffect(() => {
    if (!pendingAnimReset.current) return;
    pendingAnimReset.current = false;

    // React already committed the rotated questionStack and the new
    // displayedTopQuestion (slot 0 already shows the new top question in
    // this render). Snap every progress back to rest in one paint — every
    // visible position keeps the same color, so the swap is invisible.
    translateX.value = 0;
    cardRotate.value = 0;
    isAnimating.value = 0;
    slot1Progress.value = 0;
    slot2Progress.value = 0;
    slot3Progress.value = 0;
    slot2ColorProgress.value = 0;
    slot3ColorProgress.value = 0;
    newCardProgress.value = 0;

    // Update flip preload to the NEW next question. On iOS, by the time
    // this runs the UI thread has already snapped slot 1 back to its
    // at-rest position with the back face up — so the front-face text
    // update is invisible.
    //
    // On Android, reanimated shared-value writes above (slot1Progress = 0,
    // etc.) are applied on the UI thread on the NEXT frame, but React's
    // setState commits the new flipFaceText to the bridge synchronously.
    // That ordering means slot 1's front-face Text content is replaced
    // (B → C) one frame BEFORE slot 1's container snaps from slot 0's
    // position back to slot 1's position — and since slot 1's front face
    // is still visually occupying slot 0's spot for that one frame, the
    // user sees the next-next question (C) briefly flash before slot 1
    // moves away. Defer the React state update by one frame with
    // requestAnimationFrame so the UI thread has time to apply
    // slot1Progress = 0 first. By the time setFlipFaceText runs, slot 1's
    // back face is up and the front-face content change is invisible.
    if (Platform.OS === 'android') {
      const rafId = requestAnimationFrame(() => {
        setFlipFaceText(questionStack[1]);
      });
      return () => cancelAnimationFrame(rafId);
    }
    setFlipFaceText(questionStack[1]);
  }, [questionStack]);

  const topCardTextStyle = getSizedTextStyle(displayedTopQuestion.length);
  const flipCardTextStyle =
    flipFaceText.length === displayedTopQuestion.length
      ? topCardTextStyle
      : getSizedTextStyle(flipFaceText.length);

  // ----- swipe-to-skip animation -----
  // Shared values driving the v8 cycle. All run on the UI thread (no JS
  // round-trips during the gesture).
  //   translateX, cardRotate  — top card's live pan and commit fly-off.
  //   slot1/2/3Progress       — position/rotation cycle as cards advance one
  //                             slot forward (0 at rest, 1 fully cycled).
  //                             Section D wires the interpolations.
  //   slot2/3ColorProgress    — separate timing for the color shift on cards
  //                             arriving at slots 2 and 3 (delayed + fast,
  //                             so no two visible cards ever share a color).
  //   newCardProgress         — emergence of the freshly-drawn card from
  //                             slot NEW (off-stack, below) up into slot 3.
  //   isAnimating             — re-entry guard. 0 at rest, 1 while a cycle
  //                             is in flight (~800ms from commit to
  //                             advanceStack). Both gesture
  //                             callbacks no-op while it's 1 so a mid-cycle
  //                             pan can't race the swipe-off transform
  //                             back to the finger.
  const translateX = useSharedValue(0);
  const cardRotate = useSharedValue(0);
  const slot1Progress = useSharedValue(0);
  const slot2Progress = useSharedValue(0);
  const slot3Progress = useSharedValue(0);
  const slot2ColorProgress = useSharedValue(0);
  const slot3ColorProgress = useSharedValue(0);
  const newCardProgress = useSharedValue(0);
  const isAnimating = useSharedValue(0);

  // ----- per-slot animated styles -----
  // Each slot's at-rest values match the static positions Section C laid
  // down; the .value of 0 produces an identity transform, so swapping these
  // in over the static inline styles is visually a no-op at rest. During a
  // commit cycle, Section E drives the progress values 0 → 1 (and the
  // color progresses on their own delayed timing), which is when the
  // interpolations below come alive.
  //
  // Slot 0 (top white) — drives translateX + rotate from the live pan and
  // commit fly-off. -CARD_W/2 preserves the static centering from
  // styles.whiteCard, which gets fully overridden when an animated
  // transform applies (RN transforms don't merge across style sources).
  //
  // Slot 0 is the persistent white top card. During a swipe it flies off
  // and stays off-screen (clipped by overflow:hidden) until useLayoutEffect
  // snaps translateX back to 0 with the new question already loaded.
  const slot0Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: -CARD_W / 2 + translateX.value },
      { rotate: `${cardRotate.value}deg` },
    ],
  }));

  // Slot 1 — the flipping card. Position interpolates from slot 1's at-rest
  // values toward slot 0's (so by progress=1 it's sitting exactly where the
  // top white card used to be).
  //
  // Flip uses scaleX (2D), not rotateY. True 3D rotateY on iOS depth-tests
  // slot 1 against slot 2 beneath it — the lighter card bleeds through as a
  // vertical split mid-flip. translateZ isn't supported in RN transforms.
  // scaleX 1→0 (first half) then 0→1 (second half) + opacity face swap at
  // p=0.5 gives a reliable flip without sibling depth fighting.
  //
  // Lift envelope: sin(π·p) peaks at p=0.5. translateY = subtle pickup;
  // zIndex keeps slot 1 painted above the back stack for the whole flip.
  const slot1ContainerStyle = useAnimatedStyle(() => {
    const p = slot1Progress.value;
    const lift = Math.sin(p * Math.PI);
    const scaleX =
      p <= 0.5
        ? interpolate(p, [0, 0.5], [1, 0])
        : interpolate(p, [0.5, 1], [0, 1]);
    return {
      top: interpolate(p, [0, 1], [4, 0]),
      zIndex: lift > 0.01 ? SLOT1_FLIP_Z_INDEX : 0,
      transform: [
        { translateX: -CARD_W / 2 + interpolate(p, [0, 1], [4, 0]) },
        { translateY: -lift * SLOT1_LIFT_Y },
        { rotate: `${interpolate(p, [0, 1], [0.7, 0])}deg` },
        { scaleX },
      ],
    };
  });

  // Slot 1 face visibility — opacity swap at p=0.5 when scaleX hits edge-on.
  const slot1BackFaceStyle = useAnimatedStyle(() => ({
    opacity: slot1Progress.value < 0.5 ? 1 : 0,
  }));
  const slot1FrontFaceStyle = useAnimatedStyle(() => ({
    opacity: slot1Progress.value < 0.5 ? 0 : 1,
  }));

  // Slot 2 — middle back card. Position drifts from slot 2 toward slot 1's
  // at-rest values over the 1000ms cycle. The backgroundColor is on its own
  // separate progress (slot2ColorProgress) — that one is delayed 300ms and
  // runs in 120ms, so the color flip from "base" to "deeper" happens late
  // and fast, right before the new white card lands. That late-fast
  // schedule is the mechanism that keeps the spec's "no two visible cards
  // share a color at any frame" invariant intact: while card 0 is mid-fly
  // and slot 1 is mid-flip, slot 2 still reads as base and slot 3 still
  // reads as lighter, so the four-color silhouette is preserved.
  const slot2Style = useAnimatedStyle(() => {
    const p = slot2Progress.value;
    return {
      top: interpolate(p, [0, 1], [10, 4]),
      transform: [
        { translateX: -CARD_W / 2 + interpolate(p, [0, 1], [9, 4]) },
        { rotate: `${interpolate(p, [0, 1], [1.7, 0.7])}deg` },
      ],
      backgroundColor: interpolateColor(
        slot2ColorProgress.value,
        [0, 1],
        [data.stack.base, data.stack.deeper]
      ),
    };
  });

  // Slot 3 — bottom back card. Same shape as slot 2 but one slot deeper.
  // Color travels lighter → base on the same delayed-fast schedule.
  const slot3Style = useAnimatedStyle(() => {
    const p = slot3Progress.value;
    return {
      top: interpolate(p, [0, 1], [16, 10]),
      transform: [
        { translateX: -CARD_W / 2 + interpolate(p, [0, 1], [14, 9]) },
        { rotate: `${interpolate(p, [0, 1], [2.8, 1.7])}deg` },
      ],
      backgroundColor: interpolateColor(
        slot3ColorProgress.value,
        [0, 1],
        [data.stack.lighter, data.stack.base]
      ),
    };
  });

  // Slot NEW — the off-stack card sliding up into slot 3's footprint.
  // Travels top/translateX/rotate from the NEW position to slot 3's at-rest
  // values, while simultaneously scaling 0.94 → 1 and fading 0 → 1. Color
  // stays at lighter the whole time (set statically in the JSX); the NEW
  // card never animates its color.
  const slotNewStyle = useAnimatedStyle(() => {
    const p = newCardProgress.value;
    return {
      top: interpolate(p, [0, 1], [22, 16]),
      opacity: interpolate(p, [0, 1], [0, 1]),
      transform: [
        { translateX: -CARD_W / 2 + interpolate(p, [0, 1], [19, 14]) },
        { rotate: `${interpolate(p, [0, 1], [3.9, 2.8])}deg` },
        { scale: interpolate(p, [0, 1], [0.94, 1]) },
      ],
    };
  });

  // Called via runOnJS when the cycle finishes. Only rotates the question
  // stack — shared values reset in useLayoutEffect after React commits so
  // slot 0's Text already shows the new top question (no one-frame flicker
  // of the dismissed card).
  const advanceStack = () => {
    const becomingTop = questionStack[1];
    markQuestionUsed(category, questionStack[0]);
    setDisplayedTopQuestion(becomingTop);
    pendingAnimReset.current = true;
    setQuestionStack((prev) => {
      const next = pickQuestion(category, [...usedQuestions[category], ...prev]);
      return [prev[1], prev[2], prev[3], prev[4], next];
    });
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // Re-entry guard. While a cycle is in flight (commit → 1000ms →
      // advanceStackAndReset), incoming pans would otherwise overwrite
      // translateX/cardRotate mid-fly-off and teleport the swiped-off card
      // back to wherever the finger is. Returning early keeps the cycle
      // sealed until it completes.
      if (isAnimating.value) return;
      translateX.value = e.translationX;
      // Subtle physical tilt tied to pan distance — ~1° per 30px swiped.
      cardRotate.value = e.translationX / 30;
    })
    .onEnd((e) => {
      if (isAnimating.value) return;
      const passedDistance = Math.abs(e.translationX) > SWIPE_DISTANCE;
      const fastFlick = Math.abs(e.velocityX) > SWIPE_VELOCITY;
      if (passedDistance || fastFlick) {
        // Commit dismiss. Four things kick off simultaneously at t=0:
        //   1. Top card (slot 0) flies off ±OFFSCREEN_X with an 18° tilt
        //      over 320ms (swipeEasing — fast-start, slow-end so it
        //      accelerates off-screen). NO opacity change; the card clips
        //      at the stage edge via overflow:hidden on the display.
        //   2. Slots 1/2/3 cycle forward (CYCLE_DURATION_MS). Slot 1 scaleX-flips.
        //   3. Color shifts — delayed COLOR_SHIFT_DELAY_MS, 120ms tween.
        //   4. NEW card — NEW_CARD_DELAY_MS delay, NEW_CARD_DURATION_MS emerge.
        // slot1Progress completion → runOnJS(advanceStack); layout effect resets.
        isAnimating.value = 1;
        const direction = e.translationX > 0 ? 1 : -1;
        const swipeEasing = Easing.bezier(0.32, 0, 0.67, 0.85);
        const cycleEasing = Easing.bezier(0.4, 0, 0.2, 1);

        // Card 0 swipe-off — translateX + rotate only, no opacity fade.
        translateX.value = withTiming(direction * OFFSCREEN_X, {
          duration: 320,
          easing: swipeEasing,
        });
        cardRotate.value = withTiming(direction * 18, {
          duration: 320,
          easing: swipeEasing,
        });

        // Slot 1/2/3 position cycle. runOnJS(advanceStack) on slot1 completion.
        slot1Progress.value = withTiming(
          1,
          { duration: CYCLE_DURATION_MS, easing: cycleEasing },
          (finished) => {
            if (finished) runOnJS(advanceStack)();
          }
        );
        slot2Progress.value = withTiming(1, {
          duration: CYCLE_DURATION_MS,
          easing: cycleEasing,
        });
        slot3Progress.value = withTiming(1, {
          duration: CYCLE_DURATION_MS,
          easing: cycleEasing,
        });

        slot2ColorProgress.value = withDelay(
          COLOR_SHIFT_DELAY_MS,
          withTiming(1, { duration: COLOR_SHIFT_DURATION_MS })
        );
        slot3ColorProgress.value = withDelay(
          COLOR_SHIFT_DELAY_MS,
          withTiming(1, { duration: COLOR_SHIFT_DURATION_MS })
        );

        newCardProgress.value = withDelay(
          NEW_CARD_DELAY_MS,
          withTiming(1, { duration: NEW_CARD_DURATION_MS, easing: cycleEasing })
        );
      } else {
        // Below threshold — spring back to rest.
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
          <View style={styles.displayInner}>
          {/* Render order goes back-to-front (RN paints in DOM order, so the
              first child sits deepest in the stack). After the v8 cycle: the
              NEW card emerges from off-stack into slot 3, each existing back
              card moves up one slot, and slot 1 flips forward to become the
              new white top card. Each rendered card sits at its AT-REST
              position via static inline transforms in Section C — Section D
              swaps those statics out for useAnimatedStyle bindings that
              interpolate FROM the at-rest values TO the post-cycle values. */}

          {/* Slot NEW (off-stack, below slot 3). slotNewStyle drives top,
              translateX, rotate, scale, and opacity from a single shared
              progress. The lighter color is the only piece that stays
              static — the NEW card never changes color. */}
          <Animated.View
            style={[
              styles.cardBase,
              { backgroundColor: data.stack.lighter },
              slotNewStyle,
            ]}
          />

          {/* Slot 3 (bottom back). slot3Style owns position + animated
              backgroundColor (lighter → base on a delayed schedule so the
              color shift lands late, just before the new white card). */}
          <Animated.View style={[styles.cardBase, slot3Style]} />

          {/* Slot 2 (middle back). slot2Style owns position + animated
              backgroundColor (base → deeper). */}
          <Animated.View style={[styles.cardBase, slot2Style]} />

          {/* Slot 1 (deeper back, closest to white). Carries the flip.
              Two stacked faces — deeper back (visible first half) and white
              front (visible second half). slot1ContainerStyle scaleX-flips
              the container and slides it to slot 0. The front face holds the PRELOADED question
              (questionStack[1]) — that's what the user sees the instant
              the flip completes, so it has to be on the front face from
              mount, not swapped in later. */}
          <Animated.View style={[styles.slot1Container, slot1ContainerStyle]}>
            <Animated.View
              style={[
                styles.face,
                { backgroundColor: data.stack.deeper },
                slot1BackFaceStyle,
              ]}
            />
            <Animated.View
              style={[styles.face, styles.faceFront, slot1FrontFaceStyle]}
            >
              <View style={styles.questionWrap}>
                <Text
                  style={[
                    styles.questionText,
                    flipCardTextStyle,
                    Platform.OS === 'android' && styles.questionTextAndroid,
                  ]}
                  // Android-only: disable OS-level font scaling so Android
                  // doesn't run a deferred re-measurement pass after first
                  // paint (which causes the post-flip text-size shift).
                  // iOS keeps the RN default (true) so Dynamic Type still
                  // applies there — visual behavior unchanged on iOS.
                  allowFontScaling={Platform.OS === 'android' ? false : undefined}
                >
                  {flipFaceText}
                </Text>
              </View>
              <View style={styles.flourishWrap}>
                <Flourish />
              </View>
            </Animated.View>
          </Animated.View>

          {/* Slot 0 (top white) — the gesture-driven card. Reads from
              questionStack[0]; slot0Style owns its transform (live pan +
              commit fly-off; no opacity, no scale, no top change). */}
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[styles.cardBase, styles.whiteCard, slot0Style]}
            >
              <View style={styles.questionWrap}>
                <Text
                  style={[
                    styles.questionText,
                    topCardTextStyle,
                    Platform.OS === 'android' && styles.questionTextAndroid,
                  ]}
                  // Android-only: see slot 1 front face above. Both Text
                  // nodes need the same props/styles so the flip-end handoff
                  // stays pixel-identical (they share the same questionWrap
                  // geometry and need to measure the same way).
                  allowFontScaling={Platform.OS === 'android' ? false : undefined}
                >
                  {displayedTopQuestion}
                </Text>
              </View>
              <View style={styles.flourishWrap}>
                <Flourish />
              </View>
            </Animated.View>
          </GestureDetector>
          </View>
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
        {/* Wrap Up — same nextRound() commit as Next Round (the question on
            screen counts as a completed round), then navigates to Reflection
            instead of back to CategorySelection. Underlined text link, not a
            styled button: low-frequency exit, kept visually quieter than the
            primary CTA so it doesn't compete for attention during play.
            replace() (not navigate()) swaps QuestionCard out of the stack as
            Reflection is pushed in, so Reflection's back button — and the
            Android hardware back — both land on CategorySelection regardless
            of whether the user reached Reflection via Wrap Up here or via
            CategorySelection's ✕. Without this, goBack() from Reflection
            would pop to QuestionCard on the Wrap Up path. */}
        <Pressable
          onPress={() => {
            nextRound();
            navigation.replace('Reflection');
          }}
          accessibilityRole="button"
          accessibilityLabel="Wrap up and see reflection"
          hitSlop={12}
          style={styles.wrapUpLink}
        >
          <Text style={styles.wrapUpLabel}>Wrap Up</Text>
        </Pressable>
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

// Extra vertical room inside the display stage so rotated / lifted cards
// aren't clipped by overflow:hidden. DISPLAY_HEADROOM_TOP is subtracted
// from body.paddingTop so the stack's on-screen position stays the same.
const DISPLAY_HEADROOM_TOP = 50;

// Slot 1 "pick up then flip" — sin(π·progress) peaks at the flip midpoint.
// translateY gives a subtle pickup. zIndex (not translateZ — RN rejects
// translateZ in transform arrays) keeps slot 1 composited above slot 2
// during rotateY so the lighter card underneath doesn't show through.
const SLOT1_LIFT_Y = 15;
const SLOT1_FLIP_Z_INDEX = 10;

// Swipe-to-skip thresholds. Bumped in v8 because the heavier cycle
// animation makes accidental commits more costly (1000ms before another
// swipe can land) — better to require a deliberate gesture.
//   SWIPE_DISTANCE  — horizontal pan distance (px) needed to commit a
//                     re-roll. Raised from 80 to 130 so light grazes don't
//                     trigger the cycle.
//   SWIPE_VELOCITY  — alternative trigger so quick flicks dismiss even
//                     with short travel (px/sec). Raised from 500 to 600
//                     so slow lazy drags don't slip past as flicks.
//   OFFSCREEN_X     — how far to fly the dismissed card. Raised from 500
//                     to 560 to match the v8 swipe-off geometry (the card
//                     clips at the stage edge via overflow:hidden, and
//                     560px clears any current phone width with margin).
const SWIPE_DISTANCE = 130;
const SWIPE_VELOCITY = 600;
const OFFSCREEN_X = 560;

// Cycle timings — tuned ~20% faster than spec defaults on device.
const CYCLE_DURATION_MS = 800;
const COLOR_SHIFT_DELAY_MS = 240;
const COLOR_SHIFT_DURATION_MS = 120;
const NEW_CARD_DELAY_MS = 380;
const NEW_CARD_DURATION_MS = 380;

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
    // 30 here + DISPLAY_HEADROOM_TOP on displayInner.top = original 80px gap
    // below the topBar — same deck position as pre-flip work (Phase 4).
    paddingTop: 80 - DISPLAY_HEADROOM_TOP,
  },
  // The display is the centered "stage" for the card stack. Its only purpose
  // is to provide a known center for the absolutely-positioned cards (via
  // `left: '50%'` + a translateX of -CARD_W/2 inside each card's transform).
  // overflow:'hidden' clips the swipe-off card at the stage edge — the v8
  // commit flies the top card ±560px, well past the phone's viewport, and
  // we want it to disappear into the side of the stage cleanly rather than
  // bleeding over the safe-area or the topBar/bottomBar regions.
  // Taller than the card stack so the top DISPLAY_HEADROOM_TOP px is empty
  // clip space (swipe tilt / flip lift). displayInner sits below that band.
  display: {
    width: '100%',
    height: CARD_H + 28 + DISPLAY_HEADROOM_TOP,
    position: 'relative',
    overflow: 'hidden',
  },
  displayInner: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: DISPLAY_HEADROOM_TOP,
    height: CARD_H + 28,
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
  // Slot 1 carries two stacked faces inside its layout-only container. The
  // container only does positioning (so it can scaleX-flip + translateY-lift
  // without owning chrome that double-renders against slot 0).
  // Each face has its OWN shadow/border/radius — same chrome as cardBase —
  // so when the front face arrives at slot 0's position at flip end, it's
  // pixel-identical to slot 0 and the JS-side handoff is invisible.
  slot1Container: {
    position: 'absolute',
    width: CARD_W,
    height: CARD_H,
    left: '50%',
  },
  face: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CARD_W,
    height: CARD_H,
    borderRadius: CARD_RADIUS,
    borderWidth: 0.5,
    borderColor: 'rgba(61, 53, 48, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  faceFront: {
    backgroundColor: colors.card.bgWhite,
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
  // Android-only companion to questionText. Pins the Text node to the full
  // inner vertical space of questionWrap (CARD_H 360 − top 82 − bottom 102 =
  // 176) and uses native vertical centering instead of relying on the parent
  // questionWrap's flex justification. Why: on Android, the Text node can
  // re-measure on a second paint pass; when it's flex-centered, that
  // re-measure re-runs the parent's justify-content and shows up as a
  // visible size/position shift right after a swipe. Locking the Text to a
  // fixed height removes the re-measure-dependent layout path entirely.
  // iOS doesn't take this style (Platform.OS branch in the Text style array)
  // and keeps the existing flex-centered behavior, where it works fine.
  //
  // includeFontPadding: false removes Android's default font-metric padding
  // (extra space above ascender / below descender). Default behavior on
  // Android is to add this padding to every Text node and re-resolve it on
  // each style-prop change — that re-resolution is what causes the
  // post-flip "size shift" symptom even when fontSize / lineHeight don't
  // actually change. With this off, glyph positioning depends purely on
  // lineHeight (which is stable across the commit) and the visual shift
  // can't happen. Android-only style prop; iOS ignores it if it leaks
  // through, but we still guard at the call site for clarity.
  //
  // textAlignVertical is also Android-only and is a no-op on iOS.
  // Worst-case wrap across all three font tiers fits within 176px.
  questionTextAndroid: {
    height: 176,
    textAlignVertical: 'center',
    includeFontPadding: false,
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
    gap: 12,
  },
  cta: {
    width: '100%',
    maxWidth: 300,
  },
  wrapUpLink: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  wrapUpLabel: {
    ...typography.buttonPrimary,
    color: colors.text.tertiary,
    textDecorationLine: 'underline',
  },
});
