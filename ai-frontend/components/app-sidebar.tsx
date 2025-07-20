"use client";

import {
  Folder,
  LayoutDashboard,
  Settings,
  User,
  Bot,
  FileSearch,
  BookUser,
  Headphones,
  Code2,
  BarChart3,
  Workflow,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  selectedProject: { id: string; name: string };
  onProjectSelect: (project: { id: string; name: string }) => void;
}

const projects = [
  {
    id: "simple-ai-chat",
    name: "Simple AI Chat",
    icon: Bot,
  },
  {
    id: "document-search-qa-web-app",
    name: "Document Search & Q&A Web App",
    icon: FileSearch,
  },
  {
    id: "knowledge-base-chatbot",
    name: "Personal Knowledge Base Chatbot",
    icon: BookUser,
  },
  {
    id: "automated-customer-support",
    name: "Automated Customer Support",
    icon: Headphones,
  },
  {
    id: "code-review",
    name: "AI-Powered Code Review",
    icon: Code2,
  },
  {
    id: "dynamic-report-generation",
    name: "Dynamic Report Generation from Data",
    icon: BarChart3,
  },
  {
    id: "multi-agent-system",
    name: "Multi-Agent System for Workflow Automation",
    icon: Workflow,
  },
];

const navigationItems = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
  { id: "settings", name: "Settings", icon: Settings },
];

export function AppSidebar({
  selectedProject,
  onProjectSelect,
}: AppSidebarProps) {
  return (
    <Sidebar className="border-r border-border/40">
      <SidebarHeader className="border-b border-border/40 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">AI Dashboard</span>
            <span className="text-xs text-muted-foreground">
              Professional Suite
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-2 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton className="w-full justify-start gap-3 px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-2 mb-2">
            Projects
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton
                    isActive={selectedProject.id === project.id}
                    onClick={() => onProjectSelect(project)}
                    className="w-full justify-start gap-3 px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
                  >
                    <project.icon className="h-4 w-4" />
                    <span>{project.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="w-full justify-start gap-3 px-3 py-2">
              <User className="h-4 w-4" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">John Doe</span>
                <span className="text-xs text-muted-foreground">
                  john@example.com
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
