import { useState, useEffect } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, Plus, Clock, CheckCircle, AlertCircle, Search } from 'lucide-react';
import api from '../api/client';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

interface Call {
  id: string;
  direction: 'INCOMING' | 'OUTGOING';
  status: 'COMPLETED' | 'CALLBACK_SCHEDULED' | 'MISSED';
  scheduledCallback?: string;
  notes?: string;
  duration?: number;
  createdAt: string;
  customer: Customer;
  user: User;
}

export default function Calls() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    customerId: '',
    direction: 'INCOMING' as 'INCOMING' | 'OUTGOING',
    status: 'COMPLETED' as 'COMPLETED' | 'CALLBACK_SCHEDULED' | 'MISSED',
    scheduledCallback: '',
    notes: '',
    duration: ''
  });

  useEffect(() => {
    fetchCalls();
    fetchCustomers();
  }, [filterStatus]);

  const fetchCalls = async () => {
    try {
      const params = filterStatus ? `?status=${filterStatus}` : '';
      const response = await api.get(`/calls${params}`);
      setCalls(response.data);
    } catch (error) {
      console.error('Errore caricamento chiamate:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Errore caricamento clienti:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        duration: formData.duration ? parseInt(formData.duration) : null,
        scheduledCallback: formData.scheduledCallback || null
      };

      await api.post('/calls', data);
      setShowModal(false);
      resetForm();
      fetchCalls();
    } catch (error) {
      console.error('Errore creazione chiamata:', error);
      alert('Errore durante la creazione');
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      direction: 'INCOMING',
      status: 'COMPLETED',
      scheduledCallback: '',
      notes: '',
      duration: ''
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2 py-1 text-xs rounded-full bg-[#d5f4ec] text-[#1ABB9C] flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Completata
        </span>;
      case 'CALLBACK_SCHEDULED':
        return <span className="px-2 py-1 text-xs rounded-full bg-[#fff4e5] text-[#F39C12] flex items-center gap-1">
          <Clock className="w-3 h-3" /> Da richiamare
        </span>;
      case 'MISSED':
        return <span className="px-2 py-1 text-xs rounded-full bg-[#fadbd8] text-[#E74C3C] flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Persa
        </span>;
      default:
        return null;
    }
  };

  const filteredCalls = calls.filter(call =>
    call.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.customer.phone.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Lista Chiamate</h1>
        <p className="text-gray-600">Gestisci le chiamate con i clienti e i promemoria</p>
      </div>

      {/* Actions */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cerca cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
            />
          </div>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
        >
          <option value="">Tutte le chiamate</option>
          <option value="CALLBACK_SCHEDULED">Da richiamare</option>
          <option value="COMPLETED">Completate</option>
          <option value="MISSED">Perse</option>
        </select>

        <button
          onClick={() => {
            setShowModal(true);
            resetForm();
          }}
          className="px-4 py-2 bg-[#1ABB9C] text-white rounded-lg hover:bg-[#17a589] transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuova Chiamata
        </button>
      </div>

      {/* Lista Chiamate */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data/Ora</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Richiamo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operatore</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCalls.map((call) => (
              <tr key={call.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700">
                  {new Date(call.createdAt).toLocaleString('it-IT', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {call.duration && <div className="text-xs text-gray-500">{call.duration} min</div>}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">
                    {call.customer.firstName} {call.customer.lastName}
                  </div>
                  <div className="text-xs text-gray-500">{call.customer.phone}</div>
                </td>
                <td className="px-4 py-3">
                  {call.direction === 'INCOMING' ? (
                    <span className="flex items-center gap-1 text-sm text-[#3498DB]">
                      <PhoneIncoming className="w-4 h-4" /> In entrata
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm text-[#1ABB9C]">
                      <PhoneOutgoing className="w-4 h-4" /> In uscita
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">{getStatusBadge(call.status)}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {call.scheduledCallback
                    ? new Date(call.scheduledCallback).toLocaleString('it-IT', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {call.user.firstName} {call.user.lastName}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                  {call.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCalls.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Phone className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm">
              {searchTerm || filterStatus ? 'Nessuna chiamata trovata' : 'Nessuna chiamata registrata'}
            </p>
          </div>
        )}
      </div>

      {/* Modal Nuova Chiamata */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Nuova Chiamata</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                  <select
                    required
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  >
                    <option value="">-- Seleziona cliente --</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.firstName} {customer.lastName} - {customer.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                  <select
                    value={formData.direction}
                    onChange={(e) => setFormData({ ...formData, direction: e.target.value as 'INCOMING' | 'OUTGOING' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  >
                    <option value="INCOMING">In entrata</option>
                    <option value="OUTGOING">In uscita</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stato *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  >
                    <option value="COMPLETED">Completata</option>
                    <option value="CALLBACK_SCHEDULED">Da richiamare</option>
                    <option value="MISSED">Persa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durata (minuti)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                {formData.status === 'CALLBACK_SCHEDULED' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data/Ora Richiamo</label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledCallback}
                      onChange={(e) => setFormData({ ...formData, scheduledCallback: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1ABB9C] text-white rounded-lg hover:bg-[#17a589] transition"
                >
                  Salva Chiamata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
