import React from 'react';
import { useBiomeTheme } from '@/context/BiomeThemeContext';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import BiomeTextureOverlay from './BiomeTextureOverlay';

interface BiomeThemeBannerProps {
  showDescription?: boolean;
  className?: string;
}

/**
 * A banner component that showcases the current biome theme
 * Can be used on home or project pages to add Minecraft flavor
 */
export default function BiomeThemeBanner({ 
  showDescription = true,
  className = ''
}: BiomeThemeBannerProps) {
  const { currentTheme } = useBiomeTheme();
  
  return (
    <div className={`w-full overflow-hidden relative ${className}`}>
      <Card 
        className="p-4 border-none relative overflow-hidden" 
        style={{
          background: currentTheme.colors.backgroundGradient,
          color: currentTheme.colors.text,
          minHeight: '120px',
        }}
      >
        {/* Texture overlay specific to this banner */}
        <BiomeTextureOverlay opacity={0.15} isFixed={false} />
        
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center">
            <Sparkles 
              className="h-5 w-5 mr-2" 
              style={{ color: currentTheme.colors.accent }}
            />
            <h3 className="font-minecraft text-lg md:text-xl tracking-wide">
              {currentTheme.name} Biome
            </h3>
          </div>
          
          {showDescription && (
            <p 
              className="mt-2 text-sm opacity-80"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
            >
              {currentTheme.description}
            </p>
          )}
          
          <div className="mt-auto pt-2 flex flex-wrap gap-2">
            {/* Color swatches for the theme */}
            <div 
              className="w-6 h-6 rounded-sm" 
              title="Primary Color"
              style={{ backgroundColor: currentTheme.colors.primary }}
            />
            <div 
              className="w-6 h-6 rounded-sm" 
              title="Secondary Color"
              style={{ backgroundColor: currentTheme.colors.secondary }}
            />
            <div 
              className="w-6 h-6 rounded-sm" 
              title="Accent Color"
              style={{ backgroundColor: currentTheme.colors.accent }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}