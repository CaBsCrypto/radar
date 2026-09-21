import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  ADMIN_EMAIL, 
  loginWithGoogle, 
  logoutAdmin, 
  subscribeAuthState,
  isUserAdmin,
  subscribeWaitlistSubscribers,
  subscribeBusinessSubmissions,
  updateBusinessSubmissionStatus,
  deleteBusinessSubmission,
  deleteSubscriber,
  exportToCSV,
  WaitlistSubscriberDoc,
  BusinessSubmissionDoc
} from '../services/firestoreService';
import { 
  ShieldCheck, 
  Mail, 
  Building2, 
  Download, 
  Trash2, 
  ExternalLink, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Search, 
  RefreshCw, 
  AlertTriangle,
  LogOut,
  Users,
  Filter,
  Check
} from 'lucide-react';

interface AdminDashboardProps {
  onNotify: (message: string, type?: 'success' | 'info' | 'copied') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNotify }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Data states
  const [subscribers, setSubscribers] = useState<WaitlistSubscriberDoc[]>([]);
  const [submissions, setSubmissions] = useState<BusinessSubmissionDoc[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Tab & Filters
  const [adminTab, setAdminTab] = useState<'subscribers' | 'submissions'>('subscribers');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'contacted' | 'verified'>('all');

  // Monitor Auth state
  useEffect(() => {
    const unsubscribe = subscribeAuthState((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const isAdmin = isUserAdmin(user);

  // Subscribe to Firestore collections once authenticated as admin
  useEffect(() => {
    if (!isAdmin) return;

    setDataLoading(true);
    const unsubSubs = subscribeWaitlistSubscribers(
      (data) => {
        setSubscribers(data);
        setDataLoading(false);
      },
      (err) => {
        console.error('Error fetching subscribers:', err);
        setDataLoading(false);
      }
    );

    const unsubSubmissions = subscribeBusinessSubmissions(
      (data) => {
        setSubmissions(data);
        setDataLoading(false);
      },
      (err) => {
        console.error('Error fetching submissions:', err);
        setDataLoading(false);
      }
    );

    return () => {
      unsubSubs();
      unsubSubmissions();
    };
  }, [isAdmin]);

  const handleLogin = async () => {
    setLoginError(null);
    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        setLoginError(`Acceso restringido. La cuenta ${loggedUser.email} no tiene permisos de administrador.`);
        onNotify('Acceso restringido para este correo', 'info');
      } else {
        onNotify(`¡Bienvenido al panel, ${loggedUser.displayName || 'Admin'}!`, 'success');
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setLoginError(err.message || 'Error al iniciar sesión con Google.');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      onNotify('Sesión de administrador cerrada', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'pending' | 'contacted' | 'verified') => {
    try {
      await updateBusinessSubmissionStatus(id, newStatus);
      onNotify(`Estado de la postulación actualizado a "${newStatus}"`, 'success');
    } catch (err) {
      onNotify('Error al actualizar estado', 'info');
    }
  };

  const handleDeleteSubmission = async (id: string, companyName: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la postulación de ${companyName}?`)) return;
    try {
      await deleteBusinessSubmission(id);
      onNotify(`Postulación de ${companyName} eliminada`, 'info');
    } catch (err) {
      onNotify('Error al eliminar postulación', 'info');
    }
  };

  const handleDeleteSubscriber = async (id: string, email: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el correo ${email}?`)) return;
    try {
      await deleteSubscriber(id);
      onNotify(`Suscriptor ${email} eliminado`, 'info');
    } catch (err) {
      onNotify('Error al eliminar suscriptor', 'info');
    }
  };

  const handleExportSubscribers = () => {
    const exportData = filteredSubscribers.map(s => ({
      ID: s.id,
      Email: s.email,
      Origen: s.source || 'newsletter',
      Estado: s.status,
      Region_Preferida: s.preferredRegionId || 'Todas',
      Frecuencia: s.frequency || 'semanal',
      Intereses: (s.interests || []).join('; '),
      Fecha_Registro: s.createdAt ? new Date(s.createdAt).toLocaleString('es-CL') : ''
    }));
    exportToCSV(`chile_ai_radar_suscriptores_${new Date().toISOString().slice(0,10)}.csv`, exportData);
    onNotify(`Descargando CSV con ${exportData.length} suscriptores`, 'success');
  };

  const handleExportSubmissions = () => {
    const exportData = filteredSubmissions.map(s => ({
      ID: s.id,
      Empresa: s.companyName,
      Contacto: s.contactName,
      Cargo: s.role || '',
      Email: s.email,
      Telefono: s.phone || '',
      Region: s.regionId || '',
      Sitio_Web: s.website || '',
      Estado_Tecnico: s.currentTechState || '',
      Objetivo_Agentes: s.agentGoal || '',
      Estado: s.status || 'pending',
      Fecha_Registro: s.createdAt ? new Date(s.createdAt).toLocaleString('es-CL') : ''
    }));
    exportToCSV(`chile_ai_radar_postulaciones_${new Date().toISOString().slice(0,10)}.csv`, exportData);
    onNotify(`Descargando CSV con ${exportData.length} postulaciones`, 'success');
  };

  // Filtered lists
  const filteredSubscribers = subscribers.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.email.toLowerCase().includes(q) || (s.preferredRegionId || '').toLowerCase().includes(q);
  });

  const filteredSubmissions = submissions.filter(s => {
    const matchesSearch = !searchQuery || 
      s.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phone || '').includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter || (!s.status && statusFilter === 'pending');
    return matchesSearch && matchesStatus;
  });

  if (authLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Verificando credenciales de administrador...</p>
      </div>
    );
  }

  // ==========================================
  // Login Guard Screen
  // ==========================================
  if (!user || !isAdmin) {
    return (
      <div className="py-12 max-w-xl mx-auto px-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-['Outfit'] text-slate-900 dark:text-white">
              Panel de Administración
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Acceso exclusivo reservado para el administrador autorizado de Chile AI Radar:
            </p>
            <div className="inline-block px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold">
              {ADMIN_EMAIL}
            </div>
          </div>

          {user && !isAdmin && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-left space-y-2">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Cuenta no autorizada</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Has iniciado sesión como <strong className="text-slate-900 dark:text-white">{user.email}</strong>. Esta cuenta no cuenta con privilegios de lectura o gestión de bases de datos.
              </p>
              <button
                onClick={handleLogout}
                className="text-xs text-amber-700 dark:text-amber-400 underline font-semibold hover:text-amber-800"
              >
                Cerrar sesión e intentar con otra cuenta
              </button>
            </div>
          )}

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
              {loginError}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleLogin}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Ingresar con Google ({ADMIN_EMAIL})</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Seguridad reforzada mediante Firebase Auth y reglas de Firestore en la nube.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // Authenticated Admin Dashboard
  // ==========================================
  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-slate-900 dark:text-white">
              Panel Administrativo de Control
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Conectado a Firestore Cloud Database • Sesión activa: <strong className="text-blue-600 dark:text-blue-400">{user.email}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Mails Suscritos</span>
            <Mail className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold font-['Outfit'] text-slate-900 dark:text-white">
            {subscribers.length}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Colección waitlist_subscribers</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Empresas WebMCP</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold font-['Outfit'] text-slate-900 dark:text-white">
            {submissions.length}
          </div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-medium">
            <Users className="w-3.5 h-3.5" />
            <span>Postulaciones B2B recibidas</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Pendientes de Contacto</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold font-['Outfit'] text-amber-600 dark:text-amber-400">
            {submissions.filter(s => !s.status || s.status === 'pending').length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Empresas esperando diagnóstico
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Verificadas / Listas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold font-['Outfit'] text-emerald-600 dark:text-emerald-400">
            {submissions.filter(s => s.status === 'verified').length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Habilitadas en el mapa WebMCP
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setAdminTab('subscribers'); setSearchQuery(''); }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              adminTab === 'subscribers'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Mails Suscritos ({subscribers.length})</span>
          </button>

          <button
            onClick={() => { setAdminTab('submissions'); setSearchQuery(''); }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              adminTab === 'submissions'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Postulaciones Empresas ({submissions.length})</span>
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={adminTab === 'subscribers' ? 'Buscar correo...' : 'Buscar empresa o contacto...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {adminTab === 'subscribers' ? (
            <button
              onClick={handleExportSubscribers}
              title="Descargar suscriptores en formato CSV"
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
          ) : (
            <button
              onClick={handleExportSubmissions}
              title="Descargar postulaciones en formato CSV"
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: WAITLIST SUBSCRIBERS TABLE                                         */}
      {/* ========================================================================= */}
      {adminTab === 'subscribers' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span>Registros del Boletín y Lista de Espera</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold font-mono">
                {filteredSubscribers.length}
              </span>
            </h3>
            <span className="text-xs text-slate-400">
              Sincronizado en tiempo real con Firestore
            </span>
          </div>

          {filteredSubscribers.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Mail className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {searchQuery ? 'No se encontraron correos con ese filtro' : 'Aún no hay suscriptores registrados en la nube'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Correo Electrónico</th>
                    <th className="py-3 px-4">Origen / Formulario</th>
                    <th className="py-3 px-4">Frecuencia</th>
                    <th className="py-3 px-4">Intereses</th>
                    <th className="py-3 px-4">Fecha de Registro</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredSubscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        <a href={`mailto:${sub.email}`} className="hover:text-blue-600 underline">
                          {sub.email}
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {sub.source || 'newsletter'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 capitalize">
                        {sub.frequency || 'semanal'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {sub.interests && sub.interests.length > 0 ? (
                            sub.interests.map((it, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                                {it}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px]">General</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {sub.createdAt ? new Date(sub.createdAt).toLocaleString('es-CL') : 'Reciente'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                          title="Eliminar registro"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BUSINESS SUBMISSIONS TABLE                                         */}
      {/* ========================================================================= */}
      {adminTab === 'submissions' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Solicitudes de Incorporación al Mapa WebMCP</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold font-mono">
                {filteredSubmissions.length}
              </span>
            </h3>

            {/* Filter by status */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px]">Filtrar:</span>
              {(['all', 'pending', 'contacted', 'verified'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {st === 'all' ? 'Todos' : st === 'pending' ? 'Pendiente' : st === 'contacted' ? 'Contactado' : 'Verificado'}
                </button>
              ))}
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                No hay postulaciones de empresas con el filtro seleccionado
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSubmissions.map((sub) => {
                const currentStatus = sub.status || 'pending';
                return (
                  <div 
                    key={sub.id} 
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                          {sub.companyName}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Contacto: <strong className="text-slate-700 dark:text-slate-300">{sub.contactName}</strong> {sub.role ? `(${sub.role})` : ''}
                        </p>
                      </div>

                      {/* Status badge and toggle */}
                      <select
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(sub.id, e.target.value as any)}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1 border cursor-pointer focus:outline-none ${
                          currentStatus === 'verified'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                            : currentStatus === 'contacted'
                            ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
                            : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                        }`}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="contacted">Contactado</option>
                        <option value="verified">Verificado</option>
                      </select>
                    </div>

                    {/* Direct action links */}
                    <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-slate-200 dark:border-slate-800">
                      <a
                        href={`mailto:${sub.email}?subject=Postulaci%C3%B3n%20WebMCP%20Chile%20AI%20Radar%20-%20${encodeURIComponent(sub.companyName)}`}
                        className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium shadow-2xs"
                      >
                        <Mail className="w-3 h-3" />
                        <span>{sub.email}</span>
                      </a>

                      {sub.phone && (
                        <a
                          href={`https://wa.me/${sub.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 font-medium shadow-2xs hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{sub.phone} (WhatsApp)</span>
                        </a>
                      )}

                      {sub.website && (
                        <a
                          href={sub.website.startsWith('http') ? sub.website : `https://${sub.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 font-medium shadow-2xs hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Sitio Web</span>
                        </a>
                      )}
                    </div>

                    {/* Technical details & Goal */}
                    {(sub.currentTechState || sub.agentGoal) && (
                      <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                        {sub.currentTechState && (
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-300">Stack / Situación: </span>
                            <span className="text-slate-600 dark:text-slate-400">{sub.currentTechState}</span>
                          </div>
                        )}
                        {sub.agentGoal && (
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-300">Objetivo MCP: </span>
                            <span className="text-slate-600 dark:text-slate-400">{sub.agentGoal}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>{sub.createdAt ? new Date(sub.createdAt).toLocaleString('es-CL') : 'Fecha no especificada'}</span>
                      <button
                        onClick={() => handleDeleteSubmission(sub.id, sub.companyName)}
                        className="text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
