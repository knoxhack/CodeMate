import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClaudeAssistant from "@/components/ClaudeAssistant";
import CodeEditor from "@/components/CodeEditor";
import { Loader2, LogOut, Book, Code, MessageSquare, Plus } from "lucide-react";

export default function Home() {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("editor");
  const [projectId, setProjectId] = useState<number>(1); // In a real app, this would be set based on user selection

  // Simple sample file for demonstration
  const sampleJavaFile = `package com.example.mymod;

import net.minecraft.core.component.DataComponents;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.component.Weapon;
import net.neoforged.neoforge.registries.DeferredRegister;
import net.neoforged.neoforge.registries.RegistryObject;

public class CustomSword {
    // Create a DeferredRegister for items
    public static final DeferredRegister<Item> ITEMS = 
        DeferredRegister.create(BuiltInRegistries.ITEM, "yourmodid");
    
    // Register your custom sword
    public static final RegistryObject<Item> MY_SWORD = ITEMS.register("my_sword", 
        () -> new Item(new Item.Properties()
            .sword()
            .durability(1000)
            .add(DataComponents.WEAPON, new Weapon(2, 3f))
        ));
}`;

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center">
          <Book className="h-6 w-6 text-amber-500 mr-2" />
          <h1 className="text-xl font-bold">CodeMate</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-300">
            Welcome, <span className="font-semibold">{user?.username}</span>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </>
            )}
          </Button>
        </div>
      </header>
      
      {/* Mobile tabs (for small screens) */}
      <div className="md:hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start bg-gray-800 p-0">
            <TabsTrigger value="editor" className="data-[state=active]:bg-gray-700">
              <Code className="h-4 w-4 mr-2" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="assistant" className="data-[state=active]:bg-gray-700">
              <MessageSquare className="h-4 w-4 mr-2" />
              Assistant
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="flex-1 m-0 p-0 h-[calc(100vh-120px)]">
            <CodeEditor 
              initialContent={sampleJavaFile}
              language="java"
              fileId="sample-file"
              fileName="CustomSword.java"
              onSave={(content) => console.log("Saving file:", content)}
            />
          </TabsContent>
          
          <TabsContent value="assistant" className="flex-1 m-0 p-0 h-[calc(100vh-120px)]">
            <ClaudeAssistant 
              projectId={projectId} 
              onCodeSuggestion={(suggestion) => {
                // Dispatch code suggestion event
                const event = new CustomEvent("codeSuggestion", {
                  detail: suggestion
                });
                window.dispatchEvent(event);
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Desktop layout (for medium screens and above) */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <div className="w-2/3 h-full">
          <CodeEditor 
            initialContent={sampleJavaFile}
            language="java"
            fileId="sample-file"
            fileName="CustomSword.java"
            onSave={(content) => console.log("Saving file:", content)}
          />
        </div>
        
        <div className="w-1/3 h-full">
          <ClaudeAssistant 
            projectId={projectId}
            onCodeSuggestion={(suggestion) => {
              // Dispatch code suggestion event
              const event = new CustomEvent("codeSuggestion", {
                detail: suggestion
              });
              window.dispatchEvent(event);
            }}
          />
        </div>
      </div>
      
      {/* Footer */}
      <footer className="p-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400 text-center">
        CodeMate - AI-Powered Minecraft Mod Development Platform for NeoForge 1.21.5
      </footer>
    </div>
  );
}