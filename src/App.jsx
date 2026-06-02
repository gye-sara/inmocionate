import { useState } from 'react';
import Registro from './components/Registro.jsx';
import Map from './components/Map.jsx';
import Filters from './components/Filters.jsx';
import { useFianzas } from './hooks/useFianzas.js';

export default function App() {
  const [visitante, setVisitante] = useState(null);
  const [filtros, setFiltros]     = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const { fianzas, sinUbicacion, loading } = useFianzas(filtros);

  const activeCount = Object.values(filtros).filter(Boolean).length;

  const stats = {
    total:        fianzas.length + sinUbicacion,
    sinUbicacion: sinUbicacion,
  };

  // ── Pantalla de registro ──────────────────────────────────────────────────
  if (!visitante) {
    return <Registro onRegistro={(datos) => setVisitante(datos)} />;
  }

  // ── Mapa ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <header style={{
        background: '#1e293b', color: 'white',
        padding: '10px 20px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        zIndex: 1001, position: 'relative', gap: '12px',
        boxShadow: '0 1px 0 rgba(255,255,255,0.06)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '15px',
          }}>🏠</div>
          <span style={{ fontSize: '15px', fontWeight: 700, whiteSpace: 'nowrap' }}>GarantíaYa</span>
        </div>

        {/* Visitante actual */}
        <div style={{
          fontSize: '12px', color: 'rgba(255,255,255,0.5)',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '5px 12px', borderRadius: '20px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '260px',
        }}>
          👤 <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
            {visitante.nombre} {visitante.apellidos}
          </span>
          {visitante.inmobiliaria && (
            <span style={{ color: 'rgba(255,255,255,0.4)' }}> · {visitante.inmobiliaria}</span>
          )}
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              background: showFilters ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${showFilters ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.15)'}`,
              color: 'white', padding: '6px 14px', borderRadius: '8px',
              cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '6px',
              fontFamily: 'inherit',
            }}
          >
            ⚙️ Filtros
            {activeCount > 0 && (
              <span style={{
                background: '#6366f1', borderRadius: '10px',
                padding: '1px 7px', fontSize: '11px', fontWeight: 700,
              }}>
                {activeCount}
              </span>
            )}
          </button>

          {/* Siguiente visitante */}
          <button
            onClick={() => {
              setVisitante(null);
              setFiltros({});
              setShowFilters(false);
            }}
            style={{
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.35)',
              color: '#a5b4fc', padding: '6px 14px', borderRadius: '8px',
              cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '6px',
              fontFamily: 'inherit', transition: 'background 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(99,102,241,0.28)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
          >
            👥 Siguiente visitante
          </button>
        </div>
      </header>

      {/* Cuerpo */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>

        {/* Panel filtros */}
        {showFilters && (
          <>
            <div
              onClick={() => setShowFilters(false)}
              style={{ position: 'absolute', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.3)' }}
            />
            <div style={{
              position: 'absolute', top: 0, left: 0, bottom: 0,
              zIndex: 1000, width: '280px',
              boxShadow: '4px 0 24px rgba(0,0,0,0.15)', overflowY: 'auto',
            }}>
              <Filters filtros={filtros} onChange={setFiltros} onClose={() => setShowFilters(false)} />
            </div>
          </>
        )}

        {/* Mapa */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '100%', gap: '16px',
            }}>
              <div style={{
                width: '36px', height: '36px',
                border: '3px solid #e2e8f0', borderTopColor: '#6366f1',
                borderRadius: '50%', animation: 'spin 0.7s linear infinite',
              }} />
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>Cargando pólizas…</span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <Map fianzas={fianzas} stats={stats} filtersOpen={showFilters} />
          )}
        </div>
      </div>
    </div>
  );
}
