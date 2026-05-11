import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackScreenProps } from '../navigation/types';
import { Button } from '../src/components/Button';
import { IconButton } from '../src/components/IconButton';
import { Body, Heading } from '../src/components/typography';
import { colors } from '../src/theme';

export default function Reflection({ navigation }: RootStackScreenProps<'Reflection'>) {
  // TODO: Phase 4 — pass via navigation params from QuestionCard.
  const roundsPlayed = 18;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <IconButton
          icon="←"
          label="Back"
          onPress={() => navigation.navigate('CategorySelection')}
          hitSlop={12}
          style={styles.backButton}
          accessibilityLabel="Back to category selection"
        />

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

        <View style={styles.bottomSection}>
          <View style={styles.copy}>
            <View style={styles.headingBlock}>
              <View style={styles.headingLine1}>
                <Heading variant="bold">You're </Heading>
                <View style={styles.highlightedWord}>
                  <View style={styles.highlightStripe} />
                  <Heading variant="bold">{roundsPlayed} steps</Heading>
                </View>
              </View>
              <Heading variant="bold">closer to each other</Heading>
            </View>
            <Body variant="subheading" style={styles.subheading}>
              One for each question you took{'\n'}the time to share and let in
            </Body>
          </View>
          <Button
            label="New Game"
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] })}
            style={styles.cta}
          />
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
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  imageFrame: {
    width: IMAGE_FRAME_WIDTH,
    height: IMAGE_FRAME_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 96,
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
  highlightedWord: {
    position: 'relative',
  },
  highlightStripe: {
    position: 'absolute',
    left: -2,
    right: -6,
    bottom: -4,
    height: 17,
    backgroundColor: colors.accent.primary60,
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
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1,
  },
  cta: {
    width: '100%',
    maxWidth: 300,
  },
});
