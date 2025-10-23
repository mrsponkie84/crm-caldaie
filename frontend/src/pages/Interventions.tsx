import { useState, useEffect } from 'react';
import api from '../api/client';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function Interventions() {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadInterventions();
  }, [filter]);

  const loadInterventions = async () => {
    try {
      const params: any = {};
      if (filter !== 'all') {
        params.status = filter;
      }
      const response = await api.get('/interventions', { params });
      setInterventions(response.data);
    } catch (error) {
      console.error('Errore caricamento interventi:', error);
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
        <h1 className="text-3xl font-bold text-gray-800">Interventi</h1>
      </div>

      {/* Filtri */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Tutti
        </button>
        <button
          onClick={() => setFilter('SCHEDULED')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'SCHEDULED'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Programmati
        </button>
        <button
          onClick={() => setFilter('IN_PROGRESS')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'IN_PROGRESS'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          In Corso
        </button>
        <button
          onClick={() => setFilter('COMPLETED')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'COMPLETED'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Completati
        </button>
      </div>

      {/* Lista interventi */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {interventions.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Nessun intervento trovato
            </div>
          ) : (
            interventions.map((intervention) => (
              <div key={intervention.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        intervention.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        intervention.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                        intervention.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {intervention.status === 'COMPLETED' && 'Completato'}
                        {intervention.status === 'SCHEDULED' && 'Programmato'}
                        {intervention.status === 'IN_PROGRESS' && 'In Corso'}
                        {intervention.status === 'CANCELLED' && 'Annullato'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {intervention.type === 'ORDINARY_MAINTENANCE' && 'Manutenzione Ordinaria'}
                        {intervention.type === 'URGENT_REPAIR' && 'Riparazione Urgente'}
                        {intervention.type === 'INSPECTION' && 'Ispezione'}
                        {intervention.type === 'INSTALLATION' && 'Installazione'}
                        {intervention.type === 'CERTIFICATION' && 'Certificazione'}
                      </span>
                    </div>

                    <h3 className="font-medium text-gray-900">
                      {intervention.customer.firstName} {intervention.customer.lastName}
                    </h3>

                    {intervention.boiler && (
                      <p className="text-sm text-gray-600 mt-1">
                        {intervention.boiler.brand} {intervention.boiler.model}
                      </p>
                    )}

                    {intervention.description && (
                      <p className="text-sm text-gray-600 mt-1">{intervention.description}</p>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      Tecnico: {intervention.technician.firstName} {intervention.technician.lastName}
                    </p>
                  </div>

                  <div className="text-right ml-4">
                    <p className="text-sm font-medium text-blue-600">
                      {format(new Date(intervention.scheduledAt), 'dd MMM yyyy', { locale: it })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(intervention.scheduledAt), 'HH:mm')}
                    </p>
                    {intervention.cost && (
                      <p className="text-sm font-medium text-gray-900 mt-2">
                        € {intervention.cost.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
