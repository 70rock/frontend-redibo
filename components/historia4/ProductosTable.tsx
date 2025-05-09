"use client"
import { useCallback, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react"

interface ProductosTableProps {
  hostId: string
}

interface Reservation {
  id: string
  marca: string
  modelo: string
  nombreUsuario: string
  fechaInicio: Date
  fechaFin: Date
  estado: string
  [key: string]: string | Date
}

export function ProductosTable({ hostId }: ProductosTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [totalReservations, setTotalReservations] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: string | null }>({
    key: null,
    direction: "ascending",
  })

  // Función para obtener reservaciones
  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true)

      // Llamada a la API para obtener reservaciones
      const response = await fetch(
        `/api/reservations?hostId=${hostId}&page=${currentPage}&limit=${itemsPerPage}&sortKey=${sortConfig.key || ""}&sortDirection=${sortConfig.direction || ""}`,
      )

      if (!response.ok) {
        throw new Error("Error al cargar las reservaciones")
      }

      const data = await response.json()

      setReservations(data.data)
      setTotalReservations(data.pagination.total)
    } catch (err) {
      const errorMessage = (err as Error)?.message || "Ocurrió un error inesperado."
      setError(errorMessage)
      console.error("Error al cargar reservaciones:", err)
    } finally {
      setLoading(false)
    }
  }, [hostId, currentPage, itemsPerPage, sortConfig])

  useEffect(() => {
    if (hostId) {
      fetchReservations()
    }
  }, [fetchReservations, hostId])

  const requestSort = (key: string) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const getSortedReservations = () => {
    
    return [...reservations].sort((a, b) => {
      if (!sortConfig.key) return 0

      if (sortConfig.key === "marca_modelo") {
        const aValue = `${a.marca} ${a.modelo}`.toLowerCase()
        const bValue = `${b.marca} ${b.modelo}`.toLowerCase()
        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      }

      if (sortConfig.key === "fechaInicio" || sortConfig.key === "fechaFin") {
        const aDate = new Date(a[sortConfig.key] as Date)
        const bDate = new Date(b[sortConfig.key] as Date)
        if (aDate < bDate) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (aDate > bDate) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      }

      const aValue = String(a[sortConfig.key] || "").toLowerCase()
      const bValue = String(b[sortConfig.key] || "").toLowerCase()
      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })
  }

  const sortedReservations = getSortedReservations()
  const totalPages = Math.ceil(totalReservations / itemsPerPage)

  const formatDate = (dateString: Date) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  // Mapeo de estados a colores
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmada":
        return "bg-blue-100 text-blue-800"
      case "completada":
        return "bg-green-100 text-green-800"
      case "cancelada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const SortIndicator = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey)
      return (
        <span className="ml-1 opacity-0">
          <ChevronUp size={14} />
        </span>
      )
    return (
      <span className="ml-1">
        {sortConfig.direction === "ascending" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </span>
    )
  }

  if (loading) return <div className="text-center py-8">Cargando historial...</div>
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort("marca_modelo")}
              >
                <div className="flex items-center">
                  Marca/Modelo
                  <SortIndicator columnKey="marca_modelo" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort("nombreUsuario")}
              >
                <div className="flex items-center">
                  Cliente
                  <SortIndicator columnKey="nombreUsuario" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort("fechaInicio")}
              >
                <div className="flex items-center">
                  Fecha Inicio
                  <SortIndicator columnKey="fechaInicio" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort("fechaFin")}
              >
                <div className="flex items-center">
                  Fecha Fin
                  <SortIndicator columnKey="fechaFin" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort("estado")}
              >
                <div className="flex items-center">
                  Estado
                  <SortIndicator columnKey="estado" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedReservations.map((reserva, index) => (
              <tr key={`${reserva.id}-${index}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {reserva.marca} {reserva.modelo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{reserva.nombreUsuario}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{formatDate(reserva.fechaInicio)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{formatDate(reserva.fechaFin)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(reserva.estado)}`}
                  >
                    {reserva.estado.toLowerCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación y registros por página */}
      <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Selector de items por página */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Mostrar</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {[5, 10, 15].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-600">registros</span>
        </div>

        {/* Info de paginación */}
        <div className="text-sm text-gray-600">
          Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{" "}
          <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalReservations)}</span> de{" "}
          <span className="font-medium">{totalReservations}</span> reservaciones
        </div>

        {/* Controles de paginación */}
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md border ${currentPage === 1 ? "bg-gray-100 cursor-not-allowed" : "hover:bg-gray-50"}`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page =
                currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-md text-sm ${
                    currentPage === page ? "bg-blue-600 text-white" : "hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md border ${currentPage === totalPages ? "bg-gray-100 cursor-not-allowed" : "hover:bg-gray-50"}`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
