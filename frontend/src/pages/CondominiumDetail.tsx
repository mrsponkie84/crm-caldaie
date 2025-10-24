import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  User,
  Plus,
  Home,
  Flame,
  Calendar,
  Edit,
  Trash2
} from 'lucide-react';
import api from '../services/api';

interface CondominiumAdministrator {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  email?: string;
  phone?: string;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
}

interface Apartment {
  id: string;
  apartmentNumber: string;
  floor?: string;
  customer: Customer;
}

interface Boiler {
  id: string;
  brand: string;
  model: string;
  serialNumber: string;
  power?: string;
  isShared: boolean;
  nextMaintenanceDate?: string;
}

interface Intervention {
  id: string;
  type: string;
  status: string;
  scheduledAt: string;
  technician: {
    firstName: string;
    lastName: string;
  };
  boiler?: {
    brand: string;
    model: string;
  };
}

interface Condominium {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  fiscalCode?: string;
  vatNumber?: string;
  totalApartments?: number;
  systemType?: string;
  buildYear?: number;
  notes?: string;
  administrator?: CondominiumAdministrator;
  apartments: Apartment[];
  boilers: Boiler[];
  interventions: Intervention[];
}

export default function CondominiumDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [condominium, setCondominium] = useState<Condominium | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApartmentModal, setShowApartmentModal] = useState(false);
  const [apartmentForm, setApartmentForm] = useState({
    customerId: '',
    apartmentNumber: '',
    floor: '',
    notes: ''
  });

  useEffect(() => {
    fetchCondominium();
    fetchCustomers();
  }, [id]);

  const fetchCondominium = async () => {
    try {
      const response = await api.get(`/condominiums/${id}`);
      setCondominium(response.data);
    } catch (error) {
      console.error('Errore caricamento condominio:', error);
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

  const handleAddApartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/condominiums/${id}/apartments`, apartmentForm);
      setShowApartmentModal(false);
      setApartmentForm({ customerId: '', apartmentNumber: '', floor: '', notes: '' });
      fetchCondominium();
    } catch (error) {
      console.error('Errore aggiunta appartamento:', error);
      alert('Errore durante l\'aggiunta dell\'appartamento');
    }
  };

  const handleDeleteApartment = async (apartmentId: string) => {
    if (!confirm('Sei sicuro di voler rimuovere questo appartamento?')) return;

    try {
      await api.delete(`/condominiums/${id}/apartments/${apartmentId}`);
      fetchCondominium();
    } catch (error) {
      console.error('Errore rimozione appartamento:', error);
      alert('Errore durante la rimozione');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Caricamento...</div>
      </div>
    );
  }

  if (!condominium) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Condominio non trovato</h2>
          <button
            onClick={() => navigate('/app/condominiums')}
            className="text-[#3498DB] hover:underline"
          >
            Torna alla lista condomini
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/app/condominiums')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Torna ai condomini
        </button>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-[#3498DB] bg-opacity-10 p-3 rounded-lg">
                <Building2 className="w-8 h-8 text-[#3498DB]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{condominium.name}</h1>
                <div className="flex items-center text-gray-600 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {condominium.address}, {condominium.city} {condominium.postalCode}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
            {condominium.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{condominium.phone}</span>
              </div>
            )}
            {condominium.email && (
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{condominium.email}</span>
              </div>
            )}
            {condominium.administrator && (
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span className="text-sm">
                  Amm.: {condominium.administrator.firstName} {condominium.administrator.lastName}
                </span>
              </div>
            )}
          </div>

          {condominium.systemType && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Tipo Impianto:</span>
                  <span className="ml-2 font-medium">{condominium.systemType}</span>
                </div>
                {condominium.totalApartments && (
                  <div>
                    <span className="text-gray-500">N° Appartamenti:</span>
                    <span className="ml-2 font-medium">{condominium.totalApartments}</span>
                  </div>
                )}
                {condominium.buildYear && (
                  <div>
                    <span className="text-gray-500">Anno Costruzione:</span>
                    <span className="ml-2 font-medium">{condominium.buildYear}</span>
                  </div>
                )}
                {condominium.fiscalCode && (
                  <div>
                    <span className="text-gray-500">Codice Fiscale:</span>
                    <span className="ml-2 font-medium">{condominium.fiscalCode}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appartamenti */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Home className="w-5 h-5 text-[#3498DB]" />
              Appartamenti ({condominium.apartments.length})
            </h2>
            <button
              onClick={() => setShowApartmentModal(true)}
              className="px-3 py-1 bg-[#1ABB9C] text-white rounded-lg hover:bg-[#17a589] transition text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Aggiungi
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {condominium.apartments.map((apartment) => (
              <div
                key={apartment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div>
                  <div className="font-medium text-gray-800">
                    {apartment.apartmentNumber}
                    {apartment.floor && <span className="text-sm text-gray-500 ml-2">Piano {apartment.floor}</span>}
                  </div>
                  <div className="text-sm text-gray-600">
                    {apartment.customer.firstName} {apartment.customer.lastName}
                  </div>
                  <div className="text-xs text-gray-500">{apartment.customer.phone}</div>
                </div>
                <button
                  onClick={() => handleDeleteApartment(apartment.id)}
                  className="p-2 text-gray-400 hover:text-[#E74C3C] transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {condominium.apartments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Home className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm">Nessun appartamento registrato</p>
              </div>
            )}
          </div>
        </div>

        {/* Caldaie Centralizzate */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#F39C12]" />
              Caldaie Centralizzate ({condominium.boilers.length})
            </h2>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {condominium.boilers.map((boiler) => (
              <div
                key={boiler.id}
                className="p-3 bg-gray-50 rounded-lg"
              >
                <div className="font-medium text-gray-800">
                  {boiler.brand} {boiler.model}
                </div>
                <div className="text-sm text-gray-600">Matricola: {boiler.serialNumber}</div>
                {boiler.power && (
                  <div className="text-sm text-gray-600">Potenza: {boiler.power}</div>
                )}
                {boiler.nextMaintenanceDate && (
                  <div className="text-xs text-[#F39C12] mt-1">
                    Prossima manutenzione: {new Date(boiler.nextMaintenanceDate).toLocaleDateString('it-IT')}
                  </div>
                )}
              </div>
            ))}
            {condominium.boilers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Flame className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm">Nessuna caldaia centralizzata</p>
                <p className="text-xs mt-1">Aggiungi caldaia dalla pagina Caldaie</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interventi */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#3498DB]" />
          Interventi Recenti ({condominium.interventions.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Caldaia</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tecnico</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {condominium.interventions.map((intervention) => (
                <tr key={intervention.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(intervention.scheduledAt).toLocaleDateString('it-IT')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{intervention.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {intervention.boiler ? `${intervention.boiler.brand} ${intervention.boiler.model}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {intervention.technician.firstName} {intervention.technician.lastName}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        intervention.status === 'COMPLETED'
                          ? 'bg-[#d5f4ec] text-[#1ABB9C]'
                          : intervention.status === 'IN_PROGRESS'
                          ? 'bg-[#fff4e5] text-[#F39C12]'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {intervention.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {condominium.interventions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">Nessun intervento registrato</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Aggiungi Appartamento */}
      {showApartmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Aggiungi Appartamento</h2>
            </div>

            <form onSubmit={handleAddApartment} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                  <select
                    required
                    value={apartmentForm.customerId}
                    onChange={(e) => setApartmentForm({ ...apartmentForm, customerId: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numero Appartamento *</label>
                  <input
                    type="text"
                    required
                    placeholder="es: Int. 3, Scala A - Piano 2"
                    value={apartmentForm.apartmentNumber}
                    onChange={(e) => setApartmentForm({ ...apartmentForm, apartmentNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Piano</label>
                  <input
                    type="text"
                    placeholder="es: 2"
                    value={apartmentForm.floor}
                    onChange={(e) => setApartmentForm({ ...apartmentForm, floor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                  <textarea
                    value={apartmentForm.notes}
                    onChange={(e) => setApartmentForm({ ...apartmentForm, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowApartmentModal(false);
                    setApartmentForm({ customerId: '', apartmentNumber: '', floor: '', notes: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1ABB9C] text-white rounded-lg hover:bg-[#17a589] transition"
                >
                  Aggiungi Appartamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
