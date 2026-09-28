import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  getUserRole,
  isUserAuthorizedForAdmin,
  isUserSuperAdmin,
  loginWithGoogle, 
  logoutAdmin, 
  subscribeAuthState,
  subscribeWaitlistSubscribers,
  subscribeBusinessSubmissions,
  updateBusinessSubmissionStatus,
  deleteBusinessSubmission,
  deleteSubscriber,
  exportToCSV,
  WaitlistSubscriberDoc,
  BusinessSubmissionDoc
} from '../services/firestoreService';
import { subscribeSolicitudes, cambiarEstadoSolicitud, eliminarSolicitud } from '../services/cotizadorService';
import { CHILE_REGIONS } from '../data/datosBase';
import { PAQUETES } from '../data/cotizadorData';
import type { McpSolicitud } from '../types';
import { AdminContenido, type SeccionContenido } from './AdminContenido';
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
  Check,
  Inbox,
  Undo2,
  Eye,
  CalendarDays
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
  const [solicitudesMcp, setSolicitudesMcp] = useState<McpSolicitud[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  // Tab & Filters
  const [adminTab, setAdminTab] = useState<'subscribers' | 'submissions' | 'solicitudes' | SeccionContenido>('propuestas');
  const [conteosContenido, setConteosContenido] = useState<Record<SeccionContenido, number>>({ propuestas: 0, eventos: 0, directorio: 0 });
  const esContenido = adminTab === 'propuestas' || adminTab === 'eventos' || adminTab === 'directorio';

  const userRole = getUserRole(user);
  const isAuthorized = isUserAuthorizedForAdmin(user);
  const isSuperAdmin = isUserSuperAdmin(user);
  const isViewer = userRole === 'viewer';

  const nombreRegion = (id: string) => CHILE_REGIONS.find(r => r.id === id)?.name || id;
  const aprobarSolicitud = async (s: McpSolicitud, estado: 'postulando' | 'conectada') => {
    if (!isSuperAdmin) {
      onNotify?.('Acción no permitida en Modo Lector: requiere privilegios de SuperAdmin.', 'info');
      return;
    }
    try {
      await cambiarEstadoSolicitud(s.id, estado);
      onNotify?.(estado === 'conectada' ? 'Empresa aprobada: ya figura como empresa MCP en el mapa.' : 'Solicitud devuelta a postulando.', 'success');
    } catch {
      onNotify?.('No se pudo actualizar. Revise que las reglas de Firestore estén publicadas.', 'info');
    }
  };
  const borrarSolicitud = async (s: McpSolicitud) => {
    if (!isSuperAdmin) {
      onNotify?.('Acción no permitida en Modo Lector: requiere privilegios de SuperAdmin.', 'info');
      return;
    }
    if (!confirm('¿Eliminar esta solicitud del mapa?')) return;
    try { await eliminarSolicitud(s.id); } catch { onNotify?.('No se pudo eliminar la solicitud.', 'info'); }
  };
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

  // Subscribe to Firestore collections once authenticated (SuperAdmin or Viewer)
  // Clears in-memory data when not authorized / after logout to prevent memory leaks
  useEffect(() => {
    if (!isAuthorized) {
      setSubscribers([]);
      setSubmissions([]);
      setSolicitudesMcp([]);
      setFirestoreError(null);
      return;
    }

    setDataLoading(true);
    setFirestoreError(null);

    let subsLoaded = false;
    let submissionsLoaded = false;
    let solicitudesLoaded = false;

    const checkFinished = () => {
      if (subsLoaded && submissionsLoaded && solicitudesLoaded) {
        setDataLoading(false);
      }
    };

    const unsubSubs = subscribeWaitlistSubscribers(
      (data) => {
        setSubscribers(data);
        subsLoaded = true;
        checkFinished();
      },
      (err: any) => {
        console.error('Error fetching subscribers:', err);
        setFirestoreError(err?.message || 'Error de permisos o conectividad al cargar suscriptores.');
        subsLoaded = true;
        checkFinished();
      }
    );

    const unsubSubmissions = subscribeBusinessSubmissions(
      (data) => {
        setSubmissions(data);
        submissionsLoaded = true;
        checkFinished();
      },
      (err: any) => {
        console.error('Error fetching submissions:', err);
        setFirestoreError(err?.message || 'Error de permisos o conectividad al cargar postulaciones.');
        submissionsLoaded = true;
        checkFinished();
      }
    );

    const unsubSolicitudes = subscribeSolicitudes(
      (data) => {
        setSolicitudesMcp(data);
        solicitudesLoaded = true;
        checkFinished();
      },
      (err: any) => {
        console.warn('Solicitudes MCP:', err);
        solicitudesLoaded = true;
        checkFinished();
      }
    );

    return () => {
      unsubSubs();
      unsubSubmissions();
      unsubSolicitudes();
    };
  }, [isAuthorized]);

  const handleLogin = async () => {
    setLoginError(null);
    try {
      const loggedUser = await loginWithGoogle();
      const role = getUserRole(loggedUser);
      if (!role) {
        setLoginError(`Acceso denegado. La cuenta ${loggedUser.email} no cuenta con permisos de administrador ni de visualización del panel.`);
        onNotify('Acceso restringido para este correo', 'info');
      } else if (role === 'superadmin') {
        onNotify(`¡Bienvenido al panel, ${loggedUser.displayName || 'SuperAdmin'}!`, 'success');
      } else {
        onNotify(`¡Bienvenido al panel en Modo Lector, ${loggedUser.displayName || 'Equipo'}!`, 'success');
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
    if (!isSuperAdmin) {
      onNotify('Acción no permitida en Modo Lector: requiere privilegios de SuperAdmin.', 'info');
      return;
    }
    try {
      await updateBusinessSubmissionStatus(id, newStatus);
      onNotify(`Estado de la postulación actualizado a "${newStatus}"`, 'success');
    } catch (err) {
      onNotify('Error al actualizar estado', 'info');
    }
  };

  const handleDeleteSubmission = async (id: string, companyName: string) => {
    if (!isSuperAdmin) {
      onNotify('Acción no permitida en Modo Lector: requiere privilegios de SuperAdmin.', 'info');
      return;
    }
    if (!window.confirm(`¿Seguro que deseas eliminar la postulación de ${companyName}?`)) return;
    try {
      await deleteBusinessSubmission(id);
      onNotify(`Postulación de ${companyName} eliminada`, 'info');
    } catch (err) {
      onNotify('Error al eliminar postulación', 'info');
    }
  };

  const handleDeleteSubscriber = async (id: string, email: string) => {
    if (!isSuperAdmin) {
      onNotify('Acción no permitida en Modo Lector: requiere privilegios de SuperAdmin.', 'info');
      return;
    }
    if (!window.confirm(`¿Seguro que deseas eliminar el correo ${email}?`)) return;
    try {
      await deleteSubscriber(id);
      onNotify(`Suscriptor ${email} eliminado`, 'info');
    } catch (err) {
      onNotify('Error al eliminar suscriptor', 'info');
    }
  };

  const handleExportSubscribers = () => {
    if (filteredSubscribers.length === 0) {
      onNotify('No hay suscriptores para exportar con los filtros actuales.', 'info');
      return;
    }
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
    if (filteredSubmissions.length === 0) {
      onNotify('No hay postulaciones para exportar con los filtros actuales.', 'info');
      return;
    }
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

  const handleExportSolicitudes = () => {
    if (filteredSolicitudes.length === 0) {
      onNotify('No hay solicitudes MCP para exportar con los filtros actuales.', 'info');
      return;
    }
    const exportData = filteredSolicitudes.map(s => ({
      ID: s.id,
      Empresa: s.empresa || 'No autorizó mostrar',
      Region: nombreRegion(s.regionId),
      Region_ID: s.regionId,
      Estado: s.estado,
      Autorizo_Mapa: s.consiente ? 'Sí' : 'No',
      Metodos_MCP: (s.metodos || []).join('; '),
      Categorias: (s.categorias || []).join('; '),
      Paquete: s.paquete ? (PAQUETES[s.paquete]?.nombre || s.paquete) : 'Sin paquete',
      Tiene_Contacto_B2B: s.submissionId ? 'Sí' : 'No',
      Fecha_Registro: s.createdAt ? new Date(s.createdAt).toLocaleString('es-CL') : ''
    }));
    exportToCSV(`chile_ai_radar_solicitudes_mcp_${new Date().toISOString().slice(0,10)}.csv`, exportData);
    onNotify(`Descargando CSV con ${exportData.length} solicitudes MCP`, 'success');
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

  const filteredSolicitudes = solicitudesMcp.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const regionText = nombreRegion(s.regionId).toLowerCase();
    const empresaText = (s.empresa || '').toLowerCase();
    const metodosText = (s.metodos || []).join(' ').toLowerCase();
    const paqueteText = (s.paquete || '').toLowerCase();
    return empresaText.includes(q) || regionText.includes(q) || s.regionId.toLowerCase().includes(q) || metodosText.includes(q) || paqueteText.includes(q);
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
  if (!user || !isAuthorized) {
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
              Acceso reservado para administradores y miembros autorizados.
            </p>
          </div>

          {user && !isAuthorized && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-left space-y-2">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Cuenta no autorizada</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Has iniciado sesión como <strong className="text-slate-900 dark:text-white">{user.email || 'correo no disponible'}</strong>. Esta cuenta no se encuentra en la lista de acceso autorizado ni cuenta con permisos para ver este panel.
              </p>
              <button
                onClick={handleLogout}
                className="text-xs text-amber-700 dark:text-amber-400 underline font-semibold hover:text-amber-800 cursor-pointer"
              >
                Cerrar sesión e intentar con otra cuenta autorizada
              </button>
            </div>
          )}

          {loginError && !user && (
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
              <span>Ingresar con Google</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Seguridad reforzada mediante Firebase Auth y reglas RBAC de Firestore en la nube.
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
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-slate-900 dark:text-white">
              Panel Administrativo de Control
            </h1>
            {isSuperAdmin ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>SuperAdmin</span>
              </span>
            ) : (
              <span 
                data-testid="badge-modo-lector"
                className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center gap-1 shadow-xs"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Modo Lector</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2">
            <span>Conectado a Firestore Cloud Database</span>
            <span>•</span>
            <span>Sesión activa: <strong className="text-blue-600 dark:text-blue-400">{user.email}</strong></span>
            {!isSuperAdmin && (
              <>
                <span>•</span>
                <span className="text-blue-700 dark:text-blue-300 font-medium">
                  Permisos de solo lectura (Búsqueda, filtros y exportación CSV habilitados)
                </span>
              </>
            )}
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

      {/* Viewer Mode Informational Banner */}
      {isViewer && (
        <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 text-blue-900 dark:text-blue-200 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span>
              <strong>Modo Lector activo:</strong> Puedes consultar, buscar, filtrar y exportar a CSV todos los datos de las 3 colecciones (Mails Suscritos, Empresas WebMCP y Solicitudes Cotizador). Las acciones de edición, cambio de estado y eliminación están deshabilitadas y reservadas para el SuperAdmin.
            </span>
          </div>
        </div>
      )}

      {/* Unverified Google Account Warning Banner */}
      {user && isAuthorized && user.emailVerified === false && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span>
            <strong>Correo no verificado ante Google:</strong> Tu cuenta {user.email} no cuenta con la verificación de correo activa en Google. Las reglas de seguridad de Firestore requieren un correo verificado para autorizar la lectura de datos. Si ves listas vacías o errores de permisos, por favor verifica tu cuenta en Google.
          </span>
        </div>
      )}

      {/* Firestore Error Alert */}
      {firestoreError && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span>
              <strong>Error de sincronización con Firestore:</strong> {firestoreError}
            </span>
          </div>
          <button
            onClick={() => setFirestoreError(null)}
            className="text-[11px] underline text-rose-700 dark:text-rose-400 hover:text-rose-900 cursor-pointer font-semibold"
          >
            Descartar
          </button>
        </div>
      )}

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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {([
            ['propuestas', 'Propuestas', Inbox],
            ['eventos', 'Eventos', CalendarDays],
            ['directorio', 'Directorio', Building2],
          ] as const).map(([id, texto, Icono]) => (
            <button key={id} onClick={() => { setAdminTab(id); setSearchQuery(''); }}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                adminTab === id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}>
              <Icono className="w-4 h-4" />
              <span>{texto} ({conteosContenido[id]})</span>
            </button>
          ))}
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

          <button
            onClick={() => { setAdminTab('solicitudes'); setSearchQuery(''); }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              adminTab === 'solicitudes'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Solicitudes MCP ({solicitudesMcp.length})</span>
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={adminTab === 'subscribers' ? 'Buscar correo o región...' : adminTab === 'submissions' ? 'Buscar empresa o contacto...' : esContenido ? 'Buscar por nombre...' : 'Buscar empresa, región o método...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {esContenido ? null : adminTab === 'subscribers' ? (
            <button
              onClick={handleExportSubscribers}
              title="Descargar suscriptores en formato CSV"
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
          ) : adminTab === 'submissions' ? (
            <button
              onClick={handleExportSubmissions}
              title="Descargar postulaciones en formato CSV"
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
          ) : (
            <button
              onClick={handleExportSolicitudes}
              title="Descargar solicitudes MCP en formato CSV"
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Propuestas del público, eventos y directorio (siempre montado para mantener los conteos al día) */}
      <div hidden={!esContenido}>
        <AdminContenido
          seccion={esContenido ? adminTab : 'propuestas'}
          regions={CHILE_REGIONS}
          puedeEditar={isAuthorized}
          puedeBorrar={isSuperAdmin}
          busqueda={searchQuery}
          onNotify={onNotify}
          onConteos={setConteosContenido}
        />
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

          {dataLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Cargando suscriptores desde Firestore...</p>
            </div>
          ) : filteredSubscribers.length === 0 ? (
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
                    <th className="py-3 px-4 text-right">{isSuperAdmin ? 'Acciones' : 'Permisos'}</th>
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
                        {isSuperAdmin ? (
                          <button
                            onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                            title="Eliminar registro"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic font-normal">
                            Solo lectura
                          </span>
                        )}
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

          {dataLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Cargando postulaciones desde Firestore...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
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
                      {isAuthorized ? (
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
                      ) : (
                        <span
                          className={`text-xs font-bold rounded-lg px-2.5 py-1 border inline-block select-none ${
                            currentStatus === 'verified'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                              : currentStatus === 'contacted'
                              ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
                              : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                          }`}
                        >
                          {currentStatus === 'verified' ? 'Verificado' : currentStatus === 'contacted' ? 'Contactado' : 'Pendiente'}
                        </span>
                      )}
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
                      {isSuperAdmin && (
                        <button
                          onClick={() => handleDeleteSubmission(sub.id, sub.companyName)}
                          className="text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {/* ========================================================================= */}
      {/* TAB 3: SOLICITUDES DEL COTIZADOR WEBMCP                                    */}
      {/* ========================================================================= */}
      {adminTab === 'solicitudes' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-3">
          <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Inbox className="w-4 h-4 text-blue-600" />
              <span>Solicitudes del cotizador</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold font-mono">
                {filteredSolicitudes.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Al aprobar, la empresa pasa a ser empresa MCP en el mapa, con su nombre si lo autorizó.
              Los datos de contacto, cuando los dejó, están en Postulaciones Empresas.
            </p>
          </div>
          {dataLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Cargando solicitudes desde Firestore...</p>
            </div>
          ) : filteredSolicitudes.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {searchQuery ? 'No se encontraron solicitudes con ese filtro' : 'Aún no hay solicitudes registradas.'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSolicitudes.map(s => (
              <li key={s.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{s.empresa || 'Empresa sin nombre (no autorizó mostrarlo)'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      s.estado === 'conectada' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>{s.estado === 'conectada' ? 'Conectada' : 'Postulando'}</span>
                    {s.submissionId && <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">Dejó contacto</span>}
                  </div>
                  <p className="text-xs text-slate-500">
                    {nombreRegion(s.regionId)}
                    {s.paquete ? ` · Paquete sugerido: ${PAQUETES[s.paquete]?.nombre || s.paquete}` : ''}
                    {' · '}{new Date(s.createdAt).toLocaleString('es-CL')}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {s.metodos.map(m => <code key={m} className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[11px]">{m}()</code>)}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0 items-center">
                  {isAuthorized && (
                    <>
                      {s.estado === 'conectada' ? (
                        <button onClick={() => aprobarSolicitud(s, 'postulando')} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                          <Undo2 className="w-3.5 h-3.5" /> Revertir
                        </button>
                      ) : (
                        <button onClick={() => aprobarSolicitud(s, 'conectada')} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer">
                          <Check className="w-3.5 h-3.5" /> Aprobar
                        </button>
                      )}
                    </>
                  )}
                  {isSuperAdmin && (
                    <button onClick={() => borrarSolicitud(s)} className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-500 hover:text-rose-700 cursor-pointer" aria-label="Eliminar solicitud">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    )}
    </div>
  );
};
