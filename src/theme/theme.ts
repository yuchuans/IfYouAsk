/**
 * Theme tokens for "If You Ask".
 *
 * Source of truth: the Figma file "IfYouAsk" (file key sreZ5yoUi2tG64FgiDNw2b),
 * pulled via the Figma MCP. Names are converted from Figma's slash convention
 * (e.g., "background / cream") to nested camelCase keys (e.g., colors.background.cream).
 *
 * Notes:
 *  - 8-digit hex values include alpha (e.g., #3d3530b2 ≈ 70% alpha on #3d3530).
 *  - Some Figma typography styles report `lineHeight: 100`, which represents
 *    100% (auto). Those entries store lineHeight equal to fontSize and are flagged
 *    with an inline comment.
 *  - Figma's `shadow / card-button` is two stacked drop shadows. React Native
 *    cannot stack shadows on a single View, so the values below approximate
 *    them with one shadow. iOS uses shadow* props; Android uses elevation.
 */

export const colors = {
  background: {
    cream: '#fbf6f0',
  },
  accent: {
    primary: '#e8ad85',
    primary60: '#e8ad8599',
    secondary: '#f9eadf',
    tertiary: '#0000000a',
  },
  text: {
    primary: '#3d3530',
    secondary: '#3d3530b2',
    tertiary: '#3d353080',
    digDeepCard: '#c9efff',
    justVibingCard: '#ffc9dc',
  },
  icon: {
    primary: '#3d3530',
  },
  border: {
    card: '#3d303014',
    input: '#3d3530',
  },
  card: {
    bgWhite: '#ffffff',
    digDeep: '#b5654a',
    digDeepLighter: '#c97558',
    digDeepDarker: '#a0573e',
    justVibing: '#4a8e58',
    justVibingLighter: '#5fa66b',
    justVibingDeeper: '#3f7d4c',
    waitWhat: '#deba3a',
    waitWhatLighter: '#eed163',
    waitWhatDeeper: '#c9a42f',
  },
} as const;

export const typography = {
  appTitle: {
    fontFamily: 'Lora_500Medium',
    fontSize: 32,
    fontWeight: '500',
    lineHeight: 40,
    letterSpacing: -0.4,
  },
  heading: {
    fontFamily: 'Lora_600SemiBold',
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36,
    letterSpacing: 0,
  },
  headingBold: {
    fontFamily: 'Lora_700Bold',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    letterSpacing: 0,
  },
  subheading: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 20,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: -0.4,
  },
  body: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0,
  },
  question: {
    fontFamily: 'Lora_400Regular',
    fontSize: 26,
    fontWeight: '400',
    lineHeight: 34,
    letterSpacing: 0,
  },
  playerName: {
    fontFamily: 'Lora_500Medium',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0,
  },
  playerInitialSmall: {
    fontFamily: 'Lora_500Medium',
    fontSize: 36,
    fontWeight: '500',
    lineHeight: 60,
    letterSpacing: 0,
  },
  playerInitialLarge: {
    fontFamily: 'Lora_500Medium',
    fontSize: 48,
    fontWeight: '500',
    lineHeight: 72,
    letterSpacing: 0,
  },
  buttonPrimary: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0,
  },
  buttonSecondary: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 27,
    letterSpacing: 0,
  },
  sharesAsks: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 16.5,
    letterSpacing: 0,
  },
  inputDefault: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 20, // Figma reported 100% (auto) → equal to fontSize
    letterSpacing: 0,
  },
  inputName: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    letterSpacing: 0.55,
  },
  round: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 12, // Figma reported 100% (auto) → equal to fontSize
    letterSpacing: 1.6,
  },
} as const;

export const shadows = {
  // Approximation of 2-layer Figma shadow; see ShadowView component if upgrading to multi-layer.
  cardButton: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.24,
    shadowRadius: 3,
    elevation: 2,
  },
} as const;
