"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, User, LogIn, UserPlus, LogOut, ChevronDown, Star, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function Header() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = () => {
    router.push("/login")
  }

  const handleLogout = async () => {
    await signOut()
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    })
    router.push("/")
  }

  const handleRegister = () => {
    router.push("/register")
  }

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl">
            REDIBO
          </Link>
        </div>

        {/* Mobile menu */}
        <div className="flex md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] sm:w-[300px]">
              <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
              <nav className="flex flex-col gap-4 mt-6 p-6">
                <Link href="/" className="text-sm font-medium">
                  Inicio
                </Link>
                <Link href="/productos" className="text-sm font-medium">
                  Productos
                </Link>
                <Link href="/acerca" className="text-sm font-medium">
                  Acerca de
                </Link>
                <Link href="/contacto" className="text-sm font-medium">
                  Contacto
                </Link>

                <div className="mt-4 border-t pt-4">
                  {!!user ? (
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="text-sm font-medium">{user?.name || user?.email || "Usuario"}</div>
                      </div>
                      <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar sesión
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" passHref legacyBehavior>
                        <Button variant="default" className="w-full justify-start mb-2">
                          <LogIn className="mr-2 h-4 w-4" />
                          Iniciar sesión
                        </Button>
                      </Link>
                      <Link href="/register" passHref legacyBehavior>
                        <Button variant="outline" className="w-full justify-start">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Registrarse
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex justify-center items-center gap-6">
          <Link href="/" className="text-sm font-medium">
            Inicio
          </Link>
          <Link href="/productos" className="text-sm font-medium">
            Productos
          </Link>
          <Link href="/acerca" className="text-sm font-medium">
            Acerca de
          </Link>
          <Link href="/contacto" className="text-sm font-medium">
            Contacto
          </Link>
        </nav>

        {/* Auth section - desktop */}
        <div className="hidden md:flex items-center gap-4">
          {!!user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{user?.name || user?.email || "Usuario"}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Mi perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/calificaciones" className="w-full cursor-pointer">
                    <Star className="mr-2 h-4 w-4" />
                    <span>Calificar Renters</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                      <Link href="/Autos">
                        <Star className="mr-2 h-4 w-4" />
                        <span>Mis Autos</span>
                      </Link>
                    </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/reservaciones" className="w-full cursor-pointer">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Actividad de Automovil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login" passHref>
                <Button variant="ghost">
                  <LogIn className="mr-2 h-4 w-4" />
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/register" passHref>
                <Button variant="default">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Registrarse
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
