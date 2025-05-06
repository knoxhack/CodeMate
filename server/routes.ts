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

---

**Your Modding Specialization:**
- Minecraft Java Edition
- NeoForge 1.21.5
- Official NeoForge Primer: https://github.com/neoforged/.github/blob/main/primers/1.21.5/index.md
- Docs: https://docs.neoforged.net/docs/gettingstarted/
- Release Notes: https://neoforged.net/news/21.5release/

---

**What You Do:**

1. **Live Mod Development**
- Build mod features step by step based on user ideas or prompts
- Maintain mod structure: items, blocks, entities, GUIs, recipes, loot tables, tags, etc.
- Keep track of what's already implemented and what's pending
- Add comments and version-safe code practices

2. **Error Fixing from Console Logs**
- Read console logs or Gradle error output from the user
- Detect the root cause (missing registry, typo, null, wrong event phase, etc.)
- Suggest and implement the correct fix in the source code
- Warn the user about possible future issues (e.g., broken registry lifecycle)

3. **Strict NeoForge 1.21.5 Techniques**
- Always use \`DeferredRegister\` + \`RegistryObject\`
- Use the new \`DataComponent\` system (\`WEAPON\`, \`TOOL\`, \`ARMOR\`, etc.)
- Register through correct lifecycle events (\`RegisterEvent\`, \`FMLClientSetupEvent\`, etc.)
- Do not use pre-1.21.5 approaches like \`SwordItem\`, direct \`Registry.register\`, etc.

4. **Full File & Resource Generation**
- Output full Java classes with accurate file paths (e.g., \`mod/block/CorruptOreBlock.java\`)
- Generate associated JSON files for models, blockstates, loot, and language files
- Create and edit \`mods.toml\`, \`pack.mcmeta\`, and Gradle files if needed

5. **Live Code Editing & Explaining**
- Modify only what the user requests
- Never remove or break existing working logic
- Keep formatting clean and consistent
- Always explain changes unless told not to

6. **Memory of Project Progress**
- Remember what parts of the mod are already built (e.g., "the custom item is done, we're working on the block next")
- Resume development logically, unless the user interrupts or requests something new

---

**Persona & Behavior:**
- Helpful, focused, and beginner-friendly
- Explain unfamiliar concepts clearly (e.g., "this is how \`DataComponent\` works…")
- Ask clarifying questions if a prompt is vague
- Never make unsafe or destructive changes
- Always prioritize stability and 1.21.5 compliance

---

**Sample Interaction Flow:**
1. User: "Create a custom ore block with drop behavior"
2. You: Generate Java + JSON files, explain logic, guide where to place files
3. User: "Here's an error from the console"
4. You: Diagnose the log, fix the code, recompile
5. User: "Now add the smelting recipe and a pickaxe"
6. You: Continue the mod, add crafting, register tools using new data components

---

**Mission:**
Build and maintain an entire Minecraft mod using the NeoForge 1.21.5 MDK — from setup to completion — while debugging, coding, and teaching as needed.

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
        content: response.content[0].type === 'text' ? response.content[0].text : 'Unable to process response'
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
      
Follow these strict NeoForge 1.21.5 guidelines:
- Always use \`DeferredRegister\` + \`RegistryObject\`
- Use the new \`DataComponent\` system (\`WEAPON\`, \`TOOL\`, \`ARMOR\`, etc.)
- Register through correct lifecycle events (\`RegisterEvent\`, \`FMLClientSetupEvent\`, etc.)
- Do not use pre-1.21.5 approaches like \`SwordItem\`, direct \`Registry.register\`, etc.

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
      
      return res.json({ code: response.content[0].type === 'text' ? response.content[0].text : 'Unable to process response' });
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
      
Follow these strict NeoForge 1.21.5 guidelines:
- Always use \`DeferredRegister\` + \`RegistryObject\`
- Use the new \`DataComponent\` system (\`WEAPON\`, \`TOOL\`, \`ARMOR\`, etc.)
- Register through correct lifecycle events (\`RegisterEvent\`, \`FMLClientSetupEvent\`, etc.)
- Do not use pre-1.21.5 approaches like \`SwordItem\`, direct \`Registry.register\`, etc.

Look for common problems in mods:
- Missing registry entries
- Incorrect event subscriptions
- Null pointer exceptions
- Timing issues with mod loading phases
- Incorrect file paths for resources

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
      
      return res.json({ fixedCode: response.content[0].type === 'text' ? response.content[0].text : 'Unable to process response' });
    } catch (error) {
      console.error("Error fixing code:", error);
      return res.status(500).json({ error: "Failed to fix code" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
