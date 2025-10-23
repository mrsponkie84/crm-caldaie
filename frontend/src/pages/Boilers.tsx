import { useState, useEffect } from 'react';
import api from '../api/client';

export default function Boilers() {
  const [boilers, setBoilers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBoilers();
  }, []);

  const loadBoilers = async () => {
    try {
      const response = await api.get('/boilers');
      setBoilers(response.data);
    } catch (error) {
      console.error('Errore caricamento caldaie:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Caldaie</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boilers.map((boiler) => (
          <div key={boiler.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {boiler.brand} {boiler.model}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {boiler.customer.firstName} {boiler.customer.lastName}
                </p>
              </div>
              <span className="text-2xl">🔥</span>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Matricola:</span>
                <span className="ml-2 font-medium">{boiler.serialNumber}</span>
              </div>
              {boiler.power && (
                <div>
                  <span className="text-gray-600">Potenza:</span>
                  <span className="ml-2 font-medium">{boiler.power}</span>
                </div>
              )}
              {boiler.type && (
                <div>
                  <span className="text-gray-600">Tipo:</span>
                  <span className="ml-2 font-medium">{boiler.type}</span>
                </div>
              )}
              {boiler.nextMaintenanceDate && (
                <div>
                  <span className="text-gray-600">Prossima manutenzione:</span>
                  <span className={`ml-2 font-medium ${
                    new Date(boiler.nextMaintenanceDate) < new Date()
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}>
                    {new Date(boiler.nextMaintenanceDate).toLocaleDateString('it-IT')}
                  </span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Interventi:</span>
                <span className="ml-2 font-medium">{boiler._count.interventions}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {boilers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Nessuna caldaia registrata
        </div>
      )}
    </div>
  );
}
