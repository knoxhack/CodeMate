import React from 'react';
import { useBiomeTheme } from '@/context/BiomeThemeContext';

interface BiomeTextureOverlayProps {
  opacity?: number;
  className?: string;
  isFixed?: boolean;
}

/**
 * Component to add a biome-specific texture overlay to the page
 * This adds visual texture to backgrounds based on the current theme
 */
export default function BiomeTextureOverlay({ 
  opacity = 0.05, 
  className = '',
  isFixed = true 
}: BiomeTextureOverlayProps) {
  const { currentTheme } = useBiomeTheme();
  
  return (
    <div 
      className={`texture-overlay pointer-events-none ${isFixed ? 'fixed inset-0' : 'absolute inset-0'} z-0 ${className}`}
      style={{ 
        opacity,
        backgroundRepeat: 'repeat',
        mixBlendMode: 'overlay',
      }}
      aria-hidden="true"
    />
  );
}