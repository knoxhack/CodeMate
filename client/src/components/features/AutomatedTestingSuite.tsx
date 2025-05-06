import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  FlaskConical, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Code, 
  Plus, 
  Trash, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Loader2,
  Share2,
  Settings,
  GitCommit
} from "lucide-react";

interface AutomatedTestingSuiteProps {
  projectId: number;
}

interface TestCase {
  id: string;
  name: string;
  type: "unit" | "integration" | "performance";
  status: "passed" | "failed" | "pending" | "skipped";
  filePath: string;
  duration?: number;
  errorMessage?: string;
  coverage?: number;
}

interface TestSuite {
  id: string;
  name: string;
  description: string;
  testCases: TestCase[];
  lastRun?: string;
  status: "passed" | "failed" | "pending";
  coverage?: number;
}

export default function AutomatedTestingSuite({ projectId }: AutomatedTestingSuiteProps) {
  const { toast } = useToast();
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
  const [selectedTest, setSelectedTest] = useState<TestCase | null>(null);
  const [isGeneratingTests, setIsGeneratingTests] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTestName, setNewTestName] = useState("");
  const [newTestType, setNewTestType] = useState<string>("unit");
  const [newTestDescription, setNewTestDescription] = useState("");
  const [testingTab, setTestingTab] = useState("suites");
  const [expandedSuites, setExpandedSuites] = useState<Record<string, boolean>>({});
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generateTarget, setGenerateTarget] = useState("");
  const [generatedTestCode, setGeneratedTestCode] = useState("");

  // Load test suites when component mounts
  useEffect(() => {
    // In a real implementation, this would fetch from an API
    const mockTestSuites: TestSuite[] = [
      {
        id: "suite-1",
        name: "Core Block Tests",
        description: "Tests for custom block functionality",
        status: "passed",
        lastRun: new Date(Date.now() - 3600000).toISOString(),
        coverage: 87,
        testCases: [
          {
            id: "test-1",
            name: "CustomBlock - Basic Properties",
            type: "unit",
            status: "passed",
            filePath: "src/test/java/com/example/mod/block/CustomBlockTest.java",
            duration: 42
          },
          {
            id: "test-2",
            name: "CustomBlock - Interaction Behavior",
            type: "unit",
            status: "passed",
            filePath: "src/test/java/com/example/mod/block/CustomBlockTest.java",
            duration: 76
          },
          {
            id: "test-3",
            name: "CustomBlock - Redstone Integration",
            type: "integration",
            status: "passed",
            filePath: "src/test/java/com/example/mod/block/CustomBlockIntegrationTest.java",
            duration: 128
          }
        ]
      },
      {
        id: "suite-2",
        name: "Item Functionality",
        description: "Tests for custom items and weapons",
        status: "failed",
        lastRun: new Date(Date.now() - 7200000).toISOString(),
        coverage: 64,
        testCases: [
          {
            id: "test-4",
            name: "CustomItem - Creation",
            type: "unit",
            status: "passed",
            filePath: "src/test/java/com/example/mod/item/CustomItemTest.java",
            duration: 38
          },
          {
            id: "test-5",
            name: "CustomSword - Damage Calculation",
            type: "unit",
            status: "failed",
            filePath: "src/test/java/com/example/mod/item/CustomSwordTest.java",
            duration: 65,
            errorMessage: "java.lang.AssertionError: expected:<5.0> but was:<3.0>\nat org.junit.Assert.fail(Assert.java:89)\nat org.junit.Assert.failNotEquals(Assert.java:835)\nat org.junit.Assert.assertEquals(Assert.java:647)\nat com.example.mod.item.CustomSwordTest.testDamageCalculation(CustomSwordTest.java:42)"
          },
          {
            id: "test-6",
            name: "CustomSword - Special Effect",
            type: "integration",
            status: "passed",
            filePath: "src/test/java/com/example/mod/item/CustomSwordIntegrationTest.java",
            duration: 132
          }
        ]
      },
      {
        id: "suite-3",
        name: "Entity Tests",
        description: "Tests for custom entities and AI behavior",
        status: "pending",
        testCases: [
          {
            id: "test-7",
            name: "CustomEntity - Basic Properties",
            type: "unit",
            status: "pending",
            filePath: "src/test/java/com/example/mod/entity/CustomEntityTest.java"
          },
          {
            id: "test-8",
            name: "CustomEntity - AI Goals",
            type: "unit",
            status: "pending",
            filePath: "src/test/java/com/example/mod/entity/CustomEntityTest.java"
          }
        ]
      }
    ];

    setTestSuites(mockTestSuites);
    
    // Set the first suite as selected
    if (mockTestSuites.length > 0) {
      setSelectedSuite(mockTestSuites[0]);
    }
    
    // Initialize expanded state to show the first suite
    if (mockTestSuites.length > 0) {
      setExpandedSuites({ [mockTestSuites[0].id]: true });
    }
  }, [projectId]);

  // Toggle expansion of a test suite
  const toggleSuiteExpansion = (suiteId: string) => {
    setExpandedSuites(prev => ({
      ...prev,
      [suiteId]: !prev[suiteId]
    }));
  };

  // Handle test suite selection
  const handleSelectSuite = (suite: TestSuite) => {
    setSelectedSuite(suite);
    setSelectedTest(null);
  };

  // Handle test case selection
  const handleSelectTest = (test: TestCase) => {
    setSelectedTest(test);
  };

  // Create a new test
  const handleCreateTest = () => {
    if (!newTestName.trim()) {
      toast({
        title: "Validation Error",
        description: "Test name is required.",
        variant: "destructive",
      });
      return;
    }

    // In a real implementation, this would make an API call
    const newTest: TestCase = {
      id: `test-${Date.now()}`,
      name: newTestName,
      type: newTestType as "unit" | "integration" | "performance",
      status: "pending",
      filePath: `src/test/java/com/example/mod/${newTestName.toLowerCase().replace(/\s+/g, "_")}.java`
    };

    const newSuite: TestSuite = {
      id: `suite-${Date.now()}`,
      name: newTestName,
      description: newTestDescription || `Tests for ${newTestName}`,
      testCases: [newTest],
      status: "pending"
    };

    setTestSuites(prev => [...prev, newSuite]);
    setSelectedSuite(newSuite);
    setIsCreateModalOpen(false);
    setNewTestName("");
    setNewTestType("unit");
    setNewTestDescription("");

    toast({
      title: "Test Created",
      description: `New test suite "${newTestName}" has been created.`,
    });
  };

  // Generate tests using Claude
  const handleGenerateTests = () => {
    setIsGeneratingTests(true);
    
    // In a real implementation, this would make an API call to Claude API
    setTimeout(() => {
      // Sample generated test code
      const testCode = generateTarget === "CustomSword" 
        ? `package com.example.mod.item;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import net.minecraft.world.item.ItemStack;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.world.level.Level;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.core.BlockPos;
import net.neoforged.fml.util.ObfuscationReflectionHelper;

import com.example.mod.init.ModItems;

/**
 * Test suite for CustomSword class
 * Generated by Claude AI
 */
@DisplayName("CustomSword Tests")
public class CustomSwordTest {
    private CustomSword sword;
    private ItemStack swordStack;
    private ServerLevel mockLevel;
    private Player mockPlayer;
    
    @BeforeEach
    public void setup() {
        // Create a new CustomSword instance for each test
        sword = new CustomSword();
        swordStack = new ItemStack(sword);
        
        // Initialize mocks for testing
        // Note: In a real test, you would use a mocking framework like Mockito
        mockLevel = null; // Mock ServerLevel
        mockPlayer = null; // Mock Player
    }
    
    @Test
    @DisplayName("Test sword has correct durability")
    public void testDurability() {
        // Verify the sword uses the correct durability from component
        var durabilityComponent = swordStack.getData(ItemComponentsKeys.DURABILITY);
        assertNotNull(durabilityComponent, "Sword should have durability component");
        assertEquals(250, durabilityComponent.getMaxDurability(), 
            "Sword should have 250 max durability");
    }
    
    @Test
    @DisplayName("Test sword has correct attack damage")
    public void testAttackDamage() {
        // Verify the sword uses the correct attack damage from component
        var meleeComponent = swordStack.getData(ItemComponentsKeys.MELEE_WEAPON);
        assertNotNull(meleeComponent, "Sword should have melee weapon component");
        assertEquals(3.0f, meleeComponent.getAttackDamageBonus(), 0.01f, 
            "Sword should have 3.0 attack damage bonus");
    }
    
    @Test
    @DisplayName("Test sword has correct attack speed")
    public void testAttackSpeed() {
        // Verify the sword uses the correct attack speed from component
        var meleeComponent = swordStack.getData(ItemComponentsKeys.MELEE_WEAPON);
        assertNotNull(meleeComponent, "Sword should have melee weapon component");
        assertEquals(-2.4f, meleeComponent.getAttackSpeed(), 0.01f, 
            "Sword should have -2.4 attack speed");
    }
    
    @Test
    @DisplayName("Test special effect when attacking")
    public void testSpecialAttackEffect() {
        // This test would require mocking entities and the attack context
        // In a real test implementation, you would:
        // 1. Create mock target entity
        // 2. Call sword.hurtEnemy() with appropriate parameters
        // 3. Verify the target gets the expected effect applied
        
        // For demonstration purposes:
        assertTrue(true, "Special attack effect test - actual implementation needed");
    }
    
    @Test
    @DisplayName("Test sword takes damage when used")
    public void testDamageWhenUsed() {
        // This test verifies that the sword takes damage when used
        // In a real test implementation with mocks:
        
        // For demonstration purposes:
        int initialDamage = 0;
        // Use the sword...
        int finalDamage = 0;
        
        // assertEquals(initialDamage + 1, finalDamage, "Sword should take 1 damage when used");
        assertTrue(true, "Damage when used test - actual implementation needed");
    }
}`
        : `package com.example.mod.block;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.level.material.MapColor;
import net.minecraft.core.BlockPos;
import net.minecraft.world.level.Level;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.server.level.ServerLevel;
import net.minecraft.world.level.block.state.properties.BlockStateProperties;
import net.minecraft.core.Direction;

import com.example.mod.init.ModBlocks;

/**
 * Test suite for CustomBlock class
 * Generated by Claude AI
 */
@DisplayName("CustomBlock Tests")
public class CustomBlockTest {
    private CustomBlock block;
    private BlockState blockState;
    private BlockPos pos;
    private ServerLevel mockLevel;
    private Player mockPlayer;
    
    @BeforeEach
    public void setup() {
        // Create a new CustomBlock instance for each test
        block = new CustomBlock();
        blockState = block.defaultBlockState();
        pos = new BlockPos(0, 0, 0);
        
        // Initialize mocks for testing
        // Note: In a real test, you would use a mocking framework like Mockito
        mockLevel = null; // Mock ServerLevel
        mockPlayer = null; // Mock Player
    }
    
    @Test
    @DisplayName("Test block has correct map color")
    public void testMapColor() {
        assertEquals(MapColor.STONE, blockState.getMapColor(mockLevel, pos),
            "Block should have stone map color");
    }
    
    @Test
    @DisplayName("Test block has correct strength")
    public void testStrength() {
        float destroySpeed = blockState.getDestroySpeed(mockLevel, pos);
        assertEquals(3.0f, destroySpeed, 0.01f, 
            "Block should have correct destroy speed/hardness");
    }
    
    @Test
    @DisplayName("Test block requires correct tool")
    public void testRequiresTool() {
        assertTrue(blockState.requiresCorrectToolForDrops(),
            "Block should require correct tool for drops");
    }
    
    @Test
    @DisplayName("Test block state properties")
    public void testBlockStateProperties() {
        // Check if the block has the expected properties
        assertTrue(blockState.hasProperty(BlockStateProperties.FACING),
            "Block should have FACING property");
            
        // Test that it can be set to different directions
        BlockState northState = blockState.setValue(BlockStateProperties.FACING, Direction.NORTH);
        assertEquals(Direction.NORTH, northState.getValue(BlockStateProperties.FACING),
            "Block should support NORTH direction");
    }
    
    @Test
    @DisplayName("Test block interaction behavior")
    public void testInteractionBehavior() {
        // This test would verify the custom behavior when a player interacts with the block
        // In a real test implementation with mocks:
        
        // For demonstration purposes:
        assertTrue(true, "Interaction test - actual implementation needed");
    }
    
    @Test
    @DisplayName("Test block drops")
    public void testBlockDrops() {
        // This test would verify the items dropped when the block is broken
        // Requires mocking of LootContext and other components
        
        // For demonstration purposes:
        assertTrue(true, "Block drops test - actual implementation needed");
    }
}`;

      setGeneratedTestCode(testCode);
      setIsGeneratingTests(false);
      
      // Create new test suite with the generated test
      const newTest: TestCase = {
        id: `test-${Date.now()}`,
        name: `${generateTarget} Tests`,
        type: "unit",
        status: "pending",
        filePath: `src/test/java/com/example/mod/${generateTarget.toLowerCase()}/${generateTarget}Test.java`
      };
      
      const newSuite: TestSuite = {
        id: `suite-${Date.now()}`,
        name: `${generateTarget} Test Suite`,
        description: `Auto-generated tests for ${generateTarget}`,
        testCases: [newTest],
        status: "pending"
      };
      
      setTestSuites(prev => [...prev, newSuite]);
      
      toast({
        title: "Tests Generated",
        description: `Test code has been generated for ${generateTarget}.`,
      });
    }, 2500);
  };

  // Run all tests
  const handleRunTests = () => {
    setIsRunningTests(true);
    
    // In a real implementation, this would make an API call
    setTimeout(() => {
      // Simulate test runs by updating the status
      const updatedSuites = testSuites.map(suite => {
        // If the suite is pending, randomly determine if it passes or fails
        if (suite.status === "pending") {
          const allPassed = Math.random() > 0.3; // 70% chance of passing
          
          return {
            ...suite,
            status: allPassed ? "passed" : "failed",
            lastRun: new Date().toISOString(),
            coverage: Math.floor(Math.random() * 30) + 70, // Random coverage between 70-100%
            testCases: suite.testCases.map(test => {
              // If test was pending, give it a random outcome
              if (test.status === "pending") {
                const passed = allPassed || Math.random() > 0.3; // Higher chance of passing if the suite passes
                
                return {
                  ...test,
                  status: passed ? "passed" : "failed",
                  duration: Math.floor(Math.random() * 200) + 20, // Random duration between 20-220ms
                  errorMessage: passed ? undefined : "java.lang.AssertionError: Test failed with random error"
                };
              }
              
              return test;
            })
          };
        }
        
        return suite;
      });
      
      setTestSuites(updatedSuites);
      
      // Update selected suite if it was one of the ones that ran
      if (selectedSuite) {
        const updatedSelectedSuite = updatedSuites.find(s => s.id === selectedSuite.id);
        if (updatedSelectedSuite) {
          setSelectedSuite(updatedSelectedSuite);
        }
      }
      
      setIsRunningTests(false);
      
      toast({
        title: "Tests Completed",
        description: "All tests have been executed.",
      });
    }, 3000);
  };

  // Run a specific test suite
  const handleRunSuite = (suite: TestSuite) => {
    setIsRunningTests(true);
    
    // In a real implementation, this would make an API call
    setTimeout(() => {
      // Update just this suite
      const updatedSuites = testSuites.map(s => {
        if (s.id === suite.id) {
          const allPassed = Math.random() > 0.3; // 70% chance of passing
          
          return {
            ...s,
            status: allPassed ? "passed" : "failed",
            lastRun: new Date().toISOString(),
            coverage: Math.floor(Math.random() * 30) + 70, // Random coverage between 70-100%
            testCases: s.testCases.map(test => {
              return {
                ...test,
                status: allPassed || Math.random() > 0.3 ? "passed" : "failed",
                duration: Math.floor(Math.random() * 200) + 20, // Random duration between 20-220ms
                errorMessage: test.status === "passed" ? undefined : "java.lang.AssertionError: Test failed with random error"
              };
            })
          };
        }
        
        return s;
      });
      
      setTestSuites(updatedSuites);
      
      // Update selected suite if it was the one that ran
      if (selectedSuite && selectedSuite.id === suite.id) {
        const updatedSelectedSuite = updatedSuites.find(s => s.id === suite.id);
        if (updatedSelectedSuite) {
          setSelectedSuite(updatedSelectedSuite);
        }
      }
      
      setIsRunningTests(false);
      
      toast({
        title: "Suite Tests Completed",
        description: `Tests for "${suite.name}" have been executed.`,
      });
    }, 2000);
  };

  // Get the status icon for a test case
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "skipped":
        return <Share2 className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get the status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "passed":
        return "bg-green-900/20 text-green-400 border-green-900/50";
      case "failed":
        return "bg-red-900/20 text-red-400 border-red-900/50";
      case "pending":
        return "bg-yellow-900/20 text-yellow-400 border-yellow-900/50";
      case "skipped":
        return "bg-blue-900/20 text-blue-400 border-blue-900/50";
      default:
        return "bg-gray-900/20 text-gray-400 border-gray-700";
    }
  };

  // Format time duration in ms to a readable format
  const formatDuration = (ms?: number) => {
    if (!ms) return "N/A";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Format timestamp to a readable format
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "Never";
    
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-800/30 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-medium text-white">Automated Testing</h2>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsGenerateModalOpen(true)}
          >
            <Code className="h-4 w-4 mr-1" />
            Generate Tests
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Test
          </Button>
          
          <Button 
            size="sm"
            onClick={handleRunTests}
            disabled={isRunningTests}
          >
            {isRunningTests ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Run All Tests
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-grow flex overflow-hidden">
        <Tabs value={testingTab} onValueChange={setTestingTab} className="flex flex-col h-full w-full">
          <div className="bg-gray-800/30 px-4 pt-2">
            <TabsList className="bg-gray-800/50">
              <TabsTrigger value="suites">Test Suites</TabsTrigger>
              <TabsTrigger value="history">Test History</TabsTrigger>
              <TabsTrigger value="coverage">Coverage</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="suites" className="flex-grow flex overflow-hidden p-0">
            {/* Test Suites List */}
            <div className="w-1/3 border-r border-gray-700 overflow-auto">
              {testSuites.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <FlaskConical className="h-10 w-10 text-gray-500 mb-2" />
                  <p className="text-gray-400 mb-4">No test suites found</p>
                  <Button 
                    size="sm"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create First Test
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {testSuites.map(suite => (
                    <div key={suite.id} className="flex flex-col">
                      <div 
                        className={`p-3 cursor-pointer transition-colors ${
                          selectedSuite?.id === suite.id ? "bg-blue-900/30" : "hover:bg-gray-800/50"
                        }`}
                        onClick={() => {
                          handleSelectSuite(suite);
                          toggleSuiteExpansion(suite.id);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {expandedSuites[suite.id] ? (
                              <ChevronDown className="h-4 w-4 text-gray-400 mr-2" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />
                            )}
                            <div className="flex items-center">
                              {getStatusIcon(suite.status)}
                              <span className="ml-2 text-white font-medium">{suite.name}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <span className={`text-xs px-2 py-0.5 rounded border ${getStatusBadgeClass(suite.status)}`}>
                              {suite.status.charAt(0).toUpperCase() + suite.status.slice(1)}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="ml-1 h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRunSuite(suite);
                              }}
                              disabled={isRunningTests}
                            >
                              {isRunningTests ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
                              ) : (
                                <Play className="h-3.5 w-3.5 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-400 mt-1 truncate">
                          {suite.description}
                        </div>
                      </div>
                      
                      {expandedSuites[suite.id] && (
                        <div className="pl-6 pb-2 bg-gray-900/30">
                          {suite.testCases.map(test => (
                            <div 
                              key={test.id}
                              className={`flex items-center py-1.5 px-2 rounded mt-1 mx-2 cursor-pointer ${
                                selectedTest?.id === test.id ? "bg-blue-900/30" : "hover:bg-gray-800/70"
                              }`}
                              onClick={() => handleSelectTest(test)}
                            >
                              {getStatusIcon(test.status)}
                              <span className="ml-2 text-sm truncate">{test.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Test Details */}
            <div className="w-2/3 overflow-auto p-4">
              {selectedTest ? (
                // Test Case Details
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        {getStatusIcon(selectedTest.status)}
                        <h3 className="text-xl font-medium text-white ml-2">{selectedTest.name}</h3>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        {selectedTest.filePath}
                      </p>
                    </div>
                    
                    <div className="flex items-center">
                      <span className={`text-xs px-2 py-0.5 rounded border ${getStatusBadgeClass(selectedTest.status)}`}>
                        {selectedTest.status.charAt(0).toUpperCase() + selectedTest.status.slice(1)}
                      </span>
                      {selectedTest.duration && (
                        <span className="ml-2 text-sm text-gray-400">
                          <Clock className="h-3.5 w-3.5 inline mr-1" />
                          {formatDuration(selectedTest.duration)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 bg-gray-800/30 border-gray-700">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Test Type</h4>
                      <p className="text-white capitalize">{selectedTest.type}</p>
                    </Card>
                    
                    <Card className="p-4 bg-gray-800/30 border-gray-700">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Status</h4>
                      <div className="flex items-center">
                        {getStatusIcon(selectedTest.status)}
                        <span className="ml-2 text-white capitalize">{selectedTest.status}</span>
                      </div>
                    </Card>
                  </div>
                  
                  {selectedTest.errorMessage && (
                    <Card className="p-4 bg-red-900/20 border-red-900/50">
                      <h4 className="text-sm font-medium text-red-400 mb-2">Error Message</h4>
                      <div className="bg-gray-900 rounded-md p-3 overflow-x-auto">
                        <pre className="text-xs text-red-300 font-mono">{selectedTest.errorMessage}</pre>
                      </div>
                    </Card>
                  )}
                  
                  <Card className="p-4 bg-gray-800/30 border-gray-700">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-medium text-gray-300">Test Code</h4>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          // In a real implementation, this would open the file in the editor
                          toast({
                            title: "Opening file",
                            description: `Opening ${selectedTest.filePath} in editor.`,
                          });
                        }}
                      >
                        <FileText className="h-3.5 w-3.5 mr-1" />
                        Open File
                      </Button>
                    </div>
                    <div className="bg-gray-900 rounded-md p-3 overflow-x-auto">
                      <pre className="text-xs text-blue-300 font-mono">
                        {/* Sample test code for display */}
                        {selectedTest.type === "unit" ? 
                          `@Test
@DisplayName("${selectedTest.name}")
public void ${selectedTest.name.toLowerCase().replace(/\s+/g, "_")}() {
    // Arrange
    CustomBlock block = new CustomBlock();
    BlockState state = block.defaultBlockState();
    
    // Act
    boolean result = state.hasProperty(BlockStateProperties.FACING);
    
    // Assert
    assertTrue(result, "Block should have FACING property");
}` 
                          : 
                          `@Test
@DisplayName("${selectedTest.name}")
public void ${selectedTest.name.toLowerCase().replace(/\s+/g, "_")}() {
    // Arrange
    ServerLevel level = createTestLevel();
    BlockPos pos = new BlockPos(0, 0, 0);
    Player player = createTestPlayer(level);
    
    // Act
    level.setBlock(pos, ModBlocks.CUSTOM_BLOCK.get().defaultBlockState(), 3);
    
    // Interact with the block
    InteractionResult result = ModBlocks.CUSTOM_BLOCK.get().use(
        level.getBlockState(pos), level, pos, player, 
        InteractionHand.MAIN_HAND, BlockHitResult.miss(Vec3.ZERO, Direction.UP, pos)
    );
    
    // Assert
    assertEquals(InteractionResult.SUCCESS, result, "Block interaction should succeed");
}`}
                      </pre>
                    </div>
                  </Card>
                </div>
              ) : selectedSuite ? (
                // Test Suite Details
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        {getStatusIcon(selectedSuite.status)}
                        <h3 className="text-xl font-medium text-white ml-2">{selectedSuite.name}</h3>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        {selectedSuite.description}
                      </p>
                    </div>
                    
                    <div>
                      <Button 
                        onClick={() => handleRunSuite(selectedSuite)}
                        disabled={isRunningTests}
                      >
                        {isRunningTests ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Run Suite
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-4 bg-gray-800/30 border-gray-700">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Status</h4>
                      <div className="flex items-center">
                        {getStatusIcon(selectedSuite.status)}
                        <span className={`ml-2 text-white capitalize ${selectedSuite.status === "failed" ? "text-red-400" : selectedSuite.status === "passed" ? "text-green-400" : ""}`}>
                          {selectedSuite.status}
                        </span>
                      </div>
                    </Card>
                    
                    <Card className="p-4 bg-gray-800/30 border-gray-700">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Last Run</h4>
                      <p className="text-white">{formatTimestamp(selectedSuite.lastRun)}</p>
                    </Card>
                    
                    <Card className="p-4 bg-gray-800/30 border-gray-700">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Code Coverage</h4>
                      {selectedSuite.coverage ? (
                        <div className="flex items-center">
                          <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden mr-2">
                            <div 
                              className={`h-full ${
                                selectedSuite.coverage >= 80 ? "bg-green-500" : 
                                selectedSuite.coverage >= 50 ? "bg-yellow-500" : 
                                "bg-red-500"
                              }`}
                              style={{ width: `${selectedSuite.coverage}%` }}
                            ></div>
                          </div>
                          <span className="text-white">{selectedSuite.coverage}%</span>
                        </div>
                      ) : (
                        <p className="text-gray-400">Not measured</p>
                      )}
                    </Card>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Test Cases</h4>
                    <Card className="bg-gray-800/30 border-gray-700 overflow-hidden">
                      <div className="divide-y divide-gray-700">
                        {selectedSuite.testCases.map(test => (
                          <div 
                            key={test.id}
                            className="p-3 cursor-pointer hover:bg-gray-800/70"
                            onClick={() => handleSelectTest(test)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {getStatusIcon(test.status)}
                                <span className="ml-2 text-white">{test.name}</span>
                              </div>
                              
                              <div className="flex items-center">
                                <span className={`text-xs px-2 py-0.5 rounded border ${getStatusBadgeClass(test.status)}`}>
                                  {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                                </span>
                                {test.duration && (
                                  <span className="ml-2 text-sm text-gray-400">
                                    {formatDuration(test.duration)}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-xs text-gray-400 mt-1">
                              {test.filePath}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              ) : (
                // No selection
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <FlaskConical className="h-12 w-12 text-gray-500 mb-3" />
                  <h3 className="text-lg font-medium text-white mb-1">No Test Selected</h3>
                  <p className="text-gray-400 max-w-md mb-4">
                    Select a test suite or test case from the list to view details, or create a new test.
                  </p>
                  <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create New Test
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="flex-grow p-4 overflow-auto">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-white mb-4">Test Run History</h3>
              
              <Card className="bg-gray-800/30 border-gray-700 overflow-hidden">
                <div className="divide-y divide-gray-700">
                  <div className="p-3 flex items-center justify-between bg-gray-800">
                    <div className="flex-1 font-medium text-gray-300">Run Time</div>
                    <div className="flex-1 font-medium text-gray-300">Suite</div>
                    <div className="flex-1 font-medium text-gray-300">Status</div>
                    <div className="flex-1 font-medium text-gray-300">Duration</div>
                    <div className="flex-1 font-medium text-gray-300">Coverage</div>
                  </div>
                  
                  {testSuites
                    .filter(suite => suite.lastRun)
                    .sort((a, b) => {
                      // Sort by most recent first
                      return new Date(b.lastRun!).getTime() - new Date(a.lastRun!).getTime();
                    })
                    .map(suite => (
                      <div key={`${suite.id}-run`} className="p-3 hover:bg-gray-800/50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 text-white">{formatTimestamp(suite.lastRun)}</div>
                          <div className="flex-1 text-white">{suite.name}</div>
                          <div className="flex-1">
                            <span className={`text-xs px-2 py-0.5 rounded border ${getStatusBadgeClass(suite.status)}`}>
                              {suite.status.charAt(0).toUpperCase() + suite.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex-1 text-white">
                            {suite.testCases.reduce((total, test) => total + (test.duration || 0), 0)}ms
                          </div>
                          <div className="flex-1 text-white">
                            {suite.coverage ? `${suite.coverage}%` : "N/A"}
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  {testSuites.filter(suite => suite.lastRun).length === 0 && (
                    <div className="p-6 text-center text-gray-400">
                      No test runs recorded yet. Run your tests to see history.
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="coverage" className="flex-grow p-4 overflow-auto">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-white mb-1">Code Coverage</h3>
              <p className="text-gray-400 mb-4">Coverage report for your mod's code</p>
              
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card className="p-4 bg-gray-800/30 border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Overall Coverage</h4>
                  <div className="flex items-end">
                    <span className="text-3xl font-bold text-white">78%</span>
                    <span className="text-sm text-green-400 ml-2 mb-1">+3%</span>
                  </div>
                </Card>
                
                <Card className="p-4 bg-gray-800/30 border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Lines</h4>
                  <div className="flex items-end">
                    <span className="text-3xl font-bold text-white">82%</span>
                    <span className="text-sm text-green-400 ml-2 mb-1">+5%</span>
                  </div>
                </Card>
                
                <Card className="p-4 bg-gray-800/30 border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Branches</h4>
                  <div className="flex items-end">
                    <span className="text-3xl font-bold text-white">65%</span>
                    <span className="text-sm text-yellow-400 ml-2 mb-1">+1%</span>
                  </div>
                </Card>
                
                <Card className="p-4 bg-gray-800/30 border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Functions</h4>
                  <div className="flex items-end">
                    <span className="text-3xl font-bold text-white">74%</span>
                    <span className="text-sm text-green-400 ml-2 mb-1">+2%</span>
                  </div>
                </Card>
              </div>
              
              <h4 className="text-sm font-medium text-gray-300 mb-3">Coverage by Package</h4>
              <Card className="bg-gray-800/30 border-gray-700 overflow-hidden">
                <div className="divide-y divide-gray-700">
                  <div className="p-3 flex items-center justify-between bg-gray-800">
                    <div className="flex-[2] font-medium text-gray-300">Package</div>
                    <div className="flex-1 font-medium text-gray-300">Line %</div>
                    <div className="flex-1 font-medium text-gray-300">Branch %</div>
                    <div className="flex-1 font-medium text-gray-300">Function %</div>
                    <div className="flex-1 font-medium text-gray-300">Files</div>
                  </div>
                  
                  <div className="p-3 hover:bg-gray-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex-[2] text-white">com.example.mod.block</div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden mr-2">
                            <div className="h-full bg-green-500" style={{ width: "92%" }}></div>
                          </div>
                          <span className="text-white">92%</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden mr-2">
                            <div className="h-full bg-yellow-500" style={{ width: "76%" }}></div>
                          </div>
                          <span className="text-white">76%</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden mr-2">
                            <div className="h-full bg-green-500" style={{ width: "85%" }}></div>
                          </div>
                          <span className="text-white">85%</span>
                        </div>
                      </div>
                      <div className="flex-1 text-white">5</div>
                    </div>
                  </div>
                  
                  <div className="p-3 hover:bg-gray-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex-[2] text-white">com.example.mod.item</div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden mr-2">
                            <div className="h-full bg-green-500" style={{ width: "88%" }}></div>
                          </div>
                          <span className="text-white">88%</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden mr-2">
                            <div className="h-full bg-yellow-500" style={{ width: "71%" }}></div>
                          </div>
                          <span className="text-white">71%</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden mr-2">
                            <div className="h-full bg-green-500" style={{ width: "80%" }}></div>
                          </div>
                          <span className="text-white">80%</span>
                        </div>
                      </div>
                      <div className="flex-1 text-white">4</div>
                    </div>
                  </div>
                  
                  <div className="p-3 hover:bg-gray-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex-[2] text-white">com.example.mod.entity</div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden mr-2">
                            <div className="h-full bg-yellow-500" style={{ width: "67%" }}></div>
                          </div>
                          <span className="text-white">67%</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden mr-2">
                            <div className="h-full bg-red-500" style={{ width: "43%" }}></div>
                          </div>
                          <span className="text-white">43%</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden mr-2">
                            <div className="h-full bg-yellow-500" style={{ width: "62%" }}></div>
                          </div>
                          <span className="text-white">62%</span>
                        </div>
                      </div>
                      <div className="flex-1 text-white">3</div>
                    </div>
                  </div>
                  
                  <div className="p-3 hover:bg-gray-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex-[2] text-white">com.example.mod.init</div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden mr-2">
                            <div className="h-full bg-green-500" style={{ width: "95%" }}></div>
                          </div>
                          <span className="text-white">95%</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden mr-2">
                            <div className="h-full bg-green-500" style={{ width: "93%" }}></div>
                          </div>
                          <span className="text-white">93%</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden mr-2">
                            <div className="h-full bg-green-500" style={{ width: "98%" }}></div>
                          </div>
                          <span className="text-white">98%</span>
                        </div>
                      </div>
                      <div className="flex-1 text-white">4</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="flex-grow p-4 overflow-auto">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-white mb-1">Test Settings</h3>
              <p className="text-gray-400 mb-4">Configure test execution and reporting</p>
              
              <div className="space-y-4">
                <Card className="p-4 bg-gray-800/30 border-gray-700">
                  <h4 className="text-sm font-medium text-white mb-3">Test Framework</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="test-framework" className="text-sm text-gray-400 mb-1 block">Framework</Label>
                      <Select defaultValue="junit5">
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue placeholder="Select framework" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="junit5">JUnit 5</SelectItem>
                          <SelectItem value="junit4">JUnit 4</SelectItem>
                          <SelectItem value="testng">TestNG</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="test-method" className="text-sm text-gray-400 mb-1 block">Test Method</Label>
                      <Select defaultValue="integration">
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="unit">Unit Tests</SelectItem>
                          <SelectItem value="integration">Integration Tests</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 bg-gray-800/30 border-gray-700">
                  <h4 className="text-sm font-medium text-white mb-3">Coverage Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="coverage-tool" className="text-sm text-gray-400 mb-1 block">Coverage Tool</Label>
                      <Select defaultValue="jacoco">
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue placeholder="Select tool" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="jacoco">JaCoCo</SelectItem>
                          <SelectItem value="cobertura">Cobertura</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="coverage-threshold" className="text-sm text-gray-400 mb-1 block">Minimum Coverage</Label>
                      <Select defaultValue="70">
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue placeholder="Select threshold" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="50">50%</SelectItem>
                          <SelectItem value="70">70%</SelectItem>
                          <SelectItem value="80">80%</SelectItem>
                          <SelectItem value="90">90%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 bg-gray-800/30 border-gray-700">
                  <h4 className="text-sm font-medium text-white mb-3">Build Integration</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="build-integration" className="text-sm text-gray-400 mb-1 block">Run Tests on Build</Label>
                      <Select defaultValue="always">
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue placeholder="Select when" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="always">Always</SelectItem>
                          <SelectItem value="changes">Only on Changes</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="fail-build" className="text-sm text-gray-400 mb-1 block">Fail Build on Test Failure</Label>
                      <Select defaultValue="true">
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
                
                <div className="flex justify-end pt-2">
                  <Button 
                    onClick={() => {
                      toast({
                        title: "Settings Saved",
                        description: "Test settings have been updated.",
                      });
                    }}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Save Settings
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Create Test Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Create New Test</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add a new test suite or test case to your project.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="test-name">Test Name</Label>
              <Input 
                id="test-name" 
                value={newTestName}
                onChange={(e) => setNewTestName(e.target.value)}
                placeholder="E.g., CustomBlock Properties Test"
                className="bg-gray-800 border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="test-type">Test Type</Label>
              <Select value={newTestType} onValueChange={setNewTestType}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="unit">Unit Test</SelectItem>
                  <SelectItem value="integration">Integration Test</SelectItem>
                  <SelectItem value="performance">Performance Test</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="test-description">Description (Optional)</Label>
              <Textarea 
                id="test-description" 
                value={newTestDescription}
                onChange={(e) => setNewTestDescription(e.target.value)}
                placeholder="Describe what this test is checking..."
                className="bg-gray-800 border-gray-700 min-h-[80px]"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTest}>
              Create Test
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Generate Tests Modal */}
      <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Generate Tests with Claude AI</DialogTitle>
            <DialogDescription className="text-gray-400">
              Automatically generate test cases for your NeoForge 1.21.5 mod components.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col flex-grow overflow-hidden">
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="generate-target">Class to Test</Label>
                <Select 
                  value={generateTarget} 
                  onValueChange={setGenerateTarget}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select a class to test" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="CustomBlock">CustomBlock</SelectItem>
                    <SelectItem value="CustomBlockWithEntity">CustomBlockWithEntity</SelectItem>
                    <SelectItem value="CustomItem">CustomItem</SelectItem>
                    <SelectItem value="CustomSword">CustomSword</SelectItem>
                    <SelectItem value="CustomEntity">CustomEntity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Button 
                  onClick={handleGenerateTests}
                  disabled={!generateTarget || isGeneratingTests}
                  className="w-full"
                >
                  {isGeneratingTests ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating tests...
                    </>
                  ) : (
                    <>
                      <GitCommit className="h-4 w-4 mr-2" />
                      Generate Tests
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex-grow overflow-auto mt-4">
              {generatedTestCode ? (
                <div className="space-y-2">
                  <Label className="text-sm text-gray-400">Generated Test Code</Label>
                  <div className="bg-gray-800/50 rounded-md p-4 overflow-auto h-[400px]">
                    <pre className="text-xs text-blue-300 font-mono">
                      {generatedTestCode}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] bg-gray-800/20 rounded-md p-6 text-center border border-dashed border-gray-700">
                  <Code className="h-10 w-10 text-gray-500 mb-3" />
                  <h3 className="text-white font-medium mb-2">No Test Code Generated Yet</h3>
                  <p className="text-gray-400 max-w-md">
                    Select a class and click "Generate Tests" to create comprehensive unit tests for your NeoForge 1.21.5 mod components.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-700 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsGenerateModalOpen(false)}
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                // In a real implementation, this would create a new test file
                setIsGenerateModalOpen(false);
                toast({
                  title: "Test Code Applied",
                  description: `Test code for ${generateTarget} has been saved.`,
                });
              }}
              disabled={!generatedTestCode}
            >
              Apply & Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}