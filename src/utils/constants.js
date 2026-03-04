export const CODIGOS_ACTIVIDAD = {
  '120': 'Transporte',
  '122': 'Transporte variante',
  '123': 'Transporte variante',
  '191': 'Inspección',
  '193': 'Supervisión',
  '200': 'Operación/acarreo estándar',
  '202': 'Operación específica',
  '203': 'Otra operación',
  '262': 'Código especial',
  '301': 'Mantenimiento',
  '302': 'Mantenimiento',
  'M05': 'Mantenimiento programado',
  'HO5': 'Código especial',
};

export const CODIGOS_VALIDOS = Object.keys(CODIGOS_ACTIVIDAD);

export const GUARDIAS = ['DIA', 'NOCHE'];

export const TIPOS_COMBUSTIBLE = ['D', 'E'];

export const TIPOS_MATERIAL = ['m', 'D'];

export const TIPOS_COPIA = ['ORIGINAL', 'MANTENIMIENTO', 'CONTROL OPERATIVO'];

export const ESTADOS_PROCESAMIENTO = {
  IDLE: 'idle',
  ENVIANDO: 'enviando',
  ANALIZANDO: 'analizando',
  VALIDANDO: 'validando',
  REGISTRANDO: 'registrando',
  COMPLETADO: 'completado',
  ERROR: 'error',
};

export const ESTADOS_LABELS = {
  idle: 'Listo para procesar',
  enviando: 'Enviando imagen...',
  analizando: 'Analizando con IA...',
  validando: 'Validando datos...',
  registrando: 'Registrando en base de datos...',
  completado: 'Procesamiento completado',
  error: 'Error en el procesamiento',
};

export const ESTADOS_PROGRESO = {
  idle: 0,
  enviando: 20,
  analizando: 50,
  validando: 75,
  registrando: 90,
  completado: 100,
  error: 0,
};
