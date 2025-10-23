import { useState, useEffect } from 'react';
import api from '../api/client';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function Interventions() {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [boilers, setBoilers] = useState<any[]>([]);
  const [form, setForm] = useState({
    customerId: '',
    boilerId: '',
    type: 'ORDINARY_MAINTENANCE',
    scheduledAt: '',
    description: '',
    notes: '',
  });

  useEffect(() => {
    loadInterventions();
  }, [filter]);

  useEffect(() => {
    if (showModal) {
      loadCustomers();
    }
  }, [showModal]);

  useEffect(() => {
    if (form.customerId) {
      loadBoilers(form.customerId);
    } else {
      setBoilers([]);
    }
  }, [form.customerId]);

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

  const loadCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Errore caricamento clienti:', error);
    }
  };

  const loadBoilers = async (customerId: string) => {
    try {
      const response = await api.get(`/boilers/customer/${customerId}`);
      setBoilers(response.data);
    } catch (error) {
      console.error('Errore caricamento caldaie:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/interventions', {
        ...form,
        boilerId: form.boilerId || null,
      });
      setShowModal(false);
      setForm({
        customerId: '',
        boilerId: '',
        type: 'ORDINARY_MAINTENANCE',
        scheduledAt: '',
        description: '',
        notes: '',
      });
      loadInterventions();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Errore durante la creazione dell\'intervento');
    }
  };

  const handleStatusChange = async (interventionId: string, newStatus: string) => {
    try {
      await api.put(`/interventions/${interventionId}`, {
        status: newStatus,
        ...(newStatus === 'COMPLETED' && { completedAt: new Date().toISOString() })
      });
      loadInterventions();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Errore durante l\'aggiornamento');
    }
  };

  const isOverdue = (intervention: any) => {
    if (intervention.status !== 'SCHEDULED') return false;
    return new Date(intervention.scheduledAt) < new Date();
  };

  if (loading) {
    return <div className="text-center py-8">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Interventi</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          + Nuovo Intervento
        </button>
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
                      {isOverdue(intervention) && (
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                          Scaduto
                        </span>
                      )}
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

                    {/* Pulsanti cambio stato */}
                    <div className="flex gap-2 mt-3">
                      {intervention.status === 'SCHEDULED' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(intervention.id, 'IN_PROGRESS')}
                            className="px-3 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded transition"
                          >
                            Inizia
                          </button>
                          <button
                            onClick={() => handleStatusChange(intervention.id, 'COMPLETED')}
                            className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition"
                          >
                            Completa
                          </button>
                        </>
                      )}
                      {intervention.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleStatusChange(intervention.id, 'COMPLETED')}
                          className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition"
                        >
                          Completa
                        </button>
                      )}
                      {(intervention.status === 'SCHEDULED' || intervention.status === 'IN_PROGRESS') && (
                        <button
                          onClick={() => handleStatusChange(intervention.id, 'CANCELLED')}
                          className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition"
                        >
                          Annulla
                        </button>
                      )}
                    </div>
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

      {/* Modal Nuovo Intervento */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Nuovo Intervento</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cliente *
                </label>
                <select
                  value={form.customerId}
                  onChange={(e) => setForm({ ...form, customerId: e.target.value, boilerId: '' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleziona cliente</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {form.customerId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Caldaia (opzionale)
                  </label>
                  <select
                    value={form.boilerId}
                    onChange={(e) => setForm({ ...form, boilerId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Nessuna caldaia</option>
                    {boilers.map((boiler) => (
                      <option key={boiler.id} value={boiler.id}>
                        {boiler.brand} {boiler.model} - {boiler.serialNumber}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo Intervento *
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="ORDINARY_MAINTENANCE">Manutenzione Ordinaria</option>
                  <option value="URGENT_REPAIR">Riparazione Urgente</option>
                  <option value="INSPECTION">Ispezione</option>
                  <option value="INSTALLATION">Installazione</option>
                  <option value="CERTIFICATION">Certificazione (Bollino Blu)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data e Ora *
                </label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrizione
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descrizione dell'intervento..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Crea Intervento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
