"use client"
import Header from "@/components/header"
import { Tasklist } from "@/components/historia3/Tasklist"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Historia3Page() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  return (
    <div>
      <Header />
      <div className="p-8">
        {isLoading ? (
          <div className="text-center py-8">Cargando información del usuario...</div>
        ) : user ? (
          <Tasklist hostId={user.id} />
        ) : null}
      </div>
    </div>
  )
}
