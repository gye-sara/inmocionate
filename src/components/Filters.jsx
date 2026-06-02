import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase.js';

function SearchSelect({ label, value, onChange, options, placeholder }) {
  const [search, setSearch] = useState('');
  const [open, setOpen]     = useState(false);
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const selected = value ?? '';

  return (
    <div style={{ position: 'relative', marginBottom: '2px' }}>
      <label style={{
        display: 'block', fontSize: '11px', fontWeight: 600,
        color: '#64748b', marginBottom: '4px', marginTop: '14px',
        textTransform: 'uppercase', letterSpacing: '0.4px',
      }}>
        {label}
      </label>
      <div
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '8px 10px', borderRadius: '8px',
          border: `1.5px solid ${open ? '#6366f1' : '#e2e8f0'}`,
          fontSize: '13px', background: 'white', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <span style={{ color: selected ? '#1e293b' : '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
          {selected || placeholder}
        </span>
        <span style={{ color: '#94a3b8', fontSize: '10px', flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{
          position: 'absolute', zIndex: 2000, top: '100%', left: 0, right: 0,
          background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: '220px',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}>
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            onClick={e => e.stopPropagation()}
            placeholder="Buscar..."
            style={{ padding: '8px 10px', border: 'none', borderBottom: '1px solid #f0f0f0', fontSize: '12px', outline: 'none' }}
          />
          <div style={{ overflowY: 'auto', maxHeight: '170px' }}>
            <div
              onClick={() => { onChange(''); setSearch(''); setOpen(false); }}
              style={{ padding: '8px 10px', fontSize: '12px', color: '#94a3b8', cursor: 'pointer', background: !selected ? '#f8fafc' : 'white' }}
            >
              {placeholder} ({options.length})
            </div>
            {filtered.map(o => (
              <div
                key={o}
                onClick={() => { onChange(o); setSearch(''); setOpen(false); }}
                style={{
                  padding: '8px 10px', fontSize: '12px', color: '#1e293b', cursor: 'pointer',
                  background: selected === o ? '#ede9fe' : 'white',
                  fontWeight: selected === o ? 600 : 400,
                }}
              >
                {o}
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: '8px 10px', fontSize: '12px', color: '#94a3b8' }}>Sin resultados</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Filters({ filtros, onChange, onClose }) {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    async function fetchTodos() {
      let allData = [], page = 0;
      while (true) {
        const { data, error } = await supabase
          .from('fianzas')
          .select('sucursal, estado_contrato, categoria_garantia, nombre_inmobiliaria')
          .eq('stage', 'Póliza Vendida')
          .not('lat', 'is', null)
          .range(page * 1000, (page + 1) * 1000 - 1);
        if (error || !data || data.length === 0) break;
        allData = allData.concat(data);
        if (data.length < 1000) break;
        page++;
      }
      setTodos(allData);
    }
    fetchTodos();
  }, []);

  const opciones = useMemo(() => {
    const filtrar = (campo) => {
      let base = todos;
      if (campo !== 'sucursal'     && filtros.sucursal)     base = base.filter(d => d.sucursal === filtros.sucursal);
      if (campo !== 'inmobiliaria' && filtros.inmobiliaria) base = base.filter(d => d.nombre_inmobiliaria === filtros.inmobiliaria);
      if (campo !== 'estado'       && filtros.estado)       base = base.filter(d => d.estado_contrato === filtros.estado);
      if (campo !== 'categoria'    && filtros.categoria)    base = base.filter(d => d.categoria_garantia === filtros.categoria);
      return base;
    };
    return {
      sucursales:    [...new Set(filtrar('sucursal').map(d => d.sucursal).filter(Boolean))].sort(),
      inmobiliarias: [...new Set(filtrar('inmobiliaria').map(d => d.nombre_inmobiliaria).filter(Boolean))].sort(),
      estados:       [...new Set(filtrar('estado').map(d => d.estado_contrato).filter(Boolean))].sort(),
      categorias:    [...new Set(filtrar('categoria').map(d => d.categoria_garantia).filter(Boolean))].sort(),
    };
  }, [todos, filtros]);

  const set = (key, value) => onChange({ ...filtros, [key]: value || undefined });
  const activeCount = Object.values(filtros).filter(Boolean).length;

  const s = {
    label: { display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px', marginTop: '14px', textTransform: 'uppercase', letterSpacing: '0.4px' },
    input: { width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', background: 'white', outline: 'none', fontFamily: 'inherit' },
    section: { marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' },
    sectionTitle: { fontSize: '11px', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' },
    checkRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '9px', cursor: 'pointer', userSelect: 'none' },
    badge: { display: 'inline-block', marginLeft: '6px', background: '#ede9fe', color: '#5b21b6', borderRadius: '10px', padding: '1px 7px', fontSize: '10px', fontWeight: 700 },
  };

  return (
    <div style={{ width: '280px', background: 'white', padding: '18px', height: '100%', overflowY: 'auto', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <p style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b', margin: 0 }}>Filtros</p>
          {activeCount > 0 && <span style={s.badge}>{activeCount}</span>}
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#94a3b8', lineHeight: 1 }}
        >✕</button>
      </div>

      {/* Selects */}
      <SearchSelect label="Sucursal"        value={filtros.sucursal}     onChange={v => set('sucursal', v)}     options={opciones.sucursales}    placeholder="Todas las sucursales" />
      <SearchSelect label="Inmobiliaria"    value={filtros.inmobiliaria} onChange={v => set('inmobiliaria', v)} options={opciones.inmobiliarias} placeholder="Todas las inmobiliarias" />
      <SearchSelect label="Estado contrato" value={filtros.estado}       onChange={v => set('estado', v)}       options={opciones.estados}       placeholder="Todos los estados" />
      <SearchSelect label="Categoría"       value={filtros.categoria}    onChange={v => set('categoria', v)}    options={opciones.categorias}    placeholder="Todas las categorías" />

      {/* Actividad */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Actividad</div>
        {[
          { key: 'conRenovaciones',   emoji: '🔄', label: 'Con renovaciones' },
          { key: 'conRecuperos',      emoji: '⚠️', label: 'Con impagos recupero' },
          { key: 'conNotificaciones', emoji: '📋', label: 'Con notificaciones impago' },
          { key: 'conLegales',        emoji: '⚖️', label: 'Con impagos legales' },
        ].map(({ key, emoji, label }) => (
          <label key={key} style={s.checkRow}>
            <input
              type="checkbox"
              checked={!!filtros[key]}
              onChange={e => set(key, e.target.checked ? 'true' : '')}
              style={{ accentColor: '#6366f1', width: '15px', height: '15px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '12px', color: '#374151' }}>{emoji} {label}</span>
          </label>
        ))}
      </div>

      {/* Limpiar */}
      <button
        onClick={() => onChange({})}
        style={{
          width: '100%', marginTop: '20px', padding: '10px',
          background: '#1e293b', color: 'white', border: 'none',
          borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
          fontWeight: 600, fontFamily: 'inherit',
        }}
      >
        Limpiar filtros
      </button>
    </div>
  );
}
