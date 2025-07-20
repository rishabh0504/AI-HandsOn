"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { ChatInterface } from "@/components/chat-interface";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SimpleChatInterface } from "@/components/simple-chat-interface";

export default function Dashboard() {
  const [selectedProject, setSelectedProject] = useState({
    id: "simple-ai-chat",
    name: "Simple AI Chat",
  });

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider defaultOpen={true}>
        <AppSidebar
          selectedProject={selectedProject}
          onProjectSelect={setSelectedProject}
        />
        <SidebarInset>
          {selectedProject.id === "simple-ai-chat" ? (
            <SimpleChatInterface project={selectedProject} />
          ) : (
            <ChatInterface project={selectedProject} />
          )}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
