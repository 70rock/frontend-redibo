"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase-browser"
import { useToast } from "@/hooks/use-toast"

interface Reservacion {
  id: string
  marca: string
  modelo: string
  cliente: string
  fechaInicio: string
  fechaFin: string
  estado: "Confirmada" | "Completada" | "Pendiente"
}

export default function ReservationHistory() {
  const [reservaciones, setReservaciones] = useState<Reservacion[]>([])
  const [registrosPorPagina, setRegistrosPorPagina] = useState("5")
  const [paginaActual, setPaginaActual] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  const checkSession = async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Error checking session:", sessionError)
      setIsLoading(false)
      return
    }

    if (session) {
      cargarReservaciones(session.user.id)
    } else {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkSession()
  }, [])

  const cargarReservaciones = async (userId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from("reservaciones")
        .select("*")
        .eq("host_id", userId)
        .order("fecha_inicio", { ascending: false })

      if (error) {
        throw error
      }

      if (data) {
        const reservacionesFormateadas = data.map((res) => ({
          id: res.id,
          marca: res.marca,
          modelo: res.modelo,
          cliente: res.cliente,
          fechaInicio: res.fecha_inicio,
          fechaFin: res.fecha_fin,
          estado: res.estado,
        }))
        setReservaciones(reservacionesFormateadas)
      }
    } catch (error: any) {
      console.error("Error:", error)
      setError("No se pudieron cargar las reservaciones: " + (error.message || "Error desconocido"))
      toast({
        title: "Error",
        description: "No se pudieron cargar las reservaciones",
        variant: "destructive",
      })
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

  const totalPaginas = Math.ceil(reservaciones.length / Number.parseInt(registrosPorPagina))
  const indiceInicio = (paginaActual - 1) * Number.parseInt(registrosPorPagina)
  const indiceFin = indiceInicio + Number.parseInt(registrosPorPagina)
  const reservacionesActuales = reservaciones.slice(indiceInicio, indiceFin)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {error ? (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => checkSession()}>
            Intentar nuevamente
          </Button>
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
                  <TableHead className="font-semibold">FECHA INICIO</TableHead>
                  <TableHead className="font-semibold">FECHA FIN</TableHead>
                  <TableHead className="font-semibold">ESTADO</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservacionesActuales.map((reservacion) => (
                  <TableRow key={reservacion.id}>
                    <TableCell>
                      {reservacion.marca} {reservacion.modelo}
                    </TableCell>
                    <TableCell>{reservacion.cliente}</TableCell>
                    <TableCell>{new Date(reservacion.fechaInicio).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(reservacion.fechaFin).toLocaleDateString()}</TableCell>
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
              Mostrando {indiceInicio + 1} a {Math.min(indiceFin, reservaciones.length)} de {reservaciones.length}{" "}
              reservaciones
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaActual((prev) => prev - 1)}
                disabled={paginaActual === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
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
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
