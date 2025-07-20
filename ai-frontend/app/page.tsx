"use client";

import { ROUTE_MAPPER } from "@/common/constant";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useState } from "react";

export default function Dashboard() {
  const [selectedProject, setSelectedProject] = useState({
    id: "simple-ai-chat",
    name: "Simple AI Chat",
  });
  const Component = ROUTE_MAPPER[selectedProject.id]?.component;

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider defaultOpen={true}>
        <AppSidebar
          selectedProject={selectedProject}
          onProjectSelect={setSelectedProject}
        />
        <SidebarInset>
          <Component
            project={selectedProject}
            disableFileUpload={
              ROUTE_MAPPER[selectedProject.id]?.disableFileUpload
            }
          />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
