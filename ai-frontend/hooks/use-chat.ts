"use client"

import { useState, useCallback } from "react"
import { getChatHistory, saveChatHistory } from "@/lib/chat-storage"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  files?: File[]
}

export function useChat(projectId: string) {
  const [messages, setMessages] = useState<Message[]>(() => getChatHistory(projectId))
  const [isLoading, setIsLoading] = useState(false)

  const reset = useCallback(() => {
    const history = getChatHistory(projectId)
    setMessages(history)
  }, [projectId])

  const simulateAIResponse = useCallback(async (userMessage: string, files?: File[]): Promise<string> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    const responses = [
      `I understand you're asking about "${userMessage.slice(0, 50)}${userMessage.length > 50 ? "..." : ""}". Let me help you with that.

Based on your query, I can provide several insights:

1. **Analysis**: This appears to be related to your current project requirements.
2. **Recommendations**: I suggest considering the following approaches...
3. **Next Steps**: Here's what I recommend moving forward.

${files && files.length > 0 ? `\nI also notice you've uploaded ${files.length} file(s). I'll analyze these and incorporate the findings into my response.` : ""}

Would you like me to elaborate on any of these points?`,

      `Great question! Let me break this down for you:

**Key Points:**
• This is an important consideration for your project
• There are multiple approaches we could take
• Each has its own benefits and trade-offs

**My Recommendation:**
Based on the context of your project, I'd suggest starting with a focused approach that allows for iteration and improvement.

${files && files.length > 0 ? `\nRegarding the uploaded files, I'll review them and provide specific feedback based on their content.` : ""}

What specific aspect would you like to explore further?`,

      `Excellent! I can help you with that. Here's my analysis:

**Current Situation:**
Your query touches on several important aspects that are crucial for project success.

**Detailed Response:**
1. **Technical Considerations**: The approach you're considering has merit
2. **Implementation Strategy**: I recommend a phased approach
3. **Potential Challenges**: Be aware of these common pitfalls
4. **Success Metrics**: Here's how to measure progress

${files && files.length > 0 ? `\nI see you've shared ${files.length} file(s) with me. This additional context will help me provide more targeted advice.` : ""}

Is there a particular area you'd like me to focus on?`,
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }, [])

  const sendMessage = useCallback(
    async (content: string, files?: File[]) => {
      if (!content.trim() && (!files || files.length === 0)) return

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
        files,
      }

      setMessages((prev) => {
        const updated = [...prev, userMessage]
        saveChatHistory(projectId, updated)
        return updated
      })

      setIsLoading(true)

      try {
        const aiResponse = await simulateAIResponse(content, files)

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: aiResponse,
          timestamp: new Date(),
        }

        setMessages((prev) => {
          const updated = [...prev, assistantMessage]
          saveChatHistory(projectId, updated)
          return updated
        })
      } catch (error) {
        console.error("Error generating AI response:", error)

        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I apologize, but I encountered an error while processing your request. Please try again.",
          timestamp: new Date(),
        }

        setMessages((prev) => {
          const updated = [...prev, errorMessage]
          saveChatHistory(projectId, updated)
          return updated
        })
      } finally {
        setIsLoading(false)
      }
    },
    [projectId, simulateAIResponse],
  )

  return {
    messages,
    isLoading,
    sendMessage,
    reset,
  }
}
