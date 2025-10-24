import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, FileText, Download, RefreshCw } from 'lucide-react';
import api from '../api/client';

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    change: number;
    count: number;
  };
  profit: {
    amount: number;
    margin: number;
    costs: number;
  };
  potential: {
    amount: number;
    count: number;
  };
  overdue: {
    amount: number;
    count: number;
  };
  revenueTimeline: Array<{
    date: string;
    amount: number;
  }>;
  revenueByType: Array<{
    type: string;
    revenue: number;
    count: number;
  }>;
  alerts: Array<{
    type: string;
    title: string;
    message: string;
    action: string;
    actionLink: string;
  }>;
}

const Analytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Funzione per caricare i dati
  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/analytics/overview');
      setData(response.data.data);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Errore nel caricamento analytics:', error);
      setLoading(false);
    }
  };

  // Carica dati al mount
  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Real-time: aggiorna ogni 30 secondi
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000); // 30 secondi

    return () => clearInterval(interval);
  }, []);

  // Formatta numeri in euro
  const formatEuro = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Formatta percentuale
  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Traduci tipo intervento
  const translateInterventionType = (type: string) => {
    const translations: Record<string, string> = {
      'ORDINARY_MAINTENANCE': 'Manutenzione',
      'URGENT_REPAIR': 'Riparazioni',
      'INSPECTION': 'Ispezioni',
      'INSTALLATION': 'Installazioni',
      'CERTIFICATION': 'Certificazioni'
    };
    return translations[type] || type;
  };

  // Export PDF placeholder
  const handleExportPDF = () => {
    alert('Funzionalità Export PDF sarà disponibile a breve!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1ABB9C]"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Errore nel caricamento dei dati</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header con titolo e azioni */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2A3F54]">Analisi Finanziaria</h1>
          <p className="text-gray-500 mt-1">
            Ultimo aggiornamento: {lastUpdate.toLocaleTimeString('it-IT')}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Aggiorna</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-[#1ABB9C] text-white rounded-lg hover:bg-[#17a589] transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Esporta PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Fatturato Mensile */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-600">Fatturato Mensile</p>
            <div className="p-2 bg-[#1ABB9C]/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-[#1ABB9C]" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-[#2A3F54]">
              {formatEuro(data.revenue.current)}
            </h3>
            <div className="flex items-center gap-2">
              {data.revenue.change >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${data.revenue.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPercent(data.revenue.change)}
              </span>
              <span className="text-sm text-gray-500">vs mese scorso</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {data.revenue.count} fatture questo mese
            </p>
          </div>
        </div>

        {/* Card 2: Margine Netto */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-600">Margine Netto</p>
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-[#2A3F54]">
              {formatEuro(data.profit.amount)}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-600">
                {data.profit.margin.toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500">margine</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Costi: {formatEuro(data.profit.costs)}
            </p>
          </div>
        </div>

        {/* Card 3: Fatturato Potenziale */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-600">Fatturato Potenziale</p>
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-[#2A3F54]">
              {formatEuro(data.potential.amount)}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-purple-600">
                {data.potential.count} preventivi
              </span>
              <span className="text-sm text-gray-500">attivi</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Da convertire in fatture
            </p>
          </div>
        </div>

        {/* Card 4: Fatture Scadute */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-600">Fatture Scadute</p>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-red-600">
              {formatEuro(data.overdue.amount)}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-red-600">
                {data.overdue.count} fatture
              </span>
              <span className="text-sm text-gray-500">da sollecitare</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Richiede azione immediata
            </p>
          </div>
        </div>
      </div>

      {/* Alerts/Notifiche */}
      {data.alerts && data.alerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#2A3F54] mb-4">Notifiche Importanti</h2>
          <div className="space-y-3">
            {data.alerts.map((alert, index) => (
              <div
                key={index}
                className={`flex items-start justify-between p-4 rounded-lg border ${
                  alert.type === 'warning'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <AlertTriangle
                    className={`w-5 h-5 mt-0.5 ${
                      alert.type === 'warning' ? 'text-amber-600' : 'text-blue-600'
                    }`}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{alert.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  </div>
                </div>
                <a
                  href={alert.actionLink}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    alert.type === 'warning'
                      ? 'bg-amber-600 text-white hover:bg-amber-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {alert.action}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grafico Fatturato Ultimi 30 Giorni */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-[#2A3F54] mb-6">
          Andamento Fatturato - Ultimi 30 Giorni
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.revenueTimeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `€${value}`}
            />
            <Tooltip
              formatter={(value: number) => [formatEuro(value), 'Fatturato']}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString('it-IT', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                });
              }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#1ABB9C"
              strokeWidth={2}
              dot={{ fill: '#1ABB9C', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Grafico Breakdown per Tipo Intervento */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-[#2A3F54] mb-6">
          Fatturato per Tipo di Intervento
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.revenueByType.map(item => ({
            ...item,
            typeTranslated: translateInterventionType(item.type)
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="typeTranslated"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `€${value}`}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'revenue') return [formatEuro(value), 'Ricavo'];
                return [value, 'Numero'];
              }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#1ABB9C" name="Ricavo" radius={[8, 8, 0, 0]} />
            <Bar dataKey="count" fill="#2A3F54" name="Numero" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
