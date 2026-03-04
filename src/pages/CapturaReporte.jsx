import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Play, X, RotateCcw, Image } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { enviarReporte } from '../services/api';
import { validarReporte } from '../utils/validation';
import { ESTADOS_LABELS, ESTADOS_PROGRESO } from '../utils/constants';

export default function CapturaReporte() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { videoRef, isActive, error: cameraError, startCamera, stopCamera, capturePhoto } = useCamera();

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [estado, setEstado] = useState('idle');
  const [errorMsg, setErrorMsg] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp)|application\/pdf$/)) {
      setErrorMsg('Formato no soportado. Use JPG, PNG, WebP o PDF.');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrorMsg(null);
    stopCamera();
  };

  const handleCapture = async () => {
    const file = await capturePhoto();
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      stopCamera();
    }
  };

  const handleClear = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setEstado('idle');
    setErrorMsg(null);
  };

  const handleProcesar = async () => {
    if (!imageFile) {
      setErrorMsg('Seleccione o capture una imagen primero');
      return;
    }

    setErrorMsg(null);
    setEstado('enviando');

    try {
      const resultado = await enviarReporte(imageFile, (nuevoEstado) => {
        setEstado(nuevoEstado);
      });

      const validacion = validarReporte(resultado);
      const datosCompletos = {
        ...resultado,
        validacion,
        imagen_nombre: imageFile.name,
        fecha_procesamiento: new Date().toISOString(),
      };

      // Guardar en historial local
      const historial = JSON.parse(localStorage.getItem('historial_reportes') || '[]');
      historial.unshift({
        id: Date.now(),
        ...datosCompletos,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('historial_reportes', JSON.stringify(historial.slice(0, 100)));

      setEstado('completado');

      // Navegar a resultado
      navigate('/resultado', { state: { datos: datosCompletos } });
    } catch (err) {
      setEstado('error');
      setErrorMsg(err.message || 'Error al procesar el reporte');
    }
  };

  const progreso = ESTADOS_PROGRESO[estado] || 0;
  const estadoLabel = ESTADOS_LABELS[estado] || '';
  const procesando = !['idle', 'completado', 'error'].includes(estado);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-light px-6 py-5">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Camera className="w-7 h-7" />
            Digitalizar Reporte
          </h1>
          <p className="text-blue-100 mt-1 text-sm">
            Capture o suba una foto del reporte SCOOPTRAM
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Zona de preview / cámara */}
          <div className="relative bg-slate-100 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center border-2 border-dashed border-slate-300">
            {isActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : imagePreview ? (
              <img
                src={imagePreview}
                alt="Vista previa del reporte"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center text-slate-400 p-8">
                <Image className="w-16 h-16 mx-auto mb-3 opacity-40" />
                <p className="text-lg font-medium">Sin imagen</p>
                <p className="text-sm mt-1">Use los botones de abajo para capturar o subir</p>
              </div>
            )}

            {/* Botón limpiar sobre la imagen */}
            {(imagePreview || isActive) && (
              <button
                onClick={isActive ? stopCamera : handleClear}
                className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            {isActive ? (
              <button
                onClick={handleCapture}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <div className="w-6 h-6 rounded-full border-3 border-white" />
                Capturar Foto
              </button>
            ) : (
              <>
                <button
                  onClick={startCamera}
                  disabled={procesando}
                  className="flex-1 bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  Tomar Foto
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={procesando}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-300"
                >
                  <Upload className="w-5 h-5" />
                  Subir Archivo
                </button>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Botón procesar */}
          <button
            onClick={handleProcesar}
            disabled={!imageFile || procesando}
            className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary disabled:from-slate-300 disabled:to-slate-400 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 text-lg transition-all shadow-lg disabled:shadow-none"
          >
            {procesando ? (
              <RotateCcw className="w-6 h-6 animate-spin" />
            ) : (
              <Play className="w-6 h-6" />
            )}
            {procesando ? 'Procesando...' : 'PROCESAR REPORTE'}
          </button>

          {/* Barra de progreso */}
          {estado !== 'idle' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={`font-medium ${estado === 'error' ? 'text-red-600' : estado === 'completado' ? 'text-green-600' : 'text-primary'}`}>
                  {estadoLabel}
                </span>
                {progreso > 0 && (
                  <span className="text-slate-500">{progreso}%</span>
                )}
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    estado === 'error'
                      ? 'bg-red-500'
                      : estado === 'completado'
                      ? 'bg-green-500'
                      : 'bg-primary-light'
                  }`}
                  style={{ width: `${progreso}%` }}
                />
              </div>
            </div>
          )}

          {/* Errores */}
          {(errorMsg || cameraError) && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700 text-sm font-medium">
                {errorMsg || cameraError}
              </p>
              {estado === 'error' && (
                <button
                  onClick={() => { setEstado('idle'); setErrorMsg(null); }}
                  className="mt-2 text-red-600 underline text-sm hover:text-red-800"
                >
                  Intentar de nuevo
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Instrucciones */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h3 className="font-semibold text-amber-900 mb-2">Consejos para mejor lectura:</h3>
        <ul className="text-sm text-amber-800 space-y-1.5">
          <li>- Asegure buena iluminación, sin sombras sobre el formato</li>
          <li>- Capture el formato completo, incluyendo bordes</li>
          <li>- El formato puede estar en posición landscape (rotado 90 grados)</li>
          <li>- Evite reflejos del flash sobre el papel</li>
          <li>- Formatos de CamScanner funcionan bien</li>
        </ul>
      </div>
    </div>
  );
}
