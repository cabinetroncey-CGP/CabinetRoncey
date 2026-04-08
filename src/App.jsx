import { useState, useEffect } from "react"
import { supabase } from "./supabase"

const CAT_COLORS = {
  immobilier: '#1d7a4e', financier: '#1a5fa0', assurance: '#c9922a',
  pee: '#7a4e1d', per: '#9b2fa0', crypto: '#a03030', autre: '#4a5578'
}
const CAT_LABELS = {
  immobilier: 'Immobilier', financier: 'Financier', assurance: 'Assurance-vie',
  pee: 'PEE/PERCO', per: 'PER', crypto: 'Crypto', autre: 'Autre'
}

const PRIX_M2 = {
  'Paris': { appartement: 9600, maison: 11000, immeuble: 9200, terrain: 2500 },
  'Lyon': { appartement: 4800, maison: 5200, immeuble: 4500, terrain: 800 },
  'Marseille': { appartement: 3200, maison: 3500, immeuble: 3000, terrain: 450 },
  'Bordeaux': { appartement: 4300, maison: 4800, immeuble: 4100, terrain: 600 },
  'Toulouse': { appartement: 3600, maison: 3900, immeuble: 3400, terrain: 500 },
  'Nice': { appartement: 5200, maison: 5800, immeuble: 5000, terrain: 1200 },
  'Nantes': { appartement: 3800, maison: 4100, immeuble: 3600, terrain: 550 },
  'Strasbourg': { appartement: 3400, maison: 3700, immeuble: 3200, terrain: 480 },
  'Montpellier': { appartement: 3500, maison: 3800, immeuble: 3300, terrain: 520 },
  'Lille': { appartement: 3100, maison: 3400, immeuble: 2900, terrain: 420 },
  'Rennes': { appartement: 4000, maison: 4300, immeuble: 3800, terrain: 580 },
  'Reims': { appartement: 2600, maison: 2900, immeuble: 2400, terrain: 320 },
  'Grenoble': { appartement: 2900, maison: 3200, immeuble: 2700, terrain: 400 },
  'Toulon': { appartement: 3000, maison: 3300, immeuble: 2800, terrain: 420 },
  'Dijon': { appartement: 2700, maison: 3000, immeuble: 2500, terrain: 350 },
  'Angers': { appartement: 3000, maison: 3200, immeuble: 2800, terrain: 430 },
  'Nîmes': { appartement: 2400, maison: 2700, immeuble: 2200, terrain: 300 },
  'Saint-Étienne': { appartement: 1400, maison: 1600, immeuble: 1300, terrain: 200 },
  'Brest': { appartement: 2800, maison: 3000, immeuble: 2600, terrain: 380 },
  'Caen': { appartement: 2900, maison: 3200, immeuble: 2700, terrain: 380 },
  'Aix-en-Provence': { appartement: 5100, maison: 5600, immeuble: 4900, terrain: 900 },
  'Clermont-Ferrand': { appartement: 2300, maison: 2600, immeuble: 2100, terrain: 280 },
  'Rouen': { appartement: 2800, maison: 3100, immeuble: 2600, terrain: 360 },
  'Nancy': { appartement: 2500, maison: 2800, immeuble: 2300, terrain: 320 },
  'Metz': { appartement: 2400, maison: 2700, immeuble: 2200, terrain: 300 },
  'Perpignan': { appartement: 2100, maison: 2400, immeuble: 1900, terrain: 260 },
  'Orléans': { appartement: 2800, maison: 3000, immeuble: 2600, terrain: 380 },
  'Amiens': { appartement: 2200, maison: 2500, immeuble: 2000, terrain: 270 },
  'Le Havre': { appartement: 2200, maison: 2500, immeuble: 2000, terrain: 280 },
  'Limoges': { appartement: 1800, maison: 2000, immeuble: 1600, terrain: 220 },
  'La Rochelle': { appartement: 4000, maison: 4400, immeuble: 3800, terrain: 650 },
  'Pau': { appartement: 2500, maison: 2800, immeuble: 2300, terrain: 320 },
  'Biarritz': { appartement: 8500, maison: 9500, immeuble: 8000, terrain: 1800 },
  'Cannes': { appartement: 7500, maison: 8500, immeuble: 7200, terrain: 1600 },
  'Antibes': { appartement: 5500, maison: 6200, immeuble: 5300, terrain: 1100 },
  'Bayonne': { appartement: 4200, maison: 4600, immeuble: 4000, terrain: 680 },
  'Annecy': { appartement: 5500, maison: 6000, immeuble: 5300, terrain: 1000 },
  'Tours': { appartement: 3000, maison: 3300, immeuble: 2800, terrain: 420 },
  'Versailles': { appartement: 7500, maison: 8500, immeuble: 7200, terrain: 1600 },
  'Saint-Malo': { appartement: 5000, maison: 5500, immeuble: 4800, terrain: 900 },
  'Chambéry': { appartement: 3000, maison: 3300, immeuble: 2800, terrain: 430 },
  'Poitiers': { appartement: 2300, maison: 2600, immeuble: 2100, terrain: 290 },
  'Valence': { appartement: 2400, maison: 2700, immeuble: 2200, terrain: 300 },
  'Quimper': { appartement: 2400, maison: 2700, immeuble: 2200, terrain: 320 },
  'Besançon': { appartement: 2500, maison: 2800, immeuble: 2300, terrain: 310 },
}

function fmt(n) {
  if (isNaN(n) || n === null) return '—'
  return Math.round(n).toLocaleString('fr-FR') + ' €'
}
function fmtPct(n) { return (n >= 0 ? '+' : '') + Number(n).toFixed(1) + '%' }

function AuthPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true); setMsg('')
    if (mode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMsg(error.message)
      else onLogin(data.user)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMsg(error.message)
      else setMsg('Vérifiez votre email pour confirmer votre compte.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f8fc' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '40px 36px', width: 380, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 500, color: '#0f1b35' }}>Patrim<span style={{ color: '#c9922a' }}>IA</span></div>
          <div style={{ fontSize: 13, color: '#8a93b0', marginTop: 4 }}>Cabinet Roncey — Gestion de Patrimoine</div>
        </div>
        <div style={{ display: 'flex', gap: 6, background: '#f0f1f6', borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {['login', 'signup'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: mode === m ? '#fff' : 'transparent', color: mode === m ? '#0f1b35' : '#8a93b0', boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
              {m === 'login' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#4a5578', fontWeight: 500, display: 'block', marginBottom: 5 }}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="vous@email.com" style={{ width: '100%', padding: '9px 12px', border: '1px solid #e0e2ea', borderRadius: 8, fontSize: 14, color: '#0f1b35', background: '#fff' }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: '#4a5578', fontWeight: 500, display: 'block', marginBottom: 5 }}>Mot de passe</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" required placeholder="••••••••" style={{ width: '100%', padding: '9px 12px', border: '1px solid #e0e2ea', borderRadius: 8, fontSize: 14, color: '#0f1b35', background: '#fff' }} />
          </div>
          {msg && <div style={{ fontSize: 13, color: msg.includes('Vérifiez') ? '#1d7a4e' : '#b83030', marginBottom: 14, padding: '8px 12px', borderRadius: 8, background: msg.includes('Vérifiez') ? '#e8f5ee' : '#faeaea' }}>{msg}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '11px', background: '#0f1b35', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>
      </div>
    </div>
  )
}

function FicheActif({ asset, onClose, onSave }) {
  const [form, setForm] = useState({ ...asset })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true); await onSave(form); setSaving(false); onClose()
  }

  const pv = (form.valeur_actuelle || 0) - (form.valeur_achat || 0)
  const pvPct = form.valeur_achat > 0 ? (pv / form.valeur_achat * 100).toFixed(1) : 0

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '28px', width: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#0f1b35' }}>{form.nom}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#8a93b0', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
          {[['Valeur achat', fmt(form.valeur_achat), null], ['Valeur actuelle', fmt(form.valeur_actuelle), null], ['Plus-value', fmt(pv) + ' (' + (pv >= 0 ? '+' : '') + pvPct + '%)', pv >= 0 ? '#1d7a4e' : '#b83030']].map(([l, v, c]) => (
            <div key={l} style={{ background: '#f0f1f6', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: '#8a93b0', marginBottom: 4 }}>{l}</div>
              <div style={{ fontSize: 16, fontWeight: 500, color: c || '#0f1b35' }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          {[
            { label: "Nom de l'actif", key: 'nom', type: 'text' },
            { label: 'Catégorie', key: 'categorie', type: 'select' },
            { label: "Valeur d'achat (€)", key: 'valeur_achat', type: 'number' },
            { label: 'Valeur actuelle (€)', key: 'valeur_actuelle', type: 'number' },
            { label: "Date d'acquisition", key: 'date_acquisition', type: 'date' },
            { label: 'Rendement annuel (%)', key: 'rendement_annuel', type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, color: '#4a5578', fontWeight: 500, display: 'block', marginBottom: 5 }}>{f.label}</label>
              {f.type === 'select' ? (
                <select value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e2ea', borderRadius: 7, fontSize: 13, background: '#fff' }}>
                  {Object.entries(CAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              ) : (
                <input type={f.type} value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e2ea', borderRadius: 7, fontSize: 13 }} />
              )}
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12, color: '#4a5578', fontWeight: 500, display: 'block', marginBottom: 5 }}>Notes</label>
          <input value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e2ea', borderRadius: 7, fontSize: 13 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid #e0e2ea', borderRadius: 8, padding: '9px 18px', fontSize: 13, cursor: 'pointer', color: '#4a5578' }}>Annuler</button>
          <button onClick={handleSave} disabled={saving} style={{ background: '#0f1b35', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </div>
    </div>
  )
}

function EstimateurImmo({ onValider }) {
  const [ville, setVille] = useState('')
  const [typeBien, setTypeBien] = useState('appartement')
  const [surface, setSurface] = useState('')
  const villes = Object.keys(PRIX_M2).sort()

  const prixM2 = ville ? PRIX_M2[ville]?.[typeBien] : null
  const estimation = prixM2 && surface ? Math.round(prixM2 * parseFloat(surface)) : null

  return (
    <div style={{ background: '#e6f0fb', border: '1px solid #b5d4f4', borderRadius: 12, padding: '16px 18px', marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#0c447c', marginBottom: 12 }}>Estimateur — je ne connais pas la valeur du bien</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 11, color: '#1a5fa0', fontWeight: 500, display: 'block', marginBottom: 4 }}>Ville</label>
          <select value={ville} onChange={e => setVille(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #b5d4f4', borderRadius: 7, fontSize: 13, background: '#fff' }}>
            <option value="">Choisir une ville</option>
            {villes.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#1a5fa0', fontWeight: 500, display: 'block', marginBottom: 4 }}>Type de bien</label>
          <select value={typeBien} onChange={e => setTypeBien(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #b5d4f4', borderRadius: 7, fontSize: 13, background: '#fff' }}>
            <option value="appartement">Appartement</option>
            <option value="maison">Maison</option>
            <option value="immeuble">Immeuble</option>
            <option value="terrain">Terrain</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#1a5fa0', fontWeight: 500, display: 'block', marginBottom: 4 }}>Surface (m²)</label>
          <input type="number" value={surface} onChange={e => setSurface(e.target.value)} placeholder="Ex: 65" style={{ width: '100%', padding: '8px 10px', border: '1px solid #b5d4f4', borderRadius: 7, fontSize: 13 }} />
        </div>
      </div>
      {estimation && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: 10, padding: '12px 16px', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: '#4a5578', marginBottom: 3 }}>{typeBien} de {surface} m² à {ville} — {prixM2?.toLocaleString('fr-FR')} €/m²</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: '#0f1b35' }}>{fmt(estimation)}</div>
            <div style={{ fontSize: 11, color: '#8a93b0', marginTop: 2 }}>Estimation indicative basée sur les prix du marché 2025-2026</div>
          </div>
          <button onClick={() => onValider(estimation)} style={{ background: '#1d7a4e', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Utiliser →
          </button>
        </div>
      )}
    </div>
  )
}

function Sidebar({ page, setPage, user, onLogout }) {
  const nav = [
    { id: 'dashboard', label: 'Tableau de bord' },
    { id: 'patrimoine', label: 'Patrimoine' },
    { id: 'simulateur', label: 'Simulateur' },
    { id: 'projections', label: 'Projections' },
  ]
  return (
    <div style={{ width: 220, minWidth: 220, background: '#0f1b35', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 20, fontWeight: 500, color: '#fff' }}>Patrim<span style={{ color: '#e8b84b' }}>IA</span></div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>Cabinet Roncey</div>
      </div>
      <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Connecté</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', wordBreak: 'break-all' }}>{user?.email}</div>
      </div>
      <nav style={{ flex: 1, padding: '12px 0' }}>
        {nav.map(n => (
          <div key={n.id} onClick={() => setPage(n.id)} style={{ padding: '10px 18px', cursor: 'pointer', fontSize: 13, color: page === n.id ? '#fff' : 'rgba(255,255,255,0.5)', background: page === n.id ? 'rgba(201,146,42,0.15)' : 'transparent', borderLeft: page === n.id ? '3px solid #c9922a' : '3px solid transparent', transition: 'all 0.15s' }}>
            {n.label}
          </div>
        ))}
      </nav>
      <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={onLogout} style={{ width: '100%', background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '8px', fontSize: 12, cursor: 'pointer' }}>
          Déconnexion
        </button>
      </div>
    </div>
  )
}

function Dashboard({ assets, onOpenFiche }) {
  const total = assets.reduce((s, a) => s + (a.valeur_actuelle || 0), 0)
  const immo = assets.filter(a => a.categorie === 'immobilier').reduce((s, a) => s + a.valeur_actuelle, 0)
  const fi = assets.filter(a => ['financier', 'assurance', 'pee', 'per', 'crypto'].includes(a.categorie)).reduce((s, a) => s + a.valeur_actuelle, 0)
  const pvTotal = assets.reduce((s, a) => s + (a.valeur_actuelle - a.valeur_achat), 0)

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Patrimoine total', value: fmt(total), sub: assets.length + ' actifs' },
          { label: 'Immobilier', value: fmt(immo), sub: total > 0 ? Math.round(immo / total * 100) + '% du total' : '—' },
          { label: 'Financier', value: fmt(fi), sub: total > 0 ? Math.round(fi / total * 100) + '% du total' : '—' },
          { label: 'Plus-value totale', value: fmt(pvTotal), sub: pvTotal >= 0 ? 'gain depuis acquisition' : 'perte depuis acquisition' },
        ].map((k, i) => (
          <div key={i} style={{ background: '#f0f1f6', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: '#8a93b0', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: '#0f1b35' }}>{k.value}</div>
            <div style={{ fontSize: 12, color: '#8a93b0', marginTop: 3 }}>{k.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', border: '1px solid #e8eaf0', borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#4a5578', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 14 }}>
          Actifs — cliquez sur une ligne pour voir et modifier la fiche
        </div>
        {assets.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#8a93b0', padding: '30px 0', fontSize: 14 }}>Aucun actif — ajoutez-en dans la section Patrimoine</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>{['Actif', 'Catégorie', 'Valeur actuelle', '+/- value', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, color: '#8a93b0', fontWeight: 500, textTransform: 'uppercase', borderBottom: '1px solid #e8eaf0' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {assets.map(a => {
                const pv = a.valeur_actuelle - a.valeur_achat
                const pvPct = a.valeur_achat > 0 ? (pv / a.valeur_achat * 100) : 0
                return (
                  <tr key={a.id} onClick={() => onOpenFiche(a)} style={{ cursor: 'pointer' }}>
                    <td style={{ padding: '11px 12px', borderBottom: '1px solid #f0f1f6', fontWeight: 500 }}>{a.nom}</td>
                    <td style={{ padding: '11px 12px', borderBottom: '1px solid #f0f1f6' }}>
                      <span style={{ background: CAT_COLORS[a.categorie] + '18', color: CAT_COLORS[a.categorie], padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500 }}>{CAT_LABELS[a.categorie]}</span>
                    </td>
                    <td style={{ padding: '11px 12px', borderBottom: '1px solid #f0f1f6', fontWeight: 500 }}>{fmt(a.valeur_actuelle)}</td>
                    <td style={{ padding: '11px 12px', borderBottom: '1px solid #f0f1f6' }}>
                      <span style={{ background: pv >= 0 ? '#e8f5ee' : '#faeaea', color: pv >= 0 ? '#1d7a4e' : '#b83030', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500 }}>{pv >= 0 ? '+' : ''}{fmtPct(pvPct)}</span>
                    </td>
                    <td style={{ padding: '11px 12px', borderBottom: '1px solid #f0f1f6', fontSize: 12, color: '#1a5fa0' }}>Voir fiche →</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function Patrimoine({ assets, onAdd, onDelete, onOpenFiche }) {
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('tous')
  const [showEstimateur, setShowEstimateur] = useState(false)
  const [form, setForm] = useState({ nom: '', categorie: 'immobilier', valeur_achat: '', valeur_actuelle: '', date_acquisition: '', rendement_annuel: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const filtered = filter === 'tous' ? assets : assets.filter(a => a.categorie === filter)
  const total = assets.reduce((s, a) => s + (a.valeur_actuelle || 0), 0)

  async function handleAdd(e) {
    e.preventDefault(); setSaving(true)
    await onAdd({ ...form, valeur_achat: parseFloat(form.valeur_achat) || 0, valeur_actuelle: parseFloat(form.valeur_actuelle) || 0, rendement_annuel: parseFloat(form.rendement_annuel) || 0 })
    setForm({ nom: '', categorie: 'immobilier', valeur_achat: '', valeur_actuelle: '', date_acquisition: '', rendement_annuel: '', notes: '' })
    setShowForm(false); setShowEstimateur(false); setSaving(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 }}>
        <div style={{ display: 'flex', gap: 4, background: '#f0f1f6', borderRadius: 10, padding: 3, flexWrap: 'wrap' }}>
          {['tous', 'immobilier', 'financier', 'assurance', 'per', 'crypto', 'autre'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 11px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: filter === f ? '#fff' : 'transparent', color: filter === f ? '#0f1b35' : '#8a93b0', boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
              {f === 'tous' ? 'Tous' : CAT_LABELS[f]}
            </button>
          ))}
        </div>
        <button onClick={() => { setShowForm(!showForm); setShowEstimateur(false) }} style={{ background: '#c9922a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          {showForm ? 'Annuler' : '+ Ajouter un actif'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e8eaf0', borderRadius: 14, padding: '20px', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>Nouvel actif</div>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#4a5578', fontWeight: 500, display: 'block', marginBottom: 5 }}>Nom de l'actif</label>
                <input type="text" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Ex: Appart. Lyon 6e" required style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e2ea', borderRadius: 7, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#4a5578', fontWeight: 500, display: 'block', marginBottom: 5 }}>Catégorie</label>
                <select value={form.categorie} onChange={e => { setForm({ ...form, categorie: e.target.value }); setShowEstimateur(false) }} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e2ea', borderRadius: 7, fontSize: 13, background: '#fff' }}>
                  {Object.entries(CAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#4a5578', fontWeight: 500, display: 'block', marginBottom: 5 }}>Valeur d'achat (€)</label>
                <input type="number" value={form.valeur_achat} onChange={e => setForm({ ...form, valeur_achat: e.target.value })} placeholder="150000" style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e2ea', borderRadius: 7, fontSize: 13 }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <label style={{ fontSize: 12, color: '#4a5578', fontWeight: 500 }}>Valeur actuelle (€)</label>
                  {form.categorie === 'immobilier' && (
                    <button type="button" onClick={() => setShowEstimateur(!showEstimateur)} style={{ fontSize: 11, color: '#1a5fa0', background: '#e6f0fb', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>
                      {showEstimateur ? 'Masquer' : 'Je ne sais pas →'}
                    </button>
                  )}
                </div>
                <input type="number" value={form.valeur_actuelle} onChange={e => setForm({ ...form, valeur_actuelle: e.target.value })} placeholder="180000" style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e2ea', borderRadius: 7, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#4a5578', fontWeight: 500, display: 'block', marginBottom: 5 }}>Date d'acquisition</label>
                <input type="date" value={form.date_acquisition} onChange={e => setForm({ ...form, date_acquisition: e.target.value })} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e2ea', borderRadius: 7, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#4a5578', fontWeight: 500, display: 'block', marginBottom: 5 }}>Rendement annuel estimé (%)</label>
                <input type="number" value={form.rendement_annuel} onChange={e => setForm({ ...form, rendement_annuel: e.target.value })} placeholder="4.5" step="0.1" style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e2ea', borderRadius: 7, fontSize: 13 }} />
              </div>
            </div>
            {showEstimateur && form.categorie === 'immobilier' && (
              <EstimateurImmo onValider={val => { setForm({ ...form, valeur_actuelle: String(val), valeur_achat: String(val) }); setShowEstimateur(false) }} />
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: '#4a5578', fontWeight: 500, display: 'block', marginBottom: 5 }}>Notes</label>
              <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Locatif, nue-propriété, défiscalisation..." style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e2ea', borderRadius: 7, fontSize: 13 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={saving} style={{ background: '#c9922a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                {saving ? 'Enregistrement...' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e8eaf0', borderRadius: 14, padding: '18px 20px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#8a93b0', padding: '30px 0', fontSize: 14 }}>Aucun actif dans cette catégorie</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>{['Actif', 'Catégorie', "Valeur d'achat", 'Valeur actuelle', '+/- value', 'Poids', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, color: '#8a93b0', fontWeight: 500, textTransform: 'uppercase', borderBottom: '1px solid #e8eaf0' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const pv = a.valeur_actuelle - a.valeur_achat
                const pvPct = a.valeur_achat > 0 ? (pv / a.valeur_achat * 100) : 0
                const poids = total > 0 ? (a.valeur_actuelle / total * 100).toFixed(1) : 0
                return (
                  <tr key={a.id} onClick={() => onOpenFiche(a)} style={{ borderBottom: '1px solid #f0f1f6', cursor: 'pointer' }}>
                    <td style={{ padding: '11px 12px', fontWeight: 500 }}>
                      <div>{a.nom}</div>
                      {a.notes && <div style={{ fontSize: 11, color: '#8a93b0', marginTop: 2 }}>{a.notes}</div>}
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      <span style={{ background: CAT_COLORS[a.categorie] + '18', color: CAT_COLORS[a.categorie], padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500 }}>{CAT_LABELS[a.categorie]}</span>
                    </td>
                    <td style={{ padding: '11px 12px' }}>{fmt(a.valeur_achat)}</td>
                    <td style={{ padding: '11px 12px', fontWeight: 500 }}>{fmt(a.valeur_actuelle)}</td>
                    <td style={{ padding: '11px 12px' }}>
                      <span style={{ background: pv >= 0 ? '#e8f5ee' : '#faeaea', color: pv >= 0 ? '#1d7a4e' : '#b83030', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500 }}>{pv >= 0 ? '+' : ''}{fmtPct(pvPct)}</span>
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: 12, color: '#4a5578' }}>{poids}%</td>
                    <td style={{ padding: '11px 12px' }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => { if (confirm('Supprimer cet actif ?')) onDelete(a.id) }} style={{ background: '#faeaea', color: '#b83030', border: '1px solid rgba(184,48,48,0.15)', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>Suppr.</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function Simulateur() {
  const [p, setP] = useState({ capital: 10000, duree: 10, taux: 5, fraisGest: 1, fraisEntree: 2, mensuel: 200, withVers: false, withInflation: false, inflation: 2, freq: 12 })
  const tauxNet = (p.taux - p.fraisGest) / 100
  const capitalNet = p.capital * (1 - p.fraisEntree / 100)
  const annualVers = p.withVers ? p.mensuel * p.freq : 0
  let cap = capitalNet, totalFrais = p.capital * p.fraisEntree / 100
  const rows = []
  for (let y = 1; y <= p.duree; y++) {
    const debut = cap
    const interets = (cap + annualVers / 2) * tauxNet
    const fraisAn = (cap + annualVers / 2) * (p.fraisGest / 100)
    cap = cap + annualVers + interets; totalFrais += fraisAn
    rows.push({ y, debut, interets, fraisAn, fin: cap })
  }
  const totalInvesti = capitalNet + annualVers * p.duree
  const totalInterets = cap - totalInvesti
  const capReel = p.withInflation ? cap / Math.pow(1 + p.inflation / 100, p.duree) : cap
  const sl = (key, min, max, step = 1) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#4a5578', marginBottom: 5 }}>
        <span>{{ capital: 'Capital initial', duree: 'Durée', taux: 'Taux annuel brut', fraisGest: 'Frais de gestion', fraisEntree: "Frais d'entrée", mensuel: 'Versement mensuel', inflation: "Taux d'inflation" }[key]}</span>
        <span style={{ fontWeight: 500, color: '#0f1b35' }}>{key === 'duree' ? p[key] + ' ans' : key === 'capital' || key === 'mensuel' ? p[key].toLocaleString('fr-FR') + ' €' : p[key] + '%'}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={p[key]} onChange={e => setP({ ...p, [key]: parseFloat(e.target.value) })} style={{ width: '100%' }} />
    </div>
  )
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div style={{ background: '#fff', border: '1px solid #e8eaf0', borderRadius: 14, padding: '20px' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#4a5578', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 16 }}>Paramètres</div>
        {sl('capital', 0, 500000, 1000)}{sl('duree', 1, 40)}{sl('taux', 0, 20, 0.1)}{sl('fraisGest', 0, 5, 0.1)}{sl('fraisEntree', 0, 10, 0.25)}
        <div style={{ height: 1, background: '#e8eaf0', margin: '16px 0' }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4a5578', cursor: 'pointer', marginBottom: 12 }}>
          <input type="checkbox" checked={p.withVers} onChange={e => setP({ ...p, withVers: e.target.checked })} /> Versements périodiques
        </label>
        {p.withVers && (<>
          {sl('mensuel', 0, 5000, 50)}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: '#4a5578', fontWeight: 500, display: 'block', marginBottom: 5 }}>Fréquence</label>
            <select value={p.freq} onChange={e => setP({ ...p, freq: parseInt(e.target.value) })} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e2ea', borderRadius: 7, fontSize: 13, background: '#fff' }}>
              <option value={12}>Mensuelle</option><option value={4}>Trimestrielle</option><option value={1}>Annuelle</option>
            </select>
          </div>
        </>)}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4a5578', cursor: 'pointer', marginBottom: 12 }}>
          <input type="checkbox" checked={p.withInflation} onChange={e => setP({ ...p, withInflation: e.target.checked })} /> Prendre en compte l'inflation
        </label>
        {p.withInflation && sl('inflation', 0, 10, 0.1)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: '#0f1b35', borderRadius: 14, padding: '20px' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Capital final estimé</div>
          <div style={{ fontSize: 32, fontWeight: 500, color: '#e8b84b' }}>{fmt(Math.round(cap))}</div>
          {p.withInflation && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Valeur réelle : {fmt(Math.round(capReel))}</div>}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '16px 0' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[['Capital investi', fmt(Math.round(totalInvesti))], ['Intérêts nets', fmt(Math.round(totalInterets))], ['Total frais', fmt(Math.round(totalFrais))]].map(([l, v]) => (
              <div key={l} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e8eaf0', borderRadius: 14, padding: '18px', maxHeight: 280, overflowY: 'auto' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#4a5578', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>Tableau annuel</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead><tr>{['Année', 'Capital début', 'Intérêts', 'Frais', 'Capital fin'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: 10, color: '#8a93b0', fontWeight: 500, textTransform: 'uppercase', borderBottom: '1px solid #e8eaf0' }}>{h}</th>
            ))}</tr></thead>
            <tbody>{rows.map(r => (
              <tr key={r.y} style={{ borderBottom: '1px solid #f0f1f6' }}>
                <td style={{ padding: '7px 8px', color: '#4a5578' }}>An {r.y}</td>
                <td style={{ padding: '7px 8px' }}>{fmt(Math.round(r.debut))}</td>
                <td style={{ padding: '7px 8px', color: '#1d7a4e' }}>{fmt(Math.round(r.interets))}</td>
                <td style={{ padding: '7px 8px', color: '#b83030' }}>{fmt(Math.round(r.fraisAn))}</td>
                <td style={{ padding: '7px 8px', fontWeight: 500 }}>{fmt(Math.round(r.fin))}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Projections({ userId }) {
  const [scenarios, setScenarios] = useState([])
  const [loading, setLoading] = useState(true)
  const COLORS = ['#1d7a4e', '#1a5fa0', '#c9922a', '#9b2fa0', '#7a1d1d', '#1d6a7a']

  useEffect(() => { loadProjections() }, [])

  async function loadProjections() {
    const { data } = await supabase.from('projections').select('*').order('created_at', { ascending: false })
    if (data) setScenarios(data)
    setLoading(false)
  }

  function calcFinal(s) {
    const tauxNet = (s.taux_annuel - s.frais_gestion) / 100
    let cap = s.capital_initial
    for (let y = 0; y < s.duree_annees; y++) cap = cap + s.versement_mensuel * 12 + (cap + s.versement_mensuel * 6) * tauxNet
    return Math.round(cap)
  }

  async function addScenario() {
    const nom = prompt("Nom du scénario :", "Nouveau placement"); if (!nom) return
    const taux = parseFloat(prompt("Taux annuel brut (%) :", "5")) || 5
    const frais = parseFloat(prompt("Frais de gestion (%) :", "1")) || 1
    const capital = parseFloat(prompt("Capital initial (€) :", "10000")) || 10000
    const mensuel = parseFloat(prompt("Versement mensuel (€) :", "0")) || 0
    const duree = parseInt(prompt("Durée (ans) :", "15")) || 15
    const { data } = await supabase.from('projections').insert([{ user_id: userId, nom, type_placement: 'Personnalisé', capital_initial: capital, taux_annuel: taux, frais_gestion: frais, duree_annees: duree, versement_mensuel: mensuel }]).select()
    if (data) setScenarios([...data, ...scenarios])
  }

  async function deleteScenario(id) {
    if (!confirm('Supprimer ce scénario ?')) return
    await supabase.from('projections').delete().eq('id', id)
    setScenarios(scenarios.filter(s => s.id !== id))
  }

  if (loading) return <div style={{ textAlign: 'center', color: '#8a93b0', padding: '40px', fontSize: 14 }}>Chargement...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button onClick={addScenario} style={{ background: '#c9922a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>+ Nouveau scénario</button>
      </div>
      {scenarios.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#8a93b0', padding: '60px 0', fontSize: 14, background: '#fff', borderRadius: 14, border: '1px solid #e8eaf0' }}>
          Aucun scénario — cliquez sur "+ Nouveau scénario" pour commencer
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {scenarios.map((s, i) => {
            const final = calcFinal(s)
            const totalInv = s.capital_initial + s.versement_mensuel * 12 * s.duree_annees
            const gain = final - totalInv
            const gainPct = totalInv > 0 ? (gain / totalInv * 100).toFixed(1) : 0
            const color = COLORS[i % COLORS.length]
            return (
              <div key={s.id} style={{ background: '#fff', border: '1px solid #e8eaf0', borderRadius: 14, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{s.nom}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ background: color + '18', color, padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>{s.duree_annees} ans</span>
                    <button onClick={() => deleteScenario(s.id)} style={{ background: '#faeaea', color: '#b83030', border: 'none', borderRadius: 6, padding: '3px 8px', fontSize: 12, cursor: 'pointer' }}>×</button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {[['Capital final', fmt(final), null], ['Gain net', fmt(gain), '#1d7a4e'], ['Performance', '+' + gainPct + '%', null]].map(([l, v, c]) => (
                    <div key={l} style={{ background: '#f0f1f6', borderRadius: 8, padding: 10 }}>
                      <div style={{ fontSize: 10, color: '#8a93b0', marginBottom: 3 }}>{l}</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: c || '#0f1b35' }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: '#8a93b0' }}>
                  Capital: {fmt(s.capital_initial)} · Mensuel: {s.versement_mensuel > 0 ? fmt(s.versement_mensuel) : '—'} · Taux net: {(s.taux_annuel - s.frais_gestion).toFixed(1)}%
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('dashboard')
  const [assets, setAssets] = useState([])
  const [ficheAsset, setFicheAsset] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setUser(session?.user ?? null); setLoading(false) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => { setUser(session?.user ?? null) })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { if (user) loadAssets() }, [user])

  async function loadAssets() {
    const { data } = await supabase.from('actifs').select('*').order('created_at', { ascending: false })
    if (data) setAssets(data)
  }

  async function addAsset(form) {
    const { data } = await supabase.from('actifs').insert([{ ...form, user_id: user.id }]).select()
    if (data) setAssets([...data, ...assets])
  }

  async function updateAsset(form) {
    const { id, user_id, created_at, updated_at, ...fields } = form
    await supabase.from('actifs').update(fields).eq('id', id)
    setAssets(assets.map(a => a.id === id ? { ...a, ...fields } : a))
  }

  async function deleteAsset(id) {
    await supabase.from('actifs').delete().eq('id', id)
    setAssets(assets.filter(a => a.id !== id))
  }

  async function handleLogout() { await supabase.auth.signOut(); setUser(null); setAssets([]) }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#8a93b0', fontSize: 14 }}>Chargement...</div>
  if (!user) return <AuthPage onLogin={setUser} />

  const titles = { dashboard: 'Tableau de bord', patrimoine: 'Patrimoine', simulateur: 'Simulateur financier', projections: 'Projections & Comparateur' }
  const subs = { dashboard: 'Synthèse patrimoniale — cliquez sur un actif pour voir sa fiche', patrimoine: 'Gestion complète des actifs', simulateur: 'Intérêts composés, frais, versements', projections: 'Vos scénarios sauvegardés' }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
      {ficheAsset && <FicheActif asset={ficheAsset} onClose={() => setFicheAsset(null)} onSave={updateAsset} />}
      <Sidebar page={page} setPage={setPage} user={user} onLogout={handleLogout} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f7f8fc' }}>
        <div style={{ padding: '20px 24px 16px', background: '#fff', borderBottom: '1px solid #e8eaf0', flexShrink: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 500, color: '#0f1b35' }}>{titles[page]}</div>
          <div style={{ fontSize: 13, color: '#8a93b0', marginTop: 2 }}>{subs[page]}</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {page === 'dashboard' && <Dashboard assets={assets} onOpenFiche={setFicheAsset} />}
          {page === 'patrimoine' && <Patrimoine assets={assets} onAdd={addAsset} onDelete={deleteAsset} onOpenFiche={setFicheAsset} />}
          {page === 'simulateur' && <Simulateur />}
          {page === 'projections' && <Projections userId={user.id} />}
        </div>
      </div>
    </div>
  )
}
