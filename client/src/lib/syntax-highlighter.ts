import Prism from 'prismjs';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-groovy';
import 'prismjs/components/prism-toml';

/**
 * Determines the language for syntax highlighting based on code block context or file extension
 */
export function detectLanguage(code: string, fileExtension?: string): string {
  // Use file extension if available
  if (fileExtension) {
    const extension = fileExtension.toLowerCase();
    if (extension === 'java') return 'java';
    if (extension === 'json') return 'json';
    if (extension === 'html') return 'markup';
    if (extension === 'xml') return 'markup';
    if (extension === 'css') return 'css';
    if (extension === 'js') return 'javascript';
    if (extension === 'ts') return 'typescript';
    if (extension === 'tsx') return 'tsx';
    if (extension === 'gradle') return 'groovy';
    if (extension === 'toml') return 'toml';
  }
  
  // Try to detect by code content
  if (code.includes('class ') && code.includes('public static void main')) return 'java';
  if (code.includes('import net.minecraft')) return 'java';
  if (code.includes('import net.neoforged')) return 'java';
  if (code.trim().startsWith('{') && code.trim().endsWith('}')) return 'json';
  if (code.includes('<html') || code.includes('<!DOCTYPE')) return 'markup';
  if (code.includes('function(') || code.includes('=>')) return 'javascript';
  if (code.includes(':') && code.includes(';')) return 'css';
  if (code.includes('interface ') && code.includes('extends')) return 'typescript';
  
  // Default to java for Minecraft modding context
  return 'java';
}

/**
 * Highlights code using Prism.js
 */
export function highlightCode(code: string, language?: string): string {
  const detectedLanguage = language || detectLanguage(code);
  
  try {
    // Check if Prism has the language loaded
    if (Prism.languages[detectedLanguage]) {
      return Prism.highlight(code, Prism.languages[detectedLanguage], detectedLanguage);
    }
    // Fallback to basic text
    return code;
  } catch (error) {
    console.error('Syntax highlighting error:', error);
    return code;
  }
}

/**
 * Process text content to highlight code blocks
 * Detects code blocks marked with triple backticks and applies syntax highlighting
 */
export function processContentWithCodeBlocks(content: string): string {
  if (!content) return '';
  
  // Replace code blocks with highlighted HTML
  return content.replace(/```(?:([\w-]+)\n)?([\s\S]*?)```/g, (_, lang, code) => {
    const language = lang || detectLanguage(code);
    const highlightedCode = highlightCode(code, language);
    
    return `<pre class="language-${language}"><code class="language-${language}">${highlightedCode}</code></pre>`;
  });
}