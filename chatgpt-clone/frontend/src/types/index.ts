export interface Conversation {
  id: string;
  title: string;
  thinkingEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  reasoningContent: string | null;
  createdAt: string;
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  version: string;
}

export interface ChatRequest {
  conversationId: string;
  message: string;
  thinkingEnabled: boolean;
}

export interface StreamChunk {
  type: 'reasoning' | 'content' | 'done' | 'error';
  content?: string;
  message?: string;
}

export interface CreateConversationRequest {
  title?: string;
  thinking_enabled: boolean;
}

export interface ConversationDetailResponse {
  conversation: Conversation;
  messages: Message[];
}
