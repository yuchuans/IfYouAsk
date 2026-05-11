import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import { colors, shadows, typography } from '../theme';

type ButtonVariant = 'primary';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
};

// Darken a hex color by a 0–1 factor for the pressed state. Lives in the
// component, not in theme.ts, so derived state colors don't pollute tokens.
function darken(hex: string, factor: number): string {
  const h = hex.replace('#', '');
  const r = Math.round(parseInt(h.slice(0, 2), 16) * (1 - factor));
  const g = Math.round(parseInt(h.slice(2, 4), 16) * (1 - factor));
  const b = Math.round(parseInt(h.slice(4, 6), 16) * (1 - factor));
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const bgByVariant = {
  primary: colors.accent.primary,
} as const;

const pressedBgByVariant = {
  primary: darken(colors.accent.primary, 0.1),
} as const;

export function Button({
  label,
  variant = 'primary',
  style,
  ...rest
}: ButtonProps) {
  const bg = bgByVariant[variant];
  const pressedBg = pressedBgByVariant[variant];

  return (
    <Pressable
      accessibilityRole="button"
      {...rest}
      style={({ pressed }) => [
        styles.base,
        shadows.cardButton,
        { backgroundColor: pressed ? pressedBg : bg },
        rest.disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

// Padding and corner radius come from the Welcome screen "Button" frame in
// Figma (file IfYouAsk, node 267:105): a 300×56 frame containing 17/24px
// SemiBold text, which derives paddingVertical 16 and borderRadius 16.
// Horizontal padding isn't explicit in the design (the Figma button is
// fixed-width with centered text); 32 keeps short labels from looking
// cramped while letting callers stretch the button via the `style` prop.
const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.buttonPrimary,
    color: colors.text.primary,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});
