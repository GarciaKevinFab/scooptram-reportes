import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Camera, List, FileText, Settings } from 'lucide-react';
import CapturaReporte from './pages/CapturaReporte';
import ResultadoProcesamiento from './pages/ResultadoProcesamiento';
import HistorialReportes from './pages/HistorialReportes';
import Configuracion from './pages/Configuracion';

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">
                SCOOPTRAM Reportes
              </h1>
              <p className="text-xs text-slate-400">
                Volcán - Digitalización de Reportes
              </p>
            </div>
          </div>
          <nav className="flex gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Captura</span>
            </NavLink>
            <NavLink
              to="/historial"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Historial</span>
            </NavLink>
            <NavLink
              to="/config"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Config</span>
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400">
        Sistema de Digitalización de Reportes SCOOPTRAM - Volcán
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/scooptram-reportes">
      <Layout>
        <Routes>
          <Route path="/" element={<CapturaReporte />} />
          <Route path="/resultado" element={<ResultadoProcesamiento />} />
          <Route path="/historial" element={<HistorialReportes />} />
          <Route path="/config" element={<Configuracion />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
