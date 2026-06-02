import { useState } from 'react';

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL ?? '';

export default function Registro({ onRegistro }) {
  const [form, setForm] = useState({
    nombre: '', apellidos: '', inmobiliaria: '', email: '', telefono: '', ciudad: '',
  });
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errores[k]) setErrores(e => ({ ...e, [k]: false }));
  };

  const validar = () => {
    const e = {};
    if (!form.nombre.trim())    e.nombre    = true;
    if (!form.apellidos.trim()) e.apellidos = true;
    if (!form.email.trim())     e.email     = true;
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validar()) return;
    setEnviando(true);

    const payload = { ...form, timestamp: new Date().toISOString() };

    if (N8N_WEBHOOK_URL) {
      fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(err => console.warn('Webhook n8n error (non-blocking):', err));
    }

    await new Promise(r => setTimeout(r, 400));
    setEnviando(false);
    onRegistro(payload);
  };

  const inp = (key, placeholder, type = 'text') => ({
    type,
    placeholder,
    value: form[key],
    onChange: e => set(key, e.target.value),
    onKeyDown: e => e.key === 'Enter' && handleSubmit(),
    style: {
      width: '100%', padding: '10px 12px',
      borderRadius: '8px', fontSize: '14px',
      border: `1.5px solid ${errores[key] ? '#ef4444' : '#e2e8f0'}`,
      outline: 'none', background: errores[key] ? '#fff5f5' : 'white',
      fontFamily: 'inherit', transition: 'border-color 0.2s',
    },
  });

  return (
    <div style={{
      minHeight: '100vh', background: '#0f172a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      {/* Fondo decorativo */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-200px', right: '-200px',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-150px', left: '-150px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
        }} />
      </div>

      <div style={{
        width: '100%', maxWidth: '460px', position: 'relative',
        background: '#1e293b', borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '40px 40px 36px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
          }}>🏠</div>
          <span style={{ fontSize: '17px', fontWeight: 700, color: 'white', letterSpacing: '-0.3px' }}>
            GarantíaYa
          </span>
        </div>

        <h1 style={{
          fontSize: '24px', fontWeight: 700, color: 'white',
          marginBottom: '6px', lineHeight: 1.25, letterSpacing: '-0.5px',
        }}>
          Bienvenido al mapa<br />
          <span style={{ color: '#818cf8' }}>de presencia</span>
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '28px', lineHeight: 1.6 }}>
          Introduce tus datos para acceder a la visualización de pólizas activas en toda España.
        </p>

        {/* Formulario */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

          <Field label="Nombre *" error={errores.nombre}>
            <input {...inp('nombre', 'María')} autoFocus />
          </Field>

          <Field label="Apellidos *" error={errores.apellidos}>
            <input {...inp('apellidos', 'García López')} />
          </Field>

          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Inmobiliaria" error={false}>
              <input {...inp('inmobiliaria', 'Tu agencia inmobiliaria')} />
            </Field>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Correo electrónico *" error={errores.email}>
              <input {...inp('email', 'maria@ejemplo.com', 'email')} />
            </Field>
          </div>

          <Field label="Teléfono" error={false}>
            <input {...inp('telefono', '600 000 000', 'tel')} onKeyPress={e => !/[0-9+\s]/.test(e.key) && e.preventDefault()} />
          </Field>

          <Field label="Ciudad" error={false}>
            <input {...inp('ciudad', 'Barcelona')} />
          </Field>
        </div>

        <button
          onClick={handleSubmit}
          disabled={enviando}
          style={{
            width: '100%', marginTop: '22px', padding: '13px',
            background: enviando ? '#4338ca' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: 'white', border: 'none', borderRadius: '10px',
            fontSize: '15px', fontWeight: 700, cursor: enviando ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', letterSpacing: '-0.2px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: enviando ? 'none' : '0 4px 16px rgba(99,102,241,0.4)',
            transition: 'all 0.2s',
          }}
        >
          {enviando ? (
            <>
              <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
              Accediendo…
            </>
          ) : (
            <>🗺️ Ver el mapa</>
          )}
        </button>

        <p style={{ fontSize: '11px', color: '#334155', textAlign: 'center', marginTop: '14px', lineHeight: 1.5 }}>
          Al continuar, aceptas que GarantíaYa guarde tu información de contacto.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: '11px', fontWeight: 600,
        color: error ? '#f87171' : '#64748b',
        marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px',
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}
