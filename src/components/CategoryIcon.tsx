import { Path, Svg } from 'react-native-svg';

import type { CategoryId } from '../data/questions';

// Category icons from Figma (file IfYouAsk, container nodes 267:58 Just Vibing,
// 267:68 Dig Deep, 267:78 Wait What). Path data exported verbatim from Figma's
// SVG output. Each icon ships as an 88×88 viewBox so callers can scale uniformly
// by passing `width` / `height`.
//
// Source SVGs also live at assets/categories/{just_vibing,dig_deep,wait_what}.svg
// for designer reference — these JSX renders are the runtime source of truth.

type CategoryIconProps = {
  name: CategoryId;
  width?: number;
  height?: number;
};

export function CategoryIcon({ name, width = 88, height = 88 }: CategoryIconProps) {
  switch (name) {
    case 'justVibing':
      return <JustVibingIcon width={width} height={height} />;
    case 'digDeep':
      return <DigDeepIcon width={width} height={height} />;
    case 'waitWhat':
      return <WaitWhatIcon width={width} height={height} />;
  }
}

type IconProps = { width: number; height: number };

function JustVibingIcon({ width, height }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 88 88" fill="none">
      <Path
        d="M10.2666 67.0669H77.7333"
        stroke="#FFC9DC"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path
        d="M44 67C52.8366 67 60 59.8366 60 51C60 42.1634 52.8366 35 44 35C35.1634 35 28 42.1634 28 51C28 59.8366 35.1634 67 44 67Z"
        fill="#FFC9DC"
        fillOpacity={0.2}
        stroke="#FFC9DC"
        strokeWidth={3}
      />
      <Path
        d="M75 18H65C63.8954 18 63 18.8954 63 20V30C63 31.1046 63.8954 32 65 32H75C76.1046 32 77 31.1046 77 30V20C77 18.8954 76.1046 18 75 18Z"
        stroke="#FFC9DC"
        strokeWidth={2}
      />
      <Path
        d="M19 31C21.2091 31 23 29.2091 23 27C23 24.7909 21.2091 23 19 23C16.7909 23 15 24.7909 15 27C15 29.2091 16.7909 31 19 31Z"
        fill="#FFE9F1"
      />
    </Svg>
  );
}

function DigDeepIcon({ width, height }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 88 88" fill="none">
      <Path
        d="M10 15H78"
        stroke="#C9EFFF"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path
        d="M29.5686 24.9412C28.8581 23.609 29.8235 22 31.3333 22H56.6667C58.1765 22 59.1419 23.609 58.4314 24.9412L45.7647 48.6912C45.0118 50.1029 42.9882 50.1029 42.2353 48.6912L29.5686 24.9412Z"
        fill="#C9EFFF"
        fillOpacity={0.18}
        stroke="#C9EFFF"
        strokeWidth={3}
      />
      <Path d="M44 50V72" stroke="#C9EFFF" strokeWidth={3} />
      <Path
        d="M44 78C46.2091 78 48 76.2091 48 74C48 71.7909 46.2091 70 44 70C41.7909 70 40 71.7909 40 74C40 76.2091 41.7909 78 44 78Z"
        fill="#C9EFFF"
      />
    </Svg>
  );
}

function WaitWhatIcon({ width, height }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 88 88" fill="none">
      <Path
        d="M44 68C58.3594 68 70 56.3594 70 42C70 27.6406 58.3594 16 44 16C29.6406 16 18 27.6406 18 42C18 56.3594 29.6406 68 44 68Z"
        fill="#6257A8"
        fillOpacity={0.18}
        stroke="#6257A8"
        strokeWidth={3}
      />
      <Path
        d="M35 53C41.0751 53 46 48.0751 46 42C46 35.9249 41.0751 31 35 31C28.9249 31 24 35.9249 24 42C24 48.0751 28.9249 53 35 53Z"
        fill="#6257A8"
        fillOpacity={0.3}
      />
      <Path
        d="M72 15H60C58.8954 15 58 15.8954 58 17V29C58 30.1046 58.8954 31 60 31H72C73.1046 31 74 30.1046 74 29V17C74 15.8954 73.1046 15 72 15Z"
        fill="#6257A8"
      />
      <Path
        d="M24 77C26.2091 77 28 75.2091 28 73C28 70.7909 26.2091 69 24 69C21.7909 69 20 70.7909 20 73C20 75.2091 21.7909 77 24 77Z"
        fill="#857CBB"
      />
    </Svg>
  );
}
