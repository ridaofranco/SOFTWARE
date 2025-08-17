"use client"

import { useState, useEffect, useCallback } from "react"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  color: string
}

export interface Presence {
  userId: string
  user: User
  cursor?: { x: number; y: number }
  selection?: { start: number; end: number }
  lastSeen: Date
  isActive: boolean
}

export interface Comment {
  id: string
  userId: string
  user: User
  content: string
  position?: { start: number; end: number }
  createdAt: Date
  updatedAt: Date
  replies: Comment[]
  resolved: boolean
}

export interface CollaborationState {
  users: User[]
  presence: Record<string, Presence>
  comments: Comment[]
  isConnected: boolean
  currentUser: User | null
}

// Mock current user - in real app this would come from auth
const CURRENT_USER: User = {
  id: "user-franco",
  name: "Franco",
  email: "franco@derp.com.ar",
  color: "#3B82F6",
}

const MOCK_USERS: User[] = [
  CURRENT_USER,
  {
    id: "user-pablo",
    name: "Pablo",
    email: "pablo@derp.com.ar",
    color: "#10B981",
  },
  {
    id: "user-assistant",
    name: "Asistente",
    email: "asistente@derp.com.ar",
    color: "#F59E0B",
  },
]

export function useCollaboration(documentId: string) {
  const [state, setState] = useState<CollaborationState>({
    users: MOCK_USERS,
    presence: {},
    comments: [],
    isConnected: false,
    currentUser: CURRENT_USER,
  })

  // Simulate connection
  useEffect(() => {
    const timer = setTimeout(() => {
      setState((prev) => ({ ...prev, isConnected: true }))

      // Simulate other users joining
      const mockPresence: Record<string, Presence> = {}

      // Randomly add some active users
      if (Math.random() > 0.5) {
        mockPresence["user-pablo"] = {
          userId: "user-pablo",
          user: MOCK_USERS[1],
          lastSeen: new Date(),
          isActive: true,
        }
      }

      if (Math.random() > 0.7) {
        mockPresence["user-assistant"] = {
          userId: "user-assistant",
          user: MOCK_USERS[2],
          lastSeen: new Date(),
          isActive: true,
        }
      }

      setState((prev) => ({ ...prev, presence: mockPresence }))
    }, 1000)

    return () => clearTimeout(timer)
  }, [documentId])

  const addComment = useCallback((content: string, position?: { start: number; end: number }) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      userId: CURRENT_USER.id,
      user: CURRENT_USER,
      content,
      position,
      createdAt: new Date(),
      updatedAt: new Date(),
      replies: [],
      resolved: false,
    }

    setState((prev) => ({
      ...prev,
      comments: [...prev.comments, newComment],
    }))

    return newComment
  }, [])

  const replyToComment = useCallback((commentId: string, content: string) => {
    const reply: Comment = {
      id: `reply-${Date.now()}`,
      userId: CURRENT_USER.id,
      user: CURRENT_USER,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
      replies: [],
      resolved: false,
    }

    setState((prev) => ({
      ...prev,
      comments: prev.comments.map((comment) =>
        comment.id === commentId ? { ...comment, replies: [...comment.replies, reply] } : comment,
      ),
    }))

    return reply
  }, [])

  const resolveComment = useCallback((commentId: string) => {
    setState((prev) => ({
      ...prev,
      comments: prev.comments.map((comment) => (comment.id === commentId ? { ...comment, resolved: true } : comment)),
    }))
  }, [])

  const updatePresence = useCallback(
    (cursor?: { x: number; y: number }, selection?: { start: number; end: number }) => {
      setState((prev) => ({
        ...prev,
        presence: {
          ...prev.presence,
          [CURRENT_USER.id]: {
            userId: CURRENT_USER.id,
            user: CURRENT_USER,
            cursor,
            selection,
            lastSeen: new Date(),
            isActive: true,
          },
        },
      }))
    },
    [],
  )

  const getActiveUsers = useCallback(() => {
    return Object.values(state.presence).filter((p) => p.isActive && p.userId !== CURRENT_USER.id)
  }, [state.presence])

  const getUnresolvedComments = useCallback(() => {
    return state.comments.filter((c) => !c.resolved)
  }, [state.comments])

  return {
    ...state,
    addComment,
    replyToComment,
    resolveComment,
    updatePresence,
    getActiveUsers,
    getUnresolvedComments,
  }
}
