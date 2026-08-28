import { createTheme, MantineColorsTuple } from '@mantine/core';

// Auspicious Royal Gold Palette
const royalGold: MantineColorsTuple = [
  '#fefce8',
  '#fef9c3',
  '#fef08a',
  '#fde047',
  '#facc15',
  '#eab308',
  '#ca8a04',
  '#a16207',
  '#854d0e',
  '#713f12',
];

// Imperial Crimson Palette
const imperialCrimson: MantineColorsTuple = [
  '#fff1f2',
  '#ffe4e6',
  '#fecdd3',
  '#fda4af',
  '#fb7185',
  '#f43f5e',
  '#e11d48',
  '#be123c',
  '#9f1239',
  '#881337',
];

// Deep Royal Burgundy / Maroon
const royalBurgundy: MantineColorsTuple = [
  '#fdf2f4',
  '#fbe8eb',
  '#f6ced6',
  '#eda6b6',
  '#e0758e',
  '#cf496c',
  '#b92c53',
  '#991e41',
  '#7f1d38',
  '#4a0e1e',
];

export const theme = createTheme({
  primaryColor: 'royalGold',
  primaryShade: { light: 6, dark: 5 },
  colors: {
    royalGold,
    imperialCrimson,
    royalBurgundy,
  },
  fontFamily: "var(--font-outfit), 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  headings: {
    fontFamily: "var(--font-cinzel), 'Cinzel', 'Georgia', serif",
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '2.5rem', lineHeight: '1.2' },
      h2: { fontSize: '2rem', lineHeight: '1.25' },
      h3: { fontSize: '1.5rem', lineHeight: '1.3' },
      h4: { fontSize: '1.25rem', lineHeight: '1.35' },
      h5: { fontSize: '1.1rem', lineHeight: '1.4' },
      h6: { fontSize: '1rem', lineHeight: '1.4' },
    },
  },
  defaultRadius: 'md',
  cursorType: 'pointer',
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          fontWeight: 600,
          letterSpacing: '0.02em',
          transition: 'all 0.25s ease',
        },
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        padding: 'lg',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'lg',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
});
