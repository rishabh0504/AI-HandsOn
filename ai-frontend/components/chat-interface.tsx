"use client";

import { ChatInput } from "@/components/chat-input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useFetchStream } from "@/hooks/use-fetch-stream";
import { useCallback, useEffect, useRef, useState } from "react";
import { Message, MessageList } from "./message-list";

interface ChatInterfaceProps {
  projectId: string;
}

export function ChatInterface({ projectId }: ChatInterfaceProps) {
  const { fetchStream, loading, message } = useFetchStream();
  const [messages, setMessages] = useState<Message[]>([]);

  const projectName = projectId
    .replace("-", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  useEffect(() => {
    console.table(message);
    if (!message?.done) {
      // setMessages(prev=>[
      //   ...prev, prev[]
      // ])
    }
    // if no entry in the messages, then use this one
  }, [message]);

  const handleChatMessages = useCallback(
    async (content: string, files?: File[]) => {
      // Insert the user message first
      setMessages((prev) => [
        ...prev,
        { content, role: "user", files: [], timestamp: new Date() },
      ]);
      await fetchStream("/api/generate", content);
    },
    []
  );
  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold">{projectName}</h1>
          <p className="text-sm text-muted-foreground">AI Assistant Chat</p>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden p-4">
        <Card className="flex flex-1 flex-col overflow-hidden border-border/40 bg-card/50">
          <MessageList messages={messages} isLoading={loading} />
          <ChatInput onSendMessage={handleChatMessages} isLoading={loading} />
        </Card>
      </div>
    </div>
  );
}
