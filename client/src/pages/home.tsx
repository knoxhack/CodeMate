import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Code, FileCode, Terminal, Settings, Book } from "lucide-react";

export default function Home() {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 to-gray-800">
      <header className="bg-gray-800/80 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="h-6 w-6 text-emerald-500" />
            <h1 className="text-xl font-bold text-white">CodeMate</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Welcome, {user.username}!</span>
            <Button variant="outline" onClick={handleLogout} disabled={logoutMutation.isPending}>
              {logoutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Minecraft Mod Development Platform</h1>
          <p className="text-gray-400">Build professional mods with NeoForge 1.21.5 and Claude Code AI assistance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileCode className="h-5 w-5 mr-2 text-emerald-500" />
                New Project
              </CardTitle>
              <CardDescription>Create a new mod project from scratch</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Start with a clean NeoForge 1.21.5 MDK setup with all the necessary boilerplate code pre-configured.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Create Project</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Terminal className="h-5 w-5 mr-2 text-emerald-500" />
                Import Existing
              </CardTitle>
              <CardDescription>Import an existing mod for upgrading</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Import existing mods to upgrade to NeoForge 1.21.5 with AI-assisted migration.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Import Project</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Book className="h-5 w-5 mr-2 text-emerald-500" />
                Guides
              </CardTitle>
              <CardDescription>Explore tutorials and documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                Browse tutorials, migration guides, and documentation for NeoForge 1.21.5.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View Guides</Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Your Projects</h2>
          
          <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700 flex flex-col items-center justify-center">
            <Settings className="h-10 w-10 text-gray-500 mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">No projects yet</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              Create your first mod project to get started with NeoForge 1.21.5 development.
            </p>
            <Button>Create Your First Project</Button>
          </div>
        </div>
      </main>
    </div>
  );
}