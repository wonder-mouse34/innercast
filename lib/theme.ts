import { useThemeColor } from 'heroui-native';

/**
 * Uniwind/HeroUI theme tokens are authored in oklch(). React Native's color
 * parser does not understand oklch(), so any color handed to a native prop
 * (navigation tints, status bar, icon `color`, gradients) has to be converted
 * to a plain hex string first.
 */

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function gammaEncode(channel: number): number {
  const c = clamp01(channel);
  return c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
}

function toHexPair(channel: number): string {
  return Math.round(clamp01(channel) * 255)
    .toString(16)
    .padStart(2, '0');
}

function parseNumber(raw: string): number {
  const trimmed = raw.trim();
  if (trimmed.endsWith('%')) {
    const percent = Number.parseFloat(trimmed.slice(0, -1));
    return Number.isFinite(percent) ? percent / 100 : 0;
  }
  const value = Number.parseFloat(trimmed);
  return Number.isFinite(value) ? value : 0;
}

function oklchToHex(input: string): string | null {
  const body = input.slice(input.indexOf('(') + 1, input.lastIndexOf(')'));
  const [coords, alphaPart] = body.split('/');
  const parts = coords.trim().split(/\s+/);
  if (parts.length < 3) return null;

  const lightness = parseNumber(parts[0]);
  const chroma = parseNumber(parts[1]);
  const hueDeg = parseNumber(parts[2].replace('deg', ''));
  const hue = (hueDeg * Math.PI) / 180;

  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);

  const lRoot = lightness + 0.3963377774 * a + 0.2158037573 * b;
  const mRoot = lightness - 0.1055613458 * a - 0.0638541728 * b;
  const sRoot = lightness - 0.0894841775 * a - 1.291485548 * b;

  const l = lRoot ** 3;
  const m = mRoot ** 3;
  const s = sRoot ** 3;

  const red = gammaEncode(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  const green = gammaEncode(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
  const blue = gammaEncode(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);

  const hex = `#${toHexPair(red)}${toHexPair(green)}${toHexPair(blue)}`;

  if (alphaPart !== undefined) {
    const alpha = parseNumber(alphaPart);
    return `${hex}${toHexPair(alpha)}`;
  }
  return hex;
}

/** Convert any theme color string into something React Native can parse. */
export function toNativeColor(input: string | undefined, fallback = '#000000'): string {
  if (!input) return fallback;
  const value = input.trim();
  if (value.startsWith('oklch')) return oklchToHex(value) ?? fallback;
  if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl')) return value;
  if (value.startsWith('color-mix') || value.startsWith('var(')) return fallback;
  return value;
}

/** Blend a hex color toward transparency, for gradients and scrims. */
export function withAlpha(hexColor: string, alpha: number): string {
  const base = toNativeColor(hexColor);
  if (!base.startsWith('#') || base.length < 7) return base;
  return `${base.slice(0, 7)}${toHexPair(alpha)}`;
}

function hexChannels(hexColor: string): [number, number, number] | null {
  const base = toNativeColor(hexColor);
  if (!base.startsWith('#') || base.length < 7) return null;
  return [
    Number.parseInt(base.slice(1, 3), 16),
    Number.parseInt(base.slice(3, 5), 16),
    Number.parseInt(base.slice(5, 7), 16),
  ];
}

/** Linear blend between two colors: amount 0 keeps `from`, 1 returns `to`. */
export function mixColors(from: string, to: string, amount: number): string {
  const a = hexChannels(from);
  const b = hexChannels(to);
  if (!a || !b) return toNativeColor(from);
  const t = clamp01(amount);
  const channel = (index: 0 | 1 | 2) => Math.round(a[index] + (b[index] - a[index]) * t);
  return `#${[0, 1, 2]
    .map((index) =>
      channel(index as 0 | 1 | 2)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

const TINT_PAPER = '#fbf8f3';
const TINT_INK = '#2a221a';

export type ShowTint = {
  /** Pale wash for the top-left of artwork/hero gradients. */
  from: string;
  /** Even paler wash for the bottom-right. */
  to: string;
  /** Deep version of the show's hue, readable on the wash. */
  ink: string;
  /** Hairline border that still hints at the show's hue. */
  border: string;
};

/**
 * The corpus stores each show as a dark base plus a vivid accent, which was
 * authored for a dark UI. On the light Scandinavian palette we keep the hue but
 * lift it into a pale paper wash and darken it for text, so artwork reads as a
 * tinted card rather than a dark block.
 */
export function showTint(palette: readonly [string, string] | readonly string[]): ShowTint {
  const hue = palette[1] ?? palette[0] ?? TINT_INK;
  return {
    from: mixColors(hue, TINT_PAPER, 0.8),
    to: mixColors(hue, TINT_PAPER, 0.93),
    ink: mixColors(hue, TINT_INK, 0.52),
    border: mixColors(hue, TINT_PAPER, 0.65),
  };
}

type ThemeColorKey = Parameters<typeof useThemeColor>[0] extends readonly (infer K)[] ? K : never;

/** useThemeColor, but every value is safe to hand to a native prop. */
export function useNativeThemeColor<const T extends readonly ThemeColorKey[]>(
  keys: T,
): { [K in keyof T]: string } {
  const colors = useThemeColor([...keys]);
  return colors.map((color) => toNativeColor(color)) as { [K in keyof T]: string };
}
