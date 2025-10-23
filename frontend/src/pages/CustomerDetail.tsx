import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    try {
      const response = await api.get(`/customers/${id}`);
      setCustomer(response.data);
    } catch (error) {
      console.error('Errore caricamento cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Caricamento...</div>;
  }

  if (!customer) {
    return <div className="text-center py-8 text-red-600">Cliente non trovato</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/customers" className="text-blue-600 hover:text-blue-800">
            ← Indietro
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">
            {customer.firstName} {customer.lastName}
          </h1>
        </div>
      </div>

      {/* Info Cliente */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Informazioni</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Telefono</p>
            <p className="text-lg font-medium">{customer.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-lg font-medium">{customer.email || 'Non specificata'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Indirizzo</p>
            <p className="text-lg font-medium">{customer.address}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Città</p>
            <p className="text-lg font-medium">{customer.city}</p>
          </div>
        </div>
        {customer.notes && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Note</p>
            <p className="text-lg">{customer.notes}</p>
          </div>
        )}
      </div>

      {/* Caldaie */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Caldaie ({customer.boilers.length})</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {customer.boilers.length === 0 ? (
            <div className="px-6 py-4 text-gray-500 text-center">
              Nessuna caldaia registrata
            </div>
          ) : (
            customer.boilers.map((boiler: any) => (
              <div key={boiler.id} className="px-6 py-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {boiler.brand} {boiler.model}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Matricola: {boiler.serialNumber}
                    </p>
                    {boiler.power && (
                      <p className="text-sm text-gray-600">
                        Potenza: {boiler.power}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {boiler.nextMaintenanceDate && (
                      <span className={`inline-block px-3 py-1 rounded text-sm ${
                        new Date(boiler.nextMaintenanceDate) < new Date()
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        Manutenzione: {format(new Date(boiler.nextMaintenanceDate), 'dd/MM/yyyy')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Storico Interventi */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Storico Interventi</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {customer.interventions.length === 0 ? (
            <div className="px-6 py-4 text-gray-500 text-center">
              Nessun intervento registrato
            </div>
          ) : (
            customer.interventions.map((intervention: any) => (
              <div key={intervention.id} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div>
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
                    <p className="text-sm font-medium mt-2">
                      {intervention.type === 'ORDINARY_MAINTENANCE' && 'Manutenzione Ordinaria'}
                      {intervention.type === 'URGENT_REPAIR' && 'Riparazione Urgente'}
                      {intervention.type === 'INSPECTION' && 'Ispezione'}
                      {intervention.type === 'INSTALLATION' && 'Installazione'}
                      {intervention.type === 'CERTIFICATION' && 'Certificazione'}
                    </p>
                    {intervention.description && (
                      <p className="text-sm text-gray-600 mt-1">{intervention.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {format(new Date(intervention.scheduledAt), 'dd MMM yyyy', { locale: it })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(intervention.scheduledAt), 'HH:mm')}
                    </p>
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
