import { useState } from 'react';
import { brand } from '../theme.js';
import logoWhite from '../assets/brand/logo-horizontal.png';
import logoStacked from '../assets/brand/logo-stacked.png';

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

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      fontFamily: brand.font, background: brand.surface,
    }}>
      {/* ── Panel izquierdo (marca) ─────────────────────────────── */}
      <div style={{
        flex: '1 1 44%', position: 'relative', overflow: 'hidden',
        background: `linear-gradient(160deg, ${brand.navy} 0%, ${brand.navyDeep} 100%)`,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 52px',
        color: 'white',
      }}
      className="gy-brand-panel">
        {/* line-art casas decorativas */}
        <HouseField />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <img src={logoWhite} alt="GarantíaYa"
            style={{ height: '92px', marginLeft: '-14px', filter: 'brightness(0) invert(1)' }} />
        </div>

        {/* Mensaje central */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '440px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)',
            padding: '6px 14px', borderRadius: '100px', marginBottom: '24px',
            fontSize: '12px', fontWeight: 600, letterSpacing: '0.3px',
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: brand.red }} />
            Mapa de presencia · España
          </div>
          <h1 style={{
            fontSize: '40px', fontWeight: 700, lineHeight: 1.12,
            letterSpacing: '-1px', marginBottom: '18px',
          }}>
            La tranquilidad del<br />propietario, el respaldo<br />del <span style={{ color: '#7E9BE8' }}>inquilino.</span>
          </h1>
          <p style={{
            fontSize: '15px', lineHeight: 1.65, color: 'rgba(255,255,255,0.72)', maxWidth: '400px',
          }}>
            Visualiza en tiempo real todas las pólizas activas que respaldamos en cada rincón del país.
          </p>
        </div>
      </div>

      {/* ── Panel derecho (formulario) ──────────────────────────── */}
      <div style={{
        flex: '1 1 56%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', background: brand.canvas,
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Logo móvil */}
          <img src={logoStacked} alt="GarantíaYa" className="gy-mobile-logo"
            style={{ height: '76px', display: 'none', margin: '0 auto 8px' }} />

          <h2 style={{
            fontSize: '26px', fontWeight: 700, color: brand.ink,
            letterSpacing: '-0.6px', marginBottom: '6px', textAlign: 'left',
          }} className="gy-form-title">
            Accede al mapa
          </h2>
          <p style={{ fontSize: '14px', color: brand.slate, marginBottom: '28px', lineHeight: 1.6 }}
            className="gy-form-sub">
            Introduce tus datos para visualizar las pólizas activas.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Field label="Nombre *" error={errores.nombre}>
              <Input {...bind('nombre', form, set, errores, handleSubmit)} placeholder="María" autoFocus />
            </Field>
            <Field label="Apellidos *" error={errores.apellidos}>
              <Input {...bind('apellidos', form, set, errores, handleSubmit)} placeholder="García López" />
            </Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Inmobiliaria">
                <Input {...bind('inmobiliaria', form, set, errores, handleSubmit)} placeholder="Tu agencia inmobiliaria" />
              </Field>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Correo electrónico *" error={errores.email}>
                <Input {...bind('email', form, set, errores, handleSubmit)} type="email" placeholder="maria@ejemplo.com" />
              </Field>
            </div>
            <Field label="Teléfono">
              <Input {...bind('telefono', form, set, errores, handleSubmit)} type="tel" placeholder="600 000 000"
                onKeyPress={e => !/[0-9+\s]/.test(e.key) && e.preventDefault()} />
            </Field>
            <Field label="Ciudad">
              <Input {...bind('ciudad', form, set, errores, handleSubmit)} placeholder="Barcelona" />
            </Field>
          </div>

          <button
            onClick={handleSubmit}
            disabled={enviando}
            style={{
              width: '100%', marginTop: '26px', padding: '15px',
              background: enviando ? brand.redDark : brand.red,
              color: 'white', border: 'none', borderRadius: '12px',
              fontSize: '15px', fontWeight: 600, cursor: enviando ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', letterSpacing: '0.2px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              boxShadow: enviando ? 'none' : `0 10px 24px -8px ${brand.red}`,
              transition: 'all 0.2s',
            }}
            onMouseOver={e => !enviando && (e.currentTarget.style.background = brand.redDark)}
            onMouseOut={e => !enviando && (e.currentTarget.style.background = brand.red)}
          >
            {enviando ? (
              <>
                <Spinner /> Accediendo…
              </>
            ) : (
              <>Ver el mapa <Arrow /></>
            )}
          </button>

          <p style={{ fontSize: '12px', color: brand.muted, textAlign: 'center', marginTop: '18px', lineHeight: 1.5 }}>
            Al continuar, aceptas que GarantíaYa guarde tu información de contacto.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 880px) {
          .gy-brand-panel { display: none !important; }
          .gy-mobile-logo { display: block !important; }
          .gy-form-title, .gy-form-sub { text-align: center; }
        }
      `}</style>
    </div>
  );
}

// ── helpers ────────────────────────────────────────────────────
function bind(key, form, set, errores, submit) {
  return {
    value: form[key],
    onChange: e => set(key, e.target.value),
    onKeyDown: e => e.key === 'Enter' && submit(),
    'data-error': errores[key] ? 'true' : undefined,
  };
}

function Input({ 'data-error': err, style, ...props }) {
  const [focus, setFocus] = useState(false);
  return (
    <input
      {...props}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '14px',
        border: `1.5px solid ${err ? brand.red : focus ? brand.navy : brand.line}`,
        outline: 'none', fontFamily: 'inherit', color: brand.ink,
        background: err ? '#FEF2F2' : brand.surface,
        boxShadow: focus ? `0 0 0 3px ${brand.navy}1f` : 'none',
        transition: 'all 0.15s',
        ...style,
      }}
    />
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: '11px', fontWeight: 600,
        color: error ? brand.red : brand.slate,
        marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px',
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Spinner() {
  return <span style={{
    width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)',
    borderTopColor: 'white', borderRadius: '50%',
    animation: 'spin 0.7s linear infinite', display: 'inline-block',
  }} />;
}

function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// Casas en line-art como textura de fondo del panel de marca
function HouseField() {
  const House = ({ size, top, left, opacity }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none"
      stroke="white" strokeWidth="3" strokeLinejoin="round"
      style={{ position: 'absolute', top, left, opacity }}>
      <path d="M20 50 L50 24 L80 50 L80 82 L20 82 Z" />
      <path d="M50 24 L50 82" />
    </svg>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <House size={220} top="-40px" left="-50px" opacity={0.06} />
      <House size={140} top="40%" left="62%" opacity={0.05} />
      <House size={320} top="58%" left="-90px" opacity={0.05} />
      <div style={{
        position: 'absolute', top: '12%', right: '-120px',
        width: '360px', height: '360px', borderRadius: '50%',
        background: `radial-gradient(circle, ${brand.red}22 0%, transparent 70%)`,
      }} />
    </div>
  );
}
