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

type ThemeColorKey = Parameters<typeof useThemeColor>[0] extends readonly (infer K)[] ? K : never;

/** useThemeColor, but every value is safe to hand to a native prop. */
export function useNativeThemeColor<const T extends readonly ThemeColorKey[]>(
  keys: T,
): { [K in keyof T]: string } {
  const colors = useThemeColor([...keys]);
  return colors.map((color) => toNativeColor(color)) as { [K in keyof T]: string };
}
