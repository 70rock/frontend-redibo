"use client"
import { useParams } from "next/navigation"
import RenterDetails from "@/components/renter-details"
import Header from "@/components/header"

export default function RenterPage() {
  const params = useParams()
  const renterId = params.id as string

  return (
    <div>
      <Header />
      <RenterDetails renterId={renterId} />
    </div>
  )
}
