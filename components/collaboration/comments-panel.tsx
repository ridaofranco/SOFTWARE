"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Reply, Check, Plus } from "lucide-react"
import type { Comment, User } from "@/hooks/use-collaboration"

interface CommentsPanelProps {
  comments: Comment[]
  onAddComment: (content: string) => void
  onReplyToComment: (commentId: string, content: string) => void
  onResolveComment: (commentId: string) => void
  currentUser: User | null
}

export function CommentsPanel({
  comments,
  onAddComment,
  onReplyToComment,
  onResolveComment,
  currentUser,
}: CommentsPanelProps) {
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim())
      setNewComment("")
    }
  }

  const handleReply = (commentId: string) => {
    if (replyContent.trim()) {
      onReplyToComment(commentId, replyContent.trim())
      setReplyContent("")
      setReplyingTo(null)
    }
  }

  const unresolvedComments = comments.filter((c) => !c.resolved)
  const resolvedComments = comments.filter((c) => c.resolved)

  return (
    <div className="w-80 border-l bg-gray-50 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Comentarios
        </h3>
        <Badge variant="outline">{unresolvedComments.length} activos</Badge>
      </div>

      {/* Add new comment */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Agregar comentario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            placeholder="Escribe un comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
          />
          <Button onClick={handleAddComment} disabled={!newComment.trim()} size="sm" className="w-full">
            <Plus className="w-4 h-4 mr-1" />
            Comentar
          </Button>
        </CardContent>
      </Card>

      {/* Active comments */}
      {unresolvedComments.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Comentarios activos</h4>
          {unresolvedComments.map((comment) => (
            <Card key={comment.id} className="bg-white">
              <CardContent className="p-3 space-y-3">
                <div className="flex items-start gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs" style={{ backgroundColor: comment.user.color, color: "white" }}>
                      {comment.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{comment.user.name}</span>
                      <span className="text-xs text-gray-500">
                        {comment.createdAt.toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="ml-8 space-y-2 border-l-2 border-gray-100 pl-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback
                            className="text-xs"
                            style={{ backgroundColor: reply.user.color, color: "white" }}
                          >
                            {reply.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium">{reply.user.name}</span>
                            <span className="text-xs text-gray-500">
                              {reply.createdAt.toLocaleTimeString("es-AR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply input */}
                {replyingTo === comment.id ? (
                  <div className="ml-8 space-y-2">
                    <Textarea
                      placeholder="Escribe una respuesta..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="min-h-[60px] text-sm"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleReply(comment.id)} disabled={!replyContent.trim()}>
                        Responder
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReplyingTo(null)
                          setReplyContent("")
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setReplyingTo(comment.id)}>
                      <Reply className="w-3 h-3 mr-1" />
                      Responder
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onResolveComment(comment.id)}>
                      <Check className="w-3 h-3 mr-1" />
                      Resolver
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Resolved comments */}
      {resolvedComments.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-500">Comentarios resueltos ({resolvedComments.length})</h4>
          {resolvedComments.map((comment) => (
            <Card key={comment.id} className="bg-gray-50 opacity-75">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs" style={{ backgroundColor: comment.user.color, color: "white" }}>
                      {comment.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-600">{comment.user.name}</span>
                      <Badge variant="outline" className="text-xs">
                        Resuelto
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{comment.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {comments.length === 0 && (
        <div className="text-center py-8">
          <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No hay comentarios aún</p>
        </div>
      )}
    </div>
  )
}
