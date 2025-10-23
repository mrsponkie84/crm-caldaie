import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, Bell, FileText, CheckCircle, XCircle, Clock, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Homepage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleDemoAccess = async () => {
    setDemoLoading(true);
    try {
      // Credenziali account demo
      await login('demo@caldaiapp.com', 'demo123');
      navigate('/app');
    } catch (error) {
      alert('Demo non disponibile al momento. Per favore registrati per provare CALDAIAPP gratuitamente per 30 giorni!');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">CALDAIAPP</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900">
                Accedi
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                Prova gratis 30 giorni
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Il CRM professionale per aziende di termoidraulica
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Gestisci interventi, caldaie e clienti. Tutto in un unico sistema.
              <br />
              Semplice, potente, italiano.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition"
              >
                Prova gratis 30 giorni
              </Link>
              <button
                onClick={handleDemoAccess}
                disabled={demoLoading}
                className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-3 rounded-lg text-lg font-medium border-2 border-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {demoLoading ? 'Caricamento demo...' : 'Vedi la demo'}
              </button>
            </div>

            {/* Hero Image Placeholder */}
            <div className="mt-16 bg-white rounded-lg shadow-2xl p-8 max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg h-96 flex items-center justify-center">
                <div className="text-center">
                  <Calendar className="w-24 h-24 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Dashboard CALDAIAPP</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problemi/Soluzioni */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Trasforma il modo di gestire la tua azienda
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Appuntamenti persi
              </h3>
              <p className="text-gray-600 mb-6">
                Fogli Excel confusi e telefonate dimenticate
              </p>
              <div className="border-t-2 border-blue-600 pt-6">
                <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-blue-600 mb-2">
                  Calendario intelligente
                </h4>
                <p className="text-gray-600">
                  Tutti gli interventi organizzati, visuali e sincronizzati
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Manutenzioni scadute
              </h3>
              <p className="text-gray-600 mb-6">
                Clienti che si dimenticano del bollino blu
              </p>
              <div className="border-t-2 border-blue-600 pt-6">
                <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-10 h-10 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-blue-600 mb-2">
                  Promemoria automatici
                </h4>
                <p className="text-gray-600">
                  Alert per scadenze e manutenzioni programmate
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Documenti cartacei
              </h3>
              <p className="text-gray-600 mb-6">
                Faldoni ingombranti e informazioni irreperibili
              </p>
              <div className="border-t-2 border-blue-600 pt-6">
                <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-blue-600 mb-2">
                  Tutto digitale
                </h4>
                <p className="text-gray-600">
                  Schede clienti, caldaie e documenti sempre a portata di mano
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Funzionalità Principali */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Tutto quello che ti serve per crescere
          </h2>

          <div className="space-y-24">
            {/* Feature 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center mb-4">
                  <Users className="w-8 h-8 text-blue-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900">
                    Gestione Clienti e Caldaie
                  </h3>
                </div>
                <p className="text-gray-600 text-lg mb-6">
                  Anagrafica completa dei tuoi clienti con storico caldaie installate.
                  Marca, modello, potenza, data installazione e prossima manutenzione sempre sotto controllo.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Schede cliente complete con contatti e documenti</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Registro caldaie con caratteristiche tecniche</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Storico interventi per ogni impianto</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-lg shadow-xl p-8">
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg h-64 flex items-center justify-center">
                  <Users className="w-32 h-32 text-blue-600 opacity-50" />
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 bg-white rounded-lg shadow-xl p-8">
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg h-64 flex items-center justify-center">
                  <Calendar className="w-32 h-32 text-blue-600 opacity-50" />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="flex items-center mb-4">
                  <Calendar className="w-8 h-8 text-blue-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900">
                    Calendario Interventi
                  </h3>
                </div>
                <p className="text-gray-600 text-lg mb-6">
                  Pianifica e gestisci tutti gli interventi in un calendario visuale.
                  Manutenzioni ordinarie, riparazioni urgenti, certificazioni bollino blu.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Vista calendario mensile e settimanale</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Cambio stato rapido (programmato, in corso, completato)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Assegnazione tecnici agli interventi</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center mb-4">
                  <Bell className="w-8 h-8 text-blue-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900">
                    Monitoraggio Scadenze
                  </h3>
                </div>
                <p className="text-gray-600 text-lg mb-6">
                  Non perdere mai più una scadenza. CALDAIAPP ti avvisa quando è il momento
                  di contattare i clienti per le manutenzioni periodiche.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Badge "Scaduto" per interventi non completati</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Promemoria manutenzioni programmate</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Lista caldaie in scadenza certificazione</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-lg shadow-xl p-8">
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg h-64 flex items-center justify-center">
                  <Bell className="w-32 h-32 text-blue-600 opacity-50" />
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 bg-white rounded-lg shadow-xl p-8">
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg h-64 flex items-center justify-center">
                  <FileText className="w-32 h-32 text-blue-600 opacity-50" />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="flex items-center mb-4">
                  <FileText className="w-8 h-8 text-blue-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900">
                    Documenti e Fatture
                  </h3>
                </div>
                <p className="text-gray-600 text-lg mb-6">
                  Genera preventivi, fatture e rapporti di intervento in pochi click.
                  Tutto archiviato digitalmente e sempre accessibile.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Generazione PDF automatica</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Archivio documenti organizzato</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Preventivi e fatture professionali</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Interattiva */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Provalo subito, senza registrazione
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Esplora CALDAIAPP con dati demo e scopri quanto è semplice gestire la tua azienda
          </p>
          <button
            onClick={handleDemoAccess}
            disabled={demoLoading}
            className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-3 rounded-lg text-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {demoLoading ? 'Caricamento demo...' : 'Accedi alla demo interattiva'}
          </button>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Prezzo semplice e trasparente
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Un solo piano, tutte le funzionalità
          </p>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-xl p-8 md:p-12 border-2 border-blue-600">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Piano Professional
              </h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-blue-600">€80</span>
                <span className="text-gray-600 text-xl">/mese</span>
              </div>
              <p className="text-gray-600 mb-8">
                Utenti illimitati • Caldaie illimitate • Interventi illimitati
              </p>

              <ul className="text-left space-y-4 mb-8 max-w-md mx-auto">
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Gestione completa clienti e caldaie</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Calendario interventi illimitati</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Alert e promemoria automatici</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Generazione documenti PDF</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Assistenza via email</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Aggiornamenti continui</span>
                </li>
              </ul>

              <Link
                to="/register"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition mb-4"
              >
                Inizia la prova gratuita di 30 giorni
              </Link>
              <p className="text-sm text-gray-600">
                Nessuna carta di credito richiesta
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Si fidano di CALDAIAPP
          </h2>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Aziende attive</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">1.000+</div>
              <div className="text-gray-600">Interventi gestiti</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">2.500+</div>
              <div className="text-gray-600">Caldaie monitorate</div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-start mb-6">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    JL
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Jacopo Lionti</h4>
                  <p className="text-gray-600">Titolare, Lionti SNC</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                "Da quando utilizziamo CALDAIAPP abbiamo completamente digitalizzato la gestione della nostra azienda.
                Non perdiamo più appuntamenti, i clienti sono più soddisfatti perché li contattiamo sempre in tempo
                per le manutenzioni, e abbiamo risparmiato ore di lavoro amministrativo ogni settimana.
                Un investimento che si ripaga da solo."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pronto a far crescere la tua azienda?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Unisciti alle 50+ aziende che hanno già scelto CALDAIAPP
          </p>
          <Link
            to="/register"
            className="inline-block bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg text-lg font-medium transition"
          >
            Inizia la prova gratuita di 30 giorni
          </Link>
          <p className="mt-4 text-blue-100">
            Nessuna carta di credito richiesta • Cancellazione in qualsiasi momento
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold text-blue-400 mb-4">CALDAIAPP</h3>
              <p className="text-gray-400 mb-4">
                Il CRM professionale per aziende di termoidraulica.
                Gestisci la tua azienda in modo semplice ed efficace.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Shield className="w-5 h-5" />
                <span>Conforme GDPR • Dati sicuri e protetti</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Prodotto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Funzionalità</a></li>
                <li><a href="#" className="hover:text-white transition">Prezzi</a></li>
                <li><a href="#" className="hover:text-white transition">Demo</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legale</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Termini di Servizio</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 CALDAIAPP. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
