/**
 * Google Apps Script — Ejecutar en un Google Sheet nuevo
 *
 * Pasos:
 * 1. Abre un Google Sheet vacío
 * 2. Renómbralo a "Reportes SCOOPTRAM - BD"
 * 3. Ve a Extensiones → Apps Script
 * 4. Pega todo este código
 * 5. Haz clic en ▶ Ejecutar (función: crearEstructuraCompleta)
 * 6. Acepta los permisos cuando lo pida
 */

function crearEstructuraCompleta() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // ===== HOJA 1: encabezados =====
  let sheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Hoja 1');
  if (sheet) {
    sheet.setName('encabezados');
  } else {
    sheet = ss.insertSheet('encabezados');
  }
  sheet.getRange('A1:R1').setValues([[
    'fecha_procesamiento',
    'numero_correlativo',
    'fecha',
    'guardia',
    'empresa',
    'equipo_codigo',
    'veta',
    'horometro_inicial',
    'horometro_final',
    'horometro_diferencia',
    'tipo_combustible',
    'nombre_operador',
    'observaciones_generales',
    'tipo_copia',
    'confianza_global',
    'num_actividades',
    'num_errores',
    'num_advertencias'
  ]]);
  sheet.getRange('A1:R1').setFontWeight('bold').setBackground('#1e40af').setFontColor('#ffffff');
  sheet.setFrozenRows(1);

  // ===== HOJA 2: actividades =====
  const sheetAct = ss.insertSheet('actividades');
  sheetAct.getRange('A1:U1').setValues([[
    'numero_correlativo',
    'fecha',
    'fila',
    'hora_inicio',
    'hora_final',
    'cod_actividad',
    'veta',
    'origen_zona',
    'origen_nivel',
    'origen_labor',
    'labor_ref',
    'destino_zona',
    'destino_nivel',
    'destino_labor',
    'material_md',
    'num_viajes',
    'dist_promedio',
    'cod_equipo_transporte',
    'num_cucharas',
    'observaciones',
    'confianza'
  ]]);
  sheetAct.getRange('A1:U1').setFontWeight('bold').setBackground('#1e40af').setFontColor('#ffffff');
  sheetAct.setFrozenRows(1);

  // ===== HOJA 3: fallas =====
  const sheetFallas = ss.insertSheet('fallas');
  sheetFallas.getRange('A1:H1').setValues([[
    'numero_correlativo',
    'fecha',
    'no_falla',
    'nombre_sobrestante',
    'sistema',
    'sintoma',
    'causa',
    'horometro'
  ]]);
  sheetFallas.getRange('A1:H1').setFontWeight('bold').setBackground('#dc2626').setFontColor('#ffffff');
  sheetFallas.setFrozenRows(1);

  // ===== HOJA 4: errores_procesamiento =====
  const sheetErr = ss.insertSheet('errores_procesamiento');
  sheetErr.getRange('A1:E1').setValues([[
    'fecha_procesamiento',
    'numero_correlativo',
    'tipo_error',
    'mensaje',
    'respuesta_cruda'
  ]]);
  sheetErr.getRange('A1:E1').setFontWeight('bold').setBackground('#f59e0b').setFontColor('#000000');
  sheetErr.setFrozenRows(1);

  // ===== HOJA 5: dashboard =====
  const sheetDash = ss.insertSheet('dashboard');

  // Títulos
  sheetDash.getRange('A1').setValue('📊 DASHBOARD - Reportes SCOOPTRAM');
  sheetDash.getRange('A1').setFontSize(16).setFontWeight('bold');

  sheetDash.getRange('A3').setValue('Total reportes procesados:');
  sheetDash.getRange('B3').setFormula('=COUNTA(encabezados!B:B)-1');

  sheetDash.getRange('A4').setValue('Reportes hoy:');
  sheetDash.getRange('B4').setFormula('=COUNTIF(encabezados!A:A,">="&TODAY())');

  sheetDash.getRange('A5').setValue('Confianza promedio:');
  sheetDash.getRange('B5').setFormula('=IFERROR(AVERAGE(encabezados!O:O),"Sin datos")');
  sheetDash.getRange('B5').setNumberFormat('0.0%');

  sheetDash.getRange('A6').setValue('Actividades totales:');
  sheetDash.getRange('B6').setFormula('=COUNTA(actividades!A:A)-1');

  sheetDash.getRange('A7').setValue('Fallas registradas:');
  sheetDash.getRange('B7').setFormula('=COUNTA(fallas!A:A)-1');

  sheetDash.getRange('A8').setValue('Errores de procesamiento:');
  sheetDash.getRange('B8').setFormula('=COUNTA(errores_procesamiento!A:A)-1');

  sheetDash.getRange('A3:A8').setFontWeight('bold');
  sheetDash.getRange('B3:B8').setFontSize(14).setFontWeight('bold').setFontColor('#1e40af');

  sheetDash.setColumnWidth(1, 280);
  sheetDash.setColumnWidth(2, 150);

  // ===== Formatear todas las hojas =====
  SpreadsheetApp.flush();

  SpreadsheetApp.getUi().alert(
    '✅ Estructura creada exitosamente!\n\n' +
    '5 hojas creadas:\n' +
    '• encabezados (18 columnas)\n' +
    '• actividades (21 columnas)\n' +
    '• fallas (8 columnas)\n' +
    '• errores_procesamiento (5 columnas)\n' +
    '• dashboard (con fórmulas)\n\n' +
    'Ahora copia el ID del spreadsheet de la URL y configúralo en n8n.'
  );
}
