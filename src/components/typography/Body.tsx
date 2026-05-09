import { Text, TextProps } from 'react-native';

import { colors, typography } from '../../theme';

type BodyVariant = 'default' | 'subheading';

export type BodyProps = TextProps & {
  variant?: BodyVariant;
};

const styleByVariant = {
  default: typography.body,
  subheading: typography.subheading,
} as const;

export function Body({ variant = 'default', style, ...rest }: BodyProps) {
  return (
    <Text
      {...rest}
      style={[styleByVariant[variant], { color: colors.text.primary }, style]}
    />
  );
}
