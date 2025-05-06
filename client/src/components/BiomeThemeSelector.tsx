import React from 'react';
import { useBiomeTheme } from '@/context/BiomeThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Paintbrush, Shuffle } from 'lucide-react';
import { BiomeTheme } from '@/lib/biomeThemes';

interface BiomeThemeSelectorProps {
  variant?: 'iconOnly' | 'iconAndLabel' | 'full';
  showRandomize?: boolean;
}

export default function BiomeThemeSelector({ 
  variant = 'iconAndLabel', 
  showRandomize = true 
}: BiomeThemeSelectorProps) {
  const { currentTheme, setTheme, randomizeTheme, availableThemes } = useBiomeTheme();
  
  // Function to create a small color swatch component
  const ThemeSwatch = ({ theme }: { theme: BiomeTheme }) => (
    <div 
      className="w-5 h-5 rounded-full border border-gray-700 mr-2" 
      style={{ 
        background: theme.colors.primary,
        boxShadow: `0 0 0 1px ${theme.colors.secondary}`,
      }}
    />
  );
  
  return (
    <div className="flex items-center">
      {/* Theme selector dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={`flex items-center gap-2 border-${currentTheme.id === 'desert' ? 'gray-400' : 'gray-700'}`}
            style={{
              borderColor: currentTheme.colors.secondary,
              backgroundColor: `${currentTheme.colors.primary}22` // With alpha transparency
            }}
          >
            <ThemeSwatch theme={currentTheme} />
            
            {variant !== 'iconOnly' && (
              <span className="text-sm">
                {variant === 'full' ? `${currentTheme.name} Biome` : 'Theme'}
              </span>
            )}
            
            <Paintbrush className="h-3.5 w-3.5 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56 biome-themed-card">
          {availableThemes.map((theme) => (
            <DropdownMenuItem
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              className={`flex items-center cursor-pointer ${currentTheme.id === theme.id ? 'bg-primary/20' : ''}`}
            >
              <ThemeSwatch theme={theme} />
              <span>{theme.name}</span>
              
              {/* Description in a smaller font */}
              {variant === 'full' && (
                <span className="text-[10px] text-gray-400 block w-full overflow-hidden text-ellipsis ml-1">
                  {theme.description}
                </span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Randomize button */}
      {showRandomize && (
        <Button
          variant="ghost"
          size="sm"
          onClick={randomizeTheme}
          className="ml-1 p-2 h-8 w-8"
          title="Randomize theme"
        >
          <Shuffle className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}