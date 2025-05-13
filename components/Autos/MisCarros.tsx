"use client";

import { useState, useEffect } from 'react';

interface Car {
  id: number;
  vin: string;
  año: number;
  marca: string;
  modelo: string;
  placa: string;
  asientos: number;
  puertas: number;
  soat: boolean;
  precio_por_dia: number;
  num_mantenimientos: number;
  transmision: string;
  estado: string;
  direccion: string;
  num_casa: string;
  ciudad: {
    nombre: string;
  };
  combustibles: {
    tipoDeCombustible: string;
  }[];
  caracteristicas: {
    nombre: string;
  }[];
  imagenes: {
    url: string;
  }[];
}

interface CarDashboardProps {
  hostId: string
}

const CarDashboard = ({ hostId }: CarDashboardProps) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);
  const [stats, setStats] = useState<{total: number, autos_con_placa: number} | null>(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/host-cars/${hostId}`);
        if (!response.ok) {
          throw new Error('Error al obtener los autos');
        }
        const data = await response.json();
        
        const formattedCars = data.autos.map((car: any) => ({
          ...car,
          vim: car.vin,
          transmicion: car.transmision, 
          direccion: car.direccion,
          num_casa: car.num_casa || '',
          ciudad: car.ciudad || { nombre: 'Ciudad no especificada' }
        }));
        
        setCars(formattedCars);
        setStats({
          total: data.total,
          autos_con_placa: data.autos_con_placa
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [hostId]);

  const selectedCar = cars.find(car => car.id === selectedCarId);

  if (loading) {
    return <div className="p-6 text-center">Cargando autos...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (cars.length === 0) {
    return <div className="p-6 text-center">No tienes autos registrados</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tablero de Estado de Automóviles</h1>
      
      {/* Listado de vehículos en tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cars.map((car) => (
          <div 
            key={car.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedCarId === car.id 
                ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' 
                : 'hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setSelectedCarId(car.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{car.marca} {car.modelo}</h3>
                <p className="text-gray-600">{car.año} • {car.placa}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                car.estado === 'Disponible' 
                  ? 'bg-green-100 text-green-800' 
                  : car.estado === 'Reservado'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {car.estado}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Transmisión:</span> {car.transmision}</div>
              <div><span className="text-gray-500">Precio/día:</span> ${car.precio_por_dia}</div>
              <div><span className="text-gray-500">Combustible:</span> {car.combustibles[0]?.tipoDeCombustible || 'No especificado'}</div>
              <div><span className="text-gray-500">Ciudad:</span> {car.ciudad?.nombre || 'Ciudad no especificada'}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Detalle del vehículo seleccionado */}
      {selectedCar ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">
              {selectedCar.marca} {selectedCar.modelo} ({selectedCar.año})
            </h2>
            <button 
              onClick={() => setSelectedCarId(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              Cerrar detalle
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium text-gray-700 mb-2">Información del Vehículo</h3>
                <div className="space-y-2">
                  <p><strong>VIN:</strong> {selectedCar.vin}</p>
                  <p><strong>Placa:</strong> {selectedCar.placa || 'No registrada'}</p>
                  <p><strong>Transmisión:</strong> {selectedCar.transmision}</p>
                  <p><strong>Asientos/Puertas:</strong> {selectedCar.asientos} / {selectedCar.puertas}</p>
                  <p><strong>SOAT:</strong> {selectedCar.soat ? 'Vigente' : 'No vigente'}</p>
                  <p><strong>Mantenimientos:</strong> {selectedCar.num_mantenimientos}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium text-gray-700 mb-2">Ubicación</h3>
                <p>{selectedCar.direccion} {selectedCar.num_casa && `#${selectedCar.num_casa}`}</p>
                <p>{selectedCar.ciudad.nombre}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 rounded ${
                selectedCar.estado === 'Disponible' 
                  ? 'bg-green-50 border-green-200' 
                  : selectedCar.estado === 'Reservado'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
              } border`}>
                <h3 className="font-medium text-gray-700 mb-2">Estado Actual</h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{selectedCar.estado}</span>
                  <div className="text-3xl">
                    {selectedCar.estado === 'Disponible' ? '✅' : 
                     selectedCar.estado === 'Reservado' ? '🕒' : '⛔'}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded border border-blue-100">
                  <p className="text-sm text-blue-600">Precio por día</p>
                  <p className="text-2xl font-bold">${selectedCar.precio_por_dia}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded border border-purple-100">
                  <p className="text-sm text-purple-600">Combustible</p>
                  <p className="text-2xl font-bold">{selectedCar.combustibles[0]?.tipoDeCombustible || 'No especificado'}</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded border border-yellow-100">
                <h3 className="font-medium text-gray-700 mb-2">Características</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCar.caracteristicas.length > 0 ? (
                    selectedCar.caracteristicas.map((caracteristica, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {caracteristica.nombre}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No hay características registradas</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
          Seleccione un vehículo para ver detalles completos
        </div>
      )}
    </div>
  );
};

export default CarDashboard;