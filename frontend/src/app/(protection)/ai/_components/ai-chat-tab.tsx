'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import ReactMarkdown from 'react-markdown';
import { Bot, Send, Trash2, MessageSquare, Settings, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const AiChatTab = () => {
  const [localInput, setLocalInput] = useState('');
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/ai/chat',
        credentials: 'include',
      }),
    [],
  );

  const { messages, sendMessage, isLoading, setMessages } = useChat({
    transport,
  } as any) as any;

  // Check AI Configuration
  useEffect(() => {
    fetch('/api/ai/settings')
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        setIsConfigured(!!(data && data.apiKey));
      })
      .catch(() => {
        setIsConfigured(false);
      });
  }, []);

  // Persist messages to localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('ai-chat-messages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Failed to parse saved AI messages', e);
      }
    }
  }, [setMessages]);

  useEffect(() => {
    localStorage.setItem('ai-chat-messages', JSON.stringify(messages));
  }, [messages]);

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localInput.trim() || isLoading || !isConfigured) return;
    sendMessage({ text: localInput });
    setLocalInput('');
  };

  const handleClearChat = () => {
    if (confirm('Clear chat history?')) {
      setMessages([]);
      localStorage.removeItem('ai-chat-messages');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] min-h-[500px] rounded-xl border border-border bg-background overflow-hidden shadow-sm">
      {/* Chat Header */}
      <div className="px-6 py-3 border-b border-border flex items-center justify-between bg-primary/5">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <Bot size={18} className="text-primary" />
          <span>AI Assistant Chat</span>
        </div>
        <button
          onClick={handleClearChat}
          className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors text-muted-foreground"
          title="Clear Chat"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isConfigured === null ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : isConfigured === false ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="p-4 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full">
              <AlertCircle size={36} />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-xl">Configuration Required</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Please configure your AI provider and API key in the{' '}
                <strong>Settings</strong> tab to start chatting.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Settings size={14} />
              <span>Switch to the Settings tab above</span>
            </div>
          </div>
        ) : (
          <>
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-12">
                <MessageSquare className="mx-auto mb-3 opacity-20" size={56} />
                <p className="text-base font-medium">How can I help you today?</p>
                <p className="text-sm opacity-70 mt-1 max-w-sm">
                  Ask me anything about your finances, trading strategies, or projects.
                </p>
              </div>
            )}
            {messages.map((m: any) => (
              <div
                key={m.id}
                className={cn(
                  'max-w-[85%] p-3 rounded-xl text-sm leading-relaxed',
                  m.role === 'user'
                    ? 'ml-auto bg-primary text-primary-foreground rounded-br-sm'
                    : 'mr-auto bg-muted rounded-bl-sm',
                )}
              >
                <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                  <ReactMarkdown>
                    {typeof m.content === 'string'
                      ? m.content
                      : m.text ||
                        (m.parts &&
                          m.parts
                            .filter((p: any) => p.type === 'text')
                            .map((p: any) => p.text)
                            .join('\n')) ||
                        ''}
                  </ReactMarkdown>
                </div>
                {m.toolInvocations?.map((toolInvocation: any) => {
                  const toolCallId = toolInvocation.toolCallId;
                  if (toolInvocation.state === 'call') {
                    return (
                      <div
                        key={toolCallId}
                        className="mt-2 p-2 border border-primary/20 bg-primary/10 rounded flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider"
                      >
                        <span className="animate-pulse w-1.5 h-1.5 bg-primary rounded-full" />
                        Executing {toolInvocation.toolName}...
                      </div>
                    );
                  }
                  if (toolInvocation.state === 'result') {
                    return (
                      <div
                        key={toolCallId}
                        className="mt-2 p-2 border border-border bg-background/50 rounded text-[10px] text-muted-foreground"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono">{toolInvocation.toolName}</span>
                          <span className="text-secondary-foreground opacity-50 uppercase">
                            Success
                          </span>
                        </div>
                        <div className="max-h-20 overflow-hidden text-ellipsis whitespace-nowrap opacity-60">
                          {JSON.stringify(toolInvocation.result)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            ))}
            {isLoading && (
              <div className="mr-auto bg-muted p-3 rounded-xl rounded-bl-sm text-sm animate-pulse">
                Assistant is thinking...
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={onFormSubmit}
        className="p-4 border-t border-border flex gap-2 bg-background"
      >
        <input
          value={localInput}
          onChange={(e) => setLocalInput(e.target.value)}
          placeholder={isConfigured ? 'Ask anything...' : 'Configure AI to start chatting'}
          disabled={!isConfigured || isLoading}
          className="flex-1 bg-muted border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none disabled:opacity-50 transition-all"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isLoading || !localInput.trim() || !isConfigured}
          className="px-4"
        >
          <Send size={16} />
        </Button>
      </form>
    </div>
  );
};
