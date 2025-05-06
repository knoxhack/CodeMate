import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Code, FileCode, Terminal, Settings, Book } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import CreateProjectModal from "@/components/CreateProjectModal";
import BiomeThemeBanner from "@/components/BiomeThemeBanner";
import BiomeThemeSelector from "@/components/BiomeThemeSelector";
import { useBiomeTheme } from "@/context/BiomeThemeContext";

export default function Home() {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  interface Project {
    id: number;
    name: string;
    description: string;
    modVersion: string;
    minecraftVersion: string;
    neoForgeVersion: string;
    userId: number;
  }

  const {
    data: projects = [] as Project[],
    isLoading: projectsLoading,
    error: projectsError,
  } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleCreateProject = () => {
    setCreateModalOpen(true);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { randomizeTheme } = useBiomeTheme();

  return (
    <div className="min-h-screen">
      <header className="bg-gray-800/80 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="h-6 w-6 text-emerald-500" />
            <h1 className="text-xl font-bold text-white">CodeMate</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Welcome, {user.username}!</span>
            <BiomeThemeSelector variant="full" />
            <Button variant="outline" onClick={handleLogout} disabled={logoutMutation.isPending}>
              {logoutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Biome Theme Banner */}
        <div className="mb-8">
          <BiomeThemeBanner className="mb-6" />
          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 font-minecraft">Minecraft Mod Development</h1>
              <p className="text-gray-300">Build professional NeoForge 1.21.5 mods with Claude AI assistance</p>
            </div>
            <Button
              onClick={randomizeTheme}
              className="mt-4 md:mt-0 biome-themed-button"
            >
              Change Biome Theme
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="biome-themed-card overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              <BiomeTextureOverlay isFixed={false} opacity={0.2} />
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center font-minecraft">
                <FileCode className="h-5 w-5 mr-2" style={{ color: 'var(--theme-accent)' }} />
                New Project
              </CardTitle>
              <CardDescription className="text-gray-200">Create a new mod project from scratch</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-sm text-gray-300">
                Start with a clean NeoForge 1.21.5 MDK setup with all the necessary boilerplate code pre-configured.
              </p>
            </CardContent>
            <CardFooter className="relative z-10">
              <Button 
                className="w-full biome-themed-button" 
                onClick={handleCreateProject}
              >
                Create Project
              </Button>
            </CardFooter>
          </Card>

          <Card className="biome-themed-card overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              <BiomeTextureOverlay isFixed={false} opacity={0.2} />
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center font-minecraft">
                <Terminal className="h-5 w-5 mr-2" style={{ color: 'var(--theme-accent)' }} />
                Import Existing
              </CardTitle>
              <CardDescription className="text-gray-200">Import an existing mod for upgrading</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-sm text-gray-300">
                Import existing mods to upgrade to NeoForge 1.21.5 with AI-assisted migration.
              </p>
            </CardContent>
            <CardFooter className="relative z-10">
              <Button 
                variant="outline" 
                className="w-full border-gray-600 hover:bg-gray-700/50" 
                onClick={handleCreateProject}
              >
                Import Project
              </Button>
            </CardFooter>
          </Card>

          <Card className="biome-themed-card overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              <BiomeTextureOverlay isFixed={false} opacity={0.2} />
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center font-minecraft">
                <Book className="h-5 w-5 mr-2" style={{ color: 'var(--theme-accent)' }} />
                Guides
              </CardTitle>
              <CardDescription className="text-gray-200">Explore tutorials and documentation</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-sm text-gray-300">
                Browse tutorials, migration guides, and documentation for NeoForge 1.21.5.
              </p>
            </CardContent>
            <CardFooter className="relative z-10">
              <Button 
                variant="outline" 
                className="w-full border-gray-600 hover:bg-gray-700/50"
              >
                View Guides
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Your Projects</h2>
          
          {projectsLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : projectsError ? (
            <div className="bg-red-900/20 border border-red-700 p-6 rounded-lg text-center">
              <h3 className="text-lg font-medium text-red-300 mb-2">Error loading projects</h3>
              <p className="text-gray-400 mb-4">There was a problem loading your projects.</p>
              <Button variant="outline">Retry</Button>
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="biome-themed-card overflow-hidden relative">
                  <div className="absolute inset-0 opacity-10">
                    <BiomeTextureOverlay isFixed={false} opacity={0.2} />
                  </div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="font-minecraft">{project.name}</CardTitle>
                    <CardDescription className="text-gray-200">
                      {project.minecraftVersion} • {project.modVersion}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-sm text-gray-300 line-clamp-3">
                      {project.description}
                    </p>
                  </CardContent>
                  <CardFooter className="relative z-10">
                    <Button 
                      className="w-full biome-themed-button" 
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      Open Project
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="biome-themed-card p-8 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <BiomeTextureOverlay isFixed={false} opacity={0.2} />
              </div>
              <Settings className="h-10 w-10 mb-4 relative z-10" style={{ color: 'var(--theme-accent)' }} />
              <h3 className="text-xl font-medium text-gray-100 mb-2 font-minecraft relative z-10">No Projects Yet</h3>
              <p className="text-gray-300 text-center max-w-md mb-6 relative z-10">
                Create your first mod project to get started with NeoForge 1.21.5 development.
              </p>
              <Button 
                onClick={handleCreateProject} 
                className="relative z-10 biome-themed-button"
              >
                Create Your First Project
              </Button>
            </div>
          )}
        </div>
      </main>

      <CreateProjectModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </div>
  );
}