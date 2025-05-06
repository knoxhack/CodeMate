import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Redirect } from "wouter";
import { z } from "zod";
import { Loader2 } from "lucide-react";

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
  
  return (
    <div className="flex min-h-screen bg-gradient-to-r from-gray-900 to-gray-800">
      {/* Left column: Form */}
      <div className="flex items-center justify-center w-full lg:w-1/2 p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">CodeMate</h1>
            <p className="text-gray-400 mt-2">AI-Powered Minecraft Modding Platform</p>
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
              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <form onSubmit={onLoginSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">Username</Label>
                      <Input 
                        id="login-username"
                        type="text"
                        placeholder="Enter your username"
                        value={loginValues.username}
                        onChange={(e) => setLoginValues({...loginValues, username: e.target.value})}
                        className={loginErrors.username ? "border-red-500" : ""}
                      />
                      {loginErrors.username && (
                        <p className="text-red-500 text-sm">{loginErrors.username}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input 
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginValues.password}
                        onChange={(e) => setLoginValues({...loginValues, password: e.target.value})}
                        className={loginErrors.password ? "border-red-500" : ""}
                      />
                      {loginErrors.password && (
                        <p className="text-red-500 text-sm">{loginErrors.password}</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Login
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>
                    Register to start building Minecraft mods
                  </CardDescription>
                </CardHeader>
                <form onSubmit={onRegisterSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input 
                        id="register-username"
                        type="text"
                        placeholder="Choose a username"
                        value={registerValues.username}
                        onChange={(e) => setRegisterValues({...registerValues, username: e.target.value})}
                        className={registerErrors.username ? "border-red-500" : ""}
                      />
                      {registerErrors.username && (
                        <p className="text-red-500 text-sm">{registerErrors.username}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input 
                        id="register-password"
                        type="password"
                        placeholder="Choose a password"
                        value={registerValues.password}
                        onChange={(e) => setRegisterValues({...registerValues, password: e.target.value})}
                        className={registerErrors.password ? "border-red-500" : ""}
                      />
                      {registerErrors.password && (
                        <p className="text-red-500 text-sm">{registerErrors.password}</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
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
      <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center" style={{ 
        backgroundColor: '#1e293b',
        backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url("data:image/svg+xml,%3Csvg width="1200" height="1000" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cpath fill="%23334155" d="M0 0h20v20H0z"/%3E%3Cpath d="M20 0h20v20H20zM0 20h20v20H0z" fill="%232a3548"/%3E%3Cpath fill="%23334155" d="M20 20h20v20H20z"/%3E%3C/g%3E%3C/svg%3E")'
      }}>
        <div className="flex flex-col items-center justify-center h-full w-full p-12">
          <div className="max-w-lg text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Next-Gen Minecraft Modding Platform
            </h2>
            <p className="text-xl text-gray-300 mb-8">
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