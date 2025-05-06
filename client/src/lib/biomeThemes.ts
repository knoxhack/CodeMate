// Minecraft-inspired biome themes

export interface BiomeTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
    backgroundGradient: string; // CSS gradient string
  };
  textureUrl?: string; // Optional texture overlay
}

// Collection of Minecraft biome themes
export const biomeThemes: BiomeTheme[] = [
  {
    id: 'plains',
    name: 'Plains',
    description: 'Grassy plains with gentle hills and scattered oak trees',
    colors: {
      primary: '#7fb238',      // Light green
      secondary: '#55813b',    // Medium green
      accent: '#f9d354',       // Sunflower yellow
      text: '#ffffff',         // White text
      background: '#8ab971',   // Grass green
      backgroundGradient: 'linear-gradient(to bottom, #7ab317 0%, #8ab971 100%)',
    }
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Dense forest with oak and birch trees',
    colors: {
      primary: '#2d5d34',      // Dark green
      secondary: '#1a331e',    // Deeper green
      accent: '#a0522d',       // Brown (tree trunks)
      text: '#ffffff',         // White text
      background: '#2d4a12',   // Forest green
      backgroundGradient: 'linear-gradient(to bottom, #1e3b0a 0%, #2d5d34 100%)',
    }
  },
  {
    id: 'desert',
    name: 'Desert',
    description: 'Vast sand dunes with occasional cacti and dead bushes',
    colors: {
      primary: '#e9d9a8',      // Sand color
      secondary: '#d6b75e',    // Darker sand
      accent: '#a67c52',       // Desert brown
      text: '#1e1e1e',         // Dark text
      background: '#f9d49c',   // Light sand
      backgroundGradient: 'linear-gradient(to bottom, #f9d49c 0%, #e9be7c 100%)',
    }
  },
  {
    id: 'mountains',
    name: 'Mountains',
    description: 'Towering mountain peaks with snow caps and rugged terrain',
    colors: {
      primary: '#686e70',      // Stone gray
      secondary: '#3b4042',    // Dark gray
      accent: '#e3e3e3',       // Snow white
      text: '#ffffff',         // White text
      background: '#525a5b',   // Mountain gray
      backgroundGradient: 'linear-gradient(to bottom, #3b4042, #686e70 60%, #a9c7d9 95%, #e3e3e3)'
    }
  },
  {
    id: 'nether',
    name: 'Nether',
    description: 'Hellish dimension with lava, netherrack, and dangerous terrain',
    colors: {
      primary: '#7d2b20',      // Netherrack red
      secondary: '#4c150f',    // Dark red
      accent: '#e38e0d',       // Glowstone amber
      text: '#ffffff',         // White text
      background: '#341d18',   // Dark nether
      backgroundGradient: 'linear-gradient(to bottom, #341d18 0%, #7d2b20 70%, #c64122 100%)',
    }
  },
  {
    id: 'end',
    name: 'The End',
    description: 'Mysterious void dimension with end stone and chorus plants',
    colors: {
      primary: '#e0d7a8',      // End stone
      secondary: '#2c1e54',    // End purple
      accent: '#bd7bc7',       // Chorus purple
      text: '#ffffff',         // White text
      background: '#1a1424',   // End darkness
      backgroundGradient: 'linear-gradient(to bottom, #0d0a14 0%, #1a1424 50%, #2c1e54 100%)',
    }
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep underwater world with diverse marine life',
    colors: {
      primary: '#276387',      // Ocean blue
      secondary: '#1a3d5c',    // Deep blue
      accent: '#43b5e5',       // Light blue
      text: '#ffffff',         // White text
      background: '#0a4a7a',   // Deep ocean
      backgroundGradient: 'linear-gradient(to bottom, #0a4a7a 0%, #276387 100%)',
    }
  },
  {
    id: 'jungle',
    name: 'Jungle',
    description: 'Dense, lush rainforest with exotic plants and animals',
    colors: {
      primary: '#2b8031',      // Jungle green
      secondary: '#145725',    // Dark green
      accent: '#ffc83d',       // Jungle flower yellow
      text: '#ffffff',         // White text
      background: '#175f27',   // Jungle background
      backgroundGradient: 'linear-gradient(to bottom, #0e3b18 0%, #175f27 60%, #2b8031 100%)',
    }
  }
];

// Get a random biome theme
export function getRandomBiomeTheme(): BiomeTheme {
  const randomIndex = Math.floor(Math.random() * biomeThemes.length);
  return biomeThemes[randomIndex];
}

// Get a specific biome theme by ID
export function getBiomeThemeById(id: string): BiomeTheme | undefined {
  return biomeThemes.find(theme => theme.id === id);
}

// Default theme (used if specific theme not found)
export const defaultTheme = biomeThemes[0]; // Plains