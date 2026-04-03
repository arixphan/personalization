'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import ReactMarkdown from 'react-markdown';
import { Bot, X, Send, Minus, MessageSquare, Trash2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const AiAssistantPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [localInput, setLocalInput] = useState('');
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  
  const transport = useMemo(() => new DefaultChatTransport({
    api: '/api/ai/chat',
    credentials: 'include',
  }), []);

  const { messages, sendMessage, isLoading, setMessages } = useChat({
    transport,
  } as any) as any;
  
  // Check AI Configuration
  useEffect(() => {
    fetch('/api/ai/settings')
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        setIsConfigured(!!(data && data.apiKey));
      })
      .catch(err => {
        console.error('Failed to check AI settings', err);
        setIsConfigured(false);
      });
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('ai-chat-messages');
    const savedIsOpen = localStorage.getItem('ai-chat-open');

    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Failed to parse saved AI messages', e);
      }
    }
    if (savedIsOpen === 'true') setIsOpen(true);
  }, [setMessages]);

  useEffect(() => {
    localStorage.setItem('ai-chat-messages', JSON.stringify(messages));
    localStorage.setItem('ai-chat-open', String(isOpen));
  }, [messages, isOpen]);

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localInput.trim() || isLoading || !isConfigured) return;

    sendMessage({ text: localInput });
    setLocalInput('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform z-50"
      >
        <Bot size={24} />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-6 w-96 bg-background border border-border rounded-xl shadow-2xl z-50 flex flex-col h-[600px] transition-all duration-300 overflow-hidden"
    >
      <div className="p-4 border-b border-border flex items-center justify-between bg-primary/5">
        <div className="flex items-center gap-2 font-semibold">
          <Bot size={20} className="text-primary" />
          <span>AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => {
              if (confirm('Clear chat history?')) {
                setMessages([]);
                localStorage.removeItem('ai-chat-messages');
              }
            }} 
            className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
            title="Clear Chat"
          >
            <Trash2 size={16} />
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-muted rounded" title="Minimize">
            <Minus size={18} />
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-muted rounded" title="Close">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isConfigured === false ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full">
              <Settings size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Configuration Required</h3>
              <p className="text-sm text-muted-foreground">
                Please set up your AI Provider and API Key to start chatting.
              </p>
            </div>
            <Button asChild variant="default" className="w-full">
              <Link href="/ai">Configure AI Assistant</Link>
            </Button>
          </div>
        ) : isConfigured === null ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground mt-10">
                <MessageSquare className="mx-auto mb-2 opacity-20" size={48} />
                <p>Hello! How can I help you manage your finances, trading, or projects today?</p>
              </div>
            )}
            {messages.map((m: any) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[85%] p-3 rounded-lg text-sm",
                  m.role === 'user' 
                    ? "ml-auto bg-primary text-primary-foreground" 
                    : "mr-auto bg-muted"
                )}
              >
                <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                  <ReactMarkdown>
                    {typeof m.content === 'string' 
                      ? m.content 
                      : (m.text || (m.parts && m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\n')) || '')}
                  </ReactMarkdown>
                </div>
                {m.toolInvocations?.map((toolInvocation: any) => {
                  const toolCallId = toolInvocation.toolCallId;

                  if (toolInvocation.state === 'call') {
                    return (
                      <div key={toolCallId} className="mt-2 p-2 border border-primary/20 bg-primary/10 rounded flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                        <span className="animate-pulse w-1.5 h-1.5 bg-primary rounded-full"></span>
                        Executing {toolInvocation.toolName}...
                      </div>
                    );
                  }
                  
                  if (toolInvocation.state === 'result') {
                    return (
                      <div key={toolCallId} className="mt-2 p-2 border border-border bg-background/50 rounded text-[10px] text-muted-foreground">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono">{toolInvocation.toolName}</span>
                          <span className="text-secondary-foreground opacity-50 uppercase">Success</span>
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
              <div className="mr-auto bg-muted p-3 rounded-lg text-sm animate-pulse">
                Assistant is thinking...
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={onFormSubmit} className="p-4 border-t border-border flex gap-2 bg-background">
        <input
          value={localInput}
          onChange={(e) => setLocalInput(e.target.value)}
          placeholder={isConfigured ? "Ask anything..." : "Configuration required"}
          disabled={!isConfigured || isLoading}
          className="flex-1 bg-muted border-none rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none disabled:opacity-50"
        />
        <Button type="submit" size="sm" disabled={isLoading || !localInput.trim() || !isConfigured}>
          <Send size={16} />
        </Button>
      </form>
    </div>
  );
};
