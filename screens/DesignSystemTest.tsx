import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '../src/components/Button';
import { Body, Heading, Label } from '../src/components/typography';
import { colors, shadows, typography } from '../src/theme';

// Cast the deeply-nested color tokens to a generic shape so we can walk
// every group with Object.entries without fighting the literal types.
const colorGroups = colors as unknown as Record<string, Record<string, string>>;

// Format a token's fontFamily + fontSize into a human-readable string like
// "Lora SemiBold 28" or "DM Sans Medium 12". The fontFamily strings in
// theme.ts use the Expo Google Fonts naming scheme (e.g. "Lora_600SemiBold",
// "DMSans_400Regular"), so we split on "_", strip the leading numeric weight
// code, and re-space the family portion (DMSans → DM Sans, Lora → Lora).
function describeStyle(style: { fontFamily?: string; fontSize?: number }): string {
  const family = style.fontFamily ?? '';
  const size = style.fontSize ?? 0;

  const [rawFamily = '', rawWeight = ''] = family.split('_');
  const weightName = rawWeight.replace(/^\d+/, '');
  const familyName = rawFamily.replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');

  return [familyName, weightName, size].filter(Boolean).join(' ');
}

export default function DesignSystemTest() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      {/* Section 1 — Typography */}
      <View style={styles.section}>
        <Heading variant="bold">Section 1 — Typography</Heading>

        <Heading>Heading default — {describeStyle(typography.heading)}</Heading>
        <Heading variant="bold">
          Heading bold — {describeStyle(typography.headingBold)}
        </Heading>
        <Heading variant="app-title">
          Heading app-title — {describeStyle(typography.appTitle)}
        </Heading>

        <Body>Body default — {describeStyle(typography.body)}</Body>
        <Body variant="subheading">
          Body subheading — {describeStyle(typography.subheading)}
        </Body>

        <Label>Label — {describeStyle(typography.inputName)}</Label>
      </View>

      {/* Section 2 — Colors */}
      <View style={styles.section}>
        <Heading variant="bold">Section 2 — Colors</Heading>

        {Object.entries(colorGroups).map(([groupName, tokens]) => (
          <View key={groupName} style={styles.colorGroup}>
            <Body variant="subheading">{groupName}</Body>
            <View style={styles.swatchRow}>
              {Object.entries(tokens).map(([tokenName, hex]) => (
                <View key={tokenName} style={styles.swatchCell}>
                  <View
                    style={[
                      styles.swatch,
                      { backgroundColor: hex },
                    ]}
                  />
                  <Label style={styles.swatchLabel}>
                    colors.{groupName}.{tokenName}
                  </Label>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Section 3 — Shadow */}
      <View style={styles.section}>
        <Heading variant="bold">Section 3 — Shadow</Heading>

        <View style={styles.shadowStage}>
          <View style={[styles.shadowCard, shadows.cardButton]} />
        </View>
        <Label>shadows.cardButton</Label>
      </View>

      {/* Section 4 — Button */}
      <View style={styles.section}>
        <Heading variant="bold">Section 4 — Button</Heading>

        <Button label="Start" onPress={() => Alert.alert('Pressed')} />
        <Label>Active — fires Alert on tap</Label>

        <Button label="Continue" disabled onPress={() => {}} />
        <Label>Disabled — opacity 0.4, press is a no-op</Label>

        <Button
          label="Start a new conversation now"
          onPress={() => Alert.alert('Pressed')}
        />
        <Label>Long label — stress-tests horizontal padding</Label>

        <Button
          label="Stretched"
          onPress={() => Alert.alert('Pressed')}
          style={{ width: '100%' }}
        />
        <Label>Stretched — caller-stretch escape hatch via style prop</Label>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background.cream,
  },
  content: {
    padding: 24,
    gap: 32,
  },
  section: {
    gap: 12,
  },
  colorGroup: {
    gap: 8,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  swatchCell: {
    width: 110,
    gap: 4,
  },
  swatch: {
    width: 60,
    height: 60,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#0000001a',
  },
  swatchLabel: {
    fontSize: 10,
  },
  shadowStage: {
    paddingVertical: 16,
    alignItems: 'flex-start',
  },
  shadowCard: {
    width: 200,
    height: 100,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
});
