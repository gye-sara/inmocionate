# GarantíaYa — Mapa Evento

App React para eventos: muestra el mapa de pólizas con formulario de registro de visitantes.

## Stack
- React + Vite
- Leaflet + MarkerCluster
- Supabase (misma BD que producción, solo lectura)

## Setup rápido

### 1. Clonar e instalar
```bash
git clone https://github.com/gye-sara/garantiaya-evento.git
cd garantiaya-evento
npm install
```

### 2. Variables de entorno
Crea un fichero `.env` en la raíz:
```env
VITE_SUPABASE_URL=https://cccsdzywjxgmrurjsyqt.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
VITE_N8N_WEBHOOK_URL=https://garantiayaspain.app.n8n.cloud/webhook/tu-webhook
```

> `VITE_N8N_WEBHOOK_URL` es opcional. Si no se configura, el formulario funciona igual pero no guarda en Google Sheets.

### 3. Desarrollo local
```bash
npm run dev
```

### 4. Build para producción
```bash
npm run build
```

## Deploy en Replit

1. Crear nuevo Replit → importar desde GitHub
2. En Secrets de Replit agregar las 3 variables de entorno
3. Run command: `npm run build && npx serve dist`

## Diferencias con la app de producción

| Producción | Evento |
|---|---|
| Login por contraseña | Formulario de registro |
| Tabs Pólizas + Inmobiliarias | Solo Pólizas |
| Muestra importes y alquileres | Sin datos económicos |
| Muestra nombre del comercial | Sin comercial |
| Filtro por comercial | Sin filtro comercial |
| Rango de alquiler | Sin rango alquiler |
| Botón salir | Botón "Siguiente visitante" |

## Flujo del evento

1. Visitante se acerca → comercial abre la app
2. Visitante llena: nombre, apellidos, inmobiliaria, email, teléfono, ciudad
3. Al pulsar "Ver el mapa" → datos se envían a n8n → Google Sheets
4. Visitante explora el mapa con filtros
5. Comercial pulsa "Siguiente visitante" → formulario limpio para la siguiente persona

## Datos registrados por visitante

```json
{
  "nombre": "María",
  "apellidos": "García López",
  "inmobiliaria": "Ejemplo Inmobiliaria",
  "email": "maria@ejemplo.com",
  "telefono": "600000000",
  "ciudad": "Barcelona",
  "timestamp": "2025-06-05T10:30:00.000Z"
}
```
# inmocionate
