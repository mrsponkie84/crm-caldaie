import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBoilerModal, setShowBoilerModal] = useState(false);
  const [boilerForm, setBoilerForm] = useState({
    brand: '',
    model: '',
    serialNumber: '',
    installationDate: '',
    power: '',
    type: '',
    nextMaintenanceDate: '',
    notes: '',
  });

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

  const handleBoilerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/boilers', {
        ...boilerForm,
        customerId: id,
      });
      setShowBoilerModal(false);
      setBoilerForm({
        brand: '',
        model: '',
        serialNumber: '',
        installationDate: '',
        power: '',
        type: '',
        nextMaintenanceDate: '',
        notes: '',
      });
      loadCustomer(); // Ricarica per mostrare la nuova caldaia
    } catch (error: any) {
      alert(error.response?.data?.error || 'Errore durante la creazione della caldaia');
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
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Caldaie ({customer.boilers.length})</h2>
          <button
            onClick={() => setShowBoilerModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Nuova Caldaia
          </button>
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
                    {boiler.type && (
                      <p className="text-sm text-gray-600">
                        Tipo: {boiler.type}
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

      {/* Modal Nuova Caldaia */}
      {showBoilerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Nuova Caldaia</h2>
            <form onSubmit={handleBoilerSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca *
                  </label>
                  <input
                    type="text"
                    value={boilerForm.brand}
                    onChange={(e) => setBoilerForm({ ...boilerForm, brand: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="es. Vaillant, Ariston, Baxi"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modello *
                  </label>
                  <input
                    type="text"
                    value={boilerForm.model}
                    onChange={(e) => setBoilerForm({ ...boilerForm, model: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matricola *
                </label>
                <input
                  type="text"
                  value={boilerForm.serialNumber}
                  onChange={(e) => setBoilerForm({ ...boilerForm, serialNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Installazione
                  </label>
                  <input
                    type="date"
                    value={boilerForm.installationDate}
                    onChange={(e) => setBoilerForm({ ...boilerForm, installationDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prossima Manutenzione
                  </label>
                  <input
                    type="date"
                    value={boilerForm.nextMaintenanceDate}
                    onChange={(e) => setBoilerForm({ ...boilerForm, nextMaintenanceDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Potenza
                  </label>
                  <input
                    type="text"
                    value={boilerForm.power}
                    onChange={(e) => setBoilerForm({ ...boilerForm, power: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="es. 24 kW"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <select
                    value={boilerForm.type}
                    onChange={(e) => setBoilerForm({ ...boilerForm, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleziona tipo</option>
                    <option value="Condensazione">Condensazione</option>
                    <option value="Tradizionale">Tradizionale</option>
                    <option value="Camera stagna">Camera stagna</option>
                    <option value="Camera aperta">Camera aperta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <textarea
                  value={boilerForm.notes}
                  onChange={(e) => setBoilerForm({ ...boilerForm, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowBoilerModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Crea Caldaia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
