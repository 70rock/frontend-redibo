const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export const api = {
  async get(endpoint: string) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        credentials: "include", // Para cookies de sesión
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || `Error en la petición: ${response.status} ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error)
      throw error
    }
  },

  async post(endpoint: string, data: any) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        // Try to parse error response
        try {
          const errorData = await response.json()
          throw new Error(errorData.message || `Error en la petición: ${response.status} ${response.statusText}`)
        } catch (parseError) {
          // If we can't parse the error as JSON, use status text
          throw new Error(`Error en la petición: ${response.status} ${response.statusText}`)
        }
      }

      return response.json()
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error)
      throw error
    }
  },

  async put(endpoint: string, data: any) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || `Error en la petición: ${response.status} ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error(`PUT ${endpoint} failed:`, error)
      throw error
    }
  },

  async delete(endpoint: string) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || `Error en la petición: ${response.status} ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error)
      throw error
    }
  },
}

// Funciones de autenticación
export function login(email: string, password: string) {
  return api.post("/api/auth/signin", { email, password })
}

export function register(email: string, password: string, name?: string) {
  return api.post("/api/auth/signup", { email, password, name })
}

export function logout() {
  return api.post("/api/auth/signout", {})
}

export function getProfile() {
  return api.get("/api/auth/session")
}

// Funciones de reservas
export function getReservations() {
  return api.get("/api/reservations")
}

export function createReservation(reservationData: any) {
  return api.post("/api/reservations", reservationData)
}

// Funciones de autos
export function getCars() {
  return api.get("/api/cars")
}

export function getCarById(id: string) {
  return api.get(`/api/cars/${id}`)
}

// Funciones de usuarios
export function getUsers() {
  return api.get("/api/users")
}

export function getUserById(id: string) {
  return api.get(`/api/users/${id}`)
}

// Funciones de reseñas
export function getReviews() {
  return api.get("/api/reviews")
}

export function createReview(reviewData: any) {
  return api.post("/api/reviews", reviewData)
}

export function getRenterDetails(renterId: string) {
  return api.get(`/api/renter-details?renterId=${renterId}`)
}

export function getCalificaciones(calificadoId: string) {
  return api.get(`/api/calificaciones?calificadoId=${calificadoId}`)
}

export function getFirstRenterId() {
  return api.get("/api/renter-details/first")
}

// Obtener comentarios de un auto específico
export function getCarComments(carId: string) {
  return api.get(`/api/car-comments?carId=${carId}`)
}

// Crear un comentario para un auto
export function createCarComment(commentData: any) {
  return api.post("/api/car-comments", commentData)
}

export function createReport(reportData: any) {
  return api.post("/api/reports", reportData);
}
