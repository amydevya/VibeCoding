import { create } from 'zustand';
import type { Conversation, Message } from '../types';
import * as api from '../services/api';

interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  isInitialized: boolean;
  streamingMessage: {
    content: string;
    reasoningContent: string;
  } | null;
  thinkingEnabled: boolean;
  error: string | null;
  
  initialize: () => Promise<void>;
  setCurrentConversation: (id: string | null) => Promise<void>;
  createConversation: () => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, title: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  setThinkingEnabled: (enabled: boolean) => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  messages: [],
  isLoading: false,
  isInitialized: false,
  streamingMessage: null,
  thinkingEnabled: false,
  error: null,
  
  initialize: async () => {
    if (get().isInitialized) return;
    
    try {
      const conversations = await api.getConversations();
      set({
        conversations,
        isInitialized: true,
        currentConversationId: conversations[0]?.id || null,
      });
      
      if (conversations[0]) {
        const detail = await api.getConversation(conversations[0].id);
        set({
          messages: detail.messages,
          thinkingEnabled: detail.conversation.thinkingEnabled,
        });
      }
    } catch (error) {
      console.error('Failed to initialize:', error);
      set({ isInitialized: true, error: 'Failed to load conversations' });
    }
  },
  
  setCurrentConversation: async (id) => {
    if (!id) {
      set({
        currentConversationId: null,
        messages: [],
        streamingMessage: null,
      });
      return;
    }
    
    try {
      const detail = await api.getConversation(id);
      set({
        currentConversationId: id,
        messages: detail.messages,
        thinkingEnabled: detail.conversation.thinkingEnabled,
        streamingMessage: null,
      });
    } catch (error) {
      console.error('Failed to load conversation:', error);
      set({ error: 'Failed to load conversation' });
    }
  },
  
  createConversation: async () => {
    try {
      const newConversation = await api.createConversation({
        title: '新对话',
        thinking_enabled: get().thinkingEnabled,
      });
      
      set((state) => ({
        conversations: [newConversation, ...state.conversations],
        currentConversationId: newConversation.id,
        messages: [],
        streamingMessage: null,
      }));
    } catch (error) {
      console.error('Failed to create conversation:', error);
      set({ error: 'Failed to create conversation' });
    }
  },
  
  deleteConversation: async (id) => {
    try {
      await api.deleteConversation(id);
      
      set((state) => {
        const newConversations = state.conversations.filter(c => c.id !== id);
        const newCurrentId = state.currentConversationId === id
          ? (newConversations[0]?.id || null)
          : state.currentConversationId;
        
        return {
          conversations: newConversations,
          currentConversationId: newCurrentId,
        };
      });
      
      const newCurrentId = get().currentConversationId;
      if (newCurrentId) {
        await get().setCurrentConversation(newCurrentId);
      } else {
        set({ messages: [] });
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      set({ error: 'Failed to delete conversation' });
    }
  },
  
  renameConversation: async (id, title) => {
    try {
      const updated = await api.updateConversationTitle(id, title);
      set((state) => ({
        conversations: state.conversations.map(c =>
          c.id === id ? updated : c
        ),
      }));
    } catch (error) {
      console.error('Failed to rename conversation:', error);
      set({ error: 'Failed to rename conversation' });
    }
  },
  
  sendMessage: async (content) => {
    const { currentConversationId, thinkingEnabled } = get();
    if (!currentConversationId || !content.trim()) return;
    
    const trimmedContent = content.trim();
    
    const tempUserMessage: Message = {
      id: 'temp-' + Date.now(),
      conversationId: currentConversationId,
      role: 'user',
      content: trimmedContent,
      reasoningContent: null,
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({
      messages: [...state.messages, tempUserMessage],
      isLoading: true,
      streamingMessage: { content: '', reasoningContent: '' },
      error: null,
    }));
    
    let fullContent = '';
    let fullReasoning = '';
    
    try {
      for await (const chunk of api.streamChat(currentConversationId, trimmedContent, thinkingEnabled)) {
        if (chunk.type === 'reasoning' && chunk.content) {
          fullReasoning += chunk.content;
        } else if (chunk.type === 'content' && chunk.content) {
          fullContent += chunk.content;
        } else if (chunk.type === 'error') {
          throw new Error(chunk.message || 'Stream error');
        }
        
        set({
          streamingMessage: {
            content: fullContent,
            reasoningContent: fullReasoning,
          },
        });
      }
      
      // Reload conversation to get the saved messages with correct IDs
      const detail = await api.getConversation(currentConversationId);
      
      set({
        messages: detail.messages,
        conversations: get().conversations.map(c =>
          c.id === currentConversationId
            ? { ...c, title: detail.conversation.title, updatedAt: detail.conversation.updatedAt }
            : c
        ),
        isLoading: false,
        streamingMessage: null,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      set({
        isLoading: false,
        streamingMessage: null,
        error: error instanceof Error ? error.message : 'Failed to send message',
      });
    }
  },
  
  setThinkingEnabled: (enabled) => {
    set({ thinkingEnabled: enabled });
  },
  
  clearError: () => {
    set({ error: null });
  },
}));
