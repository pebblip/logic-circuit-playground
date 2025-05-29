export interface Theme {
  colors: {
    primary: Record<string, string>;
    secondary: Record<string, string>;
    success: Record<string, string>;
    warning: Record<string, string>;
    error: Record<string, string>;
    neutral: Record<string, string>;
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    surface: {
      primary: string;
      secondary: string;
      elevated: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      inverse: string;
    };
    semantic: {
      gateInput: string;
      gateOutput: string;
      wireActive: string;
      wireInactive: string;
      wireError: string;
      selection: string;
      hover: string;
    };
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadow: Record<string, string>;
  typography: {
    heading: Record<string, {
      fontSize: string;
      fontWeight: number;
      lineHeight: number;
      letterSpacing?: string;
    }>;
    body: Record<string, {
      fontSize: string;
      fontWeight: number;
      lineHeight: number;
    }>;
    ui: Record<string, {
      fontSize: string;
      fontWeight: number;
      lineHeight: number;
      letterSpacing?: string;
    }>;
  };
  animation: {
    duration: {
      instant: string;
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      linear: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
      spring: string;
    };
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
}