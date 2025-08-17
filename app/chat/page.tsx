"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/nav-bar"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { ChatMessages } from "@/components/chat/chat-messages"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { useChatStore } from "@/lib/chat-service"
import { useMediaQuery } from "@/hooks/use-mobile"

export default function ChatPage() {
  const [showSidebar, setShowSidebar] = useState(true)
  const activeConversationId = useChatStore((state) => state.activeConversationId)
  const conversations = useChatStore((state) => state.conversations)
  const activeConversation = conversations.find((conv) => conv.id === activeConversationId)

  const isMobile = useMediaQuery("(max-width: 768px)")

  // En móvil, ocultar la barra lateral cuando hay una conversación activa
  useEffect(() => {
    if (isMobile && activeConversationId) {
      setShowSidebar(false)
    } else if (!isMobile) {
      setShowSidebar(true)
    }
  }, [isMobile, activeConversationId])

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && <ChatSidebar />}
        <div className="flex flex-1 flex-col">
          {isMobile && activeConversationId && !showSidebar && (
            <div className="border-b p-2">
              <Button variant="ghost" size="sm" onClick={() => setShowSidebar(true)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </div>
          )}
          <ChatMessages />
        </div>
      </div>
    </div>
  )
}
