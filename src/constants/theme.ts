// ============================================================
// City Watcher - Theme & Color Palette
// Derived from UI mockup designs
// ============================================================

export const Colors = {
  // Primary
  primaryOrange: '#F5A623',
  primaryAmber: '#F7B731',

  // Emergency
  emergencyRed: '#E74C3C',
  emergencyRedDark: '#D32F2F',
  emergencyRedLight: '#FFEBEE',

  // Success / Submit
  successGreen: '#4CAF50',
  successGreenLight: '#8BC34A',
  submitGradientStart: '#8BC34A',
  submitGradientEnd: '#4CAF50',

  // Info
  infoBlue: '#5B9BD5',
  linkBlue: '#2196F3',

  // Backgrounds
  backgroundCream: '#FFF9F0',
  backgroundLight: '#FAFAFA',
  backgroundWhite: '#FFFFFF',

  // Cards
  cardWhite: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.08)',

  // Text
  textPrimary: '#333333',
  textSecondary: '#888888',
  textLight: '#BBBBBB',
  textWhite: '#FFFFFF',

  // Status badge colors
  statusReceived: '#F5A623',
  statusUnderReview: '#E91E63',
  statusDispatched: '#5B9BD5',
  statusInProgress: '#4CAF50',
  statusCompleted: '#4CAF50',
  statusEmergency: '#E74C3C',

  // Action card backgrounds
  sosCardBg: '#E8614D',
  reportCardBg: '#F5A623',
  liveReportsCardBg: '#6BAF6E',

  // Borders
  borderLight: '#E8E8E8',
  borderMedium: '#D0D0D0',

  // Social
  facebookBlue: '#4267B2',
  googleDark: '#333333',

  // Overlays
  overlayBlack: 'rgba(0, 0, 0, 0.5)',
  overlayWhite: 'rgba(255, 255, 255, 0.9)',
};

export const Fonts = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    xxxl: 28,
    hero: 34,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  round: 50,
  card: 16,
  button: 12,
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLarge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
};
