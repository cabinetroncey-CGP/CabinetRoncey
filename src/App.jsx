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

function fmt(n) {
  if (isNaN(n) || n === null) return '—'
  return Math.round(n).toLocaleString('fr-FR') + ' €'
}
function fmtPct(n) { return (n >= 0 ? '+' : '') + Number(n).toFixed(1) + '%' }

// ─── AUTH ───────────────────────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMsg('')
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
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              background: mode === m ? '#fff' : 'transparent', color: mode === m ? '#0f1b35' : '#8a93b0',
              boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
            }}>
              {m === 'login' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#4a5578', fontWeight: 500, display: 'block', marginBottom: 5 }}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #e0e2ea', borderRadius: 8, fontSize: 14, color: '#0f1b35', background: '#fff' }}
              placeholder="vous@email.com" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: '#4a5578', fontWeight: 500, display: 'block', marginBottom: 5 }}>Mot de passe</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" required
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #e0e2ea', borderRadius: 8, fontSize: 14, color: '#0f1b35', background: '#fff' }}
              placeholder="••••••••" />
          </div>
          {msg && <div style={{ fontSize: 13, color: msg.includes('Vérifiez') ? '#1d7a4e' : '#b83030', marginBottom: 14, padding: '8px 12px', borderRadius: 8, background: msg.includes('Vérifiez') ? '#e8f5ee' : '#faeaea' }}>{msg}</div>}
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '11px', background: '#0f1b35', color: '#fff', border: 'none',
            borderRadius: 9, fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
function Sidebar({ page, setPage, user, onLogout, rdvMode, setRdvMode }) {
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
          <div key={n.id} onClick={() => setPage(n.id)} style={{
            padding: '10px 18px', cursor: 'pointer', fontSize: 13,
            color: page === n.id ? '#fff' : 'rgba(255,255,255,0.5)',
            background: page === n.id ? 'rgba(201,146,42,0.15)' : 'transparent',
            borderLeft: page === n.id ? '3px solid #c9922a' : '3px solid transparent',
            transition: 'all 0.15s'
          }}>{n.label}</div>
        ))}
      </nav>
      <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={() => setRdvMode(!rdvMode)} style={{
          background: rdvMode ? '#c9922a' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none',
          borderRadius: 7, padding: '8px', fontSize: 12, fontWeight: 500, cursor: 'pointer'
        }}>
          {rdvMode ? 'Quitter rendez-vous' : 'Mode rendez-vous'}
        </button>
        <button onClick={onLogout} style={{
          background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 7, padding: '7px', fontSize: 12, cursor: 'pointer'
        }}>Déconnexion</button>
      </div>
    </div>
  )
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({ assets }) {
  const total = assets.reduce((s, a) => s + (a.valeur_actuelle || 0), 0)
  const immo = assets.filter(a => a.categorie === 'immobilier').reduce((s, a) => s + a.valeur_actuelle, 0)
  const fi = assets.filter(a => ['financier', 'assurance', 'pee', 'per', 'crypto'].includes(a.categorie)).reduce((s, a) => s + a.valeur_actuelle, 0)

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Patrimoine total', value: fmt(total), sub: assets.length + ' actifs' },
          { label: 'Immobilier', value: fmt(immo), sub: total > 0 ? Math.round(immo / total * 100) + '%' : '—' },
          { label: 'Financier', value: fmt(fi), sub: total > 0 ? Math.round(fi / total * 100) + '%' : '—' },
          { label: 'Plus-value totale', value: fmt(assets.reduce((s, a) => s + (a.valeur_actuelle - a.valeur_achat), 0)), sub: 'depuis acquisition' },
        ].map((k, i) => (
          <div key={i} style={{ background: '#f0f1f6', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: '#8a93b0', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: '#0f1b35' }}>{k.value}</div>
            <div style={{ fontSize: 12, color: '#8a93b0', marginTop: 3 }}>{k.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', border: '1px solid #e8eaf0', borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#4a5578', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 14 }}>Actifs récents</div>
        {assets.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#8a93b0', padding: '30px 0', fontSize: 14 }}>Aucun actif — ajoutez-en dans la section Patrimoine</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>{['Actif', 'Catégorie', 'Valeur actuelle', '+/- value'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, color: '#8a93b0', fontWeight: 500, textTransform: 'uppercase', borderBottom: '1px solid #e8eaf0' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {assets.slice(0, 6).map(a => {
                const pv = a.valeur_actuelle - a.valeur_achat
                const pvPct = a.valeur_achat > 0 ? (pv / a.valeur_achat * 100) : 0
                return (
                  <tr key={a.id}>
                    <td style={{ padding: '11px 12px', borderBottom: '1px solid #f0f1f6', fontWeight: 500 }}>{a.nom}</td>
                    <td style={{ padding: '11px 12px', borderBottom: '1px solid #f0f1f6' }}>
                      <span style={{ background: CAT_COLORS[a.categorie] + '18', color: CAT_COLORS[a.categorie], padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500 }}>{CAT_LABELS[a.categorie]}</span>
                    </td>
                    <td style={{ padding: '11px 12px', borderBottom: '1px solid #f0f1f6', fontWeight: 500 }}>{fmt(a.valeur_actuelle)}</td>
                    <td style={{ padding: '11px 12px', borderBottom: '1px solid #f0f1f6' }}>
                      <span style={{ background: pv >= 0 ? '#e8f5ee' : '#faeaea', color: pv >= 0 ? '#1d7a4e' : '#b83030', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500 }}>
                        {pv >= 0 ? '+' : ''}{fmtPct(pvPct)}
                      </span>
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

// ─── PATRIMOINE ───────────────────────────────────────────────────────────────
function Patrimoine({ assets, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('tous')
  const [form, setForm] = useState({ nom: '', categorie: 'immobilier', valeur_achat: '', valeur_actuelle: '', date_acquisition: '', rendement_annuel: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const filtered = filter === 'tous' ? assets : assets.filter(a => a.categorie === filter)
  const total = assets.reduce((s, a) => s + (a.valeur_actuelle || 0), 0)

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    await onAdd({ ...form, valeur_achat: parseFloat(form.valeur_achat) || 0, valeur_actuelle: parseFloat(form.valeur_actuelle) || 0, rendement_annuel: parseFloat(form.rendement_annuel) || 0 })
    setForm({ nom: '', categorie: 'immobilier', valeur_achat: '', valeur_actuelle: '', date_acquisition: '', rendement_annuel: '', notes: '' })
    setShowForm(false)
    setSaving(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 6, background: '#f0f1f6', borderRadius: 10, padding: 3 }}>
          {['tous', 'immobilier', 'financier', 'assurance', 'per', 'crypto', 'autre'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
              background: filter === f ? '#fff' : 'transparent', color: filter === f ? '#0f1b35' : '#8a93b0',
              boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
            }}>{f === 'tous' ? 'Tous' : CAT_LABELS[f]}</button>
          ))}
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: '#c9922a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          {showForm ? 'Annuler' : '+ Ajouter un actif'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e8eaf0', borderRadius: 14, padding: '20px', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>Nouvel actif</div>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              {[
                { label: "Nom de l'actif", key: 'nom', type: 'text', placeholder: 'Ex: Appart. Lyon 6e' },
                { label: 'Catégorie', key: 'categorie', type: 'select' },
                { label: "Valeur d'achat (€)", key: 'valeur_achat', type: 'number', placeholder: '150000' },
                { label: 'Valeur actuelle (€)', key: 'valeur_actuelle', type: 'number', placeholder: '180000' },
                { label: "Date d'acquisition", key: 'date_acquisition', type: 'date' },
                { label: 'Rendement annuel estimé (%)', key: 'rendement_annuel', type: 'number', placeholder: '4.5' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 12, color: '#4a5578', fontWeight: 500, display: 'block', marginBottom: 5 }}>{f.label}</label>
                  {f.type === 'select' ? (
                    <select value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e2ea', borderRadius: 7, fontSize: 13, background: '#fff' }}>
                      {Object.entries(CAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  ) : (
                    <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e2ea', borderRadius: 7, fontSize: 13 }} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: '#4a5578', fontWeight: 500, display: 'block', marginBottom: 5 }}>Notes</label>
              <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Locatif, nue-propriété..."
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e2ea', borderRadius: 7, fontSize: 13 }} />
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
                  <tr key={a.id} style={{ borderBottom: '1px solid #f0f1f6' }}>
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
                      <span style={{ background: pv >= 0 ? '#e8f5ee' : '#faeaea', color: pv >= 0 ? '#1d7a4e' : '#b83030', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500 }}>
                        {pv >= 0 ? '+' : ''}{fmtPct(pvPct)}
                      </span>
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: 12, color: '#4a5578' }}>{poids}%</td>
                    <td style={{ padding: '11px 12px' }}>
                      <button onClick={() => { if (confirm('Supprimer cet actif ?')) onDelete(a.id) }}
                        style={{ background: '#faeaea', color: '#b83030', border: '1px solid rgba(184,48,48,0.15)', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>
                        Suppr.
                      </button>
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

// ─── SIMULATEUR ───────────────────────────────────────────────────────────────
function Simulateur() {
  const [p, setP] = useState({ capital: 10000, duree: 10, taux: 5, fraisGest: 1, fraisEntree: 2, mensuel: 200, withVers: false, withInflation: false, inflation: 2, freq: 12 })

  const tauxNet = (p.taux - p.fraisGest) / 100
  const capitalNet = p.capital * (1 - p.fraisEntree / 100)
  const annualVers = p.withVers ? p.mensuel * p.freq : 0
  let cap = capitalNet
  let totalFrais = p.capital * p.fraisEntree / 100
  const rows = []
  for (let y = 1; y <= p.duree; y++) {
    const debut = cap
    const interets = (cap + annualVers / 2) * tauxNet
    const fraisAn = (cap + annualVers / 2) * (p.fraisGest / 100)
    cap = cap + annualVers + interets
    totalFrais += fraisAn
    rows.push({ y, debut, interets, fraisAn, fin: cap })
  }
  const totalInvesti = capitalNet + annualVers * p.duree
  const totalInterets = cap - totalInvesti
  const capReel = p.withInflation ? cap / Math.pow(1 + p.inflation / 100, p.duree) : cap

  const sl = (key, min, max, step = 1) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#4a5578', marginBottom: 5 }}>
        <span>{{capital:'Capital initial',duree:'Durée',taux:'Taux annuel brut',fraisGest:'Frais de gestion',fraisEntree:"Frais d'entrée",mensuel:'Versement mensuel',inflation:'Taux d\'inflation'}[key]}</span>
        <span style={{ fontWeight: 500, color: '#0f1b35' }}>
          {key === 'duree' ? p[key] + ' ans' : key === 'capital' || key === 'mensuel' ? p[key].toLocaleString('fr-FR') + ' €' : p[key] + '%'}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={p[key]} onChange={e => setP({ ...p, [key]: parseFloat(e.target.value) })} style={{ width: '100%' }} />
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div style={{ background: '#fff', border: '1px solid #e8eaf0', borderRadius: 14, padding: '20px' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#4a5578', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 16 }}>Paramètres</div>
        {sl('capital', 0, 500000, 1000)}
        {sl('duree', 1, 40)}
        {sl('taux', 0, 20, 0.1)}
        {sl('fraisGest', 0, 5, 0.1)}
        {sl('fraisEntree', 0, 10, 0.25)}
        <div style={{ height: 1, background: '#e8eaf0', margin: '16px 0' }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4a5578', cursor: 'pointer', marginBottom: 12 }}>
          <input type="checkbox" checked={p.withVers} onChange={e => setP({ ...p, withVers: e.target.checked })} />
          Versements périodiques
        </label>
        {p.withVers && (
          <>
            {sl('mensuel', 0, 5000, 50)}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: '#4a5578', fontWeight: 500, display: 'block', marginBottom: 5 }}>Fréquence</label>
              <select value={p.freq} onChange={e => setP({ ...p, freq: parseInt(e.target.value) })} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e2ea', borderRadius: 7, fontSize: 13, background: '#fff' }}>
                <option value={12}>Mensuelle</option>
                <option value={4}>Trimestrielle</option>
                <option value={1}>Annuelle</option>
              </select>
            </div>
          </>
        )}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4a5578', cursor: 'pointer', marginBottom: 12 }}>
          <input type="checkbox" checked={p.withInflation} onChange={e => setP({ ...p, withInflation: e.target.checked })} />
          Prendre en compte l'inflation
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
            <thead>
              <tr>{['Année', 'Capital début', 'Intérêts', 'Frais', 'Capital fin'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: 10, color: '#8a93b0', fontWeight: 500, textTransform: 'uppercase', borderBottom: '1px solid #e8eaf0' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.y} style={{ borderBottom: '1px solid #f0f1f6' }}>
                  <td style={{ padding: '7px 8px', color: '#4a5578' }}>An {r.y}</td>
                  <td style={{ padding: '7px 8px' }}>{fmt(Math.round(r.debut))}</td>
                  <td style={{ padding: '7px 8px', color: '#1d7a4e' }}>{fmt(Math.round(r.interets))}</td>
                  <td style={{ padding: '7px 8px', color: '#b83030' }}>{fmt(Math.round(r.fraisAn))}</td>
                  <td style={{ padding: '7px 8px', fontWeight: 500 }}>{fmt(Math.round(r.fin))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── PROJECTIONS ─────────────────────────────────────────────────────────────
function Projections() {
  const [scenarios, setScenarios] = useState([
    { id: 1, nom: 'Assurance-vie', capital: 20000, taux: 3.5, frais: 0.9, duree: 15, mensuel: 200, color: '#1d7a4e' },
    { id: 2, nom: 'ETF Monde', capital: 10000, taux: 7, frais: 0.2, duree: 20, mensuel: 300, color: '#1a5fa0' },
    { id: 3, nom: 'SCPI', capital: 50000, taux: 5, frais: 1.5, duree: 10, mensuel: 0, color: '#c9922a' },
  ])

  function calcFinal(s) {
    const tauxNet = (s.taux - s.frais) / 100
    let cap = s.capital
    for (let y = 0; y < s.duree; y++) cap = cap + s.mensuel * 12 + (cap + s.mensuel * 6) * tauxNet
    return Math.round(cap)
  }

  function addScenario() {
    const nom = prompt("Nom du scénario :", "Nouveau placement")
    if (!nom) return
    const taux = parseFloat(prompt("Taux annuel brut (%) :", "5")) || 5
    const frais = parseFloat(prompt("Frais de gestion (%) :", "1")) || 1
    const capital = parseFloat(prompt("Capital initial (€) :", "10000")) || 10000
    const mensuel = parseFloat(prompt("Versement mensuel (€) :", "0")) || 0
    const duree = parseInt(prompt("Durée (ans) :", "15")) || 15
    const colors = ['#9b2fa0', '#7a1d1d', '#1d6a7a']
    setScenarios([...scenarios, { id: Date.now(), nom, capital, taux, frais, duree, mensuel, color: colors[scenarios.length % colors.length] }])
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button onClick={addScenario} style={{ background: '#c9922a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          + Nouveau scénario
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {scenarios.map(s => {
          const final = calcFinal(s)
          const totalInv = s.capital + s.mensuel * 12 * s.duree
          const gain = final - totalInv
          const gainPct = totalInv > 0 ? (gain / totalInv * 100).toFixed(1) : 0
          return (
            <div key={s.id} style={{ background: '#fff', border: '1px solid #e8eaf0', borderRadius: 14, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{s.nom}</div>
                <span style={{ background: s.color + '18', color: s.color, padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>{s.duree} ans</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {[['Capital final', fmt(final)], ['Gain net', fmt(gain)], ['Performance', '+' + gainPct + '%']].map(([l, v]) => (
                  <div key={l} style={{ background: '#f0f1f6', borderRadius: 8, padding: 10 }}>
                    <div style={{ fontSize: 10, color: '#8a93b0', marginBottom: 3 }}>{l}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: l === 'Gain net' ? '#1d7a4e' : '#0f1b35' }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, fontSize: 11, color: '#8a93b0' }}>
                Capital: {fmt(s.capital)} · Mensuel: {s.mensuel > 0 ? fmt(s.mensuel) : '—'} · Taux net: {(s.taux - s.frais).toFixed(1)}%
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── APP PRINCIPALE ───────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('dashboard')
  const [assets, setAssets] = useState([])
  const [rdvMode, setRdvMode] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) loadAssets()
  }, [user])

  async function loadAssets() {
    const { data } = await supabase.from('actifs').select('*').order('created_at', { ascending: false })
    if (data) setAssets(data)
  }

  async function addAsset(form) {
    const { data } = await supabase.from('actifs').insert([{ ...form, user_id: user.id }]).select()
    if (data) setAssets([...data, ...assets])
  }

  async function deleteAsset(id) {
    await supabase.from('actifs').delete().eq('id', id)
    setAssets(assets.filter(a => a.id !== id))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    setAssets([])
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#8a93b0', fontSize: 14 }}>Chargement...</div>
  if (!user) return <AuthPage onLogin={setUser} />

  const titles = { dashboard: 'Tableau de bord', patrimoine: 'Patrimoine', simulateur: 'Simulateur financier', projections: 'Projections & Comparateur' }
  const subs = { dashboard: 'Synthèse patrimoniale', patrimoine: 'Gestion complète des actifs', simulateur: 'Intérêts composés, frais, versements', projections: 'Comparez vos stratégies' }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
      <Sidebar page={page} setPage={setPage} user={user} onLogout={handleLogout} rdvMode={rdvMode} setRdvMode={setRdvMode} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f7f8fc' }}>
        {rdvMode && <div style={{ background: '#c9922a', color: '#fff', textAlign: 'center', padding: '10px', fontSize: 13, fontWeight: 500 }}>Mode rendez-vous actif</div>}
        <div style={{ padding: '20px 24px 16px', background: '#fff', borderBottom: '1px solid #e8eaf0', flexShrink: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 500, color: '#0f1b35' }}>{titles[page]}</div>
          <div style={{ fontSize: 13, color: '#8a93b0', marginTop: 2 }}>{subs[page]}</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {page === 'dashboard' && <Dashboard assets={assets} />}
          {page === 'patrimoine' && <Patrimoine assets={assets} onAdd={addAsset} onDelete={deleteAsset} />}
          {page === 'simulateur' && <Simulateur />}
          {page === 'projections' && <Projections />}
        </div>
      </div>
    </div>
  )
}
