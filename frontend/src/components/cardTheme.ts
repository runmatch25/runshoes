/**
 * Centralized card theme configuration
 * Modify these values to change the appearance of all cards across the application
 */

export const cardTheme = {
  // Card container styles
  padding: '1.5rem 1.25rem',
  borderRadius: 18,
  background: 'var(--card)',
  border: '1px solid var(--border)',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 8px rgba(0, 0, 0, 0.05)',
  
  // Glare effect
  glareOpacity: 0.45,
  glareColor: 'rgba(255, 255, 255, 0.3)',
  
  // Tilt effect
  tiltMaxAngle: 10,
  tiltScale: 1.02,
  tiltPerspective: 1000,
  tiltTransition: 'transform 0.1s ease-out',
  
  // Typography
  titleFontSize: 18,
  titleFontWeight: 700,
  titleColor: 'var(--card-foreground)',
  
  bodyColor: 'var(--muted-foreground)',
  bodyFontSize: 14,
  
  // Spacing
  contentGap: 6,
} as const;



