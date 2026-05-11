import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import { colors, typography } from '../theme';

export type IconButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  /** Glyph or short string shown to the left of the label. Usually a Unicode icon like ←, ✕, →. */
  icon: string;
  /** Optional text label. Omit for icon-only buttons (e.g. an ✕ close button). */
  label?: string;
  /** Outer style override (typically used for positioning — absolute placement, margin, etc.). */
  style?: StyleProp<ViewStyle>;
};

/**
 * A text-only Pressable with an icon glyph and optional label, wired together
 * with consistent spacing (8px gap), typography (buttonSecondary), and color
 * (text.primary). Mirrors Button's mechanical state derivation: pressed dims
 * to 0.85 opacity, disabled dims to 0.4.
 *
 * For the filled CTA pattern, use Button instead.
 */
export function IconButton({ icon, label, style, ...rest }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      {...rest}
      style={({ pressed }) => [
        styles.base,
        pressed && !rest.disabled && styles.pressed,
        rest.disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={styles.text}>{icon}</Text>
      {label && <Text style={styles.text}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    ...typography.buttonSecondary,
    color: colors.text.primary,
  },
});
