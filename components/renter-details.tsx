"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Mail, Briefcase, Calendar, Shield, AlertCircle, UserPlus, MapPin, Flag } from "lucide-react"
import { getFirstRenterId, getRenterDetails, getCalificaciones } from "@/lib/api"
import type { RenterDetailsType, Review } from "@/lib/types"
import RenterReviews from "./renter-reviews"
import { ToastProvider, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import WhatsAppQRDialog from "./whatsapp-qr-dialog"
import ReportProfileDialog from "./report-profile-dialog"
import VerifiedInfo from "./verified-info"

interface RenterDetailsProps {
  renterId?: string
}

export default function RenterDetails({ renterId }: RenterDetailsProps) {
  const [renterDetails, setRenterDetails] = useState<RenterDetailsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [rating, setRating] = useState<number | null>(null)
  const [total, setTotal] = useState<number>(0)

  useEffect(() => {
    const loadRenterDetails = async () => {
      try {
        const finalRenterId = renterId || (await getFirstRenterId())

        if (!finalRenterId) {
          setError("No se encontraron arrendatarios en la base de datos.")
          setLoading(false)
          return
        }

        const data = await getRenterDetails(finalRenterId)
        const calificaciones = await getCalificaciones(finalRenterId)

        // Convertir calificaciones a formato de reseñas
        const calificacionesAsReviews = calificaciones.map((c: any) => {
          console.log("calificador recibido:", c.calificador);
          return {
            id: c.id,
            renterId: c.calificadoId,
            hostId: c.calificadorId,
            reservationId: c.reservationId,
            rating: (c.comportamiento + c.cuidadoVehiculo + c.puntualidad) / 3,
            behaviorRating: c.comportamiento,
            carCareRating: c.cuidadoVehiculo,
            punctualityRating: c.puntualidad,
            comment: c.comentario,
            hostName: c.calificador?.nombre || "Anfitrión",
            hostPicture: c.calificador?.image || undefined,
            renterName: `${data.firstName} ${data.lastName}`,
            createdAt: c.fechaCreacion ? new Date(c.fechaCreacion) : null,
            updatedAt: new Date(c.updatedAt),
            date: c.fechaCreacion ? new Date(c.fechaCreacion).toLocaleDateString() : ""
          }
        })

        // Combinar reseñas existentes con calificaciones
        const allReviews = [...(data.reviews || []), ...calificacionesAsReviews]

        setRenterDetails({
          ...data,
          reviews: allReviews,
          reviewCount: allReviews.length
        })

        if (calificaciones.length > 0) {
          const sum = calificaciones.reduce(
            (acc: number, c: { comportamiento: number; cuidadoVehiculo: number; puntualidad: number }) => 
              acc + (c.comportamiento + c.cuidadoVehiculo + c.puntualidad) / 3,
            0
          )
          setRating(sum / calificaciones.length)
          setTotal(calificaciones.length)
        } else {
          setRating(null)
          setTotal(0)
        }
      } catch (error) {
        console.error("Error fetching renter details:", error)
        setError("No se pudo cargar la información del arrendatario")
        toast({
          title: "Error",
          description: "No se pudo cargar la información del arrendatario",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadRenterDetails()
  }, [renterId, toast])

  const handleReviewAdded = (newReview: Review) => {
    if (!renterDetails) return

    const updatedReviews = [newReview, ...renterDetails.reviews]

    setRenterDetails({
      ...renterDetails,
      reviews: updatedReviews,
      reviewCount: updatedReviews.length,
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
          <h2 className="mt-4 text-xl font-semibold">{error}</h2>
          <p className="mt-2 text-muted-foreground">
            {error === "No se encontraron arrendatarios en la base de datos."
              ? "Necesita agregar arrendatarios a la base de datos para ver sus detalles."
              : "Por favor, intente nuevamente más tarde."}
          </p>
          {error === "No se encontraron arrendatarios en la base de datos." && (
            <Button className="mt-4" variant="outline" asChild>
              <Link href="/add-renter">
                <UserPlus className="mr-2 h-4 w-4" />
                Agregar Arrendatario
              </Link>
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (!renterDetails) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
          <h2 className="mt-4 text-xl font-semibold">No se pudo cargar la información del arrendatario</h2>
          <p className="mt-2 text-muted-foreground">Por favor, intente nuevamente más tarde.</p>
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Detalles del Arrendatario</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <Card className="border rounded-lg overflow-hidden">
              <div className="p-6 flex flex-col items-center text-center">
                {/* Avatar */}
                <Avatar className="h-24 w-24 mb-4">
<<<<<<< HEAD
                  <AvatarImage src={renterDetails.profilePicture || "/placeholder.svg"} alt={renterDetails.firstName} className="object-cover" />
=======
                  <AvatarImage src={renterDetails.profilePicture || "/placeholder.svg"} alt={renterDetails.firstName} />
>>>>>>> 95281ef808c427059d01109af9c1c7749de050fe
                  <AvatarFallback className="bg-gray-200">{`${renterDetails.firstName.charAt(0)}${renterDetails.lastName.charAt(0)}`}</AvatarFallback>
                </Avatar>

                {/* Nombre */}
                <h2 className="text-xl font-bold mb-2">
                  {renterDetails.firstName} {renterDetails.lastName}
                </h2>

                {/* Calificación */}
                <div className="flex items-center justify-center mb-3">
                  {rating !== null ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {[1,2,3,4,5].map(star => (
                        <span key={star} style={{color: star <= Math.round(rating) ? "#facc15" : "#e5e7eb", fontSize: 20}}>★</span>
                      ))}
                      <span style={{marginLeft: 8, fontWeight: 500}}>{rating.toFixed(1)} ({total})</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Sin calificaciones</span>
                  )}
                </div>

                {/* Verificado */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                    Verificado
                  </span>
                </div>

                {/* Reportar perfil */}
                <ReportProfileDialog
                  renterId={renterDetails.id}
                  renterName={`${renterDetails.firstName} ${renterDetails.lastName}`}
                >
                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Reportar perfil
                  </Button>
                </ReportProfileDialog>
              </div>
            </Card>

            {/* Información Verificada */}
            <div className="mt-6">
              <VerifiedInfo
                name={`${renterDetails.firstName}`}
                verifiedItems={{
                  identity: true,
                  email: true,
                  phone: true,
                }}
              />
            </div>
          </div>

          {/* Details Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 text-muted-foreground mr-3" />
                  <div>
                    <p className="text-sm font-medium">Ocupación</p>
                    <p className="text-muted-foreground">{renterDetails.occupation}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-muted-foreground mr-3" />
                  <div>
                    <p className="text-sm font-medium">Edad</p>
                    <p className="text-muted-foreground">{renterDetails.age} años</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-muted-foreground mr-3" />
                  <div>
                    <p className="text-sm font-medium">Dirección</p>
                    <p className="text-muted-foreground">{renterDetails.address}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-muted-foreground mr-3" />
                  <div>
                    <p className="text-sm font-medium">Correo Electrónico</p>
                    <p className="text-muted-foreground">{renterDetails.email}</p>
                  </div>
                </div>

                {/* WhatsApp Contact Button instead of Phone */}
                <div className="flex items-start">
                  <div className="w-5 mr-3" /> {/* Spacer for alignment */}
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-2">Contacto</p>
                    <WhatsAppQRDialog
                      phoneNumber={renterDetails.phone}
                      renterName={`${renterDetails.firstName} ${renterDetails.lastName}`}
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-muted-foreground mr-3" />
                  <div>
                    <p className="text-sm font-medium">Miembro desde</p>
                    <p className="text-muted-foreground">{renterDetails.memberSince}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews Section */}
        <div className="mt-8">
          <Tabs defaultValue="reviews">
            <TabsList className="mb-4">
              <TabsTrigger value="reviews">Reseñas ({renterDetails.reviewCount})</TabsTrigger>
              <TabsTrigger value="history">Historial de Alquileres</TabsTrigger>
            </TabsList>

            <TabsContent value="reviews">
              <div className="grid gap-6">
                {/* Reviews List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Reseñas de Otros Anfitriones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RenterReviews reviews={renterDetails.reviews} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Alquileres</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    El arrendatario ha completado {renterDetails.completedRentals} alquileres en nuestra plataforma.
                  </p>

                  {Array.isArray(renterDetails.rentalHistory) && renterDetails.rentalHistory.length > 0 ? (
                    <div className="mt-4 space-y-4">
                      {renterDetails.rentalHistory.map((rental, index) => (
                        <div key={rental.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{rental.car_model}</h4>
                              <span className="text-sm text-muted-foreground">
                                {rental.dates}
                              </span>
                            </div>
                            <Badge variant={rental.status === "Completado" ? "default" : "secondary"}>
                              {rental.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-muted-foreground">No hay historial de alquileres disponible.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <ToastViewport />
    </ToastProvider>
  )
}