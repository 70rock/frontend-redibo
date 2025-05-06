"use client"

import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { QRCodeSVG } from "qrcode.react"
import { useSearchParams } from "next/navigation"
import { Copy, Check, Share2 } from "lucide-react"
import Header from "@/components/header"

export default function WhatsAppPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
        <WhatsAppPageContent />
      </Suspense>
    </>
  )
}

function WhatsAppPageContent() {
  const searchParams = useSearchParams()
  const phone = searchParams.get("phone") ?? ""
  const [copiedQR, setCopiedQR] = useState(false)

  if (!phone) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#E4D5C1]">
        <p className="text-[#FCA311] text-lg font-semibold">Número de teléfono no válido.</p>
      </div>
    )
  }

  const cleanPhone = phone.replace(/\D/g, "")
  const whatsappUrl = `https://wa.me/${cleanPhone}`

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(whatsappUrl)
      .then(() => {
        setCopiedQR(true)
        setTimeout(() => setCopiedQR(false), 2000)
      })
      .catch((err) => console.error("Error al copiar:", err))
  }

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "WhatsApp Link",
          text: "Envía un mensaje al instante con este enlace:",
          url: whatsappUrl,
        })
      } catch (error) {
        console.error("Error al compartir:", error)
      }
    } else {
      alert("La función de compartir no está disponible en este dispositivo.")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#E4D5C1] p-4">
      <h1 className="text-3xl font-bold text-black text-center mb-6">Contactar por WhatsApp</h1>
      <p className="text-lg text-center text-black mb-4">
        Escanee el código QR o haga clic en el botón para iniciar una conversación
      </p>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <QRCodeSVG value={whatsappUrl} size={200} />
      </div>

      <Button
        className="bg-[#FCA311] hover:bg-[#e59400] text-black px-24 py-2 border border-white text-lg font-semibold mb-6 w-full max-w-md"
        onClick={() => window.open(whatsappUrl, "_blank")}
      >
        ABRIR WHATSAPP
      </Button>

      <div className="flex gap-4 w-full max-w-md">
        <Button
          className="bg-[#FCA311] hover:bg-[#e59400] text-black text-lg px-6 py-3 rounded-xl flex-1 flex items-center justify-center font-semibold"
          onClick={copyToClipboard}
        >
          {copiedQR ? <Check className="w-5 h-5 text-black mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
          Copiar
        </Button>

        <Button
          className="bg-[#FCA311] hover:bg-[#e59400] text-black text-lg px-6 py-3 rounded-xl flex-1 flex items-center justify-center font-semibold"
          onClick={shareLink}
        >
          <Share2 className="w-5 h-5 mr-2" />
          Compartir
        </Button>
      </div>
    </div>
  )
}
