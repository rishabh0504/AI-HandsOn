"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { ChatInterface } from "@/components/chat-interface";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function Dashboard() {
  const [selectedProject, setSelectedProject] = useState("simple-ai-chat");

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider defaultOpen={true}>
        <AppSidebar
          selectedProject={selectedProject}
          onProjectSelect={setSelectedProject}
        />
        <SidebarInset>
          <ChatInterface projectId={selectedProject} />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
