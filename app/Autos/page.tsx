"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import CarDashboard from "@/components/Autos/MisCarros";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

export default function MisAutos() {
  const [hostId, setHostId] = useState<string | null>(null);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHostId = async () => {
      try {
        setIsLoading(true);
        if (user) {
          setHostId(user.id);
        }
        // Removed the else block that was throwing the error
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del host",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHostId();
  }, [user, toast]);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mis Vehículos</h1>
          <Link href="/">
            <Button variant="outline">Atrás</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : hostId ? (
          <CarDashboard hostId={hostId} />
        ) : (
          <div className="text-center py-8">
            {user === null ? (
              <>
                <p className="text-muted-foreground mb-4">
                  No hay sesión activa. Por favor, inicie sesión.
                </p>
                <Link href="/login">
                  <Button>Iniciar sesión</Button>
                </Link>
              </>
            ) : (
              <p className="text-muted-foreground">
                No se pudo cargar la información del host
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}