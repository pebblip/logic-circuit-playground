import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveConfig {
  mobile: number;
  tablet: number;
}

const DEFAULT_CONFIG: ResponsiveConfig = {
  mobile: 640, // max-width for mobile
  tablet: 1024, // max-width for tablet
};

export function useResponsive(config: ResponsiveConfig = DEFAULT_CONFIG) {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'desktop';

    const width = window.innerWidth;
    if (width <= config.mobile) return 'mobile';
    if (width <= config.tablet) return 'tablet';
    return 'desktop';
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let newBreakpoint: Breakpoint;

      if (width <= config.mobile) {
        newBreakpoint = 'mobile';
      } else if (width <= config.tablet) {
        newBreakpoint = 'tablet';
      } else {
        newBreakpoint = 'desktop';
      }

      if (newBreakpoint !== breakpoint) {
        setBreakpoint(newBreakpoint);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint, config.mobile, config.tablet]);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isMobileOrTablet: breakpoint === 'mobile' || breakpoint === 'tablet',
  };
}

// 便利なヘルパー関数
export function useIsMobile() {
  const { isMobile } = useResponsive();
  return isMobile;
}

export function useIsDesktop() {
  const { isDesktop } = useResponsive();
  return isDesktop;
}
