"use client"

import Header from "@/components/header"
import { useAuth } from "@/contexts/auth-context"

export default function Home() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />
      <main className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <h1 className="text-4xl font-bold text-center">¡Bienvenido a Redibo!</h1>
          <p className="mt-4 text-lg">Tu tienda en línea para alquilar autos</p>
          {user && (
            <div className="mt-8">
              <p className="text-green-600">¡Hola, {user.name || user.email}!</p>
              {/* Aquí puedes renderizar más componentes solo para usuarios autenticados */}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
