import { useState } from 'react';
import { Settings, Save, Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function Configuracion() {
  const [webhookUrl, setWebhookUrl] = useState(
    localStorage.getItem('n8n_webhook_url') || ''
  );
  const [usuario, setUsuario] = useState(
    localStorage.getItem('usuario') || 'operador_01'
  );
  const [guardado, setGuardado] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // null, 'testing', 'ok', 'error'
  const [testMessage, setTestMessage] = useState('');

  const handleGuardar = () => {
    if (webhookUrl.trim()) {
      localStorage.setItem('n8n_webhook_url', webhookUrl.trim());
    } else {
      localStorage.removeItem('n8n_webhook_url');
    }
    localStorage.setItem('usuario', usuario.trim() || 'operador_01');
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  const handleTest = async () => {
    const url = webhookUrl.trim() || import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/reporte-scooptram';
    setTestStatus('testing');
    setTestMessage('Verificando conexion...');
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const headers = {};
      if (url.includes('.loca.lt')) {
        headers['Bypass-Tunnel-Reminder'] = 'true';
      }
      if (url.includes('ngrok')) {
        headers['ngrok-skip-browser-warning'] = 'true';
      }
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      setTestStatus('ok');
      setTestMessage(`Conexion exitosa (HTTP ${response.status})`);
    } catch (err) {
      setTestStatus('error');
      if (err.name === 'AbortError') {
        setTestMessage('Timeout: el servidor no responde (10s)');
      } else {
        setTestMessage(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Configuracion</h2>
          <p className="text-sm text-slate-500">Ajustes de conexion al servidor</p>
        </div>
      </div>

      {/* URL del Webhook */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            URL del Webhook (n8n)
          </label>
          <p className="text-xs text-slate-400 mb-3">
            Ingresa la URL publica de tu servidor n8n. Si usas ngrok, copia la URL HTTPS aqui.
          </p>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://xxxx.ngrok-free.app/webhook/reporte-scooptram"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
          <p className="text-xs text-slate-400 mt-2">
            Dejar vacio para usar el valor por defecto: <code className="bg-slate-100 px-1 rounded">{import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/reporte-scooptram'}</code>
          </p>
        </div>

        {/* Test Connection */}
        <button
          onClick={handleTest}
          disabled={testStatus === 'testing'}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {testStatus === 'testing' ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : testStatus === 'ok' ? (
            <Wifi className="w-4 h-4 text-green-600" />
          ) : testStatus === 'error' ? (
            <WifiOff className="w-4 h-4 text-red-600" />
          ) : (
            <Wifi className="w-4 h-4" />
          )}
          Probar Conexion
        </button>

        {testMessage && (
          <div
            className={`text-sm px-4 py-2 rounded-lg ${
              testStatus === 'ok'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : testStatus === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
          >
            {testMessage}
          </div>
        )}
      </div>

      {/* Usuario */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Nombre de Usuario
        </label>
        <p className="text-xs text-slate-400 mb-3">
          Identificador del operador para los reportes
        </p>
        <input
          type="text"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          placeholder="operador_01"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        />
      </div>

      {/* Botón Guardar */}
      <button
        onClick={handleGuardar}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold transition-all ${
          guardado
            ? 'bg-green-600'
            : 'bg-primary hover:bg-primary-light'
        }`}
      >
        <Save className="w-5 h-5" />
        {guardado ? 'Guardado!' : 'Guardar Configuracion'}
      </button>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 space-y-2">
        <p className="font-semibold">Como conectar tu n8n local:</p>
        <ol className="list-decimal list-inside space-y-1 text-blue-700">
          <li>Instala ngrok: <code className="bg-blue-100 px-1 rounded">npm install -g ngrok</code></li>
          <li>Exponer n8n: <code className="bg-blue-100 px-1 rounded">ngrok http 5678</code></li>
          <li>Copia la URL HTTPS (ej: https://abc123.ngrok-free.app)</li>
          <li>Pega aqui: <code className="bg-blue-100 px-1 rounded">https://abc123.ngrok-free.app/webhook/reporte-scooptram</code></li>
        </ol>
      </div>
    </div>
  );
}
