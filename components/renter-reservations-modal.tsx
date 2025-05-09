"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"


interface Reservacion {
  id: string
  marca: string
  modelo: string
  fecha_inicio: string
  fecha_fin: string
  estado: "Completada" | "Confirmada" | "Pendiente"
}

interface RenterReservationsModalProps {
  isOpen: boolean
  onClose: () => void
  renterId: string
  renterName: string
}

export function RenterReservationsModal({ isOpen, onClose, renterId, renterName }: RenterReservationsModalProps) {
  const [reservaciones, setReservaciones] = useState<Reservacion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen && renterId) {
      cargarReservaciones()
    }
  }, [isOpen, renterId])

  const cargarReservaciones = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("renter_id", renterId)
        .order("fecha_inicio", { ascending: false })

      if (error) throw error
      setReservaciones(data || [])
    } catch (error) {
      console.error("Error al cargar reservaciones:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getVarianteBadge = (estado: string) => {
    switch (estado) {
      case "Completada":
        return "default"
      case "Confirmada":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Reservaciones de {renterName}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : reservaciones.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">Este arrendatario no tiene más reservaciones.</p>
        ) : (
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">MARCA/MODELO</TableHead>
                  <TableHead className="font-semibold">FECHA INICIO</TableHead>
                  <TableHead className="font-semibold">FECHA FIN</TableHead>
                  <TableHead className="font-semibold">ESTADO</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservaciones.map((reservacion: Reservacion) => (
                  <TableRow key={reservacion.id}>
                    <TableCell>
                      {reservacion.car
                        ? `${reservacion.car.marca} ${reservacion.car.modelo}`
                        : "Sin auto"}
                    </TableCell>
                    <TableCell>{new Date(reservacion.fecha_inicio).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(reservacion.fecha_fin).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={getVarianteBadge(reservacion.estado)}>{reservacion.estado}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
