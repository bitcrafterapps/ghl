'use client';

import { useState, useRef, useEffect } from 'react';
import { messagesApi, ChatMessage as ApiChatMessage, generationsApi } from '@/lib/builder-api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  files?: Array<{ name: string; path: string }>;
}

export type ModificationIntent = 'fix' | 'enhance' | 'add_feature' | 'style_change' | 'refactor';

interface ChatPanelProps {
  projectId: string;
  onGenerate?: (prompt: string) => void;
  onModify?: (result: { modifiedFiles: Array<{ path: string; content: string; action: string }>; explanation: string }) => void;
  isGenerating?: boolean;
  existingFiles?: Array<{ path: string; content: string }>;
  hasExistingProject?: boolean;
  onAssistantMessage?: (message: Message) => void;
}

// Intent detection from prompt
function detectIntent(prompt: string): ModificationIntent | null {
  const lower = prompt.toLowerCase();
  
  // Fix patterns
  if (/fix|error|bug|broken|not working|doesn't work|crash|issue|wrong/.test(lower)) {
    return 'fix';
  }
  
  // Style patterns
  if (/color|theme|dark|light|style|css|font|spacing|margin|padding|layout|visual|look|appearance/.test(lower)) {
    return 'style_change';
  }
  
  // Refactor patterns
  if (/refactor|clean|split|organize|rename|restructure|cleanup|improve code/.test(lower)) {
    return 'refactor';
  }
  
  // Add feature patterns - be careful, these should trigger full generation more often
  if (/add|create|new page|new feature|implement|build a/.test(lower)) {
    // If it's a simple addition to existing, treat as enhance, otherwise add_feature
    if (/add.*button|add.*loading|add.*animation|add.*icon|add.*tooltip/.test(lower)) {
      return 'enhance';
    }
    return 'add_feature';
  }
  
  // Enhance patterns
  if (/improve|enhance|better|loading|spinner|animation|transition|hover|update/.test(lower)) {
    return 'enhance';
  }
  
  return null;
}

export function ChatPanel({ 
  projectId, 
  onGenerate, 
  onModify,
  isGenerating = false, 
  existingFiles = [],
  hasExistingProject = false,
  onAssistantMessage 
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isModifying, setIsModifying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Determine if we're in modification mode (project has existing files)
  const isModificationMode = hasExistingProject || existingFiles.length > 0;

  // Fetch chat history
  const loadMessages = async () => {
    try {
      console.log('[ChatPanel] Loading messages for project:', projectId);
      setIsLoadingHistory(true);
      const apiMessages = await messagesApi.getMessages(projectId);
      
      console.log('[ChatPanel] Received', apiMessages.length, 'messages from API');
      
      // Convert API messages to component format
      const formattedMessages: Message[] = apiMessages.map(msg => ({
        id: msg.id,
        role: msg.role.toLowerCase() as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.createdAt),
        files: msg.metadata?.files,
      }));
      
      setMessages(formattedMessages);
      console.log('[ChatPanel] Chat history loaded successfully');
    } catch (error) {
      console.log('[ChatPanel] Failed to load chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Fetch chat history on mount and when project changes
  useEffect(() => {
    loadMessages();
  }, [projectId]);

  // Refetch when generation finishes
  useEffect(() => {
    if (!isGenerating && !isModifying) {
      loadMessages();
    }
  }, [isGenerating, isModifying]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating, isModifying]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating || isModifying) return;

    const messageContent = input.trim();
    setInput(''); // Clear input immediately for better UX

    try {
      // Optimistic update
      const optimisticMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: messageContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, optimisticMessage]);

      // Save to database
      const savedMessage = await messagesApi.createMessage(projectId, 'USER', messageContent);
      console.log('[ChatPanel] Message saved to DB:', savedMessage.id);
      
      // Determine if we should use focused modification or full generation
      const intent = detectIntent(messageContent);
      const shouldUseModification = isModificationMode && intent;
      
      if (shouldUseModification && existingFiles.length > 0 && onModify) {
        // Use focused modification
        console.log('[ChatPanel] Using focused modification with intent:', intent);
        setIsModifying(true);
        
        try {
          const result = await generationsApi.modify(projectId, {
            prompt: messageContent,
            allFiles: existingFiles,
            intent: intent,
          });
          
          console.log('[ChatPanel] Modification result:', result);
          
          // Save assistant response to DB
          const assistantContent = result.explanation || 
            `I've modified ${result.modifiedFiles.length} file(s) for you.`;
          
          const savedAssistantMessage = await messagesApi.createMessage(projectId, 'ASSISTANT', assistantContent, {
            files: result.modifiedFiles.map(f => ({ name: f.path.split('/').pop() || f.path, path: f.path })),
            modificationType: result.intent
          });

          // Optimistically update UI with assistant response
          const assistantMessage: Message = {
            id: savedAssistantMessage.id,
            role: 'assistant',
            content: savedAssistantMessage.content,
            timestamp: new Date(savedAssistantMessage.createdAt),
            files: savedAssistantMessage.metadata?.files
          };
          setMessages((prev) => [...prev, assistantMessage]);
          
          // Call the onModify handler to apply changes
          onModify(result);
          
        } catch (error) {
          console.error('[ChatPanel] Modification failed:', error);
          // Fall back to full generation on error
          onGenerate?.(messageContent);
        } finally {
          setIsModifying(false);
        }
      } else {
        // Use full generation
        console.log('[ChatPanel] Using full generation');
        onGenerate?.(messageContent);
      }
    } catch (error) {
      console.error('Failed to save message to database:', error);
      
      // We already added the optimistic message, so no need to add another fallback
      // But we should probably indicate error. For now, we'll let it slide but trigger onGenerate
      
      // Still trigger generation even if save failed
      onGenerate?.(messageContent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Different prompts based on mode
  const initialPrompts = [
    { icon: '🎨', text: 'Create a landing page with hero section' },
    { icon: '🔐', text: 'Add user authentication' },
    { icon: '📊', text: 'Build a dashboard with charts' },
    { icon: '📝', text: 'Create a contact form' },
  ];

  const modificationPrompts = [
    { icon: '🔧', text: 'Fix the current error', intent: 'fix' as const },
    { icon: '🎨', text: 'Change the color scheme to dark mode', intent: 'style_change' as const },
    { icon: '✨', text: 'Add a loading spinner', intent: 'enhance' as const },
    { icon: '📄', text: 'Add a new page', intent: 'add_feature' as const },
    { icon: '🧹', text: 'Refactor for better organization', intent: 'refactor' as const },
  ];

  const suggestedPrompts = isModificationMode ? modificationPrompts : initialPrompts;
  const isProcessing = isGenerating || isModifying;

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      {/* Mode indicator */}
      {isModificationMode && (
        <div className="px-4 py-2 bg-blue-900/30 border-b border-blue-700/50">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-blue-400">✏️</span>
            <span className="text-blue-300">Modification Mode</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">{existingFiles.length} files in project</span>
          </div>
        </div>
      )}
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-sky-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
              <span className="text-3xl">{isModificationMode ? '✏️' : '✨'}</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {isModificationMode ? 'Modify Your Project' : 'Start Building'}
            </h3>
            <p className="text-zinc-400 text-sm mb-6 max-w-sm">
              {isModificationMode 
                ? "Describe what you'd like to change. I'll make focused updates without regenerating everything."
                : "Describe what you want to build and I'll generate the code for you."}
            </p>
            <div className="w-full space-y-2">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInput(prompt.text)}
                  className="w-full px-4 py-3 text-left text-sm bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 rounded-xl hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-200 flex items-center gap-3"
                >
                  <span className="text-lg">{prompt.icon}</span>
                  <span>{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-800 text-zinc-100 border border-zinc-700/50'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  
                  {/* File changes indicator */}
                  {message.files && message.files.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-700/50">
                      <p className="text-xs text-zinc-400 mb-2">Files changed:</p>
                      <div className="flex flex-wrap gap-1">
                        {message.files.map((file, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs bg-zinc-900 rounded-md text-zinc-300 font-mono"
                          >
                            {file.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 border border-zinc-700/50 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-zinc-400">
                      {isModifying ? 'Making changes...' : 'Generating code...'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-zinc-800">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isModificationMode 
              ? "Describe what you'd like to change..." 
              : "Describe what you want to build..."}
            className="w-full px-4 py-3 pr-12 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[48px] max-h-[200px]"
            rows={1}
            disabled={isProcessing}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-zinc-500 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
