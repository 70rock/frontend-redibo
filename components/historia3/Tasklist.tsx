"use client"
import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import "./styles.css"

interface TasklistUsuario {
  hostId: string
}

interface Renter {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  profilePicture: string
  rated?: boolean
  fechaFin?: Date
  idReserva?: string
  
}

interface Rental {
  id: string
  renterId: string
  fechaInicio: Date
  fechaFin: Date
  estado: string
  renter: Renter
}

interface Calificacion {
  id: string
  renterId: string
  comportamiento: number
  cuidadoVehiculo: number
  puntualidad: number
  comentario: string
  fecha: Date
  renter: Renter
  reservaId?: string
}

export function Tasklist({ hostId }: TasklistUsuario) {
  interface Rating {
    comportamiento: number
    cuidadoVehiculo: number
    puntualidad: number
  }

  const [renters, setRenters] = useState<Renter[]>([])
  const [selected, setSelected] = useState<Renter | null>(null)
  const [rating, setRating] = useState<Rating>({
    comportamiento: 0,
    cuidadoVehiculo: 0,
    puntualidad: 0,
  })
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showRatingPanel, setShowRatingPanel] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      setError(null)
      try {
        console.log("Fetching data for hostId:", hostId)

        // Fetch rentals from API
        const rentalsResponse = await fetch(`http://localhost:4000/api/rentals/completed?hostId=${hostId}`, {
          credentials: 'include'
        })
        if (!rentalsResponse.ok) {
          throw new Error("Error al cargar rentas completadas")
        }
        const rentalsData = await rentalsResponse.json()

        // Fetch ratings from API (ahora usando CalificacionHostUsuario)
        const ratingsResponse = await fetch(`http://localhost:4000/api/calificaciones?calificadorId=${hostId}`, {
          credentials: 'include'
        })
        if (!ratingsResponse.ok) {
          throw new Error("Error al cargar calificaciones")
        }
        const ratingsData = await ratingsResponse.json()
        const calificacionesMapeadas = (ratingsData as any[]).map((c: any) => ({
          ...c,
          reservaId: c.reservationId
        }))
        setCalificaciones(calificacionesMapeadas)

        // Extraer renters únicos de las rentas
        const uniqueRenters = rentalsData.reduce((acc: Renter[], rental: Rental) => {
          if (!acc.find(r => r.id === rental.renter.id && r.idReserva === rental.id)) {
            acc.push({
              ...rental.renter,
              idReserva: rental.id,
              fechaFin: rental.fechaFin,
              rated: calificaciones.some(c => c.reservaId === rental.id)
            })
          }
          return acc
        }, [])

        setRenters(uniqueRenters)
      } catch (error) {
        setError("No se pudieron cargar los datos. ¿Estás autenticado?")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [hostId])

  function estaDentroDePeriodoCalificacion(fechaFin: string): boolean {
    const fechaFinRenta = new Date(fechaFin)
    const fechaActual = new Date()
    // Resetear las horas, minutos y segundos para comparar solo fechas
    fechaFinRenta.setHours(0, 0, 0, 0)
    fechaActual.setHours(0, 0, 0, 0)
    // Calcular la diferencia en días
    const diferenciaTiempo = fechaActual.getTime() - fechaFinRenta.getTime()
    const diferenciaDias = Math.floor(diferenciaTiempo / (1000 * 3600 * 24))
    // Permitir calificar si no han pasado más de 2 días
    return diferenciaDias <= 2
  }

  // Modificar la función handleSeleccionar para que no permita seleccionar rentas fuera de plazo
  function handleSeleccionar(renter: Renter) {
    // Si ya está calificado, siempre permitir ver la calificación
    // Si no está calificado, solo permitir seleccionar si está dentro del período
    if (renter.rated || estaDentroDePeriodoCalificacion(renter.fechaFin?.toString() || "")) {
      const calificacion = calificaciones.find((c) => c.reservaId === renter.idReserva)
      if (calificacion) {
        setRating({
          comportamiento: calificacion.comportamiento,
          cuidadoVehiculo: calificacion.cuidadoVehiculo,
          puntualidad: calificacion.puntualidad,
        })
      } else {
        setRating({
          comportamiento: 0,
          cuidadoVehiculo: 0,
          puntualidad: 0,
        })
      }

      setSelected(renter)
      setShowRatingPanel(true)
    }
    // No hacemos nada si está fuera de plazo y no tiene calificación
  }

  async function handleGuardar() {
    console.log("Intentando guardar calificación:", rating, selected)
    if (!selected) return
    if (!estaDentroDePeriodoCalificacion(selected.fechaFin?.toString() || "")) {
      alert("No es posible guardar la calificación porque han pasado más de 2 días desde la finalización de la renta.")
      return
    }
    try {
      // Calcular el rating general como promedio de los tres ratings
      const ratingGeneral = Math.round((rating.comportamiento + rating.cuidadoVehiculo + rating.puntualidad) / 3)

      const ratingData = {
        comportamiento: rating.comportamiento,
        cuidadoVehiculo: rating.cuidadoVehiculo,
        puntualidad: rating.puntualidad,
        comentario: '', // Puedes agregar un campo de comentario si lo tienes en el formulario
        reservationId: selected.idReserva,
        calificadorId: hostId,
        calificadoId: selected.id,
      }

      const existingRating = calificaciones.find((c) => c.reservaId === selected.idReserva)

      let response
      if (existingRating) {
        response = await fetch(`/api/calificaciones/${existingRating.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ratingData),
        })
      } else {
        response = await fetch("/api/calificaciones", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ratingData),
        })
      }

      console.log("Respuesta de la API:", response)

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Error al guardar la calificación");
      }

      const updatedRating = await response.json()

      // Actualizar estado local
      if (updatedRating) {
        setCalificaciones((prev) =>
          existingRating
            ? prev.map((c) =>
                c.id === existingRating.id
                  ? {
                      ...c,
                      comportamiento: updatedRating.behaviorRating,
                      cuidadoVehiculo: updatedRating.carCareRating,
                      puntualidad: updatedRating.punctualityRating,
                    }
                  : c,
              )
            : [
                ...prev,
                {
                  ...updatedRating,
                  reservaId: updatedRating.reservationId,
                },
              ],
        )
      }

      setRenters((prev) =>
        prev.map((renter) => (renter.idReserva === selected.idReserva ? { ...renter, rated: true } : renter)),
      )

      alert(`Calificación guardada para ${selected.firstName} ${selected.lastName}`)
      setShowRatingPanel(false)
    } catch (error) {
      console.error("Error al guardar la calificación:", error)
      alert("Error al guardar la calificación")
    }
  }

  async function handleBorrar(renter: Renter) {
    if (!estaDentroDePeriodoCalificacion(renter.fechaFin?.toString() || "")) {
      return
    }
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la calificación para ${renter.firstName} ${renter.lastName}?`)) {
      return
    }
    try {
      const calificacion = calificaciones.find((c) => c.reservaId === renter.idReserva)
      if (!calificacion) {
        throw new Error("No se encontró la calificación")
      }

      const response = await fetch(`/api/calificaciones/${calificacion.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error al eliminar:", errorText);
        throw new Error("Error al eliminar la calificación");
      }

      setCalificaciones((prev) => prev.filter((c) => c.id !== calificacion.id))
      setRenters((prev) => prev.map((item) => (item.idReserva === renter.idReserva ? { ...item, rated: false } : item)))

      if (selected && selected.idReserva === renter.idReserva) {
        setSelected(null)
        setShowRatingPanel(false)
      }

      alert(`Calificación eliminada para ${renter.firstName} ${renter.lastName}`)
    } catch (error) {
      console.error("Error al eliminar la calificación:", error)
      alert("Error al eliminar la calificación")
    }
  }

  function calcularPromedio() {
    if (
      rating.comportamiento === undefined &&
      rating.cuidadoVehiculo === undefined &&
      rating.puntualidad === undefined
    ) {
      return 0
    }
    const suma = rating.comportamiento + rating.cuidadoVehiculo + rating.puntualidad
    const categoriasPuntuadas = [rating.comportamiento, rating.cuidadoVehiculo, rating.puntualidad].filter(
      (val) => val !== undefined,
    ).length
    return categoriasPuntuadas > 0 ? Math.round((suma / categoriasPuntuadas) * 10) / 10 : 0
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.getMonth()
    const year = date.getFullYear()

    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]

    return `${day} ${months[month]}, ${year}`
  }

  return (
    <div className="p-6">
      {/* <h2 className="text-2xl font-bold mb-6">Calificaciones de Arrendatarios</h2> */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {error && <div className="text-red-500">{error}</div>}
          <div className="rental-container">
            <div className="rental-history-panel">
              <div className="rental-header">
                <h2 className="rental-title">Historial de rentas</h2>
                <div className="rental-count">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>{renters.length} Rentas completadas</span>
                </div>
              </div>

              {isLoading ? (
                <p>Cargando datos...</p>
              ) : (
                <div className="rental-list">
                  {Array.isArray(renters) && renters.length > 0 ? (
                    renters.map((renter) => {
                      const calificacion = calificaciones.find(c => c.reservaId === renter.idReserva)
                      return (
                        <div key={renter.id} className="rental-item">
                          <div className="rental-item-left">
                            <div className="rental-image-placeholder"></div>
                            <div className="rental-user-avatar"></div>
                            <div className="rental-user-info">
                              <div className="rental-user-name">{renter.firstName} {renter.lastName}</div>
                              <div className="rental-car-info">
                                {/* Assuming autoModelo and autoAnio are properties of the renter */}
                                {renter.firstName} {renter.lastName}
                              </div>
                              <div className="rental-status">
                                {calificacion ? (
                                  <div className="rating-display">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                      const promedio = (calificacion.comportamiento + calificacion.cuidadoVehiculo + calificacion.puntualidad) / 3
                                      return (
                                        <span
                                          key={star}
                                          className="star-icon-small"
                                          style={{ color: star <= Math.round(promedio) ? "#facc15" : "#e5e7eb" }}
                                        >
                                          ★
                                        </span>
                                      )
                                    })}
                                    <span className="rating-value">
                                      ({(
                                        (calificacion.comportamiento + calificacion.cuidadoVehiculo + calificacion.puntualidad) / 3
                                      ).toFixed(1)})
                                    </span>
                                  </div>
                                ) : (
                                  <span>Sin calificar</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="rental-item-right">
                            <div className="rental-date">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                              </svg>
                              <span>{formatDate(renter.fechaFin?.toString() || "")}</span>
                            </div>

                            <div className="rental-actions">
                              {!estaDentroDePeriodoCalificacion(renter.fechaFin?.toString() || "") && !renter.rated ? (
                                <button className="calificar-button disabled" disabled>
                                  Fuera de plazo
                                </button>
                              ) : renter.rated ? (
                                <>
                                  <button onClick={() => handleSeleccionar(renter)} className="calificar-button rated">
                                    Calificado
                                  </button>
                                  {estaDentroDePeriodoCalificacion(renter.fechaFin?.toString() || "") && (
                                    <button
                                      onClick={() => handleBorrar(renter)}
                                      className="delete-button"
                                      aria-label="Eliminar calificación"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </>
                              ) : (
                                <button onClick={() => handleSeleccionar(renter)} className="calificar-button">
                                  Calificar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="no-rentals">No hay rentas completadas disponibles</div>
                  )}
                </div>
              )}
            </div>

            {showRatingPanel && selected && (
              <div className="rating-panel">
                <div className="rating-panel-header">
                  <div className="rating-user-info">
                    <h3>{selected.firstName} {selected.lastName}</h3>
                    <div className="rating-date">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span>{formatDate(selected.fechaFin?.toString() || "")}</span>
                    </div>
                  </div>

                  <div className="rating-car-details">
                    <div className="rating-car-image-placeholder"></div>
                    <div className="rating-car-info">
                      <div className="rating-car-model">
                        {selected.firstName} {selected.lastName}
                      </div>
                      <div className="rating-car-status">Completado</div>
                    </div>
                  </div>
                </div>

                <div className="rating-panel-content">
                  <div className="rating-summary">
                    <h4>Calificación actual</h4>

                    <div className="rating-final-score">
                      <div className="rating-score-label">Puntuación final</div>
                      <div className="rating-score-value">
                        <span className="rating-score-number">{calcularPromedio().toFixed(1)}</span>
                        <span className="rating-score-star">★</span>
                      </div>
                      <div className="rating-stars-display">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className="star-icon-large"
                            style={{ color: star <= Math.round(calcularPromedio()) ? "#facc15" : "#e5e7eb" }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <div className="rating-score-note">Promedio de las tres calificaciones</div>
                    </div>

                    <div className="rating-categories">
                      <div className="rating-category">
                        <div className="rating-category-label">
                          <span>Comportamiento</span>
                          <span className="rating-category-question">¿Cómo fue el comportamiento del arrendatario?</span>
                        </div>
                        <div className="rating-category-stars">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              onClick={() => {
                                if (!selected.rated && estaDentroDePeriodoCalificacion(selected.fechaFin?.toString() || "")) {
                                  setRating((prev) => ({ ...prev, comportamiento: star }))
                                }
                              }}
                              className={`star-icon-medium ${star <= rating.comportamiento ? "active" : ""}`}
                              style={{
                                cursor:
                                  !selected.rated && estaDentroDePeriodoCalificacion(selected.fechaFin?.toString() || "")
                                    ? "pointer"
                                    : "default",
                                color: star <= rating.comportamiento ? "#facc15" : "#e5e7eb",
                              }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="rating-category">
                        <div className="rating-category-label">
                          <span>Cuidado del vehículo</span>
                          <span className="rating-category-question">¿Cómo cuidó el arrendatario tu vehículo?</span>
                        </div>
                        <div className="rating-category-stars">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              onClick={() => {
                                if (!selected.rated && estaDentroDePeriodoCalificacion(selected.fechaFin?.toString() || "")) {
                                  setRating((prev) => ({ ...prev, cuidadoVehiculo: star }))
                                }
                              }}
                              className={`star-icon-medium ${star <= rating.cuidadoVehiculo ? "active" : ""}`}
                              style={{
                                cursor:
                                  !selected.rated && estaDentroDePeriodoCalificacion(selected.fechaFin?.toString() || "")
                                    ? "pointer"
                                    : "default",
                                color: star <= rating.cuidadoVehiculo ? "#facc15" : "#e5e7eb",
                              }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="rating-category">
                        <div className="rating-category-label">
                          <span>Puntualidad</span>
                          <span className="rating-category-question">¿Fue puntual en la entrega y devolución?</span>
                        </div>
                        <div className="rating-category-stars">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              onClick={() => {
                                if (!selected.rated && estaDentroDePeriodoCalificacion(selected.fechaFin?.toString() || "")) {
                                  setRating((prev) => ({ ...prev, puntualidad: star }))
                                }
                              }}
                              className={`star-icon-medium ${star <= rating.puntualidad ? "active" : ""}`}
                              style={{
                                cursor:
                                  !selected.rated && estaDentroDePeriodoCalificacion(selected.fechaFin?.toString() || "")
                                    ? "pointer"
                                    : "default",
                                color: star <= rating.puntualidad ? "#facc15" : "#e5e7eb",
                              }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rating-actions">
                    {!selected.rated && estaDentroDePeriodoCalificacion(selected.fechaFin?.toString() || "") && (
                      <button
                        onClick={handleGuardar}
                        disabled={!rating.comportamiento || !rating.cuidadoVehiculo || !rating.puntualidad}
                        className="save-rating-button"
                      >
                        Guardar calificación
                      </button>
                    )}

                    {selected.rated && estaDentroDePeriodoCalificacion(selected.fechaFin?.toString() || "") && (
                      <button onClick={() => handleBorrar(selected)} className="delete-rating-button">
                        <Trash2 size={16} />
                        Borrar calificación
                      </button>
                    )}

                    <button onClick={() => setShowRatingPanel(false)} className="close-rating-button">
                      {selected.rated || !estaDentroDePeriodoCalificacion(selected.fechaFin?.toString() || "") ? "Cerrar" : "Cancelar"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!showRatingPanel && (
              <div className="empty-rating-panel">
                <div className="empty-rating-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
                  </svg>
                </div>
                <h3>Selecciona un arrendatario</h3>
                <p>Selecciona un arrendatario de la lista para calificar su experiencia de renta</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
