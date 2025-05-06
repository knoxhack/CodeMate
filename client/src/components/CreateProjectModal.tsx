import { useState } from "react";
import { z } from "zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
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

const projectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  modVersion: z.string().min(1, "Mod version is required"),
  minecraftVersion: z.string().default("1.21.5"),
  neoForgeVersion: z.string().default("1.21.5-"),
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
  
  const [values, setValues] = useState<ProjectFormValues>({
    name: "",
    description: "",
    modVersion: "1.0.0",
    minecraftVersion: "1.21.5",
    neoForgeVersion: "1.21.5-21.5.0.0",
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormValues, string>>>({});
  
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: ProjectFormValues) => {
      const res = await apiRequest("POST", "/api/projects", projectData);
      return await res.json();
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
    });
    setErrors({});
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Mod Project</DialogTitle>
            <DialogDescription>
              Configure your NeoForge mod project settings
            </DialogDescription>
          </DialogHeader>
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
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}