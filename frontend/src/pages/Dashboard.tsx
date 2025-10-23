import { useState, useEffect } from 'react';
import api from '../api/client';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Users, Flame, Calendar as CalendarIcon, AlertTriangle, TrendingUp, FileText, Clock } from 'lucide-react';

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
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#73879C]">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Panoramica delle attività aziendali</p>
      </div>

      {/* Statistiche principali */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Clienti Totali"
          value={stats.totals.customers}
          icon={<Users className="w-6 h-6" />}
          bgColor="bg-[#1ABB9C]"
        />
        <StatCard
          title="Caldaie Gestite"
          value={stats.totals.boilers}
          icon={<Flame className="w-6 h-6" />}
          bgColor="bg-[#E74C3C]"
        />
        <StatCard
          title="Interventi Programmati"
          value={stats.totals.scheduledInterventions}
          icon={<CalendarIcon className="w-6 h-6" />}
          bgColor="bg-[#3498DB]"
        />
        <StatCard
          title="Manutenzioni Scadute"
          value={stats.totals.overdueMaintenances}
          icon={<AlertTriangle className="w-6 h-6" />}
          bgColor="bg-[#F39C12]"
        />
      </div>

      {/* Grafici e metriche aggiuntive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <InfoCard
          title="Interventi Questo Mese"
          value={stats.totals.completedInterventionsThisMonth}
          subtitle="completati"
          icon={<TrendingUp className="w-8 h-8 text-[#1ABB9C]" />}
        />
        <InfoCard
          title="Promemoria in Sospeso"
          value={stats.totals.pendingInvoices}
          subtitle="da inviare/pagare"
          icon={<FileText className="w-8 h-8 text-[#F39C12]" />}
        />
        <InfoCard
          title="Totale Interventi"
          value={stats.totals.interventions}
          subtitle="tutti i tempi"
          icon={<Clock className="w-8 h-8 text-[#3498DB]" />}
        />
      </div>

      {/* Prossimi interventi */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-[#73879C]">Prossimi Interventi</h2>
          <p className="text-xs text-gray-500 mt-1">Prossimi 7 giorni</p>
        </div>
        <div className="divide-y divide-gray-100">
          {stats.upcomingInterventions.length === 0 ? (
            <div className="px-5 py-8 text-gray-400 text-center text-sm">
              Nessun intervento programmato
            </div>
          ) : (
            stats.upcomingInterventions.map((intervention) => (
              <div key={intervention.id} className="px-5 py-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">
                      {intervention.customer.firstName} {intervention.customer.lastName}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {intervention.type === 'ORDINARY_MAINTENANCE' && 'Manutenzione Ordinaria'}
                      {intervention.type === 'URGENT_REPAIR' && 'Riparazione Urgente'}
                      {intervention.type === 'INSPECTION' && 'Ispezione'}
                      {intervention.type === 'INSTALLATION' && 'Installazione'}
                      {intervention.type === 'CERTIFICATION' && 'Certificazione'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      👤 {intervention.technician.firstName} {intervention.technician.lastName}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-medium text-[#1ABB9C]">
                      {format(new Date(intervention.scheduledAt), 'dd MMM yyyy', { locale: it })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
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
      <div className="bg-white rounded-md shadow-sm border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-[#73879C]">Manutenzioni in Scadenza</h2>
          <p className="text-xs text-gray-500 mt-1">Prossimi 30 giorni</p>
        </div>
        <div className="divide-y divide-gray-100">
          {stats.expiringMaintenances.length === 0 ? (
            <div className="px-5 py-8 text-gray-400 text-center text-sm">
              Nessuna manutenzione in scadenza
            </div>
          ) : (
            stats.expiringMaintenances.map((boiler) => (
              <div key={boiler.id} className="px-5 py-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">
                      {boiler.customer.firstName} {boiler.customer.lastName}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {boiler.brand} {boiler.model} - {boiler.serialNumber}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-medium text-[#F39C12]">
                      {format(new Date(boiler.nextMaintenanceDate), 'dd MMM yyyy', { locale: it })}
                    </p>
                    <span className="inline-block mt-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
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

function StatCard({
  title,
  value,
  icon,
  bgColor
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
}) {
  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
          </div>
          <div className={`${bgColor} text-white p-3 rounded-lg`}>
            {icon}
          </div>
        </div>
      </div>
      <div className={`${bgColor} h-1`}></div>
    </div>
  );
}

function InfoCard({
  title,
  value,
  subtitle,
  icon
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}
