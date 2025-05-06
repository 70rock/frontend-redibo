"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { StarRating } from "@/components/star-rating"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import type { Review } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"

interface AddReviewFormProps {
  renterId: string
  onReviewAdded: (review: Review) => void
}

export default function AddReviewForm({ renterId, onReviewAdded }: AddReviewFormProps) {
  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!rating || rating <= 0) {
      toast({
        title: "Error",
        description: "Por favor, seleccione una calificación",
        variant: "destructive",
      })
      return
    }

    if (comment.trim().length < 10) {
      toast({
        title: "Error",
        description: "El comentario debe tener al menos 10 caracteres",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (!user) {
        toast({
          title: "Error",
          description: "Debe iniciar sesión para publicar una reseña",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          renterId,
          hostId: user.id,
          hostName: user.email?.split("@")[0] || "Usuario",
          hostPicture: "/placeholder.svg?height=40&width=40",
          rating,
          comment,
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "No se pudo enviar la reseña")
      }
      const savedReview = await response.json()

      onReviewAdded({
        ...savedReview,
        date: new Date(savedReview.createdAt).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      })

      setRating(0)
      setComment("")

      toast({
        title: "Reseña enviada",
        description: "Su reseña ha sido publicada correctamente",
      })
    } catch (error: any) {
      console.error("Error submitting review:", error)

      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la reseña. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Agregar una reseña</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Calificación</label>
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>
          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Comentario
            </label>
            <Textarea
              id="comment"
              placeholder="Comparta su experiencia con este arrendatario..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Publicar reseña"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
