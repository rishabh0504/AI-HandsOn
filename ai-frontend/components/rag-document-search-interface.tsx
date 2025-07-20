"use client";

import { ROUTE_MAPPER } from "@/common/constant";
import { ChatInput } from "@/components/chat-input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useFetchStream } from "@/hooks/use-fetch-stream";
import { Message } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { MessageList } from "./message-list";

interface RagBasedLangchainChatInterfaceProps {
  project: { id: string; name: string };
  disableFileUpload: boolean;
}

export function RagBasedLangchainChatInterface({
  project,
  disableFileUpload,
}: RagBasedLangchainChatInterfaceProps) {
  const { fetchStream, loading, message } = useFetchStream();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (message) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "user") {
        setMessages((prev) => [...prev, message]);
      } else {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: message.content,
            created_at: message.created_at,
            done: message.done,
          };
          return updated;
        });
      }
    }
  }, [message]);

  const handleChatMessages = useCallback(
    async (content: string, files?: File[]) => {
      // Insert the user message first
      setMessages((prev) => [
        ...prev,
        { content, role: "user", files: [], created_at: new Date() },
      ]);
      const selectedProjectConfig = ROUTE_MAPPER[project.id];
      await fetchStream(
        `${selectedProjectConfig.endpoint}${selectedProjectConfig.chatEndPoint}`,
        JSON.stringify({ query: content })
      );
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
          <h1 className="text-lg font-semibold">{project.name}</h1>
          <p className="text-sm text-muted-foreground">AI Assistant Chat</p>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden p-4">
        <Card className="flex flex-1 flex-col overflow-hidden border-border/40 bg-card/50">
          <MessageList messages={messages} isLoading={loading} />
          <ChatInput
            onSendMessage={handleChatMessages}
            isLoading={loading}
            disableFileUpload={disableFileUpload}
          />
        </Card>
      </div>
    </div>
  );
}
