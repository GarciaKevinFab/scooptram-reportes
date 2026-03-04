import { CODIGOS_VALIDOS } from './constants';

export function validarReporte(data) {
  const errores = [];
  const advertencias = [];

  if (!data || data.error) {
    errores.push('Error en el procesamiento de la imagen');
    return { errores, advertencias, validacion_ok: false };
  }

  // 1. Fecha válida
  if (!data.encabezado?.fecha || data.encabezado.fecha === '???') {
    errores.push('Fecha no legible');
  }

  // 2. Horómetros
  const hi = data.horometros?.inicial;
  const hf = data.horometros?.final;
  if (hi != null && hf != null) {
    if (hf < hi) {
      errores.push(`Horómetro final (${hf}) menor que inicial (${hi})`);
    }
    const diff = Math.round((hf - hi) * 100) / 100;
    if (diff > 24) {
      advertencias.push(`Diferencia de horómetro (${diff}) mayor a 24h`);
    }
  }

  // 3. Validar actividades
  const actividades = data.actividades || [];
  if (actividades.length === 0) {
    errores.push('No se extrajeron actividades del reporte');
  }

  for (const act of actividades) {
    // Hora inicio < hora final
    if (act.hora_inicio && act.hora_final) {
      const [hiH, hiM] = act.hora_inicio.split(':').map(Number);
      const [hfH, hfM] = act.hora_final.split(':').map(Number);
      const inicioMin = hiH * 60 + hiM;
      const finalMin = hfH * 60 + hfM;

      if (finalMin <= inicioMin && inicioMin < 720) {
        advertencias.push(`Fila ${act.fila}: Hora final <= hora inicio`);
      }
    }

    // Código actividad reconocido
    if (
      act.cod_actividad &&
      !CODIGOS_VALIDOS.includes(act.cod_actividad) &&
      act.cod_actividad !== '???'
    ) {
      advertencias.push(
        `Fila ${act.fila}: Código actividad "${act.cod_actividad}" no reconocido`
      );
    }

    // Baja confianza
    if (act.confianza != null && act.confianza < 0.7) {
      advertencias.push(
        `Fila ${act.fila}: Baja confianza de lectura (${(act.confianza * 100).toFixed(0)}%)`
      );
    }
  }

  // 4. Confianza global
  if (data.confianza_global != null && data.confianza_global < 0.6) {
    errores.push('Confianza global muy baja, considerar tomar nueva foto');
  }

  // 5. Operador
  if (!data.operador?.nombre || data.operador.nombre === '???') {
    advertencias.push('Nombre de operador no legible');
  }

  return {
    errores,
    advertencias,
    validacion_ok: errores.length === 0,
  };
}

export function tieneValoresInciertos(obj) {
  if (typeof obj === 'string') return obj.includes('???');
  if (Array.isArray(obj)) return obj.some(tieneValoresInciertos);
  if (obj && typeof obj === 'object') {
    return Object.values(obj).some(tieneValoresInciertos);
  }
  return false;
}

export function getConfianzaColor(confianza) {
  if (confianza >= 0.9) return 'text-green-700 bg-green-50';
  if (confianza >= 0.7) return 'text-yellow-700 bg-yellow-50';
  return 'text-red-700 bg-red-50';
}

export function getConfianzaBadge(confianza) {
  const pct = (confianza * 100).toFixed(0);
  if (confianza >= 0.9) return { label: `${pct}%`, class: 'bg-green-100 text-green-800' };
  if (confianza >= 0.7) return { label: `${pct}%`, class: 'bg-yellow-100 text-yellow-800' };
  return { label: `${pct}%`, class: 'bg-red-100 text-red-800' };
}
