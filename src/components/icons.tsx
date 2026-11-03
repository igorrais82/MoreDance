import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconProps = {
  size?: number;
  color: string;
};

/**
 * Один набор иконок на всё приложение.
 *
 * Раньше вкладки рисовались глифами из разных шрифтов (✦ ♪ ★ ◆), поэтому
 * иконки отличались толщиной и оптическим размером. Теперь это заливные SVG
 * 24×24 с одинаковой геометрией.
 */
export function StarIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4 6.2 20.5l1.1-6.5-4.7-4.6 6.5-.9L12 2.6z"
        fill={color}
      />
    </Svg>
  );
}

export function NoteIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M20 3.4v10.3a3.6 3.6 0 1 1-2.2-3.3V7.1l-7.2 1.6v8a3.6 3.6 0 1 1-2.2-3.3V6.2l11.6-2.8z"
        fill={color}
      />
    </Svg>
  );
}

export function GroupIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="8.4" cy="7.2" r="3.3" fill={color} />
      <Circle cx="16.9" cy="8.6" r="2.6" fill={color} opacity={0.72} />
      <Path
        d="M8.4 11.6c3.4 0 6.1 1.8 6.1 4v4H2.3v-4c0-2.2 2.7-4 6.1-4z"
        fill={color}
      />
      <Path
        d="M16.9 12.4c2.6 0 4.8 1.4 4.8 3.2v4h-4.4v-4c0-1.2-.4-2.3-1.2-3.1.3-.1.5-.1.8-.1z"
        fill={color}
        opacity={0.72}
      />
    </Svg>
  );
}

export function ChartIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="3" y="12.4" width="4.2" height="8.6" rx="1.4" fill={color} />
      <Rect x="9.9" y="7.4" width="4.2" height="13.6" rx="1.4" fill={color} />
      <Rect x="16.8" y="3" width="4.2" height="18" rx="1.4" fill={color} />
    </Svg>
  );
}

export function PersonIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 3.2a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8Zm0 10.4c4.5 0 8.2 2.3 8.2 5.2v2H3.8v-2c0-2.9 3.7-5.2 8.2-5.2Z"
        fill={color}
      />
    </Svg>
  );
}

export function GearIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M13.9 2.2h-3.8l-.6 2.4a7.4 7.4 0 0 0-1.7 1l-2.3-.8-1.9 3.3 1.8 1.7a7.5 7.5 0 0 0 0 2l-1.8 1.7 1.9 3.3 2.3-.8c.5.4 1.1.7 1.7 1l.6 2.4h3.8l.6-2.4c.6-.3 1.2-.6 1.7-1l2.3.8 1.9-3.3-1.8-1.7a7.5 7.5 0 0 0 0-2l1.8-1.7-1.9-3.3-2.3.8a7.4 7.4 0 0 0-1.7-1l-.6-2.4Z"
        fill={color}
      />
      <Circle cx="12" cy="11.4" r="2.8" fill="#14082A" />
    </Svg>
  );
}

export function PlayIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M8.4 5.2 19 12 8.4 18.8V5.2Z" fill={color} />
    </Svg>
  );
}

export function PauseIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="6.4" y="5" width="3.9" height="14" rx="1.4" fill={color} />
      <Rect x="13.7" y="5" width="3.9" height="14" rx="1.4" fill={color} />
    </Svg>
  );
}

export function SoundIcon({
  size = 24,
  color,
  muted,
}: IconProps & { muted?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 9.4h3.4L12 5.4v13.2L7.4 14.6H4V9.4Z"
        fill={color}
      />
      {muted ? (
        <Path
          d="M15.6 9.4l4.4 5.2M20 9.4l-4.4 5.2"
          stroke={color}
          strokeWidth="1.9"
          strokeLinecap="round"
        />
      ) : (
        <Path
          d="M15.2 9.1a4.2 4.2 0 0 1 0 5.8M17.8 6.7a7.6 7.6 0 0 1 0 10.6"
          stroke={color}
          strokeWidth="1.9"
          strokeLinecap="round"
        />
      )}
    </Svg>
  );
}

export function CameraIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4.4 6.6h8.9a2 2 0 0 1 2 2v6.8a2 2 0 0 1-2 2H4.4a2 2 0 0 1-2-2V8.6a2 2 0 0 1 2-2Z"
        fill={color}
      />
      <Path
        d="M16.6 11.2l3.6-2.2c.5-.3 1.1.1 1.1.6v4.8c0 .5-.6.9-1.1.6l-3.6-2.2v-1.6Z"
        fill={color}
      />
    </Svg>
  );
}

export function CheckIcon({ size = 24, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M9.6 17.1 4.5 12l1.7-1.7 3.4 3.4 8.2-8.2L19.5 7 9.6 17.1Z"
        fill={color}
      />
    </Svg>
  );
}

export function ChevronIcon({
  size = 24,
  color,
  up,
}: IconProps & { up?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={up ? 'M6.2 14.7 12 8.9l5.8 5.8-1.6 1.6L12 12.1l-4.2 4.2-1.6-1.6Z' : 'M6.2 9.3 12 15.1l5.8-5.8-1.6-1.6L12 11.9 7.8 7.7 6.2 9.3Z'}
        fill={color}
      />
    </Svg>
  );
}

export type TabIconName = 'star' | 'note' | 'group' | 'chart' | 'person';

const TAB_GLYPHS = {
  star: StarIcon,
  note: NoteIcon,
  group: GroupIcon,
  chart: ChartIcon,
  person: PersonIcon,
} as const;

/** Иконка вкладки по имени из TAB_META — одна точка правды для панели и настроек. */
export function TabGlyph({
  icon,
  size = 20,
  color,
}: {
  icon: TabIconName;
  size?: number;
  color: string;
}) {
  const Icon = TAB_GLYPHS[icon];
  return <Icon size={size} color={color} />;
}
