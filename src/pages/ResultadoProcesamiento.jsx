import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Edit3,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { getConfianzaBadge } from '../utils/validation';
import { CODIGOS_ACTIVIDAD } from '../utils/constants';
import { enviarCorreccion } from '../services/api';

export default function ResultadoProcesamiento() {
  const location = useLocation();
  const navigate = useNavigate();
  const datosIniciales = location.state?.datos;

  const [datos, setDatos] = useState(datosIniciales);
  const [editando, setEditando] = useState(false);
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({
    encabezado: true,
    horometros: true,
    actividades: true,
    operador: true,
    observaciones: true,
    fallas: false,
    firmas: false,
    validacion: true,
  });
  const [guardando, setGuardando] = useState(false);

  if (!datos) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
        <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-600">
          No hay datos para mostrar
        </h2>
        <p className="text-slate-400 mt-2">
          Procese un reporte primero desde la pantalla de captura.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
          Ir a Captura
        </button>
      </div>
    );
  }

  const { validacion } = datos;
  const confianzaBadge = getConfianzaBadge(datos.confianza_global || 0);

  const toggleSeccion = (key) => {
    setSeccionesAbiertas((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateField = (path, value) => {
    setDatos((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = isNaN(keys[i]) ? keys[i] : parseInt(keys[i]);
        obj = obj[k];
      }
      obj[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await enviarCorreccion(datos);
      // Actualizar historial local
      const historial = JSON.parse(localStorage.getItem('historial_reportes') || '[]');
      const idx = historial.findIndex(
        (r) => r.encabezado?.numero_correlativo === datos.encabezado?.numero_correlativo
      );
      if (idx >= 0) {
        historial[idx] = { ...historial[idx], ...datos, corregido: true };
        localStorage.setItem('historial_reportes', JSON.stringify(historial));
      }
      setEditando(false);
      alert('Datos guardados correctamente');
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setGuardando(false);
    }
  };

  const isIncierto = (val) => typeof val === 'string' && val.includes('???');

  const CeldaEditable = ({ value, path, type = 'text', className = '' }) => {
    const incierto = isIncierto(value);
    const baseClass = `px-2 py-1 rounded text-sm ${
      incierto ? 'bg-red-100 text-red-800 border border-red-300' : ''
    } ${className}`;

    if (editando) {
      return (
        <input
          type={type}
          value={value ?? ''}
          onChange={(e) => updateField(path, e.target.value)}
          className={`${baseClass} border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none w-full`}
        />
      );
    }
    return <span className={baseClass}>{value ?? '-'}</span>;
  };

  const SeccionHeader = ({ id, titulo, icono: Icon }) => (
    <button
      onClick={() => toggleSeccion(id)}
      className="w-full flex items-center justify-between py-3 px-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-2 font-semibold text-slate-700">
        {Icon && <Icon className="w-5 h-5" />}
        {titulo}
      </div>
      {seccionesAbiertas[id] ? (
        <ChevronUp className="w-5 h-5 text-slate-400" />
      ) : (
        <ChevronDown className="w-5 h-5 text-slate-400" />
      )}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header con estado general */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div
          className={`px-6 py-5 ${
            validacion?.validacion_ok
              ? 'bg-gradient-to-r from-green-600 to-green-500'
              : 'bg-gradient-to-r from-red-600 to-red-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              {validacion?.validacion_ok ? (
                <CheckCircle className="w-8 h-8" />
              ) : (
                <XCircle className="w-8 h-8" />
              )}
              <div>
                <h1 className="text-xl font-bold">
                  {validacion?.validacion_ok
                    ? 'Reporte Procesado Correctamente'
                    : 'Reporte con Errores'}
                </h1>
                <p className="text-sm opacity-90">
                  Correlativo: {datos.encabezado?.numero_correlativo || 'N/A'} |{' '}
                  {datos.encabezado?.fecha || 'Sin fecha'}
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-bold ${confianzaBadge.class}`}
            >
              {confianzaBadge.label}
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="px-6 py-3 bg-slate-50 flex gap-3 border-b">
          <button
            onClick={() => setEditando(!editando)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            {editando ? 'Cancelar Edición' : 'Editar Datos'}
          </button>
          {editando && (
            <button
              onClick={handleGuardar}
              disabled={guardando}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {guardando ? 'Guardando...' : 'Confirmar y Guardar'}
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Nuevo Reporte
          </button>
        </div>
      </div>

      {/* Validación */}
      {(validacion?.errores?.length > 0 || validacion?.advertencias?.length > 0) && (
        <div className="bg-white rounded-2xl shadow-lg p-5 space-y-3">
          <SeccionHeader id="validacion" titulo="Validación" icono={AlertTriangle} />
          {seccionesAbiertas.validacion && (
            <div className="space-y-2 mt-2">
              {validacion.errores?.map((err, i) => (
                <div
                  key={`e-${i}`}
                  className="flex items-start gap-2 bg-red-50 p-3 rounded-lg"
                >
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-700">{err}</span>
                </div>
              ))}
              {validacion.advertencias?.map((adv, i) => (
                <div
                  key={`a-${i}`}
                  className="flex items-start gap-2 bg-yellow-50 p-3 rounded-lg"
                >
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-yellow-700">{adv}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Encabezado */}
      <div className="bg-white rounded-2xl shadow-lg p-5 space-y-3">
        <SeccionHeader id="encabezado" titulo="Encabezado del Reporte" />
        {seccionesAbiertas.encabezado && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
            {[
              ['Mina', 'encabezado.mina'],
              ['Fecha', 'encabezado.fecha'],
              ['Guardia', 'encabezado.guardia'],
              ['Empresa', 'encabezado.empresa'],
              ['Equipo', 'encabezado.equipo_codigo'],
              ['Veta', 'encabezado.veta'],
              ['Nro. Correlativo', 'encabezado.numero_correlativo'],
            ].map(([label, path]) => {
              const keys = path.split('.');
              let val = datos;
              for (const k of keys) val = val?.[k];
              return (
                <div key={path}>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {label}
                  </label>
                  <div className="mt-1">
                    <CeldaEditable value={val} path={path} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Horómetros */}
      <div className="bg-white rounded-2xl shadow-lg p-5 space-y-3">
        <SeccionHeader id="horometros" titulo="Horómetros" />
        {seccionesAbiertas.horometros && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
            {[
              ['Macro', 'horometros.macro', 'number'],
              ['Inicial', 'horometros.inicial', 'number'],
              ['Final', 'horometros.final', 'number'],
              ['Combustible', 'horometros.tipo_combustible'],
            ].map(([label, path, type]) => {
              const keys = path.split('.');
              let val = datos;
              for (const k of keys) val = val?.[k];
              return (
                <div key={path}>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {label}
                  </label>
                  <div className="mt-1">
                    <CeldaEditable value={val} path={path} type={type} />
                  </div>
                </div>
              );
            })}
            {datos.horometros?.inicial != null && datos.horometros?.final != null && (
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Diferencia
                </label>
                <div className="mt-1 text-sm font-semibold text-primary">
                  {(datos.horometros.final - datos.horometros.inicial).toFixed(1)} hrs
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabla de actividades */}
      <div className="bg-white rounded-2xl shadow-lg p-5 space-y-3">
        <SeccionHeader
          id="actividades"
          titulo={`Actividades (${datos.actividades?.length || 0})`}
        />
        {seccionesAbiertas.actividades && (
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="px-2 py-2 text-left font-medium text-slate-600">#</th>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">Inicio</th>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">Final</th>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">Cód.</th>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">Veta</th>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">Origen</th>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">Destino</th>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">Mat.</th>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">Viajes</th>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">Dist.</th>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">Equipo</th>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">Cuch.</th>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">Obs.</th>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">Conf.</th>
                </tr>
              </thead>
              <tbody>
                {datos.actividades?.map((act, idx) => {
                  const conf = getConfianzaBadge(act.confianza || 0);
                  const rowBg =
                    act.confianza < 0.7
                      ? 'bg-yellow-50'
                      : idx % 2 === 0
                      ? 'bg-white'
                      : 'bg-slate-50';
                  return (
                    <tr key={idx} className={`${rowBg} border-b border-slate-100`}>
                      <td className="px-2 py-1.5 font-medium">{act.fila}</td>
                      <td className="px-2 py-1.5">
                        <CeldaEditable
                          value={act.hora_inicio}
                          path={`actividades.${idx}.hora_inicio`}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <CeldaEditable
                          value={act.hora_final}
                          path={`actividades.${idx}.hora_final`}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <CeldaEditable
                          value={act.cod_actividad}
                          path={`actividades.${idx}.cod_actividad`}
                          className={
                            CODIGOS_ACTIVIDAD[act.cod_actividad]
                              ? ''
                              : 'text-orange-600'
                          }
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <CeldaEditable
                          value={act.veta}
                          path={`actividades.${idx}.veta`}
                        />
                      </td>
                      <td className="px-2 py-1.5 text-xs">
                        <CeldaEditable
                          value={[act.origen_zona, act.origen_nivel, act.origen_labor]
                            .filter(Boolean)
                            .join(' / ')}
                          path={`actividades.${idx}.origen_labor`}
                        />
                      </td>
                      <td className="px-2 py-1.5 text-xs">
                        <CeldaEditable
                          value={[act.destino_zona, act.destino_nivel, act.destino_labor]
                            .filter(Boolean)
                            .join(' / ')}
                          path={`actividades.${idx}.destino_labor`}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <CeldaEditable
                          value={act.material_md}
                          path={`actividades.${idx}.material_md`}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <CeldaEditable
                          value={act.num_viajes}
                          path={`actividades.${idx}.num_viajes`}
                          type="number"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <CeldaEditable
                          value={act.dist_promedio}
                          path={`actividades.${idx}.dist_promedio`}
                          type="number"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <CeldaEditable
                          value={act.cod_equipo_transporte}
                          path={`actividades.${idx}.cod_equipo_transporte`}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <CeldaEditable
                          value={act.num_cucharas}
                          path={`actividades.${idx}.num_cucharas`}
                          type="number"
                        />
                      </td>
                      <td className="px-2 py-1.5 max-w-[120px] truncate">
                        <CeldaEditable
                          value={act.observaciones}
                          path={`actividades.${idx}.observaciones`}
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${conf.class}`}
                        >
                          {conf.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Operador */}
      <div className="bg-white rounded-2xl shadow-lg p-5 space-y-3">
        <SeccionHeader id="operador" titulo="Operador" />
        {seccionesAbiertas.operador && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Nombre
              </label>
              <div className="mt-1">
                <CeldaEditable value={datos.operador?.nombre} path="operador.nombre" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Datos
              </label>
              <div className="mt-1">
                <CeldaEditable value={datos.operador?.datos} path="operador.datos" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Horómetro
              </label>
              <div className="mt-1">
                <CeldaEditable
                  value={datos.operador?.horometro}
                  path="operador.horometro"
                  type="number"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Observaciones generales */}
      <div className="bg-white rounded-2xl shadow-lg p-5 space-y-3">
        <SeccionHeader id="observaciones" titulo="Observaciones Generales" />
        {seccionesAbiertas.observaciones && (
          <div className="mt-3">
            {editando ? (
              <textarea
                value={datos.observaciones_generales || ''}
                onChange={(e) => updateField('observaciones_generales', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            ) : (
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                {datos.observaciones_generales || 'Sin observaciones'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Fallas */}
      {datos.fallas?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-5 space-y-3">
          <SeccionHeader id="fallas" titulo={`Fallas (${datos.fallas.length})`} />
          {seccionesAbiertas.fallas && (
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Sobrestante</th>
                    <th className="px-3 py-2 text-left">Sistema</th>
                    <th className="px-3 py-2 text-left">Síntoma</th>
                    <th className="px-3 py-2 text-left">Causa</th>
                    <th className="px-3 py-2 text-left">Horómetro</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.fallas.map((falla, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="px-3 py-2">{falla.no}</td>
                      <td className="px-3 py-2">
                        <CeldaEditable
                          value={falla.nombre_sobrestante}
                          path={`fallas.${idx}.nombre_sobrestante`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <CeldaEditable value={falla.sistema} path={`fallas.${idx}.sistema`} />
                      </td>
                      <td className="px-3 py-2">
                        <CeldaEditable value={falla.sintoma} path={`fallas.${idx}.sintoma`} />
                      </td>
                      <td className="px-3 py-2">
                        <CeldaEditable value={falla.causa} path={`fallas.${idx}.causa`} />
                      </td>
                      <td className="px-3 py-2">
                        <CeldaEditable
                          value={falla.horometro}
                          path={`fallas.${idx}.horometro`}
                          type="number"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Firmas */}
      <div className="bg-white rounded-2xl shadow-lg p-5 space-y-3">
        <SeccionHeader id="firmas" titulo="Firmas" />
        {seccionesAbiertas.firmas && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
            {[
              ['Jefe Guardia ECM', 'firmas_presentes.jefe_guardia_ecm'],
              ['Jefe Guardia Volcán', 'firmas_presentes.jefe_guardia_volcan'],
              ['Técnico Mant.', 'firmas_presentes.tecnico_mantenimiento'],
              ['Residente ECM', 'firmas_presentes.residente_ecm'],
              ['Sup. Mantenimiento', 'firmas_presentes.supervisor_mantenimiento'],
            ].map(([label, path]) => {
              const keys = path.split('.');
              let val = datos;
              for (const k of keys) val = val?.[k];
              return (
                <div
                  key={path}
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    val ? 'bg-green-50' : 'bg-slate-50'
                  }`}
                >
                  {val ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-300" />
                  )}
                  <span className="text-sm">{label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* JSON raw (colapsable) */}
      <details className="bg-white rounded-2xl shadow-lg p-5">
        <summary className="cursor-pointer font-semibold text-slate-600 hover:text-slate-800">
          Ver JSON completo
        </summary>
        <pre className="mt-3 text-xs bg-slate-900 text-green-400 p-4 rounded-xl overflow-x-auto max-h-96">
          {JSON.stringify(datos, null, 2)}
        </pre>
      </details>
    </div>
  );
}
