import { LangchainChatInterface } from "@/components/langchain-chat-interface";
import { SimpleChatInterface } from "@/components/simple-chat-interface";
import {
  BarChart3,
  BookUser,
  Bot,
  Code2,
  FileSearch,
  Headphones,
  LayoutDashboard,
  Settings,
  Workflow,
} from "lucide-react";

export const DEFAULT_LLM_MODEL = "deepseek-r1:1.5b";

export const ROUTE_MAPPER: any = {
  "simple-ai-chat": {
    endpoint: "http://127.0.0.1:11434",
    component: SimpleChatInterface,
    disableFileUpload: true,
    chatEndPoint: "/api/generate",
  },
  "langchain-ai-chat-langchain": {
    endpoint: "http://127.0.0.1:8000/api/langchain-ai",
    component: LangchainChatInterface,
    chatEndPoint: "/chat",
    disableFileUpload: true,
  },
  "document-search-qa-web-app": {
    endpoint: "http://127.0.0.1:8000/api/langchain-ai",
    component: SimpleChatInterface,
    chatEndPoint: "/api/generate",
  },
  "knowledge-base-chatbot": {
    endpoint: "http://127.0.0.1:8000/api/langchain-ai",
    component: SimpleChatInterface,
    chatEndPoint: "/api/generate",
  },
  "automated-customer-support": {
    endpoint: "http://127.0.0.1:8000/api/langchain-ai",
    component: SimpleChatInterface,
    chatEndPoint: "/api/generate",
  },
  "code-review": {
    endpoint: "http://127.0.0.1:8000/api/langchain-ai",
    component: SimpleChatInterface,
    chatEndPoint: "/api/generate",
  },
  "dynamic-report-generation": {
    endpoint: "http://127.0.0.1:8000/api/langchain-ai",
    component: SimpleChatInterface,
    chatEndPoint: "/api/generate",
  },
  "multi-agent-system": {
    endpoint: "http://127.0.0.1:8000/api/langchain-ai",
    component: SimpleChatInterface,
    chatEndPoint: "/api/generate",
  },
};
export const Projects = [
  {
    id: "simple-ai-chat",
    name: "Simple AI Chat",
    icon: Bot,
  },
  {
    id: "langchain-ai-chat-langchain",
    name: "Langchain AI Chat",
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

export const NavigationItems = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
  { id: "settings", name: "Settings", icon: Settings },
];
