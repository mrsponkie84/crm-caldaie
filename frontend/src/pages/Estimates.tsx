import { useState, useEffect } from 'react';
import api from '../api/client';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { X, Plus } from 'lucide-react';

interface EstimateItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export default function Estimates() {
  const [estimates, setEstimates] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 giorni
    vat: 22,
    notes: '',
  });
  const [items, setItems] = useState<EstimateItem[]>([
    { description: '', quantity: 1, unitPrice: 0, amount: 0 }
  ]);

  useEffect(() => {
    loadEstimates();
    loadCustomers();
  }, []);

  const loadEstimates = async () => {
    try {
      const response = await api.get('/estimates');
      setEstimates(response.data);
    } catch (error) {
      console.error('Errore caricamento preventivi:', error);
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

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof EstimateItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Calcola amount
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
    }

    setItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const vatAmount = (subtotal * formData.vat) / 100;
    const total = subtotal + vatAmount;
    return { subtotal, vatAmount, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId) {
      alert('Seleziona un cliente');
      return;
    }

    if (items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      alert('Compila tutti i campi delle righe');
      return;
    }

    try {
      await api.post('/estimates', {
        ...formData,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      });

      setShowModal(false);
      resetForm();
      loadEstimates();
    } catch (error) {
      console.error('Errore creazione preventivo:', error);
      alert('Errore durante la creazione del preventivo');
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      vat: 22,
      notes: '',
    });
    setItems([{ description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  const handleStatusChange = async (estimateId: string, newStatus: string) => {
    try {
      await api.put(`/estimates/${estimateId}`, { status: newStatus });
      loadEstimates();
    } catch (error) {
      console.error('Errore aggiornamento stato:', error);
      alert('Errore durante l\'aggiornamento dello stato');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-yellow-100 text-yellow-800',
    };

    const labels = {
      DRAFT: 'Bozza',
      SENT: 'Inviato',
      ACCEPTED: 'Accettato',
      REJECTED: 'Rifiutato',
      EXPIRED: 'Scaduto',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const { subtotal, vatAmount, total } = calculateTotals();

  if (loading) {
    return <div className="text-center py-8">Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Preventivi</h1>
          <p className="text-sm text-gray-600 mt-1">
            ℹ️ I preventivi generati sono documenti informativi. Non sostituiscono la fattura elettronica ufficiale.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuovo Preventivo
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Numero
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Importo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stato
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {estimates.map((estimate) => (
              <tr key={estimate.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {estimate.estimateNumber}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {estimate.customer.firstName} {estimate.customer.lastName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {format(new Date(estimate.date), 'dd MMM yyyy', { locale: it })}
                  </div>
                  <div className="text-xs text-gray-500">
                    Valido fino: {format(new Date(estimate.validUntil), 'dd/MM/yyyy')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    € {estimate.totalAmount.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    (IVA {estimate.vat}%)
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(estimate.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    {estimate.status === 'DRAFT' && (
                      <button
                        onClick={() => handleStatusChange(estimate.id, 'SENT')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Invia
                      </button>
                    )}
                    {estimate.status === 'SENT' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(estimate.id, 'ACCEPTED')}
                          className="text-green-600 hover:text-green-800"
                        >
                          Accetta
                        </button>
                        <button
                          onClick={() => handleStatusChange(estimate.id, 'REJECTED')}
                          className="text-red-600 hover:text-red-800"
                        >
                          Rifiuta
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {estimates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nessun preventivo trovato
          </div>
        )}
      </div>

      {/* Modal Nuovo Preventivo */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Nuovo Preventivo</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dati principali */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cliente *
                    </label>
                    <select
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IVA %
                    </label>
                    <input
                      type="number"
                      value={formData.vat}
                      onChange={(e) => setFormData({ ...formData, vat: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      max="100"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Preventivo *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valido fino a *
                    </label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Righe items */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Righe Preventivo
                    </label>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Aggiungi riga
                    </button>
                  </div>

                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Descrizione</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Q.tà</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Prezzo €/un</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Totale</th>
                          <th className="px-4 py-2"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded"
                                placeholder="Es. Manutenzione caldaia"
                                required
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded"
                                min="0"
                                step="0.01"
                                required
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                className="w-24 px-2 py-1 border border-gray-300 rounded"
                                min="0"
                                step="0.01"
                                required
                              />
                            </td>
                            <td className="px-4 py-2 font-medium">
                              € {item.amount.toFixed(2)}
                            </td>
                            <td className="px-4 py-2">
                              {items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totali */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2 max-w-xs ml-auto">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotale:</span>
                      <span className="font-medium">€ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">IVA {formData.vat}%:</span>
                      <span className="font-medium">€ {vatAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>TOTALE:</span>
                      <span className="text-blue-600">€ {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note (opzionale)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Note aggiuntive..."
                  />
                </div>

                {/* Bottoni */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    Salva Preventivo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
