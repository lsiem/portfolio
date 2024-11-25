// Utility functions for checking color contrast ratios according to WCAG guidelines

/**
 * Converts a hex color to RGB values
 * @param hex - Hex color code (e.g., "#ffffff")
 * @returns RGB values as {r, g, b}
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Calculates relative luminance of a color
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Relative luminance value
 */
const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculates contrast ratio between two colors
 * @param color1 - First hex color
 * @param color2 - Second hex color
 * @returns Contrast ratio (1-21)
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 1;

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Checks if a color combination meets WCAG contrast requirements
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @param isLargeText - Whether the text is large (>= 18pt or bold >= 14pt)
 * @returns Whether the contrast meets WCAG requirements
 */
export const meetsContrastRequirements = (
  foreground: string,
  background: string,
  isLargeText: boolean = false,
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
};

/**
 * Suggests a darker or lighter variant of a color to meet contrast requirements
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @param isLargeText - Whether the text is large
 * @returns Adjusted foreground color that meets contrast requirements
 */
export const suggestAccessibleColor = (
  foreground: string,
  background: string,
  isLargeText: boolean = false,
): string => {
  if (meetsContrastRequirements(foreground, background, isLargeText)) {
    return foreground;
  }

  const rgb = hexToRgb(foreground);
  if (!rgb) return foreground;

  // Try making the color darker or lighter until we meet requirements
  let { r, g, b } = rgb;
  const step = 5;
  const maxIterations = 50;

  for (let i = 0; i < maxIterations; i++) {
    // Try darker
    const darkerColor = `#${Math.max(0, r - step * i)
      .toString(16)
      .padStart(2, "0")}${Math.max(0, g - step * i)
      .toString(16)
      .padStart(2, "0")}${Math.max(0, b - step * i)
      .toString(16)
      .padStart(2, "0")}`;

    if (meetsContrastRequirements(darkerColor, background, isLargeText)) {
      return darkerColor;
    }

    // Try lighter
    const lighterColor = `#${Math.min(255, r + step * i)
      .toString(16)
      .padStart(2, "0")}${Math.min(255, g + step * i)
      .toString(16)
      .padStart(2, "0")}${Math.min(255, b + step * i)
      .toString(16)
      .padStart(2, "0")}`;

    if (meetsContrastRequirements(lighterColor, background, isLargeText)) {
      return lighterColor;
    }
  }

  return foreground;
};
