import type {
  HealthCheckResponse,
  Conversation,
  Message,
  CreateConversationRequest,
  ConversationDetailResponse,
  StreamChunk,
} from '../types';

const API_BASE = '/api';

export const checkHealth = async (): Promise<HealthCheckResponse> => {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  return response.json();
};

export const getConversations = async (): Promise<Conversation[]> => {
  const response = await fetch(`${API_BASE}/conversations`);
  if (!response.ok) {
    throw new Error('Failed to fetch conversations');
  }
  return response.json();
};

export const createConversation = async (
  data: CreateConversationRequest
): Promise<Conversation> => {
  const response = await fetch(`${API_BASE}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create conversation');
  }
  return response.json();
};

export const getConversation = async (
  id: string
): Promise<ConversationDetailResponse> => {
  const response = await fetch(`${API_BASE}/conversations/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch conversation');
  }
  return response.json();
};

export const deleteConversation = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/conversations/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete conversation');
  }
};

export const updateConversationTitle = async (
  id: string,
  title: string
): Promise<Conversation> => {
  const response = await fetch(`${API_BASE}/conversations/${id}/title`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) {
    throw new Error('Failed to update conversation title');
  }
  return response.json();
};

export async function* streamChat(
  conversationId: string,
  message: string,
  thinkingEnabled: boolean
): AsyncGenerator<StreamChunk, void, unknown> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversation_id: conversationId,
      message,
      thinking_enabled: thinkingEnabled,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          yield data as StreamChunk;
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }

  // Process remaining buffer
  if (buffer.startsWith('data: ')) {
    try {
      const data = JSON.parse(buffer.slice(6));
      yield data as StreamChunk;
    } catch {
      // Skip invalid JSON
    }
  }
}
