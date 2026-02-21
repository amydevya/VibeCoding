import type { Conversation, Message } from '../types';

export const mockConversations: Conversation[] = [
  {
    id: '1',
    title: '第一次对话',
    thinkingEnabled: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    title: '深度思考测试',
    thinkingEnabled: true,
    createdAt: '2024-01-14T14:00:00Z',
    updatedAt: '2024-01-14T15:00:00Z',
  },
];

export const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: '1-1',
      conversationId: '1',
      role: 'user',
      content: '你好，请介绍一下你自己',
      reasoningContent: null,
      createdAt: '2024-01-15T10:00:00Z',
    },
    {
      id: '1-2',
      conversationId: '1',
      role: 'assistant',
      content: '你好！我是一个基于 DeepSeek 的 AI 助手。我可以帮助你回答问题、进行对话、提供建议等。有什么我可以帮助你的吗？',
      reasoningContent: null,
      createdAt: '2024-01-15T10:00:30Z',
    },
  ],
  '2': [
    {
      id: '2-1',
      conversationId: '2',
      role: 'user',
      content: '请帮我分析一下人工智能的发展趋势',
      reasoningContent: null,
      createdAt: '2024-01-14T14:00:00Z',
    },
    {
      id: '2-2',
      conversationId: '2',
      role: 'assistant',
      content: '根据我的分析，人工智能的发展趋势主要包括以下几个方面：\n\n1. **大语言模型的持续进化**：模型规模和能力不断提升\n2. **多模态融合**：文本、图像、音频、视频的统一理解\n3. **AI Agent 的兴起**：具备自主决策和行动能力的智能体\n4. **边缘计算与端侧 AI**：在设备端运行的高效模型',
      reasoningContent: '让我思考一下人工智能的发展趋势...\n\n首先，从技术层面来看，大语言模型（LLM）正在经历快速发展，参数规模从数十亿到数万亿不等...\n\n其次，多模态学习正在成为主流，GPT-4V、Gemini 等模型已经展示了强大的多模态能力...\n\n再者，AI Agent 的概念正在兴起，AutoGPT、BabyAGI 等项目展示了 AI 自主完成复杂任务的潜力...\n\n综合以上分析，我可以给出一个全面的回答。',
      createdAt: '2024-01-14T14:01:00Z',
    },
  ],
};

const mockResponses = [
  '这是一个很好的问题！让我来详细解答一下。\n\n首先，我们需要理解问题的核心...',
  '感谢你的提问！我会尽力提供一个全面的回答。\n\n根据我的理解，这个话题涉及多个方面...',
  '好的，我来帮你分析一下这个问题。\n\n从技术角度来看，这是一个非常有趣的挑战...',
];

const mockThinkingContent = [
  '让我仔细思考这个问题...\n\n首先，我需要理解用户的意图...\n然后，我会分析相关的背景知识...\n最后，我会给出一个结构化的回答。',
  '这是一个复杂的问题，需要从多个角度来分析...\n\n1. 从技术层面考虑...\n2. 从应用层面考虑...\n3. 从未来发展趋势考虑...',
];

export async function* mockStreamResponse(thinkingEnabled: boolean = false) {
  const responseIndex = Math.floor(Math.random() * mockResponses.length);
  const response = mockResponses[responseIndex];
  
  if (thinkingEnabled) {
    const thinkingIndex = Math.floor(Math.random() * mockThinkingContent.length);
    const thinking = mockThinkingContent[thinkingIndex];
    
    for (const char of thinking) {
      yield { type: 'reasoning' as const, data: char };
      await new Promise(r => setTimeout(r, 15));
    }
    
    await new Promise(r => setTimeout(r, 300));
  }
  
  for (const char of response) {
    yield { type: 'content' as const, data: char };
    await new Promise(r => setTimeout(r, 25));
  }
}
