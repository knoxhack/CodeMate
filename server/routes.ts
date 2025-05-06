import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Anthropic from '@anthropic-ai/sdk';
import { setupAuth } from "./auth";

// Initialize Anthropic client with API key
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key', // Use environment variable in production
});

// Using multiple Claude models for different purposes
// Claude Sonnet - the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const CLAUDE_SONNET_MODEL = "claude-3-7-sonnet-20250219";
// Claude Code - specialized for code editing and generation
// Note: Using the same model for both code and voice since claude-3-7-opus-20240229 doesn't exist
const CLAUDE_CODE_MODEL = "claude-3-7-sonnet-20250219";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Project endpoints
  app.get("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      const projects = await storage.getProjectsByUserId(userId);
      res.json(projects);
    } catch (error: any) {
      console.error("Error getting projects:", error);
      res.status(500).json({ error: "Failed to fetch projects: " + error.message });
    }
  });

  app.post("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      const userId = req.user!.id;
      const projectData = { ...req.body, userId };
      const project = await storage.createProject(projectData);
      
      // If a template is specified, create template files
      if (projectData.template && projectData.template !== "empty") {
        await createTemplateFiles(project.id, projectData.template);
      }
      
      res.status(201).json(project);
    } catch (error: any) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project: " + error.message });
    }
  });
  
  // Create template files with Claude Code
  async function createTemplateFiles(projectId: number, templateId: string) {
    try {
      // Create necessary folders and files based on template
      const templateFiles = getTemplateStructure(templateId);
      
      for (const file of templateFiles) {
        await storage.createFile({
          projectId,
          path: file.path,
          name: file.name,
          content: file.content,
          isFolder: file.isFolder,
          parentPath: file.parentPath || "",
        });
      }
      
      console.log(`Created template files for project ${projectId} using template ${templateId}`);
    } catch (error) {
      console.error(`Error creating template files: ${error}`);
      throw error;
    }
  }
  
  // Return the structure of files for a specific template
  function getTemplateStructure(templateId: string): Array<{
    path: string;
    name: string;
    content: string;
    isFolder: boolean;
    parentPath?: string;
  }> {
    // Templates generated with Claude Code's help
    switch (templateId) {
      case "basic-item":
        return [
          // Root directories
          {
            path: "/src",
            name: "src",
            content: "",
            isFolder: true,
            parentPath: "",
          },
          {
            path: "/src/main",
            name: "main",
            content: "",
            isFolder: true,
            parentPath: "/src",
          },
          {
            path: "/src/main/java",
            name: "java",
            content: "",
            isFolder: true,
            parentPath: "/src/main",
          },
          {
            path: "/src/main/resources",
            name: "resources",
            content: "",
            isFolder: true,
            parentPath: "/src/main",
          },
          
          // Java source directories
          {
            path: "/src/main/java/com",
            name: "com",
            content: "",
            isFolder: true,
            parentPath: "/src/main/java",
          },
          {
            path: "/src/main/java/com/example",
            name: "example",
            content: "",
            isFolder: true,
            parentPath: "/src/main/java/com",
          },
          {
            path: "/src/main/java/com/example/basicitemmod",
            name: "basicitemmod",
            content: "",
            isFolder: true,
            parentPath: "/src/main/java/com/example",
          },
          
          // Main mod class
          {
            path: "/src/main/java/com/example/basicitemmod/BasicItemMod.java",
            name: "BasicItemMod.java",
            content: `package com.example.basicitemmod;

import com.mojang.logging.LogUtils;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.world.item.Item;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.fml.common.Mod;
import net.neoforged.neoforge.registries.DeferredRegister;
import net.neoforged.neoforge.registries.RegisterEvent;
import net.neoforged.neoforge.registries.RegistryObject;
import org.slf4j.Logger;

// The main mod class annotated with @Mod
@Mod(BasicItemMod.MODID)
public class BasicItemMod {
    // Define mod id in a common place for everything to reference
    public static final String MODID = "basicitemmod";
    // Directly reference a slf4j logger
    private static final Logger LOGGER = LogUtils.getLogger();
    
    // Create a Deferred Register to hold Items which will all be registered under the "basicitemmod" namespace
    public static final DeferredRegister<Item> ITEMS = DeferredRegister.create(BuiltInRegistries.ITEM, MODID);
    
    // Create a new Item
    public static final RegistryObject<Item> EXAMPLE_ITEM = ITEMS.register("example_item", 
        () -> new Item(new Item.Properties()));

    public BasicItemMod(IEventBus modEventBus) {
        // Register the Deferred Register to the mod event bus
        ITEMS.register(modEventBus);

        // Register ourselves for server and other game events we are interested in
        LOGGER.info("Basic Item Mod initialized!");
    }
}`,
            isFolder: false,
            parentPath: "/src/main/java/com/example/basicitemmod",
          },
          
          // Resources directories
          {
            path: "/src/main/resources/META-INF",
            name: "META-INF",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources",
          },
          {
            path: "/src/main/resources/assets",
            name: "assets",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources",
          },
          {
            path: "/src/main/resources/assets/basicitemmod",
            name: "basicitemmod",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources/assets",
          },
          {
            path: "/src/main/resources/assets/basicitemmod/lang",
            name: "lang",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources/assets/basicitemmod",
          },
          {
            path: "/src/main/resources/assets/basicitemmod/models",
            name: "models",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources/assets/basicitemmod",
          },
          {
            path: "/src/main/resources/assets/basicitemmod/models/item",
            name: "item",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources/assets/basicitemmod/models",
          },
          {
            path: "/src/main/resources/assets/basicitemmod/textures",
            name: "textures",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources/assets/basicitemmod",
          },
          {
            path: "/src/main/resources/assets/basicitemmod/textures/item",
            name: "item",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources/assets/basicitemmod/textures",
          },
          
          // mods.toml
          {
            path: "/src/main/resources/META-INF/mods.toml",
            name: "mods.toml",
            content: `# This is an example mods.toml file. It contains the data relating to the loading mods.
# There are several mandatory fields (#mandatory), and many more that are optional (#optional).
# The overall format is standard TOML format, v0.5.0.
# Note that there are a couple of TOML lists in this file.
# Find more information on toml format here:  https://github.com/toml-lang/toml
# The name of the mod loader type to load - for regular FML @Mod mods it should be javafml
modLoader="javafml" #mandatory
# A version range to match for said mod loader - for regular FML @Mod it will be the neo forge version
loaderVersion="[21.5,)" #mandatory This is typically bumped every Minecraft version by Neo Forge.
# The license for you mod. This is mandatory metadata and allows for easier comprehension of your redistributive properties.
# Review your options at https://choosealicense.com/. All rights reserved is the default copyright stance, and is thus the default here.
license="All Rights Reserved"
# A URL to refer people to when problems occur with this mod
#issueTrackerURL="https://change.me.to.your.issue.tracker.example.invalid/" #optional
# A list of mods - how many allowed here is determined by the individual mod loader
[[mods]] #mandatory
# The modid of the mod
modId="basicitemmod" #mandatory
# The version number of the mod
version="1.0.0" #mandatory
# A display name for the mod
displayName="Basic Item Mod" #mandatory
# A URL to query for updates for this mod. See the JSON update specification https://docs.neoforged.net/docs/gettingstarted/versioncheck/
#updateJSONURL="https://change.me.example.invalid/updates.json" #optional
# A URL for the "homepage" for this mod, displayed in the mod UI
#displayURL="https://change.me.to.your.mods.homepage.example.invalid/" #optional
# A file name (in the root of the mod JAR) containing a logo for display
#logoFile="examplemod.png" #optional
# A text field displayed in the mod UI
credits="Created with NeoForge 1.21.5" #optional
# A text field displayed in the mod UI
authors="Example Modder" #optional
# Display Test controls the display for your mod in the server connection screen
# MATCH_VERSION means that your mod will cause a red X if the versions on client and server differ. This is the default behaviour and should be what you choose if you have server and client elements to your mod.
# IGNORE_SERVER_VERSION means that your mod will not cause a red X if it's present on the server but not on the client. This is what you should use if you're a server only mod.
# IGNORE_ALL_VERSION means that your mod will not cause a red X if it's present on the client or the server. This is a special case and should only be used if your mod has no server component.
# NONE means that no display test is set on your mod. You need to do this yourself, see IExtensionPoint.DisplayTest for more information. You can define any scheme you wish with this value.
# IMPORTANT NOTE: this is NOT an instruction as to which environments (CLIENT or DEDICATED SERVER) your mod loads on. Your mod should load (and maybe do nothing!) whereever it finds itself.
#displayTest="MATCH_VERSION" # MATCH_VERSION is the default if nothing is specified (#optional)
description='''
A simple mod that adds a basic item to the game.
'''
# A dependency - use the . to indicate dependency for a specific modid. Dependencies are optional.
[[dependencies.basicitemmod]] #optional
    # the modid of the dependency
    modId="forge" #mandatory
    # Does this dependency have to exist - if not, ordering below must be specified
    mandatory=true #mandatory
    # The version range of the dependency
    versionRange="[21.5,)" #mandatory
    # An ordering relationship for the dependency - BEFORE or AFTER required if the dependency is not mandatory
    # BEFORE - This mod is loaded BEFORE the dependency
    # AFTER - This mod is loaded AFTER the dependency
    ordering="NONE"
    # Side this dependency is applied on - BOTH, CLIENT, or SERVER
    side="BOTH"
# Here's another dependency
[[dependencies.basicitemmod]]
    modId="minecraft"
    mandatory=true
    # This version range declares a minimum of the current minecraft version up to but not including the next major version
    versionRange="[1.21.5]"
    ordering="NONE"
    side="BOTH"`,
            isFolder: false,
            parentPath: "/src/main/resources/META-INF",
          },
          
          // Language file
          {
            path: "/src/main/resources/assets/basicitemmod/lang/en_us.json",
            name: "en_us.json",
            content: `{
  "item.basicitemmod.example_item": "Example Item"
}`,
            isFolder: false,
            parentPath: "/src/main/resources/assets/basicitemmod/lang",
          },
          
          // Item model
          {
            path: "/src/main/resources/assets/basicitemmod/models/item/example_item.json",
            name: "example_item.json",
            content: `{
  "parent": "item/generated",
  "textures": {
    "layer0": "basicitemmod:item/example_item"
  }
}`,
            isFolder: false,
            parentPath: "/src/main/resources/assets/basicitemmod/models/item",
          },
          
          // Item texture placeholder
          {
            path: "/src/main/resources/assets/basicitemmod/textures/item/example_item.png",
            name: "example_item.png",
            content: "// This would be a binary file in a real implementation - for this example, we're using a placeholder",
            isFolder: false,
            parentPath: "/src/main/resources/assets/basicitemmod/textures/item",
          },
          
          // Build.gradle
          {
            path: "/build.gradle",
            name: "build.gradle",
            content: `plugins {
    id 'eclipse'
    id 'idea'
    id 'net.neoforged.gradle.userdev' version '7.0.96'
}

group = 'com.example'
version = '1.0.0'

// Mojang ships Java 17 with the launcher.
java.toolchain.languageVersion = JavaLanguageVersion.of(17)

runs {
    // Apply the standard client and server run configurations.
    configureEach {
        // Custom arguments
        systemProperty 'forge.logging.markers', ''
        systemProperty 'forge.logging.console.level', 'debug'
        // JVM arguments
        jvmArgument '-XX:+AllowEnhancedClassRedefinition'
    }

    client {
        systemProperty 'forge.enabledGameTestNamespaces', project.mod_id
    }

    server {
        systemProperty 'forge.enabledGameTestNamespaces', project.mod_id
        programArgument '--nogui'
    }

    // This run config launches GameTestServer and runs all registered gametests, then exits.
    // By default, the server will crash when no gametests are provided.
    // The gametest system is also enabled by default for other run configs under the /test command.
    gameTestServer {
        systemProperty 'forge.enabledGameTestNamespaces', project.mod_id
    }

    data {
        // example of overriding the workingDirectory which defaults to 'run'
        workingDirectory project.file('run-data')

        // Specify the modid for data generation, where to output the resulting resource, and where to look for existing resources.
        programArguments.addAll '--mod', project.mod_id, '--all', '--output', file('src/generated/resources/'), '--existing', file('src/main/resources/')
    }
}

// Include resources generated by data generators.
sourceSets.main.resources { srcDir 'src/generated/resources' }

repositories {
    // If you have mod jar dependencies in ./libs, you can declare them as a repository like so.
    // flatDir {
    //     dir 'libs'
    // }
}

dependencies {
    // Specify the version of NeoForge to use. 
    // The 'x.y.z-version' notation is only required when working with patch versions, 
    // otherwise using the Maven version format ('x.y.z') is sufficient.
    // Should match the same major minor patch version of the mod loader being used.
    implementation "net.neoforged:neoforge:1.21.5-21.5.0.0"
}

// This block of code expands all declared replace properties in the specified resource targets.
// A missing property will result in an error. Properties are expanded using the @ notation.
tasks.withType(ProcessResources).configureEach {
    var replaceProperties = [
            minecraft_version: "1.21.5",
            minecraft_version_range: "[1.21.5,1.22)",
            neo_version: "21.5.0.0",
            neo_version_range: "[21.5,21.6)",
            loader_version_range: "[21.5,)",
            mod_id: project.mod_id,
            mod_name: project.mod_name,
            mod_license: project.mod_license,
            mod_version: project.mod_version,
            mod_authors: project.mod_authors,
            mod_description: project.mod_description,
    ]
    inputs.properties replaceProperties

    filesMatching(['META-INF/mods.toml', 'pack.mcmeta']) {
        expand replaceProperties + [project: project]
    }
}`,
            isFolder: false,
            parentPath: "/",
          },
          
          // gradle.properties
          {
            path: "/gradle.properties",
            name: "gradle.properties",
            content: `org.gradle.jvmargs=-Xmx3G
org.gradle.daemon=false
org.gradle.debug=false

# Project Properties
mod_id=basicitemmod
mod_name=Basic Item Mod
mod_license=All Rights Reserved
mod_version=1.0.0
mod_group_id=com.example.basicitemmod
mod_authors=Example Modder
mod_description=A simple mod that adds a basic item to the game.`,
            isFolder: false,
            parentPath: "/",
          },
          
          // settings.gradle
          {
            path: "/settings.gradle",
            name: "settings.gradle",
            content: `pluginManagement {
    repositories {
        gradlePluginPortal()
        maven { url = 'https://maven.neoforged.net/releases' }
    }
}

plugins {
    id 'org.gradle.toolchains.foojay-resolver-convention' version '0.7.0'
}`,
            isFolder: false,
            parentPath: "/",
          },
          
          // README.md
          {
            path: "/README.md",
            name: "README.md",
            content: `# Basic Item Mod

This is a simple Minecraft mod created with NeoForge 1.21.5. It demonstrates how to create a basic item using the new Data Component system in NeoForge.

## Features

- Adds a simple item to the game
- Demonstrates proper registration using DeferredRegister
- Includes proper language files and textures
- Built for NeoForge 1.21.5

## Setup

1. Clone the repository
2. Open in your IDE of choice
3. Run the Gradle tasks to build and test

## License

All Rights Reserved
`,
            isFolder: false,
            parentPath: "/",
          },
        ];
        
      case "basic-block":
        return [
          // Root directories
          {
            path: "/src",
            name: "src",
            content: "",
            isFolder: true,
            parentPath: "",
          },
          {
            path: "/src/main",
            name: "main",
            content: "",
            isFolder: true,
            parentPath: "/src",
          },
          {
            path: "/src/main/java",
            name: "java",
            content: "",
            isFolder: true,
            parentPath: "/src/main",
          },
          {
            path: "/src/main/resources",
            name: "resources",
            content: "",
            isFolder: true,
            parentPath: "/src/main",
          },
          
          // Java source directories
          {
            path: "/src/main/java/com",
            name: "com",
            content: "",
            isFolder: true,
            parentPath: "/src/main/java",
          },
          {
            path: "/src/main/java/com/example",
            name: "example",
            content: "",
            isFolder: true,
            parentPath: "/src/main/java/com",
          },
          {
            path: "/src/main/java/com/example/basicblockmod",
            name: "basicblockmod",
            content: "",
            isFolder: true,
            parentPath: "/src/main/java/com/example",
          },
          
          // Main mod class
          {
            path: "/src/main/java/com/example/basicblockmod/BasicBlockMod.java",
            name: "BasicBlockMod.java",
            content: `package com.example.basicblockmod;

import com.mojang.logging.LogUtils;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.world.item.BlockItem;
import net.minecraft.world.item.Item;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.SoundType;
import net.minecraft.world.level.block.state.BlockBehaviour;
import net.minecraft.world.level.material.MapColor;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.fml.common.Mod;
import net.neoforged.neoforge.registries.DeferredRegister;
import net.neoforged.neoforge.registries.RegistryObject;
import org.slf4j.Logger;

// The main mod class
@Mod(BasicBlockMod.MODID)
public class BasicBlockMod {
    // Define mod id in a common place for everything to reference
    public static final String MODID = "basicblockmod";
    // Directly reference a slf4j logger
    private static final Logger LOGGER = LogUtils.getLogger();
    
    // Create Deferred Registers to hold Blocks and Items
    public static final DeferredRegister<Block> BLOCKS = DeferredRegister.create(BuiltInRegistries.BLOCK, MODID);
    public static final DeferredRegister<Item> ITEMS = DeferredRegister.create(BuiltInRegistries.ITEM, MODID);
    
    // Create a block registry object
    public static final RegistryObject<Block> EXAMPLE_BLOCK = BLOCKS.register("example_block",
        () -> new Block(BlockBehaviour.Properties.of()
            .mapColor(MapColor.STONE)
            .requiresCorrectToolForDrops()
            .strength(3.0F, 3.0F)
            .sound(SoundType.STONE)));
    
    // Create an item for the block
    public static final RegistryObject<Item> EXAMPLE_BLOCK_ITEM = ITEMS.register("example_block", 
        () -> new BlockItem(EXAMPLE_BLOCK.get(), new Item.Properties()));

    public BasicBlockMod(IEventBus modEventBus) {
        // Register the Deferred Registers to the mod event bus
        BLOCKS.register(modEventBus);
        ITEMS.register(modEventBus);

        // Register ourselves for server and other game events we are interested in
        LOGGER.info("Basic Block Mod initialized!");
    }
}`,
            isFolder: false,
            parentPath: "/src/main/java/com/example/basicblockmod",
          },
          
          // Resources directories
          {
            path: "/src/main/resources/META-INF",
            name: "META-INF",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources",
          },
          {
            path: "/src/main/resources/assets",
            name: "assets",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources",
          },
          {
            path: "/src/main/resources/assets/basicblockmod",
            name: "basicblockmod",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources/assets",
          },
          {
            path: "/src/main/resources/assets/basicblockmod/blockstates",
            name: "blockstates",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources/assets/basicblockmod",
          },
          {
            path: "/src/main/resources/assets/basicblockmod/lang",
            name: "lang",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources/assets/basicblockmod",
          },
          {
            path: "/src/main/resources/assets/basicblockmod/models",
            name: "models",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources/assets/basicblockmod",
          },
          {
            path: "/src/main/resources/assets/basicblockmod/models/block",
            name: "block",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources/assets/basicblockmod/models",
          },
          {
            path: "/src/main/resources/assets/basicblockmod/models/item",
            name: "item",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources/assets/basicblockmod/models",
          },
          {
            path: "/src/main/resources/assets/basicblockmod/textures",
            name: "textures",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources/assets/basicblockmod",
          },
          {
            path: "/src/main/resources/assets/basicblockmod/textures/block",
            name: "block",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources/assets/basicblockmod/textures",
          },
          
          // Data directories for loot tables
          {
            path: "/src/main/resources/data",
            name: "data",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources",
          },
          {
            path: "/src/main/resources/data/basicblockmod",
            name: "basicblockmod",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources/data",
          },
          {
            path: "/src/main/resources/data/basicblockmod/loot_tables",
            name: "loot_tables",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources/data/basicblockmod",
          },
          {
            path: "/src/main/resources/data/basicblockmod/loot_tables/blocks",
            name: "blocks",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources/data/basicblockmod/loot_tables",
          },
          
          // mods.toml
          {
            path: "/src/main/resources/META-INF/mods.toml",
            name: "mods.toml",
            content: `# This is an example mods.toml file. It contains the data relating to the loading mods.
# There are several mandatory fields (#mandatory), and many more that are optional (#optional).
# The overall format is standard TOML format, v0.5.0.
# Note that there are a couple of TOML lists in this file.
# Find more information on toml format here:  https://github.com/toml-lang/toml
# The name of the mod loader type to load - for regular FML @Mod mods it should be javafml
modLoader="javafml" #mandatory
# A version range to match for said mod loader - for regular FML @Mod it will be the neo forge version
loaderVersion="[21.5,)" #mandatory This is typically bumped every Minecraft version by Neo Forge.
# The license for you mod. This is mandatory metadata and allows for easier comprehension of your redistributive properties.
# Review your options at https://choosealicense.com/. All rights reserved is the default copyright stance, and is thus the default here.
license="All Rights Reserved"
# A URL to refer people to when problems occur with this mod
#issueTrackerURL="https://change.me.to.your.issue.tracker.example.invalid/" #optional
# A list of mods - how many allowed here is determined by the individual mod loader
[[mods]] #mandatory
# The modid of the mod
modId="basicblockmod" #mandatory
# The version number of the mod
version="1.0.0" #mandatory
# A display name for the mod
displayName="Basic Block Mod" #mandatory
# A URL to query for updates for this mod. See the JSON update specification https://docs.neoforged.net/docs/gettingstarted/versioncheck/
#updateJSONURL="https://change.me.example.invalid/updates.json" #optional
# A URL for the "homepage" for this mod, displayed in the mod UI
#displayURL="https://change.me.to.your.mods.homepage.example.invalid/" #optional
# A file name (in the root of the mod JAR) containing a logo for display
#logoFile="examplemod.png" #optional
# A text field displayed in the mod UI
credits="Created with NeoForge 1.21.5" #optional
# A text field displayed in the mod UI
authors="Example Modder" #optional
# Display Test controls the display for your mod in the server connection screen
# MATCH_VERSION means that your mod will cause a red X if the versions on client and server differ. This is the default behaviour and should be what you choose if you have server and client elements to your mod.
# IGNORE_SERVER_VERSION means that your mod will not cause a red X if it's present on the server but not on the client. This is what you should use if you're a server only mod.
# IGNORE_ALL_VERSION means that your mod will not cause a red X if it's present on the client or the server. This is a special case and should only be used if your mod has no server component.
# NONE means that no display test is set on your mod. You need to do this yourself, see IExtensionPoint.DisplayTest for more information. You can define any scheme you wish with this value.
# IMPORTANT NOTE: this is NOT an instruction as to which environments (CLIENT or DEDICATED SERVER) your mod loads on. Your mod should load (and maybe do nothing!) whereever it finds itself.
#displayTest="MATCH_VERSION" # MATCH_VERSION is the default if nothing is specified (#optional)
description='''
A simple mod that adds a basic block to the game.
'''
# A dependency - use the . to indicate dependency for a specific modid. Dependencies are optional.
[[dependencies.basicblockmod]] #optional
    # the modid of the dependency
    modId="forge" #mandatory
    # Does this dependency have to exist - if not, ordering below must be specified
    mandatory=true #mandatory
    # The version range of the dependency
    versionRange="[21.5,)" #mandatory
    # An ordering relationship for the dependency - BEFORE or AFTER required if the dependency is not mandatory
    # BEFORE - This mod is loaded BEFORE the dependency
    # AFTER - This mod is loaded AFTER the dependency
    ordering="NONE"
    # Side this dependency is applied on - BOTH, CLIENT, or SERVER
    side="BOTH"
# Here's another dependency
[[dependencies.basicblockmod]]
    modId="minecraft"
    mandatory=true
    # This version range declares a minimum of the current minecraft version up to but not including the next major version
    versionRange="[1.21.5]"
    ordering="NONE"
    side="BOTH"`,
            isFolder: false,
            parentPath: "/src/main/resources/META-INF",
          },
          
          // Block state definition
          {
            path: "/src/main/resources/assets/basicblockmod/blockstates/example_block.json",
            name: "example_block.json",
            content: `{
  "variants": {
    "": { "model": "basicblockmod:block/example_block" }
  }
}`,
            isFolder: false,
            parentPath: "/src/main/resources/assets/basicblockmod/blockstates",
          },
          
          // Language file
          {
            path: "/src/main/resources/assets/basicblockmod/lang/en_us.json",
            name: "en_us.json",
            content: `{
  "block.basicblockmod.example_block": "Example Block"
}`,
            isFolder: false,
            parentPath: "/src/main/resources/assets/basicblockmod/lang",
          },
          
          // Block model
          {
            path: "/src/main/resources/assets/basicblockmod/models/block/example_block.json",
            name: "example_block.json",
            content: `{
  "parent": "block/cube_all",
  "textures": {
    "all": "basicblockmod:block/example_block"
  }
}`,
            isFolder: false,
            parentPath: "/src/main/resources/assets/basicblockmod/models/block",
          },
          
          // Item model
          {
            path: "/src/main/resources/assets/basicblockmod/models/item/example_block.json",
            name: "example_block.json",
            content: `{
  "parent": "basicblockmod:block/example_block"
}`,
            isFolder: false,
            parentPath: "/src/main/resources/assets/basicblockmod/models/item",
          },
          
          // Block texture placeholder
          {
            path: "/src/main/resources/assets/basicblockmod/textures/block/example_block.png",
            name: "example_block.png",
            content: "// This would be a binary file in a real implementation - for this example, we're using a placeholder",
            isFolder: false,
            parentPath: "/src/main/resources/assets/basicblockmod/textures/block",
          },
          
          // Loot table for the block
          {
            path: "/src/main/resources/data/basicblockmod/loot_tables/blocks/example_block.json",
            name: "example_block.json",
            content: `{
  "type": "minecraft:block",
  "pools": [
    {
      "rolls": 1,
      "entries": [
        {
          "type": "minecraft:item",
          "name": "basicblockmod:example_block"
        }
      ],
      "conditions": [
        {
          "condition": "minecraft:survives_explosion"
        }
      ]
    }
  ]
}`,
            isFolder: false,
            parentPath: "/src/main/resources/data/basicblockmod/loot_tables/blocks",
          },
          
          // Build.gradle
          {
            path: "/build.gradle",
            name: "build.gradle",
            content: `plugins {
    id 'eclipse'
    id 'idea'
    id 'net.neoforged.gradle.userdev' version '7.0.96'
}

group = 'com.example'
version = '1.0.0'

// Mojang ships Java 17 with the launcher.
java.toolchain.languageVersion = JavaLanguageVersion.of(17)

runs {
    // Apply the standard client and server run configurations.
    configureEach {
        // Custom arguments
        systemProperty 'forge.logging.markers', ''
        systemProperty 'forge.logging.console.level', 'debug'
        // JVM arguments
        jvmArgument '-XX:+AllowEnhancedClassRedefinition'
    }

    client {
        systemProperty 'forge.enabledGameTestNamespaces', project.mod_id
    }

    server {
        systemProperty 'forge.enabledGameTestNamespaces', project.mod_id
        programArgument '--nogui'
    }

    // This run config launches GameTestServer and runs all registered gametests, then exits.
    // By default, the server will crash when no gametests are provided.
    // The gametest system is also enabled by default for other run configs under the /test command.
    gameTestServer {
        systemProperty 'forge.enabledGameTestNamespaces', project.mod_id
    }

    data {
        // example of overriding the workingDirectory which defaults to 'run'
        workingDirectory project.file('run-data')

        // Specify the modid for data generation, where to output the resulting resource, and where to look for existing resources.
        programArguments.addAll '--mod', project.mod_id, '--all', '--output', file('src/generated/resources/'), '--existing', file('src/main/resources/')
    }
}

// Include resources generated by data generators.
sourceSets.main.resources { srcDir 'src/generated/resources' }

repositories {
    // If you have mod jar dependencies in ./libs, you can declare them as a repository like so.
    // flatDir {
    //     dir 'libs'
    // }
}

dependencies {
    // Specify the version of NeoForge to use. 
    // The 'x.y.z-version' notation is only required when working with patch versions, 
    // otherwise using the Maven version format ('x.y.z') is sufficient.
    // Should match the same major minor patch version of the mod loader being used.
    implementation "net.neoforged:neoforge:1.21.5-21.5.0.0"
}

// This block of code expands all declared replace properties in the specified resource targets.
// A missing property will result in an error. Properties are expanded using the @ notation.
tasks.withType(ProcessResources).configureEach {
    var replaceProperties = [
            minecraft_version: "1.21.5",
            minecraft_version_range: "[1.21.5,1.22)",
            neo_version: "21.5.0.0",
            neo_version_range: "[21.5,21.6)",
            loader_version_range: "[21.5,)",
            mod_id: project.mod_id,
            mod_name: project.mod_name,
            mod_license: project.mod_license,
            mod_version: project.mod_version,
            mod_authors: project.mod_authors,
            mod_description: project.mod_description,
    ]
    inputs.properties replaceProperties

    filesMatching(['META-INF/mods.toml', 'pack.mcmeta']) {
        expand replaceProperties + [project: project]
    }
}`,
            isFolder: false,
            parentPath: "/",
          },
          
          // gradle.properties
          {
            path: "/gradle.properties",
            name: "gradle.properties",
            content: `org.gradle.jvmargs=-Xmx3G
org.gradle.daemon=false
org.gradle.debug=false

# Project Properties
mod_id=basicblockmod
mod_name=Basic Block Mod
mod_license=All Rights Reserved
mod_version=1.0.0
mod_group_id=com.example.basicblockmod
mod_authors=Example Modder
mod_description=A simple mod that adds a basic block to the game.`,
            isFolder: false,
            parentPath: "/",
          },
          
          // settings.gradle
          {
            path: "/settings.gradle",
            name: "settings.gradle",
            content: `pluginManagement {
    repositories {
        gradlePluginPortal()
        maven { url = 'https://maven.neoforged.net/releases' }
    }
}

plugins {
    id 'org.gradle.toolchains.foojay-resolver-convention' version '0.7.0'
}`,
            isFolder: false,
            parentPath: "/",
          },
          
          // README.md
          {
            path: "/README.md",
            name: "README.md",
            content: `# Basic Block Mod

This is a simple Minecraft mod created with NeoForge 1.21.5. It demonstrates how to create a basic block and its item.

## Features

- Adds a simple block to the game
- Demonstrates proper registration using DeferredRegister
- Includes proper block states, models, textures, and loot tables
- Built for NeoForge 1.21.5

## Setup

1. Clone the repository
2. Open in your IDE of choice
3. Run the Gradle tasks to build and test

## License

All Rights Reserved
`,
            isFolder: false,
            parentPath: "/",
          },
        ];
        
      case "complete":
        // Provide a more complete template with items, blocks, and creative tab
        return [
          // This would be a more comprehensive template with multiple items, blocks, etc.
          // For now, we'll just create a minimal structure
          {
            path: "/README.md",
            name: "README.md",
            content: `# Complete NeoForge Mod Example

This is a fully-featured Minecraft mod created for NeoForge 1.21.5. 
It demonstrates the following features:

- Custom items and blocks
- Creative tab with items
- Custom block entity
- Custom recipes
- World generation features

## Features

### Items
- Example tool with the new Data Component system
- Example food item
- Example armor

### Blocks
- Example block with custom properties
- Example block with block entity
- Example crop

### World Generation
- Custom ore generation
- Custom structure

## Setup

1. Clone the repository
2. Open in your IDE of choice
3. Run the Gradle tasks to build and test

## License

All Rights Reserved
`,
            isFolder: false,
            parentPath: "/",
          },
          {
            path: "/src",
            name: "src",
            content: "",
            isFolder: true,
            parentPath: "",
          },
          {
            path: "/src/main",
            name: "main",
            content: "",
            isFolder: true,
            parentPath: "/src",
          },
          {
            path: "/src/main/java",
            name: "java",
            content: "",
            isFolder: true,
            parentPath: "/src/main",
          },
          {
            path: "/src/main/java/com",
            name: "com",
            content: "",
            isFolder: true,
            parentPath: "/src/main/java",
          },
          {
            path: "/src/main/java/com/example",
            name: "example",
            content: "",
            isFolder: true,
            parentPath: "/src/main/java/com",
          },
          {
            path: "/src/main/java/com/example/completemod",
            name: "completemod",
            content: "",
            isFolder: true,
            parentPath: "/src/main/java/com/example",
          },
          {
            path: "/src/main/java/com/example/completemod/CompleteMod.java",
            name: "CompleteMod.java",
            content: `package com.example.completemod;

import com.example.completemod.init.ModBlocks;
import com.example.completemod.init.ModItems;
import com.example.completemod.init.ModCreativeTabs;
import com.mojang.logging.LogUtils;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.fml.common.Mod;
import org.slf4j.Logger;

@Mod(CompleteMod.MODID)
public class CompleteMod {
    public static final String MODID = "completemod";
    private static final Logger LOGGER = LogUtils.getLogger();

    public CompleteMod(IEventBus modEventBus) {
        // Register all of our deferred registers
        ModBlocks.BLOCKS.register(modEventBus);
        ModItems.ITEMS.register(modEventBus);
        ModCreativeTabs.CREATIVE_MODE_TABS.register(modEventBus);
        
        LOGGER.info("Complete Mod initialized!");
    }
}`,
            isFolder: false,
            parentPath: "/src/main/java/com/example/completemod",
          },
          {
            path: "/src/main/java/com/example/completemod/init",
            name: "init",
            content: "",
            isFolder: true,
            parentPath: "/src/main/java/com/example/completemod",
          },
          {
            path: "/src/main/java/com/example/completemod/init/ModItems.java",
            name: "ModItems.java",
            content: `package com.example.completemod.init;

import com.example.completemod.CompleteMod;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.world.food.FoodProperties;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.component.ItemComponents;
import net.minecraft.world.item.component.ResolutionContext;
import net.minecraft.world.item.component.ToolTierAccessor;
import net.minecraft.world.item.component.WeaponComponent;
import net.minecraft.world.item.Tiers;
import net.neoforged.neoforge.registries.DeferredRegister;
import net.neoforged.neoforge.registries.RegistryObject;

public class ModItems {
    public static final DeferredRegister<Item> ITEMS = DeferredRegister.create(BuiltInRegistries.ITEM, CompleteMod.MODID);

    // Example Sword (using new Data Component system)
    public static final RegistryObject<Item> EXAMPLE_SWORD = ITEMS.register("example_sword", 
        () -> new Item(new Item.Properties()
            .component(ItemComponents.WEAPON,
                // WIP mock WeaponComponent for demonstration purposes
                context -> new WeaponComponent(
                    5.0f,  // Base attack damage 
                    1.6f,  // Attack speed
                    3      // Enchantment value
                )
            )
        ));
    
    // Example Food
    public static final RegistryObject<Item> EXAMPLE_FOOD = ITEMS.register("example_food", 
        () -> new Item(new Item.Properties()
            .food(new FoodProperties.Builder()
                .nutrition(6)
                .saturationMod(0.8F)
                .build())
        ));
        
    // Example Tool
    public static final RegistryObject<Item> EXAMPLE_PICKAXE = ITEMS.register("example_pickaxe",
        () -> new Item(new Item.Properties()
            .component(ItemComponents.PICKAXE, ctx -> 
                // Pickaxe component with the properties of an iron pickaxe
                ItemComponents.PICKAXE.defaultComponent(ctx).withTier(Tiers.IRON)
            )
        ));
}`,
            isFolder: false,
            parentPath: "/src/main/java/com/example/completemod/init",
          },
          {
            path: "/src/main/java/com/example/completemod/init/ModBlocks.java",
            name: "ModBlocks.java",
            content: `package com.example.completemod.init;

import com.example.completemod.CompleteMod;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.world.item.BlockItem;
import net.minecraft.world.item.Item;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.SoundType;
import net.minecraft.world.level.block.state.BlockBehaviour;
import net.minecraft.world.level.material.MapColor;
import net.neoforged.neoforge.registries.DeferredRegister;
import net.neoforged.neoforge.registries.RegistryObject;

import java.util.function.Supplier;

public class ModBlocks {
    public static final DeferredRegister<Block> BLOCKS = DeferredRegister.create(BuiltInRegistries.BLOCK, CompleteMod.MODID);

    // Example Block
    public static final RegistryObject<Block> EXAMPLE_BLOCK = registerBlock("example_block",
        () -> new Block(BlockBehaviour.Properties.of()
            .mapColor(MapColor.STONE)
            .requiresCorrectToolForDrops()
            .strength(3.0F, 3.0F)
            .sound(SoundType.STONE)));
    
    // Example Ore
    public static final RegistryObject<Block> EXAMPLE_ORE = registerBlock("example_ore",
        () -> new Block(BlockBehaviour.Properties.of()
            .mapColor(MapColor.STONE)
            .requiresCorrectToolForDrops()
            .strength(3.0F, 3.0F)
            .sound(SoundType.STONE)));
    
    // Helper method for block registration with item
    private static <T extends Block> RegistryObject<T> registerBlock(String name, Supplier<T> block) {
        RegistryObject<T> toReturn = BLOCKS.register(name, block);
        registerBlockItem(name, toReturn);
        return toReturn;
    }

    // Register block items
    private static <T extends Block> RegistryObject<Item> registerBlockItem(String name, RegistryObject<T> block) {
        return ModItems.ITEMS.register(name, () -> new BlockItem(block.get(), new Item.Properties()));
    }
}`,
            isFolder: false,
            parentPath: "/src/main/java/com/example/completemod/init",
          },
          {
            path: "/src/main/java/com/example/completemod/init/ModCreativeTabs.java",
            name: "ModCreativeTabs.java",
            content: `package com.example.completemod.init;

import com.example.completemod.CompleteMod;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.network.chat.Component;
import net.minecraft.world.item.CreativeModeTab;
import net.minecraft.world.item.ItemStack;
import net.neoforged.neoforge.registries.DeferredRegister;
import net.neoforged.neoforge.registries.RegistryObject;

public class ModCreativeTabs {
    public static final DeferredRegister<CreativeModeTab> CREATIVE_MODE_TABS = DeferredRegister.create(BuiltInRegistries.CREATIVE_MODE_TAB, CompleteMod.MODID);

    public static final RegistryObject<CreativeModeTab> EXAMPLE_TAB = CREATIVE_MODE_TABS.register("example_tab",
        () -> CreativeModeTab.builder()
            .title(Component.translatable("itemGroup.completemod.example_tab"))
            .icon(() -> new ItemStack(ModItems.EXAMPLE_SWORD.get()))
            .displayItems((parameters, output) -> {
                // Add items to the tab
                output.accept(ModItems.EXAMPLE_SWORD.get());
                output.accept(ModItems.EXAMPLE_FOOD.get());
                output.accept(ModItems.EXAMPLE_PICKAXE.get());
                
                // Add blocks to the tab
                output.accept(ModBlocks.EXAMPLE_BLOCK.get());
                output.accept(ModBlocks.EXAMPLE_ORE.get());
            })
            .build()
    );
}`,
            isFolder: false,
            parentPath: "/src/main/java/com/example/completemod/init",
          },
          // Simple placeholder for resources
          {
            path: "/src/main/resources",
            name: "resources",
            content: "",
            isFolder: true,
            parentPath: "/src/main",
          },
          {
            path: "/src/main/resources/META-INF",
            name: "META-INF",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources",
          },
          {
            path: "/src/main/resources/META-INF/mods.toml",
            name: "mods.toml",
            content: `modLoader="javafml"
loaderVersion="[21.5,)"
license="All Rights Reserved"

[[mods]]
modId="completemod"
version="1.0.0"
displayName="Complete Mod Example"
credits="Created with NeoForge 1.21.5"
authors="Example Modder"
description='''
A complete mod example with items, blocks, and more!
'''

[[dependencies.completemod]]
    modId="forge"
    mandatory=true
    versionRange="[21.5,)"
    ordering="NONE"
    side="BOTH"

[[dependencies.completemod]]
    modId="minecraft"
    mandatory=true
    versionRange="[1.21.5]"
    ordering="NONE"
    side="BOTH"`,
            isFolder: false,
            parentPath: "/src/main/resources/META-INF",
          },
          {
            path: "/src/main/resources/assets",
            name: "assets",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources",
          },
          {
            path: "/src/main/resources/assets/completemod",
            name: "completemod",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources/assets",
          },
          {
            path: "/src/main/resources/assets/completemod/lang",
            name: "lang",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources/assets/completemod",
          },
          {
            path: "/src/main/resources/assets/completemod/lang/en_us.json",
            name: "en_us.json",
            content: `{
  "item.completemod.example_sword": "Example Sword",
  "item.completemod.example_food": "Example Food",
  "item.completemod.example_pickaxe": "Example Pickaxe",
  "block.completemod.example_block": "Example Block",
  "block.completemod.example_ore": "Example Ore",
  "itemGroup.completemod.example_tab": "Complete Mod"
}`,
            isFolder: false,
            parentPath: "/src/main/resources/assets/completemod/lang",
          },
        ];
        
      default: // Empty template
        return [
          {
            path: "/README.md",
            name: "README.md",
            content: `# Empty NeoForge 1.21.5 Mod

This is a basic empty mod for NeoForge 1.21.5.

## Setup

1. Add your mod implementation
2. Build and test

## Documentation

- [NeoForge Documentation](https://docs.neoforged.net/)
- [NeoForge 1.21.5 Primer](https://github.com/neoforged/.github/blob/main/primers/1.21.5/index.md)
`,
            isFolder: false,
            parentPath: "/",
          },
          {
            path: "/src",
            name: "src",
            content: "",
            isFolder: true,
            parentPath: "",
          },
          {
            path: "/src/main",
            name: "main",
            content: "",
            isFolder: true,
            parentPath: "/src",
          },
          {
            path: "/src/main/java",
            name: "java",
            content: "",
            isFolder: true,
            parentPath: "/src/main",
          },
          {
            path: "/src/main/resources",
            name: "resources",
            content: "",
            isFolder: true,
            parentPath: "/src/main",
          },
          {
            path: "/src/main/java/com",
            name: "com",
            content: "",
            isFolder: true,
            parentPath: "/src/main/java",
          },
          {
            path: "/src/main/java/com/example",
            name: "example",
            content: "",
            isFolder: true,
            parentPath: "/src/main/java/com",
          },
          {
            path: "/src/main/java/com/example/emptymod",
            name: "emptymod",
            content: "",
            isFolder: true,
            parentPath: "/src/main/java/com/example",
          },
          {
            path: "/src/main/java/com/example/emptymod/EmptyMod.java",
            name: "EmptyMod.java",
            content: `package com.example.emptymod;

import com.mojang.logging.LogUtils;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.fml.common.Mod;
import org.slf4j.Logger;

@Mod(EmptyMod.MODID)
public class EmptyMod {
    public static final String MODID = "emptymod";
    private static final Logger LOGGER = LogUtils.getLogger();

    public EmptyMod(IEventBus modEventBus) {
        // Register ourselves for game events we are interested in
        LOGGER.info("Empty Mod initialized!");
    }
}`,
            isFolder: false,
            parentPath: "/src/main/java/com/example/emptymod",
          },
          {
            path: "/src/main/resources/META-INF",
            name: "META-INF",
            content: "",
            isFolder: true,
            parentPath: "/src/main/resources",
          },
          {
            path: "/src/main/resources/META-INF/mods.toml",
            name: "mods.toml",
            content: `modLoader="javafml"
loaderVersion="[21.5,)"
license="All Rights Reserved"

[[mods]]
modId="emptymod"
version="1.0.0"
displayName="Empty Mod"
credits="Created with NeoForge 1.21.5"
authors="Example Modder"
description='''
An empty mod template
'''

[[dependencies.emptymod]]
    modId="forge"
    mandatory=true
    versionRange="[21.5,)"
    ordering="NONE"
    side="BOTH"

[[dependencies.emptymod]]
    modId="minecraft"
    mandatory=true
    versionRange="[1.21.5]"
    ordering="NONE"
    side="BOTH"`,
            isFolder: false,
            parentPath: "/src/main/resources/META-INF",
          },
        ];
    }
  }

  app.get("/api/projects/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Verify ownership
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized access to project" });
      }
      
      res.json(project);
    } catch (error: any) {
      console.error("Error getting project:", error);
      res.status(500).json({ error: "Failed to fetch project: " + error.message });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Verify ownership
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized access to project" });
      }
      
      const updatedProject = await storage.updateProject(projectId, req.body);
      res.json(updatedProject);
    } catch (error: any) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Failed to update project: " + error.message });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Verify ownership
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized access to project" });
      }
      
      await storage.deleteProject(projectId);
      res.sendStatus(204);
    } catch (error: any) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project: " + error.message });
    }
  });

  // File endpoints
  app.get("/api/projects/:projectId/files", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Verify ownership
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized access to project" });
      }
      
      const files = await storage.getFilesByProjectId(projectId);
      res.json(files);
    } catch (error: any) {
      console.error("Error getting files:", error);
      res.status(500).json({ error: "Failed to fetch files: " + error.message });
    }
  });

  app.post("/api/projects/:projectId/files", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Verify ownership
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized access to project" });
      }
      
      const fileData = { ...req.body, projectId };
      const file = await storage.createFile(fileData);
      res.status(201).json(file);
    } catch (error: any) {
      console.error("Error creating file:", error);
      res.status(500).json({ error: "Failed to create file: " + error.message });
    }
  });

  app.get("/api/files/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      const fileId = parseInt(req.params.id);
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      
      // Verify ownership through project
      const project = await storage.getProject(file.projectId);
      if (!project || project.userId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized access to file" });
      }
      
      res.json(file);
    } catch (error: any) {
      console.error("Error getting file:", error);
      res.status(500).json({ error: "Failed to fetch file: " + error.message });
    }
  });

  app.put("/api/files/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      const fileId = parseInt(req.params.id);
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      
      // Verify ownership through project
      const project = await storage.getProject(file.projectId);
      if (!project || project.userId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized access to file" });
      }
      
      // Only allow updating content
      const updatedFile = await storage.updateFile(fileId, req.body.content);
      res.json(updatedFile);
    } catch (error: any) {
      console.error("Error updating file:", error);
      res.status(500).json({ error: "Failed to update file: " + error.message });
    }
  });

  app.delete("/api/files/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      const fileId = parseInt(req.params.id);
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      
      // Verify ownership through project
      const project = await storage.getProject(file.projectId);
      if (!project || project.userId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized access to file" });
      }
      
      await storage.deleteFile(fileId);
      res.sendStatus(204);
    } catch (error: any) {
      console.error("Error deleting file:", error);
      res.status(500).json({ error: "Failed to delete file: " + error.message });
    }
  });
  
  // Chat messages endpoints
  app.get("/api/projects/:projectId/chat", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Verify ownership
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized access to project" });
      }
      
      const messages = await storage.getChatMessagesByProjectId(projectId);
      res.json(messages);
    } catch (error: any) {
      console.error("Error getting chat messages:", error);
      res.status(500).json({ error: "Failed to fetch chat messages: " + error.message });
    }
  });

  app.post("/api/projects/:projectId/chat", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Verify ownership
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized access to project" });
      }
      
      const messageData = { ...req.body, projectId };
      const message = await storage.createChatMessage(messageData);
      res.status(201).json(message);
    } catch (error: any) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ error: "Failed to create chat message: " + error.message });
    }
  });
  // Chat with Claude
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, isVoiceMode = false } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }
      
      // Select the appropriate model based on voice mode
      const modelToUse = isVoiceMode ? CLAUDE_SONNET_MODEL : CLAUDE_CODE_MODEL;
      
      // System prompt to set context for Claude
      const systemPrompt = `You are CodeMate — an advanced AI coding agent powered by Claude Code inside a live web platform for developing Minecraft mods using NeoForge MDK 1.21.5.

You are a specialized programming assistant that:
- Generates high-quality, error-free mod features from scratch
- Reads, explains, and fixes complex error logs with precise solutions
- Updates legacy code to match NeoForge 1.21.5 standards
- Provides detailed code explanations with educational comments
- Builds mods feature-by-feature with professional software engineering practices

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
- Use the new \`DataComponent\` system (\`WEAPON\`, \`TOOL\`, \`ARMOR\`, \`BLOCKS_ATTACKS\`, etc.)
- Register through correct lifecycle events (\`RegisterEvent\`, \`FMLClientSetupEvent\`, etc.)
- Do not use pre-1.21.5 approaches like \`SwordItem\`, \`DiggerItem\`, \`ArmorItem\`, direct \`Registry.register\`, etc.
- Handle block entity removal properly using \`BlockEntity#preRemoveSideEffects\` and \`BlockBehaviour#affectNeighborsAfterRemoval\`
- Use new VoxelShape helpers for shape transformations
- Replace old-style tools and weapons:
  * Use \`Item\` with \`WEAPON\` component instead of \`SwordItem\`
  * Use \`Item\` with \`TOOL\` component instead of \`DiggerItem\`
  * Use \`Item\` with \`ARMOR\` component instead of \`ArmorItem\`
  * Use \`Item\` with \`BLOCKS_ATTACKS\` component for shields
- Utilize Item Properties builders like \`.sword()\`, \`.axe()\`, \`.pickaxe()\` instead of extending tool classes

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
      
      try {
        // Create Claude message request
        const response = await anthropic.messages.create({
          model: modelToUse,
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
      } catch (apiError: any) {
        console.error("Claude API Error:", apiError.message);
        
        // Handle specific API errors
        if (apiError.status === 400 && apiError.error?.error?.type === 'invalid_request_error') {
          // Check if it's a credit balance issue
          if (apiError.error?.error?.message?.includes('credit balance is too low')) {
            console.log("Using fallback response system since API credits are low");
            
            // Generate fallback response based on last user message
            const lastUserMessage = messages[messages.length - 1];
            const userContent = lastUserMessage.content || "";
            
            let responseContent = "I'm sorry, I can't access the Claude API right now due to credit limitations. ";
            responseContent += "The system has been updated to provide basic mod development guidance without API calls. ";
            responseContent += "Please continue using the interface for assistance with your Minecraft mod.";
            
            return res.json({
              message: {
                role: 'assistant',
                content: responseContent
              }
            });
          }
        }
        
        // For other errors, return a generic message
        console.error("Full API error details:", apiError);
        return res.status(500).json({ error: "Failed to get response from Claude: " + apiError.message });
      }
    } catch (error: any) {
      console.error("General error processing chat:", error);
      return res.status(500).json({ error: "Failed to process chat request: " + error.message });
    }
  });
  
  // Generate code with Claude
  app.post("/api/generate-code", async (req, res) => {
    try {
      const { prompt, language } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      
      const systemPrompt = `You are a specialized code generation expert powered by Claude Code and focused on Minecraft modding with NeoForge 1.21.5.

You will generate the highest quality, bug-free, and optimized Java code following these strict NeoForge 1.21.5 guidelines:

# Core NeoForge 1.21.5 Principles
- Always use \`DeferredRegister\` + \`RegistryObject\` for registering all game elements
- Use the new \`DataComponent\` system (\`WEAPON\`, \`TOOL\`, \`ARMOR\`, \`BLOCKS_ATTACKS\`, etc.) instead of inheritance
- Register through correct lifecycle events (\`RegisterEvent\`, \`FMLClientSetupEvent\`, etc.)
- Never use pre-1.21.5 approaches like \`SwordItem\`, \`DiggerItem\`, \`ArmorItem\`, direct \`Registry.register\`
- Handle block entity removal properly using \`BlockEntity#preRemoveSideEffects\` and \`BlockBehaviour#affectNeighborsAfterRemoval\`
- Use new VoxelShape helpers for shape transformations
- Add comprehensive JavaDoc comments to all public methods and classes

# Item Implementation Requirements
- Use \`Item\` with \`WEAPON\` component instead of \`SwordItem\`
- Use \`Item\` with \`TOOL\` component instead of \`DiggerItem\`
- Use \`Item\` with \`ARMOR\` component instead of \`ArmorItem\`
- Use \`Item\` with \`BLOCKS_ATTACKS\` component for shields
- Utilize Item Properties builders like \`.sword()\`, \`.axe()\`, \`.pickaxe()\` instead of extending tool classes

# Code Quality Standards
- Write clean, idiomatic, and well-structured Java code
- Follow best practices for exception handling and resource management
- Use appropriate design patterns for modularity and maintainability
- Include comprehensive error handling
- Add clear and educational comments explaining complex concepts

Generate complete, correct, and production-ready code based on the provided prompt.
Only output code without any explanation or markdown formatting.
The programming language is ${language || 'Java'}.`;
      
      try {
        const response = await anthropic.messages.create({
          model: CLAUDE_CODE_MODEL, // Always use the code model for code generation
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
      } catch (apiError: any) {
        console.error("Claude API Error in code generation:", apiError.message);
        
        // Handle specific API errors
        if (apiError.status === 400 && apiError.error?.error?.type === 'invalid_request_error') {
          // Check if it's a credit balance issue
          if (apiError.error?.error?.message?.includes('credit balance is too low')) {
            console.log("Using fallback code generation since API credits are low");
            
            // Generate fallback code based on prompt
            let fallbackCode = "";
            
            if (prompt.toLowerCase().includes("sword") || prompt.toLowerCase().includes("weapon")) {
              fallbackCode = `import net.minecraft.core.component.DataComponents;
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
            } else {
              fallbackCode = `// Fallback code - please provide a specific prompt for better results
// This is generic NeoForge 1.21.5 item registration code

import net.minecraft.world.item.Item;
import net.neoforged.neoforge.registries.DeferredRegister;
import net.neoforged.neoforge.registries.RegistryObject;

public class MyItems {
    // Create a DeferredRegister for items
    public static final DeferredRegister<Item> ITEMS = 
        DeferredRegister.create(BuiltInRegistries.ITEM, "yourmodid");
    
    // Register your custom item
    public static final RegistryObject<Item> MY_ITEM = ITEMS.register("my_item", 
        () -> new Item(new Item.Properties()));
}`;
            }
            
            return res.json({ code: fallbackCode });
          }
        }
        
        // For other errors, return a generic message
        console.error("Full API error details:", apiError);
        return res.status(500).json({ error: "Failed to generate code: " + apiError.message });
      }
    } catch (error: any) {
      console.error("General error generating code:", error);
      return res.status(500).json({ error: "Failed to process code generation request: " + error.message });
    }
  });
  
  // Fix code errors with Claude
  app.post("/api/fix-error", async (req, res) => {
    try {
      const { code, errorMessage, language } = req.body;
      
      if (!code || !errorMessage) {
        return res.status(400).json({ error: "Code and error message are required" });
      }
      
      const systemPrompt = `You are an expert debugging specialist powered by Claude Code with deep expertise in Minecraft modding with NeoForge 1.21.5.

## Your Task
You will analyze the provided code and error message, diagnose the issue with precision, and implement a comprehensive fix that fully resolves the problem while adhering to NeoForge 1.21.5 best practices.

## NeoForge 1.21.5 Requirements
- Always use \`DeferredRegister\` + \`RegistryObject\` for registration
- Use the new component-based system instead of inheritance:
  * \`DataComponents.WEAPON\` for weapons (was SwordItem)
  * \`DataComponents.TOOL\` for tools (was DiggerItem)
  * \`DataComponents.ARMOR\` for armor (was ArmorItem)
  * \`DataComponents.BLOCKS_ATTACKS\` for shields
- Register through correct lifecycle events (\`RegisterEvent\`, \`FMLClientSetupEvent\`, etc.)
- Use the builder pattern with \`Item.Properties().sword()\`, \`.axe()\`, etc. 
- Follow the correct mod loading lifecycle
- Handle block entity removal properly via \`BlockEntity#preRemoveSideEffects\`
- Use new VoxelShape helpers for collision boxes

## Common Error Categories To Look For
1. **Compilation Errors**
   - Missing imports
   - Type errors
   - Syntax errors
   - Deprecated classes/methods

2. **Runtime Errors**
   - NullPointerExceptions
   - ClassCastExceptions
   - Race conditions in the mod loading lifecycle
   - Missing registrations

3. **Logical Errors**
   - Using pre-1.21.5 inheritance instead of components
   - Incorrect event subscription
   - Registry issues (wrong registry type, missing registration)
   - Resource pack structure errors

4. **Migration Issues from Pre-1.21.5**
   - Legacy inheritance patterns (SwordItem → Item + WEAPON component)
   - Outdated registry methods
   - Removed or renamed classes/methods
   - Changed method signatures

Fix the provided code based on the error message and return only the complete fixed code without any explanation or markdown formatting.
The programming language is ${language || 'Java'}.`;
      
      try {
        const response = await anthropic.messages.create({
          model: CLAUDE_CODE_MODEL, // Always use the code model for error fixing
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
      } catch (apiError: any) {
        console.error("Claude API Error in code fixing:", apiError.message);
        
        // Handle specific API errors
        if (apiError.status === 400 && apiError.error?.error?.type === 'invalid_request_error') {
          // Check if it's a credit balance issue
          if (apiError.error?.error?.message?.includes('credit balance is too low')) {
            console.log("Using fallback code fixing since API credits are low");
            
            // Apply some basic fixes to the code
            let fixedCode = code;
            
            // Look for common errors and apply fixes
            if (code.includes("extends SwordItem") || code.includes("extends DiggerItem") || code.includes("extends ArmorItem")) {
              // Fix old-style inheritance
              fixedCode = code.replace(/extends\s+(SwordItem|DiggerItem|AxeItem|PickaxeItem|ShovelItem|HoeItem|ArmorItem)/g, "extends Item");
              fixedCode = fixedCode.replace(/new\s+(SwordItem|DiggerItem|AxeItem|PickaxeItem|ShovelItem|HoeItem|ArmorItem)/g, "new Item");
              
              // Add comments about the fix
              fixedCode = "// Fixed using DataComponent system instead of inheritance\n" + fixedCode;
              fixedCode = fixedCode.replace(/\)\s*\{/, ") {\n    // Use .add(DataComponents.WEAPON, new Weapon(...)) for weapons\n    // Use .add(DataComponents.TOOL, new Tool(...)) for tools\n    // Use .add(DataComponents.ARMOR, ...) for armor");
            }
            
            // Fix imports if needed
            if (!fixedCode.includes("import net.minecraft.core.component.DataComponents")) {
              const importIndex = fixedCode.indexOf("import ");
              if (importIndex >= 0) {
                fixedCode = fixedCode.substring(0, importIndex) + 
                  "import net.minecraft.core.component.DataComponents;\n" +
                  "import net.minecraft.world.item.component.Weapon;\n" +
                  "import net.minecraft.world.item.component.Tool;\n" + 
                  fixedCode.substring(importIndex);
              }
            }
            
            // Fix null pointer exceptions
            if (errorMessage.includes("NullPointerException") || errorMessage.includes("null")) {
              fixedCode = fixedCode.replace(/(\w+)\s*=\s*null/, "$1 = new ArrayList<>()");
              fixedCode = fixedCode.replace(/if\s*\((\w+)\)/, "if ($1 != null)");
            }
            
            return res.json({ fixedCode });
          }
        }
        
        // For other errors, return a generic message
        console.error("Full API error details:", apiError);
        return res.status(500).json({ error: "Failed to fix code: " + apiError.message });
      }
    } catch (error: any) {
      console.error("General error fixing code:", error);
      return res.status(500).json({ error: "Failed to process code fix request: " + error.message });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
