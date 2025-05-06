import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Redirect } from "wouter";
import { z } from "zod";
import { Loader2, Sparkles, Blocks } from "lucide-react";
import { useBiomeTheme } from "@/context/BiomeThemeContext";
import BiomeTextureOverlay from "@/components/BiomeTextureOverlay";
import BiomeThemeSelector from "@/components/BiomeThemeSelector";

// Form validation schemas
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  
  // Form states
  const [loginValues, setLoginValues] = useState<LoginFormValues>({
    username: "",
    password: "",
  });
  
  const [registerValues, setRegisterValues] = useState<RegisterFormValues>({
    username: "",
    password: "",
  });
  
  // Form errors
  const [loginErrors, setLoginErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>({});
  const [registerErrors, setRegisterErrors] = useState<Partial<Record<keyof RegisterFormValues, string>>>({});
  
  const onLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      loginSchema.parse(loginValues);
      setLoginErrors({});
      loginMutation.mutate(loginValues);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof LoginFormValues, string>> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof LoginFormValues;
          fieldErrors[field] = err.message;
        });
        setLoginErrors(fieldErrors);
      }
    }
  };
  
  const onRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      registerSchema.parse(registerValues);
      setRegisterErrors({});
      registerMutation.mutate(registerValues);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof RegisterFormValues, string>> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof RegisterFormValues;
          fieldErrors[field] = err.message;
        });
        setRegisterErrors(fieldErrors);
      }
    }
  };
  
  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }
  
  const { currentTheme, randomizeTheme } = useBiomeTheme();

  return (
    <div className="flex min-h-screen relative">
      <BiomeTextureOverlay isFixed={true} opacity={0.1} />
      
      {/* Left column: Form */}
      <div className="flex items-center justify-center w-full lg:w-1/2 p-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white font-minecraft">CodeMate</h1>
            <p className="text-gray-300 mt-2">AI-Powered Minecraft Modding Platform</p>
            <div className="mt-4 flex justify-center">
              <BiomeThemeSelector variant="iconAndLabel" showRandomize={true} />
            </div>
          </div>
          
          <Tabs 
            defaultValue="login" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card className="biome-themed-card overflow-hidden relative">
                <div className="absolute inset-0 opacity-10">
                  <BiomeTextureOverlay isFixed={false} opacity={0.2} />
                </div>
                <CardHeader className="relative z-10">
                  <CardTitle className="font-minecraft">Login</CardTitle>
                  <CardDescription className="text-gray-200">
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <form onSubmit={onLoginSubmit}>
                  <CardContent className="space-y-4 relative z-10">
                    <div className="space-y-2">
                      <Label htmlFor="login-username" className="text-gray-200">Username</Label>
                      <Input 
                        id="login-username"
                        type="text"
                        placeholder="Enter your username"
                        value={loginValues.username}
                        onChange={(e) => setLoginValues({...loginValues, username: e.target.value})}
                        className={`bg-gray-800/50 border-gray-700 text-white ${loginErrors.username ? "border-red-500" : ""}`}
                      />
                      {loginErrors.username && (
                        <p className="text-red-500 text-sm">{loginErrors.username}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-gray-200">Password</Label>
                      <Input 
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginValues.password}
                        onChange={(e) => setLoginValues({...loginValues, password: e.target.value})}
                        className={`bg-gray-800/50 border-gray-700 text-white ${loginErrors.password ? "border-red-500" : ""}`}
                      />
                      {loginErrors.password && (
                        <p className="text-red-500 text-sm">{loginErrors.password}</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="relative z-10">
                    <Button 
                      type="submit" 
                      className="w-full biome-themed-button"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      Login
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card className="biome-themed-card overflow-hidden relative">
                <div className="absolute inset-0 opacity-10">
                  <BiomeTextureOverlay isFixed={false} opacity={0.2} />
                </div>
                <CardHeader className="relative z-10">
                  <CardTitle className="font-minecraft">Create an account</CardTitle>
                  <CardDescription className="text-gray-200">
                    Register to start building Minecraft mods
                  </CardDescription>
                </CardHeader>
                <form onSubmit={onRegisterSubmit}>
                  <CardContent className="space-y-4 relative z-10">
                    <div className="space-y-2">
                      <Label htmlFor="register-username" className="text-gray-200">Username</Label>
                      <Input 
                        id="register-username"
                        type="text"
                        placeholder="Choose a username"
                        value={registerValues.username}
                        onChange={(e) => setRegisterValues({...registerValues, username: e.target.value})}
                        className={`bg-gray-800/50 border-gray-700 text-white ${registerErrors.username ? "border-red-500" : ""}`}
                      />
                      {registerErrors.username && (
                        <p className="text-red-500 text-sm">{registerErrors.username}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-gray-200">Password</Label>
                      <Input 
                        id="register-password"
                        type="password"
                        placeholder="Choose a password"
                        value={registerValues.password}
                        onChange={(e) => setRegisterValues({...registerValues, password: e.target.value})}
                        className={`bg-gray-800/50 border-gray-700 text-white ${registerErrors.password ? "border-red-500" : ""}`}
                      />
                      {registerErrors.password && (
                        <p className="text-red-500 text-sm">{registerErrors.password}</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="relative z-10">
                    <Button 
                      type="submit" 
                      className="w-full biome-themed-button"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Blocks className="h-4 w-4 mr-2" />
                      )}
                      Create Account
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Right column: Hero section */}
      <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative overflow-hidden" style={{ 
        backgroundColor: '#1e293b',
      }}>
        <BiomeTextureOverlay isFixed={true} opacity={0.25} />
        <div className="relative z-10 flex flex-col items-center justify-center h-full w-full p-12">
          <div className="max-w-lg text-center">
            <h2 className="text-4xl font-bold text-white mb-4 font-minecraft">
              Minecraft Modding Platform
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Build and deploy professional Minecraft mods with AI assistance, code suggestions, and debugging support.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="mt-1 bg-emerald-500 p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">AI-Powered Development</h3>
                  <p className="text-gray-400">Leverage Claude Code to generate mod features, fix errors, and get detailed explanations.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="mt-1 bg-emerald-500 p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">NeoForge 1.21.5 Compatible</h3>
                  <p className="text-gray-400">Modern modding practices with the latest NeoForge APIs and data component system.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="mt-1 bg-emerald-500 p-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Collaborative Environment</h3>
                  <p className="text-gray-400">Manage multiple projects, share code, and work together on mod development.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}