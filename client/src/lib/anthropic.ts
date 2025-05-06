import { apiRequest } from "./queryClient";
import { ChatMessage } from "@/types/project";

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const MODEL = "claude-3-7-sonnet-20250219";

// Get responses from Claude
export async function getChatResponse(messages: ChatMessage[]): Promise<ChatMessage> {
  try {
    const response = await apiRequest('POST', '/api/chat', {
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    });
    
    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('Error getting chat response:', error);
    return {
      role: 'assistant',
      content: 'I encountered an error processing your request. Please try again.'
    };
  }
}

// Generate code from a natural language description
export async function generateCode(prompt: string, language: string): Promise<string> {
  try {
    const response = await apiRequest('POST', '/api/generate-code', {
      prompt,
      language
    });
    
    const data = await response.json();
    return data.code;
  } catch (error) {
    console.error('Error generating code:', error);
    throw new Error('Failed to generate code');
  }
}

// Fix errors in code based on console output
export async function fixErrorInCode(
  code: string,
  errorMessage: string,
  language: string
): Promise<string> {
  try {
    const response = await apiRequest('POST', '/api/fix-error', {
      code,
      errorMessage,
      language
    });
    
    const data = await response.json();
    return data.fixedCode;
  } catch (error) {
    console.error('Error fixing code:', error);
    throw new Error('Failed to fix code error');
  }
}
