"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function LoginButton() {
  const { toast } = useToast()
  const router = useRouter()

  const handleLogin = () => {
    toast({
      title: "Sesión iniciada",
      description: "Has iniciado sesión correctamente.",
    })

    router.refresh()
  }

  return (
    <Button onClick={handleLogin} className="bg-primary hover:bg-primary/90 text-white">
      Iniciar sesión
    </Button>
  )
}
