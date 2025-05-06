import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client with API key
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key', // Use environment variable in production
});

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const CLAUDE_MODEL = "claude-3-7-sonnet-20250219";

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat with Claude
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }
      
      // System prompt to set context for Claude
      const systemPrompt = `You are CodeMate — an advanced AI agent inside a live web platform for developing Minecraft mods using NeoForge MDK 1.21.5.
      
You are not just a code generator. You are a full development assistant that:
- Generates mod features from scratch
- Reads, explains, and fixes error logs
- Updates broken code to match 1.21.5 standards
- Keeps building feature-by-feature until the full mod is complete

**Your Modding Specialization:**
- Minecraft Java Edition
- NeoForge 1.21.5
- Always use \`DeferredRegister\` + \`RegistryObject\`
- Use the new \`DataComponent\` system (\`WEAPON\`, \`TOOL\`, \`ARMOR\`, etc.)
- Register through correct lifecycle events (\`RegisterEvent\`, \`FMLClientSetupEvent\`, etc.)

**What You Do:**
- Build mod features step by step based on user ideas or prompts
- Maintain mod structure: items, blocks, entities, GUIs, recipes, loot tables, tags, etc.
- Add comments and version-safe code practices

When generating code, please provide complete, well-formatted implementations.`;
      
      // Create Claude message request
      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        system: systemPrompt,
        max_tokens: 1024,
        messages: messages
      });
      
      // Extract and return Claude's response
      const assistantMessage = {
        role: 'assistant',
        content: response.content[0].text
      };
      
      return res.json({ message: assistantMessage });
    } catch (error) {
      console.error("Error processing chat:", error);
      return res.status(500).json({ error: "Failed to get response from Claude" });
    }
  });
  
  // Generate code with Claude
  app.post("/api/generate-code", async (req, res) => {
    try {
      const { prompt, language } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      
      const systemPrompt = `You are a code generation assistant specialized in Minecraft modding with NeoForge 1.21.5. 
      Generate complete, correct, and working code based on the provided prompt.
      Only output code without any explanation or markdown formatting.
      The programming language is ${language || 'Java'}.`;
      
      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        system: systemPrompt,
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });
      
      return res.json({ code: response.content[0].text });
    } catch (error) {
      console.error("Error generating code:", error);
      return res.status(500).json({ error: "Failed to generate code" });
    }
  });
  
  // Fix code errors with Claude
  app.post("/api/fix-error", async (req, res) => {
    try {
      const { code, errorMessage, language } = req.body;
      
      if (!code || !errorMessage) {
        return res.status(400).json({ error: "Code and error message are required" });
      }
      
      const systemPrompt = `You are a debugging assistant specialized in Minecraft modding with NeoForge 1.21.5.
      Fix the provided code based on the error message.
      Return only the complete fixed code without any explanation or markdown formatting.
      The programming language is ${language || 'Java'}.`;
      
      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        system: systemPrompt,
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: `Here's the code with an error:\n\n${code}\n\nError message:\n${errorMessage}\n\nPlease fix the code.`
          }
        ]
      });
      
      return res.json({ fixedCode: response.content[0].text });
    } catch (error) {
      console.error("Error fixing code:", error);
      return res.status(500).json({ error: "Failed to fix code" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
