"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { CalendarIcon, Search, Star } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

// Tipos basados en el esquema Prisma proporcionado
type Review = {
  id: string
  renterId: string
  hostId: string
  reservationId: string
  carId: string | null
  rating: number
  behaviorRating: number
  carCareRating: number
  punctualityRating: number
  comment: string | null
  hostName: string
  hostPicture: string | null
  renterName: string
  createdAt: string | Date
  updatedAt: string | Date
  car?: {
    marca: string
    modelo: string
    año: number
    imagenes: { url: string }[]
  } | null
}

export default function ComentariosPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("fecha")
  const [sortOrder, setSortOrder] = useState("descendente")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const reviewsPerPage = 4
  const { toast } = useToast()

  // Cargar comentarios cuando se monte el componente
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true)

        // Obtener el ID del usuario actual (host)
        const sessionResponse = await api.get("/api/auth/session")
        if (!sessionResponse || !sessionResponse.user || !sessionResponse.user.id) {
          throw new Error("No se pudo obtener la sesión del usuario")
        }

        const hostId = sessionResponse.user.id

        // Obtener las reseñas donde el usuario es el host
        const reviewsResponse = await api.get(`/api/reviews?hostId=${hostId}`)

        // Procesar las reseñas para incluir información del vehículo
        const reviewsWithCars = await Promise.all(
          reviewsResponse.map(async (review: Review) => {
            if (review.carId) {
              try {
                // Obtener información del vehículo
                const carResponse = await api.get(`/api/cars/${review.carId}`)
                return {
                  ...review,
                  car: {
                    marca: carResponse.marca,
                    modelo: carResponse.modelo,
                    año: carResponse.año,
                    imagenes: carResponse.imagenes || [],
                  },
                  createdAt: new Date(review.createdAt),
                  updatedAt: new Date(review.updatedAt),
                }
              } catch (error) {
                console.error(`Error al obtener información del vehículo ${review.carId}:`, error)
                return {
                  ...review,
                  createdAt: new Date(review.createdAt),
                  updatedAt: new Date(review.updatedAt),
                }
              }
            }
            return {
              ...review,
              createdAt: new Date(review.createdAt),
              updatedAt: new Date(review.updatedAt),
            }
          }),
        )

        setReviews(reviewsWithCars)
        setFilteredReviews(reviewsWithCars)
      } catch (error) {
        console.error("Error al cargar comentarios:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los comentarios",
          variant: "destructive",
        })
        setReviews([])
        setFilteredReviews([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [])

  // Aplicar filtros
  const applyFilters = () => {
    let filtered = [...reviews]

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (review) => review.car?.marca?.toLowerCase().includes(term) || review.car?.modelo?.toLowerCase().includes(term),
      )
    }

    // Filtrar por rango de fechas
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter((review) => {
        const reviewDate = new Date(review.createdAt)
        return reviewDate >= dateRange.from! && reviewDate <= dateRange.to!
      })
    }

    // Ordenar resultados
    filtered.sort((a, b) => {
      if (sortBy === "fecha") {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return sortOrder === "ascendente" ? dateA - dateB : dateB - dateA
      } else if (sortBy === "calificacion") {
        return sortOrder === "ascendente" ? a.rating - b.rating : b.rating - a.rating
      } else {
        // alfabético
        const nameA = `${a.car?.marca || ""} ${a.car?.modelo || ""}`.toLowerCase()
        const nameB = `${b.car?.marca || ""} ${b.car?.modelo || ""}`.toLowerCase()
        return sortOrder === "ascendente" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      }
    })

    setFilteredReviews(filtered)
    setCurrentPage(1)
  }

  // Paginación
  const indexOfLastReview = currentPage * reviewsPerPage
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage
  const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview)
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage)

  // Renderizar estrellas
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="w-4 h-4 fill-amber-400 text-amber-400" />)
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="w-4 h-4 text-amber-400" />
          <div className="absolute inset-0 overflow-hidden w-[50%]">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
        </div>,
      )
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />)
    }

    return (
      <div className="flex items-center">
        {stars}
        <span className="ml-1 text-sm font-medium">{rating}</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Comentarios sobre mis vehículos</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy")
                  )
                ) : (
                  "Fecha recientes primero"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                locale={es}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Ordenar por</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fecha">Fecha</SelectItem>
              <SelectItem value="calificacion">Calificación</SelectItem>
              <SelectItem value="alfabetico">A/Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Orden</span>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Orden" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ascendente">Ascendente</SelectItem>
              <SelectItem value="descendente">Descendente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-grow">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por marca o modelo"
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={applyFilters}>Aplicar filtros</Button>
      </div>

      <div className="space-y-4 mb-6">
        {isLoading ? (
          // Mostrar esqueletos durante la carga
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 flex gap-4 animate-pulse">
              <div className="flex-shrink-0 bg-gray-200 w-[120px] h-[80px] rounded-md"></div>
              <div className="flex-grow">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))
        ) : currentReviews.length > 0 ? (
          currentReviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4 flex gap-4">
              <div className="flex-shrink-0">
                <Image
                  src={review.car?.imagenes?.[0]?.url || "/placeholder.svg?height=80&width=120"}
                  alt={`${review.car?.marca || ""} ${review.car?.modelo || ""}`}
                  width={120}
                  height={80}
                  className="rounded-md object-cover"
                />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-lg">
                    {review.car?.marca || "Vehículo"} {review.car?.modelo || ""} {review.car?.año || ""}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {format(new Date(review.createdAt), "d MMMM yyyy", { locale: es })}
                  </span>
                </div>
                <div className="mt-1">{renderStars(review.rating)}</div>
                <p className="mt-2 text-gray-700">{review.comment || "Sin comentarios"}</p>
                <p className="mt-1 text-sm text-gray-500">Por: {review.renterName}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">No se encontraron comentarios con los filtros aplicados.</div>
        )}
      </div>

      {filteredReviews.length > reviewsPerPage && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage > 1) setCurrentPage(currentPage - 1)
                }}
              />
            </PaginationItem>

            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageNumber = i + 1
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#"
                    isActive={pageNumber === currentPage}
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage(pageNumber)
                    }}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            {totalPages > 5 && <PaginationEllipsis />}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
