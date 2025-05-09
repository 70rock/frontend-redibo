"use client";

import CarDashboard from "@/components/Autos/MisCarros";
import Header from "@/components/header";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function MisAutos() {
  const [hostId, setHostId] = useState<number | null>(null);
  
  useEffect(() => {
    const id_usuarioHost = 4;
    setHostId(id_usuarioHost); 
  }, []);

  return (
    <div>
      <Header />
      <div className="p-8">
        {hostId ? (
          <>
            <CarDashboard hostId={hostId} />
            <div className="flex justify-end mt-4">
              <Link href="/">
                <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                  Atrás
                </button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-8">Cargando información del host...</div>
        )}
      </div>
    </div>
  );
}