interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  files?: File[]
}

const STORAGE_KEY = "ai-dashboard-chats"

export function getChatHistory(projectId: string): Message[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const allChats = JSON.parse(stored)
    const projectChat = allChats[projectId] || []

    // Convert timestamp strings back to Date objects
    return projectChat.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }))
  } catch (error) {
    console.error("Error loading chat history:", error)
    return []
  }
}

export function saveChatHistory(projectId: string, messages: Message[]): void {
  if (typeof window === "undefined") return

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const allChats = stored ? JSON.parse(stored) : {}

    allChats[projectId] = messages
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allChats))
  } catch (error) {
    console.error("Error saving chat history:", error)
  }
}

export function clearChatHistory(projectId: string): void {
  if (typeof window === "undefined") return

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return

    const allChats = JSON.parse(stored)
    delete allChats[projectId]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allChats))
  } catch (error) {
    console.error("Error clearing chat history:", error)
  }
}
