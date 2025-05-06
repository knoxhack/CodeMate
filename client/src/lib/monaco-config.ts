import * as monaco from 'monaco-editor';

/**
 * Configure Monaco Editor with special settings for Minecraft modding
 */
export function configureMonaco() {
  // Set dark theme
  monaco.editor.defineTheme('minecraft-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '#cc7832', fontStyle: 'bold' },
      { token: 'comment', foreground: '#808080', fontStyle: 'italic' },
      { token: 'string', foreground: '#6a8759' },
      { token: 'number', foreground: '#6897bb' },
      { token: 'type', foreground: '#afb42b' },
      { token: 'annotation', foreground: '#bbb529' },
      { token: 'field', foreground: '#9876aa' },
    ],
    colors: {
      'editor.background': '#1e1e1e',
      'editor.foreground': '#d4d4d4',
      'editorCursor.foreground': '#a5a5a5',
      'editor.lineHighlightBackground': '#2f2f2f',
      'editorLineNumber.foreground': '#5a5a5a',
      'editor.selectionBackground': '#214283',
      'editor.inactiveSelectionBackground': '#3a3d41',
    },
  });

  // Set theme as default
  monaco.editor.setTheme('minecraft-dark');

  // Add Minecraft-specific code completion providers
  addNeoForgeCompletions();
}

/**
 * Add code completion suggestions for NeoForge 1.21.5
 */
function addNeoForgeCompletions() {
  // Java language provider
  monaco.languages.registerCompletionItemProvider('java', {
    triggerCharacters: ['.', '@'],
    provideCompletionItems: (model, position) => {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions: monaco.languages.CompletionItem[] = [];

      // Minecraft/NeoForge imports
      if (textUntilPosition.trim().startsWith('import') || textUntilPosition.includes('import net.')) {
        suggestions.push(
          {
            label: 'net.minecraft.core.component.DataComponents',
            kind: monaco.languages.CompletionItemKind.Reference,
            insertText: 'net.minecraft.core.component.DataComponents',
            range,
          },
          {
            label: 'net.minecraft.world.item.Item',
            kind: monaco.languages.CompletionItemKind.Reference,
            insertText: 'net.minecraft.world.item.Item',
            range,
          },
          {
            label: 'net.minecraft.world.item.component.Weapon',
            kind: monaco.languages.CompletionItemKind.Reference,
            insertText: 'net.minecraft.world.item.component.Weapon',
            range,
          },
          {
            label: 'net.neoforged.neoforge.registries.DeferredRegister',
            kind: monaco.languages.CompletionItemKind.Reference,
            insertText: 'net.neoforged.neoforge.registries.DeferredRegister',
            range,
          },
          {
            label: 'net.neoforged.neoforge.registries.RegistryObject',
            kind: monaco.languages.CompletionItemKind.Reference,
            insertText: 'net.neoforged.neoforge.registries.RegistryObject',
            range,
          }
        );
      }

      // DataComponents for item properties
      if (textUntilPosition.includes('DataComponents.')) {
        suggestions.push(
          {
            label: 'WEAPON',
            kind: monaco.languages.CompletionItemKind.Field,
            insertText: 'WEAPON',
            detail: 'DataComponents.WEAPON - For weapon items',
            range,
          },
          {
            label: 'TOOL',
            kind: monaco.languages.CompletionItemKind.Field,
            insertText: 'TOOL',
            detail: 'DataComponents.TOOL - For tool items',
            range,
          },
          {
            label: 'ARMOR',
            kind: monaco.languages.CompletionItemKind.Field,
            insertText: 'ARMOR',
            detail: 'DataComponents.ARMOR - For armor items',
            range,
          },
          {
            label: 'BLOCKS_ATTACKS',
            kind: monaco.languages.CompletionItemKind.Field,
            insertText: 'BLOCKS_ATTACKS',
            detail: 'DataComponents.BLOCKS_ATTACKS - For shields',
            range,
          }
        );
      }

      // Item properties builder methods
      if (textUntilPosition.includes('new Item.Properties()') || textUntilPosition.includes('Properties().')) {
        suggestions.push(
          {
            label: 'sword',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'sword()',
            detail: 'Configures this item as a sword',
            range,
          },
          {
            label: 'axe',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'axe()',
            detail: 'Configures this item as an axe',
            range,
          },
          {
            label: 'pickaxe',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'pickaxe()',
            detail: 'Configures this item as a pickaxe',
            range,
          },
          {
            label: 'shovel',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'shovel()',
            detail: 'Configures this item as a shovel',
            range,
          },
          {
            label: 'hoe',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'hoe()',
            detail: 'Configures this item as a hoe',
            range,
          },
          {
            label: 'durability',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'durability(${1:1000})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Sets item durability',
            range,
          },
          {
            label: 'stacksTo',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'stacksTo(${1:64})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Sets item stack size',
            range,
          },
          {
            label: 'add',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'add(${1:DataComponents}, ${2:component})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Adds a data component to the item',
            range,
          }
        );
      }

      // Block properties
      if (textUntilPosition.includes('BlockBehaviour.Properties') || textUntilPosition.includes('Properties.')) {
        suggestions.push(
          {
            label: 'of',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'of(${1:BlockSetType})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Creates new block properties',
            range,
          },
          {
            label: 'strength',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'strength(${1:1.5f}, ${2:6.0f})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Sets hardness and resistance',
            range,
          },
          {
            label: 'requiresCorrectToolForDrops',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'requiresCorrectToolForDrops()',
            detail: 'Makes block require the correct tool',
            range,
          },
          {
            label: 'sound',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'sound(${1:SoundType})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Sets the block sound',
            range,
          }
        );
      }

      return {
        suggestions,
      };
    },
  });
}