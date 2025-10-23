import { useState, useEffect } from 'react';
import api from '../api/client';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface Stats {
  totals: {
    customers: number;
    boilers: number;
    interventions: number;
    scheduledInterventions: number;
    completedInterventionsThisMonth: number;
    pendingInvoices: number;
    overdueMaintenances: number;
  };
  upcomingInterventions: any[];
  expiringMaintenances: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Errore caricamento statistiche:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Caricamento...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8 text-red-600">Errore nel caricamento dei dati</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

      {/* Statistiche principali */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Clienti"
          value={stats.totals.customers}
          icon="👥"
          color="bg-blue-500"
        />
        <StatCard
          title="Caldaie"
          value={stats.totals.boilers}
          icon="🔥"
          color="bg-orange-500"
        />
        <StatCard
          title="Interventi Programmati"
          value={stats.totals.scheduledInterventions}
          icon="📅"
          color="bg-green-500"
        />
        <StatCard
          title="Manutenzioni Scadute"
          value={stats.totals.overdueMaintenances}
          icon="⚠️"
          color="bg-red-500"
        />
      </div>

      {/* Grafici e metriche aggiuntive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Interventi Questo Mese</h3>
          <p className="text-4xl font-bold text-blue-600">
            {stats.totals.completedInterventionsThisMonth}
          </p>
          <p className="text-sm text-gray-600 mt-2">completati</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Fatture in Sospeso</h3>
          <p className="text-4xl font-bold text-yellow-600">
            {stats.totals.pendingInvoices}
          </p>
          <p className="text-sm text-gray-600 mt-2">da inviare/pagare</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Totale Interventi</h3>
          <p className="text-4xl font-bold text-purple-600">
            {stats.totals.interventions}
          </p>
          <p className="text-sm text-gray-600 mt-2">tutti i tempi</p>
        </div>
      </div>

      {/* Prossimi interventi */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Prossimi Interventi (7 giorni)</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {stats.upcomingInterventions.length === 0 ? (
            <div className="px-6 py-4 text-gray-500 text-center">
              Nessun intervento programmato
            </div>
          ) : (
            stats.upcomingInterventions.map((intervention) => (
              <div key={intervention.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {intervention.customer.firstName} {intervention.customer.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {intervention.type === 'ORDINARY_MAINTENANCE' && 'Manutenzione Ordinaria'}
                      {intervention.type === 'URGENT_REPAIR' && 'Riparazione Urgente'}
                      {intervention.type === 'INSPECTION' && 'Ispezione'}
                      {intervention.type === 'INSTALLATION' && 'Installazione'}
                      {intervention.type === 'CERTIFICATION' && 'Certificazione'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Tecnico: {intervention.technician.firstName} {intervention.technician.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">
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

      {/* Manutenzioni in scadenza */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Manutenzioni in Scadenza (30 giorni)</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {stats.expiringMaintenances.length === 0 ? (
            <div className="px-6 py-4 text-gray-500 text-center">
              Nessuna manutenzione in scadenza
            </div>
          ) : (
            stats.expiringMaintenances.map((boiler) => (
              <div key={boiler.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {boiler.customer.firstName} {boiler.customer.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {boiler.brand} {boiler.model} - {boiler.serialNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-600">
                      {format(new Date(boiler.nextMaintenanceDate), 'dd MMM yyyy', { locale: it })}
                    </p>
                    <span className="inline-block mt-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                      Scadenza vicina
                    </span>
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

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`${color} text-white text-3xl p-4 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
