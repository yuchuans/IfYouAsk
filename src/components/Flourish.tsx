import { G, Path, Svg } from 'react-native-svg';

import { colors } from '../theme';

// Decorative flourish from the Welcome screen white card in Figma
// (file IfYouAsk, container node 267:99 with vectors 267:101–267:103).
// Three vectors compose a single horizontal mark — a soft wave, a small
// circle, and a mirrored wave. Path data is taken verbatim from the Figma
// SVG export; each vector is positioned with a <G transform="translate(...)">
// so the paths keep their original viewBox coordinates and can be swapped
// out individually later if the design changes.
//
// The default 92×16 size matches the Figma container exactly. Pass `width`
// and `height` to scale uniformly (the SVG viewBox handles the math).

type FlourishProps = {
  width?: number;
  height?: number;
  color?: string;
};

export function Flourish({
  width = 92,
  height = 16,
  color = colors.icon.primary,
}: FlourishProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 92 16" fill="none">
      <G transform="translate(3.10, 5.25)">
        <Path
          d="M0.750036 2.74988C5.85956 0.0832175 10.9691 0.0832175 16.0787 2.74988C21.1882 5.41659 26.2977 5.41659 31.4072 2.74988"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          fill="none"
        />
      </G>
      <G transform="translate(40.51, 5.5)">
        <Path
          d="M2.39514 4.99995C3.71787 4.99995 4.79018 3.88071 4.79018 2.49999C4.79018 1.11929 3.71787 0 2.39514 0C1.07231 0 0 1.11929 0 2.49999C0 3.88071 1.07231 4.99995 2.39514 4.99995Z"
          fill={color}
        />
      </G>
      <G transform="translate(50.54, 5.25)">
        <Path
          d="M0.750036 2.74988C5.85954 5.41659 10.9691 5.41659 16.0786 2.74988C21.1881 0.0832175 26.2977 0.0832175 31.4073 2.74988"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          fill="none"
        />
      </G>
    </Svg>
  );
}
