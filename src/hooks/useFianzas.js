import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

export function useFianzas(filtros = {}) {
  const [fianzas, setFianzas]       = useState([]);
  const [sinUbicacion, setSinUbicacion] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let allData = [];
        let page = 0;
        const PAGE_SIZE = 1000;

        while (true) {
          // ⚠️  Sin campos sensibles: sin amount, alquiler, comercial_garantiaya,
          //     nombre_contacto, fecha_inicio/fin_garantia, duracion_contrato_meses
          let query = supabase
            .from('fianzas')
            .select(`
              zoho_id, deal_name,
              nombre_inmobiliaria,
              sucursal, provincia, ciudad, direccion_completa,
              lat, lng,
              estado_contrato, stage,
              categoria_garantia,
              renovaciones(id, name, stage, renovacion_n),
              impagos_recupero(id, name, fase),
              impagos_notificaciones(id, name, fase, periodo_mes, periodo_ano, importe),
              impagos_legales(id, name, fase_legal, caso_activo)
            `)
            .eq('stage', 'Póliza Vendida')
            .not('lat', 'is', null)
            .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

          if (filtros.sucursal)     query = query.eq('sucursal', filtros.sucursal);
          if (filtros.inmobiliaria) query = query.eq('nombre_inmobiliaria', filtros.inmobiliaria);
          if (filtros.estado)       query = query.eq('estado_contrato', filtros.estado);
          if (filtros.categoria)    query = query.eq('categoria_garantia', filtros.categoria);

          const { data, error } = await query;
          if (error) throw error;
          if (!data || data.length === 0) break;
          allData = allData.concat(data);
          if (data.length < PAGE_SIZE) break;
          page++;
        }

        // Filtros post-query (relaciones)
        if (filtros.conRenovaciones)   allData = allData.filter(f => f.renovaciones?.length > 0);
        if (filtros.conRecuperos)      allData = allData.filter(f => f.impagos_recupero?.length > 0);
        if (filtros.conNotificaciones) allData = allData.filter(f => f.impagos_notificaciones?.length > 0);
        if (filtros.conLegales)        allData = allData.filter(f => f.impagos_legales?.length > 0);

        // Contar sin ubicación (solo sin filtros activos)
        const hayFiltros = Object.values(filtros).some(Boolean);
        if (!hayFiltros) {
          const { count } = await supabase
            .from('fianzas')
            .select('zoho_id', { count: 'exact', head: true })
            .eq('stage', 'Póliza Vendida')
            .is('lat', null);
          setSinUbicacion(count ?? 0);
        } else {
          setSinUbicacion(0);
        }

        setFianzas(allData);
      } catch (err) {
        console.error('Error cargando fianzas:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [JSON.stringify(filtros)]);

  return { fianzas, sinUbicacion, loading, error };
}
