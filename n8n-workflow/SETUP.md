# Configuración del Workflow n8n - SCOOPTRAM Reportes

## Requisitos Previos

1. **n8n** instalado y corriendo (local o cloud)
2. **API Key de Anthropic** (Claude) con acceso a claude-sonnet-4-20250514
3. **Google Sheets API** habilitada con credenciales OAuth2

## Pasos de Configuración

### 1. Importar el Workflow

1. Abrir n8n en tu navegador
2. Ir a **Workflows** > **Import from File**
3. Seleccionar `workflow-scooptram.json`

### 2. Configurar Variables de Entorno en n8n

En la configuración de n8n, agregar:

```
ANTHROPIC_API_KEY=tu_api_key_de_anthropic_aqui
```

### 3. Configurar Google Sheets

1. En n8n, ir a **Credentials** > **New Credential** > **Google Sheets OAuth2 API**
2. Seguir el proceso de autenticación con tu cuenta de Google
3. Crear un Google Sheet llamado **"Reportes SCOOPTRAM - BD"** con estas hojas:

#### Hoja "encabezados" (fila 1 = headers):
```
fecha_procesamiento | numero_correlativo | fecha | guardia | empresa | equipo_codigo | veta | horometro_inicial | horometro_final | horometro_diferencia | tipo_combustible | nombre_operador | observaciones_generales | tipo_copia | confianza_global | num_actividades | num_errores | num_advertencias
```

#### Hoja "actividades" (fila 1 = headers):
```
numero_correlativo | fecha | fila | hora_inicio | hora_final | cod_actividad | veta | origen_zona | origen_nivel | origen_labor | labor_ref | destino_zona | destino_nivel | destino_labor | material_md | num_viajes | dist_promedio | cod_equipo_transporte | num_cucharas | observaciones | confianza
```

#### Hoja "fallas" (fila 1 = headers):
```
numero_correlativo | fecha | no_falla | nombre_sobrestante | sistema | sintoma | causa | horometro
```

#### Hoja "errores_procesamiento" (fila 1 = headers):
```
fecha_procesamiento | numero_correlativo | tipo_error | mensaje | respuesta_cruda
```

#### Hoja "dashboard" (fórmulas):
- A1: `Total reportes:` | B1: `=COUNTA(encabezados!B:B)-1`
- A2: `Reportes hoy:` | B2: `=COUNTIF(encabezados!A:A,">="&TODAY())`
- A3: `Confianza promedio:` | B3: `=AVERAGE(encabezados!O:O)`
- A4: `Actividades totales:` | B4: `=COUNTA(actividades!A:A)-1`

4. Copiar el **ID del spreadsheet** de la URL (la parte entre `/d/` y `/edit`)
5. En cada nodo de Google Sheets del workflow, configurar:
   - **Document**: seleccionar el spreadsheet creado
   - **Credential**: seleccionar la credencial OAuth2 creada

### 4. Activar el Workflow

1. Hacer clic en **Activate** en n8n
2. El webhook estará disponible en: `https://tu-dominio-n8n/webhook/reporte-scooptram`

### 5. Configurar el Frontend

En el archivo `.env` del proyecto React:

```
VITE_N8N_WEBHOOK_URL=https://tu-dominio-n8n/webhook/reporte-scooptram
VITE_API_KEY=tu_api_key_para_el_webhook
```

## Probar el Sistema

1. Ejecutar el frontend: `npm run dev`
2. Tomar o subir una foto de un reporte SCOOPTRAM
3. Hacer clic en "PROCESAR REPORTE"
4. Verificar que los datos aparezcan en Google Sheets

## Solución de Problemas

- **Error 401**: Verificar la API key de Anthropic
- **Error 422**: El reporte no pasó la validación, revisar los errores retornados
- **Error 500**: Verificar logs de n8n para errores internos
- **Timeout**: Aumentar el timeout del nodo HTTP Request (default: 60s)
- **JSON inválido**: Claude no pudo parsear bien la imagen, tomar nueva foto
