import { Text, TextProps } from 'react-native';

import { colors, typography } from '../../theme';

type HeadingVariant = 'default' | 'bold' | 'app-title';

export type HeadingProps = TextProps & {
  variant?: HeadingVariant;
};

const styleByVariant = {
  default: typography.heading,
  bold: typography.headingBold,
  'app-title': typography.appTitle,
} as const;

export function Heading({ variant = 'default', style, ...rest }: HeadingProps) {
  return (
    <Text
      {...rest}
      style={[styleByVariant[variant], { color: colors.text.primary }, style]}
    />
  );
}
