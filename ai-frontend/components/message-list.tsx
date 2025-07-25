"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/types";
import { Bot, User } from "lucide-react";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}
function preprocessMessage(content: string): string {
  return content
    .replaceAll("<think>", "**🤔 Think:** ")
    .replaceAll("</think>", "");
}
function MessageBubble({
  message,
  isLatest,
}: {
  message: Message;
  isLatest: boolean;
}) {
  const displayContent = message.content;
  const processedContent = preprocessMessage(displayContent);
  return (
    <div
      className={`flex gap-3 ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      {message.role === "assistant" && (
        <Avatar className="h-8 w-8 border border-border/40">
          <AvatarFallback className="bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={`max-w-[80%] space-y-2 ${
          message.role === "user" ? "order-first" : ""
        }`}
      >
        <div
          className={`rounded-lg px-4 py-2 text-sm ${
            message.role === "user"
              ? "bg-muted border border-border/40 ml-auto"
              : "bg-muted border border-border/40"
          }`}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap break-words">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {processedContent}
            </ReactMarkdown>
          </div>

          {message.files && message.files.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.files.map((file, index) => (
                <div key={index} className="text-xs opacity-70">
                  📎 {file.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div
          className={`text-xs text-muted-foreground ${
            message.role === "user" ? "text-right" : ""
          }`}
        >
          {message.created_at.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      {message.role === "user" && (
        <Avatar className="h-8 w-8 border border-border/40">
          <AvatarFallback className="bg-secondary">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 p-8">
      <div className="space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
            <p className="text-muted-foreground max-w-md">
              Ask me anything about your project. I'm here to help with
              analysis, suggestions, and answers.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={index}
              message={message}
              isLatest={index === messages.length - 1}
            />
          ))
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <Avatar className="h-8 w-8 border border-border/40">
              <AvatarFallback className="bg-primary/10">
                <Bot className="h-4 w-4 text-primary animate-pulse" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-muted border border-border/40 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
