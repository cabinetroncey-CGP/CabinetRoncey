import { useState, useMemo } from "react"

function fmt(n) {
  if (isNaN(n) || n === null) return '—'
  return Math.round(n).toLocaleString('fr-FR') + ' €'
}

export default function Simulateur() {
  const [p, setP] = useState({
    capital: 10000, duree: 10, taux: 5,
    fraisGest: 1.0, fraisEntree: 2.0,
    mensuel: 200, withVers: false, freq: 12
  })

  const result = useMemo(() => {
    const capitalNet = p.capital * (1 - p.fraisEntree / 100)
    const annualVers = p.withVers ? p.mensuel * p.freq : 0
    const annualVersNet = annualVers * (1 - p.fraisEntree / 100)
    let cap = capitalNet
    let totalVersements = capitalNet
    let totalInterets = 0
    const rows = []
    for (let y = 1; y <= p.duree; y++) {
      const debut = cap
      cap += annualVersNet
      const interetsBruts = cap * (p.taux / 100)
      const fraisGestAn = cap * (p.fraisGest / 100)
      const interetsNets = interetsBruts - fraisGestAn
      cap += interetsNets
      totalVersements += annualVersNet
      totalInterets += interetsNets
      rows.push({ y, debut, versements: annualVersNet, interets: interetsNets, fin: cap })
    }
    const capitalFinal = cap
    const propVersements = capitalFinal > 0 ? (totalVersements / capitalFinal * 100) : 0
    const propInterets = capitalFinal > 0 ? (totalInterets / capitalFinal * 100) : 0
    return { capitalFinal, totalVersements, totalInterets, propVersements, propInterets, rows }
  }, [p])

  const { capitalFinal, totalVersements, totalInterets, propVersements, propInterets, rows } = result

  function sl(key, min, max, step, label) {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#4a5578', marginBottom: 5 }}>
          <span>{label}</span>
          <span style={{ fontWeight: 500, color: '#0f1b35' }}>
            {key === 'duree' ? p[key] + ' ans'
              : key === 'capital' || key === 'mensuel' ? p[key].toLocaleString('fr-FR') + ' €'
              : p[key].toFixed(2) + '%'}
          </span>
        </div>
        <input type="range" min={min} max={max} step={step} value={p[key]}
          onChange={e => setP(prev => ({ ...prev, [key]: parseFloat(e.target.value) }))}
          style={{ width: '100%' }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div style={{ background: '#fff', border: '1px solid #e8eaf0', borderRadius: 14, padding: '20px' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#4a5578', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 16 }}>Paramètres</div>
        {sl('capital', 0, 500000, 1000, 'Capital initial')}
        {sl('duree', 1, 40, 1, 'Durée')}
        {sl('taux', 0, 20, 0.1, 'Taux annuel brut')}
        {sl('fraisGest', 0, 5, 0.01, 'Frais de gestion annuels')}
        {sl('fraisEntree', 0, 10, 0.01, "Frais d'entrée")}
        <div style={{ fontSize: 11, color: '#8a93b0', marginBottom: 16, padding: '8px 10px', background: '#f7f8fc', borderRadius: 7, lineHeight: 1.5 }}>
          Frais d'entrée appliqués au versement initial et aux versements périodiques. Frais de gestion déduits chaque année avant capitalisation.
        </div>
        <div style={{ height: 1, background: '#e8eaf0', margin: '4px 0 16px' }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4a5578', cursor: 'pointer', marginBottom: 12 }}>
          <input type="checkbox" checked={p.withVers} onChange={e => setP(prev => ({ ...prev, withVers: e.target.checked }))} />
          Versements périodiques
        </label>
        {p.withVers && (
          <>
            {sl('mensuel', 0, 5000, 50, 'Montant du versement')}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: '#4a5578', fontWeight: 500, display: 'block', marginBottom: 5 }}>Fréquence</label>
              <select value={p.freq} onChange={e => setP(prev => ({ ...prev, freq: parseInt(e.target.value) }))}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e2ea', borderRadius: 7, fontSize: 13, background: '#fff' }}>
                <option value={12}>Mensuelle</option>
                <option value={4}>Trimestrielle</option>
                <option value={1}>Annuelle</option>
              </select>
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: '#0f1b35', borderRadius: 14, padding: '20px' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Capital final estimé</div>
          <div style={{ fontSize: 32, fontWeight: 500, color: '#e8b84b' }}>{fmt(Math.round(capitalFinal))}</div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '16px 0' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 16 }}>
            {[['Capital investi (net frais)', fmt(Math.round(totalVersements))], ['Intérêts nets cumulés', fmt(Math.round(totalInterets))]].map(([l, v]) => (
              <div key={l} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Répartition du capital final</div>
          <div style={{ height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: Math.round(propVersements) + '%', background: '#3b82f6', transition: 'width 0.3s ease' }} />
            <div style={{ width: Math.round(propInterets) + '%', background: '#e8b84b', transition: 'width 0.3s ease' }} />
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: '#3b82f6' }} />
              Versements {Math.round(propVersements)}%
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: '#e8b84b' }} />
              Intérêts {Math.round(propInterets)}%
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e8eaf0', borderRadius: 14, padding: '18px', maxHeight: 280, overflowY: 'auto' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#4a5578', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>Tableau annuel</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead><tr>{['Année', 'Capital début', 'Versements', 'Intérêts nets', 'Capital fin'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: 10, color: '#8a93b0', fontWeight: 500, textTransform: 'uppercase', borderBottom: '1px solid #e8eaf0' }}>{h}</th>
            ))}</tr></thead>
            <tbody>{rows.map(r => (
              <tr key={r.y} style={{ borderBottom: '1px solid #f0f1f6' }}>
                <td style={{ padding: '7px 8px', color: '#4a5578' }}>An {r.y}</td>
                <td style={{ padding: '7px 8px' }}>{fmt(Math.round(r.debut))}</td>
                <td style={{ padding: '7px 8px', color: '#1a5fa0' }}>{r.versements > 0 ? fmt(Math.round(r.versements)) : '—'}</td>
                <td style={{ padding: '7px 8px', color: '#1d7a4e' }}>{fmt(Math.round(r.interets))}</td>
                <td style={{ padding: '7px 8px', fontWeight: 500 }}>{fmt(Math.round(r.fin))}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
