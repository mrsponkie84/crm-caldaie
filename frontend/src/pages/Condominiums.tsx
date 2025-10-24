import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, MapPin, Search, Edit, Trash2 } from 'lucide-react';
import api from '../api/client';

interface CondominiumAdministrator {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  email?: string;
  phone?: string;
}

interface Condominium {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  totalApartments?: number;
  systemType?: string;
  administrator?: CondominiumAdministrator;
  _count: {
    apartments: number;
    boilers: number;
    interventions: number;
  };
}

export default function Condominiums() {
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [administrators, setAdministrators] = useState<CondominiumAdministrator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingCondominium, setEditingCondominium] = useState<Condominium | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: '',
    fiscalCode: '',
    vatNumber: '',
    totalApartments: '',
    systemType: 'Misto',
    buildYear: '',
    notes: '',
    administratorId: ''
  });

  const [adminFormData, setAdminFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    officeAddress: '',
    notes: ''
  });

  useEffect(() => {
    fetchCondominiums();
    fetchAdministrators();
  }, []);

  const fetchCondominiums = async () => {
    try {
      const response = await api.get('/condominiums');
      setCondominiums(response.data);
    } catch (error) {
      console.error('Errore caricamento condomini:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdministrators = async () => {
    try {
      const response = await api.get('/condominium-administrators');
      setAdministrators(response.data);
    } catch (error) {
      console.error('Errore caricamento amministratori:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        totalApartments: formData.totalApartments ? parseInt(formData.totalApartments) : null,
        buildYear: formData.buildYear ? parseInt(formData.buildYear) : null,
        administratorId: formData.administratorId || null
      };

      if (editingCondominium) {
        await api.put(`/condominiums/${editingCondominium.id}`, data);
      } else {
        await api.post('/condominiums', data);
      }

      setShowModal(false);
      setEditingCondominium(null);
      resetForm();
      fetchCondominiums();
    } catch (error) {
      console.error('Errore salvataggio condominio:', error);
      alert('Errore durante il salvataggio');
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/condominium-administrators', adminFormData);
      setShowAdminModal(false);
      resetAdminForm();
      fetchAdministrators();
      alert('Amministratore creato con successo!');
    } catch (error) {
      console.error('Errore creazione amministratore:', error);
      alert('Errore durante la creazione');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo condominio?')) return;

    try {
      await api.delete(`/condominiums/${id}`);
      fetchCondominiums();
    } catch (error) {
      console.error('Errore eliminazione:', error);
      alert('Errore durante l\'eliminazione');
    }
  };

  const openEditModal = (condominium: Condominium) => {
    setEditingCondominium(condominium);
    setFormData({
      name: condominium.name,
      address: condominium.address,
      city: condominium.city,
      postalCode: '',
      phone: condominium.phone || '',
      email: condominium.email || '',
      fiscalCode: '',
      vatNumber: '',
      totalApartments: condominium.totalApartments?.toString() || '',
      systemType: condominium.systemType || 'Misto',
      buildYear: '',
      notes: '',
      administratorId: condominium.administrator?.id || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      postalCode: '',
      phone: '',
      email: '',
      fiscalCode: '',
      vatNumber: '',
      totalApartments: '',
      systemType: 'Misto',
      buildYear: '',
      notes: '',
      administratorId: ''
    });
  };

  const resetAdminForm = () => {
    setAdminFormData({
      firstName: '',
      lastName: '',
      company: '',
      email: '',
      phone: '',
      officeAddress: '',
      notes: ''
    });
  };

  const filteredCondominiums = condominiums.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.address.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Condomini</h1>
        <p className="text-gray-600">Gestisci i condomini e le caldaie centralizzate</p>
      </div>

      {/* Actions */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cerca condominio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
            />
          </div>
        </div>
        <button
          onClick={() => {
            setShowAdminModal(true);
            resetAdminForm();
          }}
          className="px-4 py-2 bg-[#3498DB] text-white rounded-lg hover:bg-[#2980b9] transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuovo Amministratore
        </button>
        <button
          onClick={() => {
            setShowModal(true);
            setEditingCondominium(null);
            resetForm();
          }}
          className="px-4 py-2 bg-[#1ABB9C] text-white rounded-lg hover:bg-[#17a589] transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuovo Condominio
        </button>
      </div>

      {/* Lista Condomini */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCondominiums.map((condominium) => (
          <div
            key={condominium.id}
            className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-[#3498DB] bg-opacity-10 p-2 rounded-lg">
                  <Building2 className="w-6 h-6 text-[#3498DB]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{condominium.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {condominium.city}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEditModal(condominium)}
                  className="p-1 text-gray-400 hover:text-[#3498DB] transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(condominium.id)}
                  className="p-1 text-gray-400 hover:text-[#E74C3C] transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3">{condominium.address}</p>

            {condominium.administrator && (
              <div className="text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded">
                <strong>Amministratore:</strong> {condominium.administrator.firstName} {condominium.administrator.lastName}
                {condominium.administrator.company && ` - ${condominium.administrator.company}`}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4 pt-3 border-t">
              <div className="text-center">
                <div className="text-lg font-bold text-[#3498DB]">{condominium._count.apartments}</div>
                <div className="text-xs text-gray-500">Appartamenti</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-[#1ABB9C]">{condominium._count.boilers}</div>
                <div className="text-xs text-gray-500">Caldaie</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-[#F39C12]">{condominium._count.interventions}</div>
                <div className="text-xs text-gray-500">Interventi</div>
              </div>
            </div>

            <Link
              to={`/app/condominiums/${condominium.id}`}
              className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition text-sm font-medium"
            >
              Vedi Dettagli
            </Link>
          </div>
        ))}
      </div>

      {filteredCondominiums.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            {searchTerm ? 'Nessun condominio trovato' : 'Nessun condominio'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Prova con un altro termine di ricerca' : 'Inizia creando il primo condominio'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setShowModal(true);
                setEditingCondominium(null);
                resetForm();
              }}
              className="px-6 py-2 bg-[#1ABB9C] text-white rounded-lg hover:bg-[#17a589] transition"
            >
              Crea Condominio
            </button>
          )}
        </div>
      )}

      {/* Modal Condominio */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {editingCondominium ? 'Modifica Condominio' : 'Nuovo Condominio'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Condominio *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Città *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CAP</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Codice Fiscale</label>
                  <input
                    type="text"
                    value={formData.fiscalCode}
                    onChange={(e) => setFormData({ ...formData, fiscalCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Partita IVA</label>
                  <input
                    type="text"
                    value={formData.vatNumber}
                    onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">N° Appartamenti</label>
                  <input
                    type="number"
                    value={formData.totalApartments}
                    onChange={(e) => setFormData({ ...formData, totalApartments: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Impianto</label>
                  <select
                    value={formData.systemType}
                    onChange={(e) => setFormData({ ...formData, systemType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  >
                    <option value="Centralizzato">Centralizzato</option>
                    <option value="Autonomo">Autonomo</option>
                    <option value="Misto">Misto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Anno Costruzione</label>
                  <input
                    type="number"
                    value={formData.buildYear}
                    onChange={(e) => setFormData({ ...formData, buildYear: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amministratore</label>
                  <select
                    value={formData.administratorId}
                    onChange={(e) => setFormData({ ...formData, administratorId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  >
                    <option value="">-- Nessuno --</option>
                    {administrators.map((admin) => (
                      <option key={admin.id} value={admin.id}>
                        {admin.firstName} {admin.lastName} {admin.company && `- ${admin.company}`}
                      </option>
                    ))}
                  </select>
                </div>

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
                    setEditingCondominium(null);
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
                  {editingCondominium ? 'Aggiorna' : 'Crea'} Condominio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Amministratore */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Nuovo Amministratore di Condominio</h2>
            </div>

            <form onSubmit={handleAdminSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    type="text"
                    required
                    value={adminFormData.firstName}
                    onChange={(e) => setAdminFormData({ ...adminFormData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cognome *</label>
                  <input
                    type="text"
                    required
                    value={adminFormData.lastName}
                    onChange={(e) => setAdminFormData({ ...adminFormData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Studio/Società</label>
                  <input
                    type="text"
                    value={adminFormData.company}
                    onChange={(e) => setAdminFormData({ ...adminFormData, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={adminFormData.email}
                    onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                  <input
                    type="tel"
                    value={adminFormData.phone}
                    onChange={(e) => setAdminFormData({ ...adminFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo Studio</label>
                  <input
                    type="text"
                    value={adminFormData.officeAddress}
                    onChange={(e) => setAdminFormData({ ...adminFormData, officeAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                  <textarea
                    value={adminFormData.notes}
                    onChange={(e) => setAdminFormData({ ...adminFormData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminModal(false);
                    resetAdminForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1ABB9C] text-white rounded-lg hover:bg-[#17a589] transition"
                >
                  Crea Amministratore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
