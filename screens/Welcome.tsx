import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackScreenProps } from '../navigation/types';
import { Button } from '../src/components/Button';
import { Flourish } from '../src/components/Flourish';
import { Body, Heading } from '../src/components/typography';
import { colors, shadows } from '../src/theme';

export default function Welcome({ navigation }: RootStackScreenProps<'Welcome'>) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Heading variant="app-title" style={styles.centerText}>
          if you ask
        </Heading>

        <View style={styles.stackWrap}>
          <CardStack />
        </View>

        <View style={styles.copy}>
          <Heading style={styles.centerText}>
            Asking and listening{'\n'}bring us closer
          </Heading>
          <Body variant="subheading" style={styles.subheading}>
            These questions are a place to start
          </Body>
        </View>

        <Button
          label="Let’s begin"
          onPress={() => navigation.navigate('NameEntry')}
          style={styles.cta}
        />
      </View>
    </SafeAreaView>
  );
}

// Visual approximation of the Figma "Card stack" (node 267:91): three
// colored category cards fanned out behind a white card with three text-line
// placeholders and a small decorative flourish. Sizes/rotations are tuned by
// eye to match the Figma screenshot, not derived from exact pixel inset math.
function CardStack() {
  return (
    <View style={styles.stack}>
      <View style={[styles.deckCard, styles.cardYellow]} />
      <View style={[styles.deckCard, styles.cardRed]} />
      <View style={[styles.deckCard, styles.cardGreen]} />
      <View style={[styles.deckCard, styles.cardWhite]}>
        <View style={styles.lineGroup}>
          <View style={[styles.line, { width: 160 }]} />
          <View style={[styles.line, { width: 184 }]} />
          <View style={[styles.line, { width: 132 }]} />
        </View>
        <Flourish />
      </View>
    </View>
  );
}

const CARD_WIDTH = 240;
const CARD_HEIGHT = 200;
const STACK_WIDTH = 296;
const STACK_HEIGHT = 244;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.cream,
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
  stackWrap: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stack: {
    width: STACK_WIDTH,
    height: STACK_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckCard: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 18,
    borderWidth: 0.4,
    borderColor: colors.border.card,
    ...shadows.cardButton,
  },
  cardYellow: {
    backgroundColor: colors.card.waitWhat,
    transform: [{ translateX: -16 }, { translateY: 22 }, { rotate: '-7deg' }],
  },
  cardRed: {
    backgroundColor: colors.card.digDeep,
    transform: [{ translateX: 16 }, { translateY: 16 }, { rotate: '5deg' }],
  },
  cardGreen: {
    backgroundColor: colors.card.justVibing,
    transform: [{ translateX: -8 }, { translateY: -10 }, { rotate: '-3deg' }],
  },
  cardWhite: {
    backgroundColor: colors.card.bgWhite,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 32,
  },
  lineGroup: {
    alignItems: 'center',
    gap: 26,
  },
  line: {
    height: 1.7,
    backgroundColor: colors.icon.primary,
    opacity: 0.9,
    borderRadius: 2,
  },
  copy: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  subheading: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
  cta: {
    width: '100%',
    maxWidth: 300,
  },
});
