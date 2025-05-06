import { useState } from "react";
import { z } from "zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Define our mod templates
const modTemplates = [
  {
    id: "empty",
    name: "Empty Project",
    description: "Start with a clean slate",
    features: ["Basic mod structure", "Empty mod class", "gradle build files"],
  },
  {
    id: "basic-item",
    name: "Basic Item Mod",
    description: "Start with simple item implementation",
    features: ["Complete item registration", "Textures", "JSON models", "Language files"],
  },
  {
    id: "basic-block",
    name: "Basic Block Mod",
    description: "Start with simple block implementation",
    features: ["Complete block registration", "Textures", "JSON models", "Language files"],
  },
  {
    id: "complete",
    name: "Complete Example",
    description: "Full-featured mod example",
    features: ["Items", "Blocks", "Creative Tab", "Recipes", "World Generation"],
  },
];

const projectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  modVersion: z.string().min(1, "Mod version is required"),
  minecraftVersion: z.string().default("1.21.5"),
  neoForgeVersion: z.string().default("1.21.5-"),
  template: z.string().default("empty"),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateProjectModal({
  open,
  onOpenChange,
}: CreateProjectModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Add a step state for the wizard
  const [step, setStep] = useState<"info" | "template">("info");
  
  const [values, setValues] = useState<ProjectFormValues>({
    name: "",
    description: "",
    modVersion: "1.0.0",
    minecraftVersion: "1.21.5",
    neoForgeVersion: "1.21.5-21.5.0.0",
    template: "empty",
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormValues, string>>>({});
  
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: ProjectFormValues) => {
      const res = await apiRequest("POST", "/api/projects", projectData);
      const project = await res.json();
      
      // If using a template other than empty, we'll need to create template files
      if (projectData.template !== "empty") {
        // In a real implementation, we would call another endpoint to add template files
        // For now, we'll just log this action
        console.log(`Creating template files for ${projectData.template} template`);
      }
      
      return project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project created",
        description: `Project "${values.name}" has been created successfully.`,
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create project",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const resetForm = () => {
    setValues({
      name: "",
      description: "",
      modVersion: "1.0.0",
      minecraftVersion: "1.21.5",
      neoForgeVersion: "1.21.5-21.5.0.0",
      template: "empty",
    });
    setErrors({});
    setStep("info");
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when typing
    if (errors[name as keyof ProjectFormValues]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };
  
  const handleTemplateChange = (templateId: string) => {
    setValues((prev) => ({
      ...prev,
      template: templateId,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If on first step, validate and move to template selection
    if (step === "info") {
      try {
        // Only validate the fields on this step
        const { name, description, modVersion } = values;
        z.object({
          name: projectSchema.shape.name,
          description: projectSchema.shape.description,
          modVersion: projectSchema.shape.modVersion,
        }).parse({ name, description, modVersion });
        
        setErrors({});
        setStep("template");
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldErrors: Partial<Record<keyof ProjectFormValues, string>> = {};
          error.errors.forEach((err) => {
            const field = err.path[0] as keyof ProjectFormValues;
            fieldErrors[field] = err.message;
          });
          setErrors(fieldErrors);
        }
      }
      return;
    }
    
    // If on template step, do final validation and submit
    try {
      projectSchema.parse(values);
      setErrors({});
      createProjectMutation.mutate(values);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof ProjectFormValues, string>> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof ProjectFormValues;
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
      }
    }
  };
  
  const goBack = () => {
    setStep("info");
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Mod Project</DialogTitle>
            <DialogDescription>
              {step === "info" 
                ? "Configure your NeoForge mod project settings" 
                : "Choose a template for your mod"}
            </DialogDescription>
          </DialogHeader>
          
          {/* Project Info Step */}
          {step === "info" && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="My Awesome Mod"
                  value={values.name}
                  onChange={handleChange}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe what your mod does..."
                  value={values.description}
                  onChange={handleChange}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modVersion">Mod Version</Label>
                  <Input
                    id="modVersion"
                    name="modVersion"
                    placeholder="1.0.0"
                    value={values.modVersion}
                    onChange={handleChange}
                    className={errors.modVersion ? "border-red-500" : ""}
                  />
                  {errors.modVersion && (
                    <p className="text-red-500 text-sm">{errors.modVersion}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minecraftVersion">Minecraft Version</Label>
                  <Input
                    id="minecraftVersion"
                    name="minecraftVersion"
                    value={values.minecraftVersion}
                    onChange={handleChange}
                    disabled
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="neoForgeVersion">NeoForge Version</Label>
                <Input
                  id="neoForgeVersion"
                  name="neoForgeVersion"
                  value={values.neoForgeVersion}
                  onChange={handleChange}
                  disabled
                />
              </div>
            </div>
          )}
          
          {/* Template Selection Step */}
          {step === "template" && (
            <div className="py-4 space-y-4 max-h-[50vh] overflow-y-auto">
              <div className="grid grid-cols-1 gap-4">
                {modTemplates.map((template) => (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer transition-all ${
                      values.template === template.id 
                        ? "border-blue-600 shadow-md" 
                        : "hover:border-gray-400"
                    }`}
                    onClick={() => handleTemplateChange(template.id)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center justify-between">
                        {template.name}
                        {values.template === template.id && (
                          <Badge className="ml-2 bg-blue-600">Selected</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="text-xs text-gray-500 space-y-1">
                        {template.features.map((feature, i) => (
                          <li key={i} className="flex items-center">
                            <div className="mr-2 h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200 mt-4">
                <AlertCircle className="h-4 w-4" />
                <p>All templates are optimized for NeoForge 1.21.5 using the new Data Component system</p>
              </div>
            </div>
          )}
          
          <DialogFooter className="sticky bottom-0 pt-2 bg-background border-t mt-4">
            {step === "template" ? (
              <>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={goBack}
                >
                  Back
                </Button>
                <Button 
                  type="submit"
                  disabled={createProjectMutation.isPending}
                >
                  {createProjectMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Create Project
                </Button>
              </>
            ) : (
              <>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                >
                  Next
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}