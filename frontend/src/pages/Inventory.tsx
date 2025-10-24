import { useState, useEffect } from 'react';
import { Package, Plus, AlertTriangle, TrendingUp, Search, Edit, Trash2 } from 'lucide-react';
import api from '../api/client';

interface Product {
  id: string;
  name: string;
  code?: string;
  category?: string;
  quantity: number;
  purchasePrice?: number;
  sellingPrice?: number;
  supplier?: string;
  minimumStock?: number;
  _count: {
    movements: number;
  };
}

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    quantity: '',
    purchasePrice: '',
    sellingPrice: '',
    supplier: '',
    minimumStock: '',
    notes: ''
  });

  const [movementForm, setMovementForm] = useState({
    type: 'IN' as 'IN' | 'OUT',
    quantity: '',
    notes: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Errore caricamento prodotti:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        quantity: parseFloat(formData.quantity) || 0,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
        sellingPrice: formData.sellingPrice ? parseFloat(formData.sellingPrice) : null,
        minimumStock: formData.minimumStock ? parseFloat(formData.minimumStock) : null
      };

      if (selectedProduct) {
        await api.put(`/products/${selectedProduct.id}`, data);
      } else {
        await api.post('/products', data);
      }

      setShowModal(false);
      setSelectedProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Errore salvataggio prodotto:', error);
      alert('Errore durante il salvataggio');
    }
  };

  const handleMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      await api.post(`/products/${selectedProduct.id}/movements`, {
        type: movementForm.type,
        quantity: parseFloat(movementForm.quantity),
        notes: movementForm.notes
      });

      setShowMovementModal(false);
      setSelectedProduct(null);
      setMovementForm({ type: 'IN', quantity: '', notes: '' });
      fetchProducts();
    } catch (error: any) {
      console.error('Errore registrazione movimento:', error);
      alert(error.response?.data?.error || 'Errore durante la registrazione del movimento');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo prodotto?')) return;

    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error('Errore eliminazione:', error);
      alert('Errore durante l\'eliminazione');
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      code: product.code || '',
      category: product.category || '',
      quantity: product.quantity.toString(),
      purchasePrice: product.purchasePrice?.toString() || '',
      sellingPrice: product.sellingPrice?.toString() || '',
      supplier: product.supplier || '',
      minimumStock: product.minimumStock?.toString() || '',
      notes: ''
    });
    setShowModal(true);
  };

  const openMovementModal = (product: Product) => {
    setSelectedProduct(product);
    setMovementForm({ type: 'IN', quantity: '', notes: '' });
    setShowMovementModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      category: '',
      quantity: '',
      purchasePrice: '',
      sellingPrice: '',
      supplier: '',
      minimumStock: '',
      notes: ''
    });
  };

  const filteredProducts = products
    .filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(p => !filterLowStock || (p.minimumStock != null && p.quantity < p.minimumStock));

  const lowStockCount = products.filter(p => p.minimumStock != null && p.quantity < p.minimumStock).length;
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * (p.purchasePrice || 0)), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Magazzino</h1>
        <p className="text-gray-600">Gestisci l'inventario dei ricambi</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Prodotti Totali</p>
              <p className="text-2xl font-bold text-gray-800">{products.length}</p>
            </div>
            <Package className="w-10 h-10 text-[#3498DB] opacity-20" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Valore Magazzino</p>
              <p className="text-2xl font-bold text-gray-800">€{totalValue.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-[#1ABB9C] opacity-20" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Scorte Basse</p>
              <p className="text-2xl font-bold text-[#E74C3C]">{lowStockCount}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-[#E74C3C] opacity-20" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cerca prodotto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
            />
          </div>
        </div>

        <button
          onClick={() => setFilterLowStock(!filterLowStock)}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
            filterLowStock
              ? 'bg-[#E74C3C] text-white'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
          Scorte basse {lowStockCount > 0 && `(${lowStockCount})`}
        </button>

        <button
          onClick={() => {
            setShowModal(true);
            setSelectedProduct(null);
            resetForm();
          }}
          className="px-4 py-2 bg-[#1ABB9C] text-white rounded-lg hover:bg-[#17a589] transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuovo Prodotto
        </button>
      </div>

      {/* Tabella */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prodotto</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Codice</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantità</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">P. Acquisto</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">P. Vendita</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fornitore</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.map((product) => {
              const isLowStock = product.minimumStock != null && product.quantity < product.minimumStock;

              return (
                <tr key={product.id} className={`hover:bg-gray-50 ${isLowStock ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{product.name}</div>
                    {isLowStock && (
                      <div className="text-xs text-[#E74C3C] flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        Sotto scorta minima ({product.minimumStock})
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{product.code || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{product.category || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      isLowStock ? 'bg-[#E74C3C] text-white' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-700">
                    {product.purchasePrice ? `€${product.purchasePrice.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-700">
                    {product.sellingPrice ? `€${product.sellingPrice.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{product.supplier || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openMovementModal(product)}
                        className="p-1 text-gray-400 hover:text-[#1ABB9C] transition"
                        title="Carico/Scarico"
                      >
                        <TrendingUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-1 text-gray-400 hover:text-[#3498DB] transition"
                        title="Modifica"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1 text-gray-400 hover:text-[#E74C3C] transition"
                        title="Elimina"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm">
              {searchTerm || filterLowStock ? 'Nessun prodotto trovato' : 'Nessun prodotto in magazzino'}
            </p>
          </div>
        )}
      </div>

      {/* Modal Prodotto */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedProduct ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Prodotto *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Codice Articolo</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <input
                    type="text"
                    placeholder="es: Valvole, Pompe, Guarnizioni"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantità Iniziale</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scorta Minima</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prezzo Acquisto (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prezzo Vendita (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fornitore</label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedProduct(null);
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
                  {selectedProduct ? 'Aggiorna' : 'Crea'} Prodotto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Movimento */}
      {showMovementModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Movimento Magazzino</h2>
              <p className="text-sm text-gray-600 mt-1">{selectedProduct.name}</p>
              <p className="text-xs text-gray-500">Quantità attuale: {selectedProduct.quantity}</p>
            </div>

            <form onSubmit={handleMovement} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Movimento *</label>
                  <select
                    value={movementForm.type}
                    onChange={(e) => setMovementForm({ ...movementForm, type: e.target.value as 'IN' | 'OUT' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  >
                    <option value="IN">Carico (acquisto)</option>
                    <option value="OUT">Scarico (utilizzo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantità *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={movementForm.quantity}
                    onChange={(e) => setMovementForm({ ...movementForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                  <textarea
                    value={movementForm.notes}
                    onChange={(e) => setMovementForm({ ...movementForm, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3498DB] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowMovementModal(false);
                    setSelectedProduct(null);
                    setMovementForm({ type: 'IN', quantity: '', notes: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1ABB9C] text-white rounded-lg hover:bg-[#17a589] transition"
                >
                  Registra Movimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
