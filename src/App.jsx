import { useState } from 'react';
import Registro from './components/Registro.jsx';
import Map from './components/Map.jsx';
import Filters from './components/Filters.jsx';
import { useFianzas } from './hooks/useFianzas.js';
import { brand } from './theme.js';
import logo from './assets/brand/logo-horizontal.png';

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
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', fontFamily: brand.font }}>

      {/* Header */}
      <header style={{
        background: brand.surface, color: brand.ink,
        padding: '12px 22px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        zIndex: 1001, position: 'relative', gap: '12px',
        borderBottom: `1px solid ${brand.line}`,
        boxShadow: '0 1px 12px rgba(15,27,61,0.04)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, minWidth: 0 }}>
          <img src={logo} alt="GarantíaYa" style={{ height: '36px', marginLeft: '-6px' }} />
          <span className="gy-hd-divider" style={{
            display: 'inline-block', height: '22px', width: '1px',
            background: brand.line,
          }} />
          <span className="gy-hd-subtitle" style={{ fontSize: '13px', fontWeight: 600, color: brand.slate, whiteSpace: 'nowrap' }}>
            Mapa de presencia
          </span>
        </div>

        {/* Visitante actual */}
        <div className="gy-hd-visitor" style={{
          fontSize: '12px', color: brand.slate,
          background: brand.canvas,
          border: `1px solid ${brand.line}`,
          padding: '6px 14px', borderRadius: '100px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px',
          minWidth: 0,
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{
            width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
            background: brand.navy, color: 'white',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 700,
          }}>
            {(visitante.nombre?.[0] ?? '') + (visitante.apellidos?.[0] ?? '')}
          </span>
          <span style={{ color: brand.ink, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {visitante.nombre} {visitante.apellidos}
          </span>
          {visitante.inmobiliaria && (
            <span className="gy-hd-agency" style={{ color: brand.muted }}>· {visitante.inmobiliaria}</span>
          )}
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* Filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            title="Filtros"
            style={{
              background: showFilters ? brand.navy : brand.surface,
              border: `1.5px solid ${showFilters ? brand.navy : brand.line}`,
              color: showFilters ? 'white' : brand.ink,
              padding: '8px 16px', borderRadius: '10px',
              cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '8px',
              fontFamily: 'inherit', transition: 'all 0.18s',
            }}
          >
            <FilterIcon />
            <span className="gy-btn-label">Filtros</span>
            {activeCount > 0 && (
              <span style={{
                background: brand.red, color: 'white', borderRadius: '100px',
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
            title="Siguiente visitante"
            style={{
              background: brand.red,
              border: 'none',
              color: 'white', padding: '8px 16px', borderRadius: '10px',
              cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '8px',
              fontFamily: 'inherit', transition: 'background 0.18s',
              boxShadow: `0 6px 16px -8px ${brand.red}`,
            }}
            onMouseOver={e => e.currentTarget.style.background = brand.redDark}
            onMouseOut={e => e.currentTarget.style.background = brand.red}
          >
            <UserSwitchIcon />
            <span className="gy-btn-label">Siguiente visitante</span>
          </button>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .gy-hd-agency { display: none; }
          }
          @media (max-width: 760px) {
            .gy-hd-divider, .gy-hd-subtitle { display: none; }
            .gy-btn-label { display: none; }
          }
          @media (max-width: 560px) {
            .gy-hd-visitor { display: none !important; }
          }
        `}</style>
      </header>

      {/* Cuerpo */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>

        {/* Panel filtros */}
        {showFilters && (
          <>
            <div
              onClick={() => setShowFilters(false)}
              style={{ position: 'absolute', inset: 0, zIndex: 999, background: 'rgba(15,27,61,0.28)' }}
            />
            <div style={{
              position: 'absolute', top: 0, left: 0, bottom: 0,
              zIndex: 1000, width: '280px',
              boxShadow: '4px 0 32px rgba(15,27,61,0.18)', overflowY: 'auto',
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
              height: '100%', gap: '16px', background: brand.canvas,
            }}>
              <div style={{
                width: '38px', height: '38px',
                border: `3px solid ${brand.line}`, borderTopColor: brand.red,
                borderRadius: '50%', animation: 'spin 0.7s linear infinite',
              }} />
              <span style={{ fontSize: '14px', color: brand.slate, fontWeight: 500 }}>Cargando pólizas…</span>
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

function FilterIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function UserSwitchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="17 11 20 8 23 11" /><path d="M20 8v8" />
    </svg>
  );
}
