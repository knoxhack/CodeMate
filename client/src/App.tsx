import { Toaster } from "@/components/ui/toaster";
import { useTheme } from "./hooks/use-theme";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

// Pages
import Home from "./pages/home";
import AuthPage from "./pages/auth-page";
import NotFound from "./pages/not-found";
import ProjectEditor from "./pages/project-editor";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Home} />
      <ProtectedRoute path="/projects/:id" component={ProjectEditor} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { theme } = useTheme();
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className={theme}>
          <Toaster />
          <Router />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
