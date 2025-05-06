"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"
import Link from "next/link"

interface Renter {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
}

interface Reservacion {
  id: string
  marca: string
  modelo: string
  fecha_inicio: string | Date
  fecha_fin: string | Date
  estado: "Confirmada" | "Completada" | "Pendiente"
  renter: Renter
}

export default function ReservacionesPage() {
  const [reservaciones, setReservaciones] = useState<Reservacion[]>([])
  const [registrosPorPagina, setRegistrosPorPagina] = useState("5")
  const [paginaActual, setPaginaActual] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalReservaciones, setTotalReservaciones] = useState(0)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      cargarReservaciones()
    } else {
      setError("No hay sesión activa. Por favor, inicie sesión nuevamente.")
    }
  }, [user, paginaActual, registrosPorPagina])

  const cargarReservaciones = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get(`/api/reservations?hostId=${user.id}&page=${paginaActual}&limit=${registrosPorPagina}`)
      const formattedReservations = response.data.map((res: any) => ({
        id: res.id,
        marca: res.marca,
        modelo: res.modelo,
        fecha_inicio: res.fechaInicio,
        fecha_fin: res.fechaFin,
        estado: res.estado,
        renter: res.renter
          ? {
              id: res.renter.id,
              first_name: res.renter.firstName,
              last_name: res.renter.lastName,
              email: res.renter.email,
              phone: res.renter.phone,
            }
          : null,
      }))
      setReservaciones(formattedReservations)
      setTotalReservaciones(response.pagination.total)
    } catch (error: any) {
      console.error("Error:", error)
      const errorMessage = error.response?.data?.error || error.message || "Error desconocido"
      const errorCode = error.response?.data?.code || "UNKNOWN_ERROR"
      setError(`No se pudieron cargar las reservaciones: ${errorMessage} (${errorCode})`)
      toast({
        title: "Error",
        description: "No se pudieron cargar las reservaciones",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getVarianteBadge = (status: string) => {
    switch (status) {
      case "Completada":
        return "default"
      case "Confirmada":
        return "secondary"
      default:
        return "outline"
    }
  }

  const totalPaginas = Math.ceil(totalReservaciones / Number.parseInt(registrosPorPagina))
  const indiceInicio = (paginaActual - 1) * Number.parseInt(registrosPorPagina)
  const indiceFin = Math.min(indiceInicio + Number.parseInt(registrosPorPagina), totalReservaciones)

  return (
    <div>
      <Header />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Historial de Reservaciones</h1>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => cargarReservaciones()}>
              Intentar nuevamente
            </Button>
          </div>
        ) : reservaciones.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hay reservaciones disponibles</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Mostrar</span>
                <Select
                  value={registrosPorPagina}
                  onValueChange={(value) => {
                    setRegistrosPorPagina(value)
                    setPaginaActual(1)
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue>{registrosPorPagina}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">registros</span>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">MARCA/MODELO</TableHead>
                    <TableHead className="font-semibold">CLIENTE</TableHead>
                    <TableHead className="font-semibold">CONTACTO</TableHead>
                    <TableHead className="font-semibold">FECHA INICIO</TableHead>
                    <TableHead className="font-semibold">FECHA FIN</TableHead>
                    <TableHead className="font-semibold">ESTADO</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservaciones.map((reservacion) => (
                    <TableRow key={reservacion.id}>
                      <TableCell>
                        {reservacion.marca} {reservacion.modelo}
                      </TableCell>
                      <TableCell>
                        {reservacion.renter ? (
                          <Link href={`/renter/${reservacion.renter.id}`} className="text-primary hover:underline">
                            {reservacion.renter.first_name} {reservacion.renter.last_name}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">Sin datos</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{reservacion.renter?.email}</div>
                          <div className="text-muted-foreground">{reservacion.renter?.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(reservacion.fecha_inicio).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        {new Date(reservacion.fecha_fin).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getVarianteBadge(reservacion.estado)}>{reservacion.estado}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {indiceInicio + 1} a {indiceFin} de {totalReservaciones} reservaciones
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaginaActual((prev) => prev - 1)}
                  disabled={paginaActual === 1}
                >
                  Anterior
                </Button>
                <span className="px-3 py-2 rounded-md bg-primary text-primary-foreground">{paginaActual}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaginaActual((prev) => prev + 1)}
                  disabled={paginaActual === totalPaginas}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
