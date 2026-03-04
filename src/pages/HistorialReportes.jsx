import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Calendar,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Trash2,
  FileText,
} from 'lucide-react';
import { getConfianzaBadge } from '../utils/validation';

export default function HistorialReportes() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [filtroGuardia, setFiltroGuardia] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const historial = useMemo(() => {
    return JSON.parse(localStorage.getItem('historial_reportes') || '[]');
  }, []);

  const reportesFiltrados = useMemo(() => {
    return historial.filter((r) => {
      const matchBusqueda =
        !busqueda ||
        r.encabezado?.numero_correlativo?.includes(busqueda) ||
        r.encabezado?.fecha?.includes(busqueda) ||
        r.operador?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.encabezado?.veta?.toLowerCase().includes(busqueda.toLowerCase());

      const matchGuardia =
        filtroGuardia === 'todos' || r.encabezado?.guardia === filtroGuardia;

      const matchEstado =
        filtroEstado === 'todos' ||
        (filtroEstado === 'ok' && r.validacion?.validacion_ok) ||
        (filtroEstado === 'error' && !r.validacion?.validacion_ok);

      return matchBusqueda && matchGuardia && matchEstado;
    });
  }, [historial, busqueda, filtroGuardia, filtroEstado]);

  const handleVerDetalle = (reporte) => {
    navigate('/resultado', { state: { datos: reporte } });
  };

  const handleLimpiarHistorial = () => {
    if (window.confirm('Se eliminará todo el historial local. ¿Continuar?')) {
      localStorage.removeItem('historial_reportes');
      window.location.reload();
    }
  };

  const stats = useMemo(() => {
    const total = historial.length;
    const ok = historial.filter((r) => r.validacion?.validacion_ok).length;
    const conAdvertencias = historial.filter(
      (r) => r.validacion?.advertencias?.length > 0
    ).length;
    const avgConfianza =
      total > 0
        ? historial.reduce((sum, r) => sum + (r.confianza_global || 0), 0) / total
        : 0;
    return { total, ok, conAdvertencias, avgConfianza };
  }, [historial]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-primary">{stats.total}</p>
          <p className="text-sm text-slate-500 mt-1">Total Reportes</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{stats.ok}</p>
          <p className="text-sm text-slate-500 mt-1">Exitosos</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">{stats.conAdvertencias}</p>
          <p className="text-sm text-slate-500 mt-1">Con Advertencias</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-primary">
            {(stats.avgConfianza * 100).toFixed(0)}%
          </p>
          <p className="text-sm text-slate-500 mt-1">Confianza Prom.</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-lg p-5">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por correlativo, fecha, operador, veta..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <select
            value={filtroGuardia}
            onChange={(e) => setFiltroGuardia(e.target.value)}
            className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-primary outline-none"
          >
            <option value="todos">Todas las guardias</option>
            <option value="DIA">Día</option>
            <option value="NOCHE">Noche</option>
          </select>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-primary outline-none"
          >
            <option value="todos">Todos los estados</option>
            <option value="ok">Exitosos</option>
            <option value="error">Con errores</option>
          </select>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-slate-700 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Reportes Procesados ({reportesFiltrados.length})
          </h2>
          {historial.length > 0 && (
            <button
              onClick={handleLimpiarHistorial}
              className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Limpiar
            </button>
          )}
        </div>

        {reportesFiltrados.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 text-lg">No hay reportes</p>
            <p className="text-slate-300 text-sm mt-1">
              {historial.length > 0
                ? 'No se encontraron reportes con esos filtros'
                : 'Los reportes procesados aparecerán aquí'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reportesFiltrados.map((reporte) => {
              const conf = getConfianzaBadge(reporte.confianza_global || 0);
              const tieneErrores = !reporte.validacion?.validacion_ok;
              const tieneAdv = reporte.validacion?.advertencias?.length > 0;

              return (
                <button
                  key={reporte.id}
                  onClick={() => handleVerDetalle(reporte)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      tieneErrores
                        ? 'bg-red-100'
                        : tieneAdv
                        ? 'bg-yellow-100'
                        : 'bg-green-100'
                    }`}
                  >
                    {tieneErrores ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : tieneAdv ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">
                        #{reporte.encabezado?.numero_correlativo || 'N/A'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          reporte.encabezado?.guardia === 'DIA'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {reporte.encabezado?.guardia || '?'}
                      </span>
                      {reporte.corregido && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                          Corregido
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      <span>{reporte.encabezado?.fecha || 'Sin fecha'}</span>
                      <span>Veta: {reporte.encabezado?.veta || '?'}</span>
                      <span>{reporte.actividades?.length || 0} actividades</span>
                      <span>{reporte.operador?.nombre || 'Operador desconocido'}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${conf.class}`}>
                    {conf.label}
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
