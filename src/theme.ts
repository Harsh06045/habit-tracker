/** Visual tokens matching the warm porcelain, vibrant orange, and espresso reference design. */
export const theme = {
  colors: {
    primary: '#FF6B00', // Vibrant Warm Orange
    primaryPressed: '#E65F00',
    primarySoft: '#FFF0E6',
    primaryDark: '#2D2320', // Deep Espresso Brown
    secondaryDark: '#372823', // Dark Chocolate Button
    background: '#FAF8F5', // Warm Porcelain / Canvas
    surface: '#FFFFFF',
    surfaceMuted: '#F5F3EF',
    cardPeach: '#FFE8DB', // Reminder Card Peach
    cardPeachSoft: '#FFF2EA',
    avatarRing: '#FFD3CD',
    border: '#EFECE7',
    borderLight: '#F3EFEB',
    text: '#221C18', // Deep Espresso Heading Text
    textMuted: '#847D77', // Soft Warm Gray
    textFaint: '#B8B2AC',
    success: '#25B76B',
    successSoft: '#E7F8EF',
    warning: '#F59E0B',
    danger: '#E85757',
    white: '#FFFFFF',
    black: '#1A1412',
    overlay: 'rgba(34, 28, 24, 0.45)',

    // Reference Chart & Routine Colors
    chart: {
      espresso: '#3E2F2B',
      terracotta: '#A84D1E',
      olive: '#7B9A36',
      pink: '#DF68C6',
      blue: '#4F8CFF',
    },

    // Routine Icon Backgrounds
    routineIcons: {
      milk: '#F6ECE2',
      meditation: '#EAF6EE',
      stretch: '#EBF0FA',
      exercise: '#FCEBF0',
      learning: '#EFF5FF',
    },
  },
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },
  radius: {
    sm: 10,
    md: 16,
    lg: 22,
    xl: 28,
    pill: 999,
  },
  typography: {
    display: { fontSize: 32, lineHeight: 38, fontWeight: '800' as const },
    h1: { fontSize: 26, lineHeight: 32, fontWeight: '800' as const },
    h2: { fontSize: 20, lineHeight: 26, fontWeight: '700' as const },
    h3: { fontSize: 17, lineHeight: 22, fontWeight: '700' as const },
    body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
    bodyMedium: { fontSize: 15, lineHeight: 22, fontWeight: '600' as const },
    caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
    overline: { fontSize: 11, lineHeight: 14, fontWeight: '700' as const, letterSpacing: 0.8 },
  },
  shadows: {
    card: {
      shadowColor: '#2D2320',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 2,
    },
    floating: {
      shadowColor: '#2D2320',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
      elevation: 6,
    },
  },
  layout: {
    screenHorizontal: 20,
    tabBarHeight: 70,
    touchTarget: 48,
  },
} as const;

export const colors = theme.colors;
