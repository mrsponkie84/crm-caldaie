import { useState, useEffect } from 'react';
import api from '../api/client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterventions();
  }, [currentDate]);

  const loadInterventions = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await api.get(`/interventions/calendar?year=${year}&month=${month}`);
      setInterventions(response.data);
    } catch (error) {
      console.error('Errore caricamento calendario:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getInterventionsForDay = (day: Date) => {
    return interventions.filter(i => isSameDay(new Date(i.scheduledAt), day));
  };

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Calendario</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={prevMonth}
            className="px-4 py-2 bg-white hover:bg-gray-50 border rounded-lg transition"
          >
            ← Mese Precedente
          </button>
          <h2 className="text-xl font-semibold">
            {format(currentDate, 'MMMM yyyy', { locale: it })}
          </h2>
          <button
            onClick={nextMonth}
            className="px-4 py-2 bg-white hover:bg-gray-50 border rounded-lg transition"
          >
            Mese Successivo →
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Caricamento...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Header giorni della settimana */}
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
              <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700">
                {day}
              </div>
            ))}
          </div>

          {/* Griglia calendario */}
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {/* Giorni vuoti all'inizio */}
            {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-gray-50 min-h-24"></div>
            ))}

            {/* Giorni del mese */}
            {days.map(day => {
              const dayInterventions = getInterventionsForDay(day);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toString()}
                  className={`bg-white min-h-24 p-2 ${
                    isToday ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {format(day, 'd')}
                  </div>

                  <div className="space-y-1">
                    {dayInterventions.map(intervention => (
                      <div
                        key={intervention.id}
                        className={`text-xs p-1 rounded truncate ${
                          intervention.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          intervention.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                          intervention.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                        title={`${format(new Date(intervention.scheduledAt), 'HH:mm')} - ${intervention.customer.firstName} ${intervention.customer.lastName}`}
                      >
                        {format(new Date(intervention.scheduledAt), 'HH:mm')} {intervention.customer.lastName}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
