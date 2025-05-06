"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"
import Link from "next/link"

interface AuthCheckProps {
  onEnableTestMode?: () => void
}

export default function AuthCheck({ onEnableTestMode }: AuthCheckProps) {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl">Acceso Restringido</CardTitle>
          <CardDescription>Necesita iniciar sesión para ver los detalles del arrendatario</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Esta información está disponible solo para usuarios registrados. Por favor inicie sesión o cree una cuenta
            para continuar.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full" asChild>
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/register">Crear Cuenta</Link>
          </Button>
          {onEnableTestMode && process.env.NODE_ENV === "development" && (
            <Button variant="ghost" className="w-full mt-2" onClick={onEnableTestMode}>
              Continuar en Modo de Prueba
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
