import { Text, TextProps } from 'react-native';

import { colors, typography } from '../../theme';

// theme.ts has several label-tier styles (inputName, sharesAsks, round, etc.).
// `inputName` is the most generic "label above another element" style, so it's
// the default here. Pass `style` to override per-call when a different
// label-tier style is needed.
export type LabelProps = TextProps;

export function Label({ style, ...rest }: LabelProps) {
  return (
    <Text
      {...rest}
      style={[typography.inputName, { color: colors.text.primary }, style]}
    />
  );
}
