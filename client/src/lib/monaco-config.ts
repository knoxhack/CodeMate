import * as monaco from "monaco-editor";

let isConfigured = false;

export function configureMonaco() {
  if (isConfigured) return;

  // Register Java language
  monaco.languages.register({ id: 'java' });

  // Java syntax highlighting
  monaco.languages.setMonarchTokensProvider('java', {
    defaultToken: 'invalid',
    tokenPostfix: '.java',

    keywords: [
      'abstract', 'continue', 'for', 'new', 'switch', 'assert', 'default', 
      'goto', 'package', 'synchronized', 'boolean', 'do', 'if', 'private', 
      'this', 'break', 'double', 'implements', 'protected', 'throw', 'byte', 
      'else', 'import', 'public', 'throws', 'case', 'enum', 'instanceof', 
      'return', 'transient', 'catch', 'extends', 'int', 'short', 'try', 
      'char', 'final', 'interface', 'static', 'void', 'class', 'finally', 
      'long', 'strictfp', 'volatile', 'const', 'float', 'native', 'super', 'while'
    ],

    typeKeywords: [
      'boolean', 'double', 'byte', 'int', 'short', 'char', 'void', 'long', 'float'
    ],

    operators: [
      '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
      '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
      '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
      '%=', '<<=', '>>=', '>>>='
    ],

    symbols: /[=><!~?:&|+\-*\/\^%]+/,
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
    digits: /\d+(_+\d+)*/,
    octaldigits: /[0-7]+(_+[0-7]+)*/,
    binarydigits: /[0-1]+(_+[0-1]+)*/,
    hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,

    tokenizer: {
      root: [
        // Package and import statements
        [/^(package)(\s+)/, ['keyword', { token: '', next: '@package' }]],
        [/^(import)(\s+)/, ['keyword', { token: '', next: '@import' }]],

        // Identifiers and keywords
        [/[a-z_$][\w$]*/, {
          cases: {
            '@typeKeywords': 'type',
            '@keywords': 'keyword',
            '@default': 'identifier'
          }
        }],
        [/[A-Z][\w$]*/, 'type.identifier'],

        // Whitespace
        { include: '@whitespace' },

        // Delimiters and operators
        [/[{}()\[\]]/, '@brackets'],
        [/[<>](?!@symbols)/, '@brackets'],
        [/@symbols/, {
          cases: {
            '@operators': 'operator',
            '@default': ''
          }
        }],

        // Numbers
        [/(@digits)[eE]([\-+]?(@digits))?[fFdD]?/, 'number.float'],
        [/(@digits)\.(@digits)([eE][\-+]?(@digits))?[fFdD]?/, 'number.float'],
        [/0[xX](@hexdigits)[lL]?/, 'number.hex'],
        [/0(@octaldigits)[lL]?/, 'number.octal'],
        [/0[bB](@binarydigits)[lL]?/, 'number.binary'],
        [/(@digits)[lL]?/, 'number'],

        // Delimiter: after number because of .\d floats
        [/[;,.]/, 'delimiter'],

        // Strings
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/"/, 'string', '@string'],

        // Characters
        [/'[^\\']'/, 'string'],
        [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
        [/'/, 'string.invalid']
      ],

      whitespace: [
        [/[ \t\r\n]+/, ''],
        [/\/\*\*(?!\/)/, 'comment.doc', '@javadoc'],
        [/\/\*/, 'comment', '@comment'],
        [/\/\/.*$/, 'comment']
      ],

      comment: [
        [/[^\/*]+/, 'comment'],
        [/\*\//, 'comment', '@pop'],
        [/[\/*]/, 'comment']
      ],

      javadoc: [
        [/[^\/*]+/, 'comment.doc'],
        [/\*\//, 'comment.doc', '@pop'],
        [/[\/*]/, 'comment.doc']
      ],

      string: [
        [/[^\\"]+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/"/, 'string', '@pop']
      ],

      package: [
        [/[A-Za-z]\w*/, 'package'],
        [/\./, 'delimiter'],
        [/;/, 'delimiter', '@pop'],
      ],

      import: [
        [/[A-Za-z]\w*/, 'import'],
        [/\./, 'delimiter'],
        [/;/, 'delimiter', '@pop'],
        [/\*/, 'import'],
      ]
    }
  });

  // Code completion
  monaco.languages.registerCompletionItemProvider('java', {
    provideCompletionItems: () => {
      const suggestions = [
        {
          label: 'public',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'public'
        },
        {
          label: 'private',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'private'
        },
        {
          label: 'class',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'class'
        },
        {
          label: 'interface',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'interface'
        },
        {
          label: 'extends',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'extends'
        },
        {
          label: 'implements',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'implements'
        },
        {
          label: 'return',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'return'
        },
        {
          label: 'void',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'void'
        },
        {
          label: 'static',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'static'
        },
        {
          label: 'import',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'import'
        },
        {
          label: 'package',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'package'
        },
        {
          label: 'final',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'final'
        },
        {
          label: 'boolean',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'boolean'
        },
        {
          label: 'int',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'int'
        },
        {
          label: 'float',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'float'
        },
        {
          label: 'double',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'double'
        },
        {
          label: 'String',
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: 'String'
        },
        // NeoForge specific suggestions
        {
          label: 'DeferredRegister',
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: 'DeferredRegister'
        },
        {
          label: 'RegistryObject',
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: 'RegistryObject'
        },
        {
          label: 'DataComponent',
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: 'DataComponent'
        },
        {
          label: 'RegisterEvent',
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: 'RegisterEvent'
        },
        {
          label: 'FMLClientSetupEvent',
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: 'FMLClientSetupEvent'
        },
        {
          label: 'sout',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'System.out.println(${1:message});',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        },
        {
          label: 'psvm',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'public static void main(String[] args) {\n\t${1}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        },
        {
          label: 'for',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n\t${3}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        },
        {
          label: 'if',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'if (${1:condition}) {\n\t${2}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        }
      ];
      
      return { suggestions };
    }
  });

  isConfigured = true;
}
