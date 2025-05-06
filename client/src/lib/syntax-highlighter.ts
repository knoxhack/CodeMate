import Prism from 'prismjs';

// Import language definitions
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-toml';

/**
 * Determines the language for syntax highlighting based on code block context or file extension
 */
export function detectLanguage(code: string, fileExtension?: string): string {
  // Use file extension if provided
  if (fileExtension) {
    switch (fileExtension.toLowerCase()) {
      case 'java': return 'java';
      case 'json': return 'json';
      case 'js': return 'javascript';
      case 'jsx': return 'jsx';
      case 'ts': return 'typescript';
      case 'tsx': return 'tsx';
      case 'css': return 'css';
      case 'html': return 'html';
      case 'xml': return 'xml';
      case 'md': return 'markdown';
      case 'sh': case 'bash': return 'bash';
      case 'yaml': case 'yml': return 'yaml';
      case 'toml': return 'toml';
      default: return 'java'; // Default to Java for Minecraft mods
    }
  }

  // Try to detect from code content
  if (code.includes('class') && (code.includes('public') || code.includes('private'))) {
    return 'java';
  }

  if (code.startsWith('{') && code.endsWith('}')) {
    return 'json';
  }

  if (code.includes('function') || code.includes('const ') || code.includes('let ')) {
    return 'javascript';
  }

  if (code.includes('<') && code.includes('/>')) {
    return 'jsx';
  }

  // Default to Java for Minecraft mod context
  return 'java';
}

/**
 * Highlights code using Prism.js
 */
export function highlightCode(code: string, language?: string): string {
  if (!code) return '';
  
  const lang = language || detectLanguage(code);
  
  try {
    // Ensure the language exists in Prism
    if (Prism.languages[lang]) {
      return Prism.highlight(code, Prism.languages[lang], lang);
    } else {
      // Fallback to plain text if language not supported
      return code;
    }
  } catch (error) {
    console.error('Error highlighting code:', error);
    return code;
  }
}

/**
 * Process text content to highlight code blocks
 * Detects code blocks marked with triple backticks and applies syntax highlighting
 */
export function processContentWithCodeBlocks(content: string): string {
  if (!content) return '';

  // Match triple backtick code blocks
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  
  return content.replace(codeBlockRegex, (match, lang, code) => {
    const language = lang || detectLanguage(code);
    const highlightedCode = highlightCode(code, language);
    
    return `<pre class="prism-code language-${language}"><code class="language-${language}">${highlightedCode}</code></pre>`;
  });
}