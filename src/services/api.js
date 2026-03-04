function getWebhookUrl() {
  return localStorage.getItem('n8n_webhook_url')
    || import.meta.env.VITE_N8N_WEBHOOK_URL
    || 'http://localhost:5678/webhook/reporte-scooptram';
}

const API_KEY = import.meta.env.VITE_API_KEY || '';

// Agrega headers especiales para túneles (localtunnel, ngrok)
function getTunnelHeaders() {
  const url = getWebhookUrl();
  const extra = {};
  // localtunnel requiere este header para bypass de la página de confirmación
  if (url.includes('.loca.lt')) {
    extra['Bypass-Tunnel-Reminder'] = 'true';
  }
  // ngrok free requiere este header
  if (url.includes('ngrok')) {
    extra['ngrok-skip-browser-warning'] = 'true';
  }
  return extra;
}

export async function enviarReporte(imageFile, onProgress) {
  onProgress?.('enviando');

  const formData = new FormData();
  formData.append('imagen', imageFile);
  formData.append(
    'metadata',
    JSON.stringify({
      usuario: localStorage.getItem('usuario') || 'operador_01',
      timestamp: new Date().toISOString(),
    })
  );

  const headers = { ...getTunnelHeaders() };
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }

  onProgress?.('analizando');

  const response = await fetch(getWebhookUrl(), {
    method: 'POST',
    headers,
    body: formData,
  });

  onProgress?.('validando');

  const data = await response.json().catch(() => ({}));

  // 422 = validación falló pero hay datos extraídos (se pueden corregir manualmente)
  // 200 = todo OK
  if (response.status === 200 || response.status === 422) {
    onProgress?.('completado');
    return data;
  }

  // Cualquier otro error es fatal
  throw new Error(
    data.message || `Error del servidor: ${response.status}`
  );
}

export async function enviarCorreccion(datosCorregidos) {
  const headers = {
    'Content-Type': 'application/json',
    ...getTunnelHeaders(),
  };
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }

  const response = await fetch(`${getWebhookUrl()}/correccion`, {
    method: 'POST',
    headers,
    body: JSON.stringify(datosCorregidos),
  });

  if (!response.ok) {
    throw new Error(`Error al enviar corrección: ${response.status}`);
  }

  return response.json();
}
