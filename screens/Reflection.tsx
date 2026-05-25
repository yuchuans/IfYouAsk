import { useEffect } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackScreenProps } from '../navigation/types';
import { Button } from '../src/components/Button';
import { IconButton } from '../src/components/IconButton';
import { Body, Heading } from '../src/components/typography';
import { useGame } from '../src/context/GameContext';
import { colors, typography } from '../src/theme';

// ----- text-reveal animation constants -----
// CHAR_INTERVAL_MS sets the per-character cadence (so headingProgress
// advances exactly one "index unit" every 24ms when running on linear
// timing). CHAR_OVERLAP is how many characters are mid-fade at any moment —
// 9 produces a smooth "wash" rather than a hard typewriter, because each
// char's 0→1 opacity ramp covers 9 * 24ms = 216ms.
const CHAR_INTERVAL_MS = 24;
const CHAR_OVERLAP = 9;
const INITIAL_DELAY_MS = 300;
const PAINT_DURATION_MS = 500;
const SUB_DELAY_MS = 60;
const SUB_DURATION_MS = 800;
const SUB_TRANSLATE_FROM = 4;

// Stripe geometry: height 17 is proportional to the Heading line-height;
// bottom -4 keeps it clear of the "p" descender. Negative left/right
// overhangs make the stripe wider than the "{N} steps" text on both sides
// while staying within the trailing-space gap of "You're " on the left
// and unused line-1 space on the right.
const STRIPE_HEIGHT = 17;
const STRIPE_BOTTOM = -4;
const STRIPE_LEFT = -2;
const STRIPE_RIGHT = -6;

// Same standard "decelerate" curve we use for swipe-off / handoff motion.
const stripeEasing = Easing.bezier(0.4, 0, 0.2, 1);
// Symmetric ease-in-out for the subheading — slow start AND slow end so the
// entrance is gradual on both sides. The previous (0.16, 1, 0.3, 1) curve
// front-loaded the opacity change into the first 30% of duration, which
// read as abrupt.
const subheadingEasing = Easing.bezier(0.42, 0, 0.58, 1);

type AnimatedCharProps = {
  char: string;
  index: number;
  progress: SharedValue<number>;
};

// iOS per-character renderer. Each character is its own Animated.Text
// mounted inline inside a parent Heading (which is itself a Text), so
// font / color / weight flow down via the usual nested-Text inheritance
// and we only override opacity per character. Lives at module scope
// because each AnimatedChar owns its own useAnimatedStyle hook, and
// React doesn't allow hooks inside a .map() — the component boundary
// gives us the per-index hook isolation we need.
//
// Why iOS-only: on Android the native text layout collapses nested
// <Text> children into a single Spannable, and the Spannable API
// silently drops animated per-span alpha — so the per-char opacity
// here renders as nothing on Android. AndroidAnimatedChar (below) is
// the Android counterpart and uses Animated.View > Text instead, which
// composites each char as its own native layer with its own animatable
// opacity. Each AndroidAnimatedChar takes up the same physical layout
// space as a normal text char from t=0 (opacity 0), so the heading
// block has its full dimensions reserved from mount — no layout shift.
function AnimatedChar({ char, index, progress }: AnimatedCharProps) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [index, index + CHAR_OVERLAP],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));
  return <Animated.Text style={style}>{char}</Animated.Text>;
}

const androidCharTextStyle = [
  typography.headingBold,
  { color: colors.text.primary },
];

function AndroidAnimatedChar({ char, index, progress }: AnimatedCharProps) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [index, index + CHAR_OVERLAP],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));
  return (
    <Animated.View style={style}>
      <Text style={androidCharTextStyle}>{char}</Text>
    </Animated.View>
  );
}

export default function Reflection({ navigation }: RootStackScreenProps<'Reflection'>) {
  const { round, resetGame } = useGame();

  // `round` is the *next* round about to be played; the number of rounds the
  // players actually completed is round - 1. Reaches 0 if the user taps ✕ on
  // CategorySelection without playing any rounds — typically a first-time
  // user clicking around to see what each button does, not a deliberate
  // exit after a session. We branch to a neutral copy block ("Nothing shared
  // yet") in that case rather than the reward copy, which would presume
  // emotional intent the user may not have.
  const roundsPlayed = round - 1;
  const isZeroRounds = roundsPlayed === 0;

  // Normal-path heading is laid out in three segments. Segment 1 + segment 2
  // share a row (so the stripe can sit absolutely behind seg 2); segment 3
  // sits on its own row below. The global character index spans all three
  // segments continuously — the visual line break between segments 2 and 3
  // is purely structural, the typing animation just keeps marching through
  // indices.
  //
  // Zero-rounds heading is a single flat string — no segmentation, no stripe.
  const seg1 = "You're ";
  // Singular/plural agreement: "1 step closer" vs "2 steps closer". seg2's
  // char count flows through to seg3Start and headingTotalChars via the
  // existing `seg1.length + seg2.length` math, so the animation timing and
  // stripe geometry auto-adjust when the word loses its 's'.
  const seg2 = `${roundsPlayed} ${roundsPlayed === 1 ? 'step' : 'steps'}`;
  const seg3 = 'closer to each other';
  const seg1Start = 0;
  const seg2Start = seg1.length;
  const seg3Start = seg1.length + seg2.length;
  const zeroRoundsHeading = 'Nothing shared yet';
  const headingTotalChars = isZeroRounds
    ? zeroRoundsHeading.length
    : seg1.length + seg2.length + seg3.length;

  // headingProgress: a counter that walks 0 → totalChars linearly. Each
  // per-character renderer (AnimatedChar on iOS, AndroidAnimatedChar on
  // Android) reads its own slice (index .. index + CHAR_OVERLAP) and
  // interpolates 0→1 opacity over that window. Both platforms share this
  // shared value and the same fade-wash math — the only difference is
  // the per-char wrapper (Animated.Text on iOS vs Animated.View > Text
  // on Android), which is what makes the per-char alpha animate on
  // Android. See AnimatedChar / AndroidAnimatedChar at module scope.
  const headingProgress = useSharedValue(0);
  // stripeProgress: 0 = unpainted, 1 = fully painted. Drives scaleX of the
  // absolute-positioned stripe behind seg 2.
  const stripeProgress = useSharedValue(0);
  // Subheading entrance — opacity + translateY animated together.
  const subOpacity = useSharedValue(0);
  const subTranslateY = useSharedValue(SUB_TRANSLATE_FROM);

  useEffect(() => {
    // Captured at mount. The branch choice (isZeroRounds) and segment
    // lengths are fixed for the lifetime of this Reflection screen — the
    // game state doesn't change while we're sitting on the wrap-up — so
    // closing over these values is safe.
    // Animate progress past the last character index by CHAR_OVERLAP so the
    // final characters' fade windows (index .. index + CHAR_OVERLAP) actually
    // complete. Without this, the last 9 chars only reach opacity
    // ((index_advance - i) / 9) at animation end — the trailing word fades
    // out instead of arriving fully visible.
    const headingTarget = headingTotalChars + CHAR_OVERLAP;
    const headingDuration = headingTarget * CHAR_INTERVAL_MS;
    // "Visually done" — when the last char's fade window is halfway through
    // (~50% opaque, readable). The remaining CHAR_OVERLAP/2 frames are just
    // the tail of the wash, which we let overlap with the subheading entry
    // so the user doesn't sit waiting for the trailing opacity to crest.
    const headingVisualDoneAt =
      INITIAL_DELAY_MS +
      (headingTotalChars + Math.floor(CHAR_OVERLAP / 2)) * CHAR_INTERVAL_MS;

    headingProgress.value = withDelay(
      INITIAL_DELAY_MS,
      withTiming(headingTarget, {
        duration: headingDuration,
        easing: Easing.linear,
      })
    );

    // Stripe only runs in the normal path — for zero rounds there's no
    // number to highlight, so we skip the stripe entirely and the subheading
    // just waits on the heading.
    let stripeDoneAt = 0;
    if (!isZeroRounds) {
      const stripeStartAt = INITIAL_DELAY_MS + seg1.length * CHAR_INTERVAL_MS;
      stripeDoneAt = stripeStartAt + PAINT_DURATION_MS;
      stripeProgress.value = withDelay(
        stripeStartAt,
        withTiming(1, { duration: PAINT_DURATION_MS, easing: stripeEasing })
      );
    }

    const subStartAt =
      Math.max(headingVisualDoneAt, stripeDoneAt) + SUB_DELAY_MS;

    subOpacity.value = withDelay(
      subStartAt,
      withTiming(1, { duration: SUB_DURATION_MS, easing: subheadingEasing })
    );
    subTranslateY.value = withDelay(
      subStartAt,
      withTiming(0, { duration: SUB_DURATION_MS, easing: subheadingEasing })
    );
    // Run-on-mount only. isZeroRounds and the segment lengths are stable for
    // the screen's lifetime (game state doesn't mutate during Reflection),
    // so omitting them from deps is intentional — we don't want to retrigger
    // the sequence if React re-renders for any reason.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stripeStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: stripeProgress.value }],
  }));

  const subheadingStyle = useAnimatedStyle(() => ({
    opacity: subOpacity.value,
    transform: [{ translateY: subTranslateY.value }],
  }));

  // Render one full heading segment (wrapper + children), branched by
  // platform. The wrapper element itself has to differ: on iOS we wrap
  // chars in <Heading> (a <Text>) so each <Animated.Text> child
  // inherits the parent's font / weight / lineHeight via the standard
  // nested-Text inheritance; on Android we wrap them in a flex-row
  // <View> because per-char alpha must animate on an Animated.View
  // (not on a <Text> inside a parent <Text> — see AndroidAnimatedChar
  // module comment).
  //
  // Both branches use the same headingProgress shared value and the
  // same per-char index window, so the animation timing is identical
  // across platforms. `start` is the global character index where this
  // segment begins (seg1Start / seg2Start / seg3Start) so each char's
  // opacity ramp aligns with its position in the continuous reveal.
  //
  // Caveat: on Android the chars are individually-laid-out Views, so
  // we lose kerning between characters (every char gets its natural
  // width). At 28px headings this widens each segment by ~2–5%, which
  // is visually subtle. Worth the trade vs. a static-render heading.
  const renderHeadingSegment = (
    segment: string,
    start: number,
    keyPrefix: string
  ) => {
    if (Platform.OS === 'android') {
      return (
        <View style={styles.androidHeadingRow}>
          {segment.split('').map((c, i) => (
            <AndroidAnimatedChar
              key={`${keyPrefix}-${i}`}
              char={c}
              index={start + i}
              progress={headingProgress}
            />
          ))}
        </View>
      );
    }
    return (
      <Heading variant="bold">
        {segment.split('').map((c, i) => (
          <AnimatedChar
            key={`${keyPrefix}-${i}`}
            char={c}
            index={start + i}
            progress={headingProgress}
          />
        ))}
      </Heading>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <IconButton
          icon="←"
          label="Back"
          onPress={() => navigation.goBack()}
          hitSlop={12}
          accessibilityLabel="Back to category selection"
        />
      </View>

      <View style={styles.container}>
        <View style={styles.imageFrame}>
          <Image
            source={require('../assets/images/reflection.png')}
            style={styles.image}
            resizeMode="cover"
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        </View>

        <View
          style={[
            styles.bottomSection,
            isZeroRounds && styles.bottomSectionZeroRounds,
          ]}
        >
          <View style={styles.copy}>
            <View style={styles.headingBlock}>
              {isZeroRounds ? (
                renderHeadingSegment(zeroRoundsHeading, 0, 'zr')
              ) : (
                <>
                  <View style={styles.headingLine1}>
                    {renderHeadingSegment(seg1, seg1Start, 's1')}
                    <View style={styles.highlightedWord}>
                      <Animated.View
                        style={[styles.highlightStripe, stripeStyle]}
                      />
                      {renderHeadingSegment(seg2, seg2Start, 's2')}
                    </View>
                  </View>
                  {renderHeadingSegment(seg3, seg3Start, 's3')}
                </>
              )}
            </View>
            {/* Wrap Body in Animated.View — Body itself is a plain Text, so
                the parent View is what we animate. Opacity on a View
                cascades to text children. */}
            <Animated.View style={subheadingStyle}>
              <Body variant="subheading" style={styles.subheading}>
                {isZeroRounds
                  ? 'Start drawing a question card\nwhenever you are ready'
                  : 'One for each question you took\nthe time to share and let in'}
              </Body>
            </Animated.View>
          </View>
          {/* Zero-rounds case: no CTA. The back arrow in the topBar already
              gives the user the most useful action — return to
              CategorySelection with player names and first-asker still
              intact — which is almost always what they want after tapping
              ✕ accidentally. New Game would wipe their session and force a
              re-entry from Welcome, which is the wrong default here. */}
          {!isZeroRounds && (
            <Button
              label="New Game"
              onPress={() => {
                resetGame();
                navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
              }}
              style={styles.cta}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

// Figma node 267:241 — visible image frame is 370×268 with 16px radius and
// overflow-clip. The underlying art (node 267:242) is rendered at 402×268
// with a -16 horizontal offset, so 16px is trimmed off each side.
const IMAGE_FRAME_WIDTH = 370;
const IMAGE_FRAME_HEIGHT = 268;
const IMAGE_ART_WIDTH = 402;

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
    paddingHorizontal: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  imageFrame: {
    width: IMAGE_FRAME_WIDTH,
    height: IMAGE_FRAME_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 64,
  },
  image: {
    width: IMAGE_ART_WIDTH,
    height: IMAGE_FRAME_HEIGHT,
    marginLeft: -16,
  },
  copy: {
    alignItems: 'center',
    gap: 12,
  },
  headingBlock: {
    alignItems: 'center',
  },
  headingLine1: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  // Android-only: row container that takes the place of a <Heading>
  // (<Text>) wrapper around AndroidAnimatedChar children. Each child is
  // an <Animated.View> wrapping a <Text>, so the parent has to be a
  // <View> with flex-row layout — putting a <View> inside a <Text> is
  // illegal in RN. alignItems: 'baseline' keeps the chars' text
  // baselines aligned even though they're separate views, so the
  // segment still reads as one line of text.
  androidHeadingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  highlightedWord: {
    position: 'relative',
  },
  // v2 geometry — see STRIPE_* constants up top. scaleX starts at 0 and
  // the animated stripeStyle ramps it to 1; transformOrigin: 'left center'
  // makes the paint sweep left → right rather than expanding from center.
  highlightStripe: {
    position: 'absolute',
    left: STRIPE_LEFT,
    right: STRIPE_RIGHT,
    bottom: STRIPE_BOTTOM,
    height: STRIPE_HEIGHT,
    backgroundColor: colors.accent.primary60,
    transform: [{ scaleX: 0 }],
    transformOrigin: 'left center',
  },
  subheading: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
  bottomSection: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 80,
  },
  // Zero-rounds variant: with no CTA Button rendered, the copy block would
  // otherwise hug the bottom of bottomSection (justifyContent: 'flex-end').
  // Add paddingBottom equal to (Button height 56 + sibling gap 80) so the
  // copy lands at the same vertical position as the normal-path copy does
  // when the Button is present. If the Button's intrinsic height changes
  // (theme tweak, label wraps to two lines), this number needs to follow.
  bottomSectionZeroRounds: {
    paddingBottom: 80 + 56,
  },
  cta: {
    width: '100%',
    maxWidth: 300,
  },
});
