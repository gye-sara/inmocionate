import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

const esc = (s) => (s ?? '—').toString()
  .replace(/&/g, '&amp;').replace(/'/g, '&#39;')
  .replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const faseColor = (fase) => {
  if (!fase) return '#94a3b8';
  const f = fase.toLowerCase();
  if (f.includes('pagado') || f.includes('cerrado') || f.includes('recuperado')) return '#10b981';
  if (f.includes('legal') || f.includes('demanda') || f.includes('juicio'))      return '#ef4444';
  if (f.includes('pendiente') || f.includes('notif') || f.includes('nuevo'))     return '#f59e0b';
  return '#6366f1';
};

function buildPopup(f) {
  const isVigente      = f.estado_contrato === 'VIGENTE';
  const renovaciones   = f.renovaciones ?? [];
  const recuperos      = f.impagos_recupero ?? [];
  const notificaciones = f.impagos_notificaciones ?? [];
  const legales        = f.impagos_legales ?? [];
  const tieneImpagos   = recuperos.length > 0 || notificaciones.length > 0 || legales.length > 0;

  // Total impagos pagados — solo notificaciones con fase "pagado"
  const totalPagado = notificaciones
    .filter(n => n.fase?.toLowerCase().includes('pagad'))
    .reduce((sum, n) => sum + (parseFloat(n.importe) || 0), 0);

  const badgeBg    = tieneImpagos ? '#fee2e2' : isVigente ? '#dcfce7' : '#fef3c7';
  const badgeColor = tieneImpagos ? '#dc2626' : isVigente ? '#16a34a' : '#b45309';
  const badgeLabel = tieneImpagos ? 'Con impagos' : (f.estado_contrato ?? '—');

  const ubicacion = f.direccion_completa
    ?? [f.ciudad, f.provincia].filter(Boolean).join(', ')
    ?? '—';

  // Tags de impagos/renovaciones
  const tags = [];
  if (renovaciones.length > 0)   tags.push(`<span style="background:#ede9fe;color:#5b21b6;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600;">🔄 ${renovaciones.length} renovación${renovaciones.length > 1 ? 'es' : ''}</span>`);
  if (recuperos.length > 0)      tags.push(`<span style="background:#fee2e2;color:#dc2626;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600;">⚠️ Recupero</span>`);
  if (notificaciones.length > 0) tags.push(`<span style="background:#fef3c7;color:#b45309;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600;">📋 Notificación</span>`);
  if (legales.length > 0)        tags.push(`<span style="background:#fee2e2;color:#991b1b;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600;">⚖️ Legal</span>`);

  console.log('notificaciones:', notificaciones);
  console.log('totalPagado:', totalPagado);

  return `
    <div style="font-family:system-ui,sans-serif;width:300px;">
      <!-- Header -->
      <div style="background:#f8fafc;padding:12px 14px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
        <div style="font-size:13px;font-weight:700;color:#1e293b;line-height:1.3;">${esc(f.nombre_inmobiliaria)}</div>
        <span style="flex-shrink:0;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:${badgeBg};color:${badgeColor};text-transform:uppercase;letter-spacing:0.3px;">${esc(badgeLabel)}</span>
      </div>

      <!-- Datos -->
      <div style="padding:12px 14px;display:flex;flex-direction:column;gap:7px;">
        <div style="display:flex;gap:8px;align-items:flex-start;">
          <span style="font-size:13px;flex-shrink:0;">📍</span>
          <div>
            <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.4px;font-weight:600;margin-bottom:1px;">Ubicación</div>
            <div style="font-size:12px;color:#374151;line-height:1.4;">${esc(ubicacion)}</div>
          </div>
        </div>
        ${f.categoria_garantia ? `
        <div style="display:flex;gap:8px;align-items:flex-start;">
          <span style="font-size:13px;flex-shrink:0;">🏷️</span>
          <div>
            <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.4px;font-weight:600;margin-bottom:1px;">Categoría</div>
            <div style="font-size:12px;color:#374151;">${esc(f.categoria_garantia)}</div>
          </div>
        </div>` : ''}
        <div style="display:flex;gap:8px;align-items:flex-start;">
          <span style="font-size:13px;flex-shrink:0;">📋</span>
          <div>
            <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.4px;font-weight:600;margin-bottom:1px;">Estado</div>
            <div style="font-size:12px;color:#374151;">${esc(f.estado_contrato)}</div>
          </div>
        </div>
        ${totalPagado > 0 ? `
        <div style="display:flex;gap:8px;align-items:flex-start;">
          <span style="font-size:13px;flex-shrink:0;">💶</span>
          <div>
            <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.4px;font-weight:600;margin-bottom:1px;">Total impagos pagados</div>
            <div style="font-size:13px;color:#10b981;font-weight:700;">€${totalPagado.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>` : ''}
      </div>

      <!-- Tags -->
      ${tags.length > 0 ? `<div style="padding:0 14px 12px;display:flex;flex-wrap:wrap;gap:5px;">${tags.join('')}</div>` : ''}
    </div>
  `;
}

export default function Map({ fianzas, stats, filtersOpen }) {
  const mapRef   = useRef(null);
  const mapObj   = useRef(null);
  const layerRef = useRef(null);
  const zoomRef  = useRef(null);
  const [showPanel, setShowPanel] = useState(true);

  // Init mapa
  useEffect(() => {
    if (mapObj.current) return;
    mapObj.current = L.map(mapRef.current, {
      center: [40.4168, -3.7038], zoom: 6, zoomControl: false,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CartoDB', maxZoom: 19,
    }).addTo(mapObj.current);
    zoomRef.current = L.control.zoom({ position: 'topright' });
    zoomRef.current.addTo(mapObj.current);
  }, []);

  // Reposicionar zoom al abrir/cerrar filtros
  useEffect(() => {
    if (!mapObj.current || !zoomRef.current) return;
    zoomRef.current.remove();
    zoomRef.current = L.control.zoom({ position: 'topright' });
    zoomRef.current.addTo(mapObj.current);
  }, [filtersOpen]);

  // Markers
  useEffect(() => {
    if (!mapObj.current || !fianzas.length) return;
    if (layerRef.current) mapObj.current.removeLayer(layerRef.current);

    const cluster = L.markerClusterGroup({
      chunkedLoading: true,
      chunkInterval: 50,
      chunkDelay: 50,
      maxClusterRadius: 50,
      iconCreateFunction: (c) => {
        const n    = c.getChildCount();
        const size = n > 100 ? 44 : n > 50 ? 38 : n > 10 ? 32 : 28;
        return L.divIcon({
          html: `<div style="width:${size}px;height:${size}px;background:#1e293b;color:white;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,0.3);">${n > 999 ? '+999' : n}</div>`,
          className: '', iconSize: [size, size],
        });
      },
    });

    fianzas.forEach(f => {
      if (!f.lat || !f.lng) return;
      const isVigente    = f.estado_contrato === 'VIGENTE';
      const tieneImpagos = (f.impagos_recupero?.length > 0) ||
                           (f.impagos_notificaciones?.length > 0) ||
                           (f.impagos_legales?.length > 0);
      const color = tieneImpagos ? '#ef4444' : isVigente ? '#10b981' : '#f59e0b';
      const size  = 14;

      const icon = L.divIcon({
        html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
        className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2],
      });

      L.marker([parseFloat(f.lat), parseFloat(f.lng)], { icon })
        .bindPopup(buildPopup(f), { maxWidth: 320, maxHeight: 400 })
        .addTo(cluster);
    });

    layerRef.current = cluster;
    mapObj.current.addLayer(cluster);
  }, [fianzas]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Panel stats */}
      <div style={{
        position: 'absolute', bottom: '32px', right: '12px', zIndex: 1000,
        background: 'white', borderRadius: '12px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.13)', minWidth: '210px', overflow: 'hidden',
      }}>
        <button
          onClick={() => setShowPanel(!showPanel)}
          style={{
            width: '100%', padding: '10px 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: showPanel ? '1px solid #f0f0f0' : 'none',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>Leyenda</span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>{showPanel ? '▼' : '▲'}</span>
        </button>

        {showPanel && (
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estado marker</div>
            {[
              { color: '#10b981', label: 'Vigente sin impagos' },
              { color: '#ef4444', label: 'Con impagos' },
              { color: '#f59e0b', label: 'Otro estado' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: color, display: 'inline-block', border: '2px solid white', boxShadow: `0 0 0 1px ${color}`, flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: '#374151' }}>{label}</span>
              </div>
            ))}

            {stats?.sinUbicacion > 0 && (
              <div style={{ paddingTop: '8px', borderTop: '1px solid #f0f0f0', fontSize: '11px', color: '#94a3b8' }}>
                {stats.sinUbicacion.toLocaleString('es-ES')} sin ubicación
              </div>
            )}

            <div style={{ paddingTop: '8px', borderTop: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#1e293b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '9px', fontWeight: 700, border: '2px solid white', boxShadow: '0 0 0 1px #1e293b', flexShrink: 0 }}>N</span>
                <span style={{ fontSize: '12px', color: '#374151' }}>Zoom para expandir</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}