import { useState, useEffect, useRef } from "react"

const TYPE_LOCAL_MAP = {
  appartement: "Appartement",
  maison: "Maison",
  immeuble: null,
  terrain: null,
}

function fmt(n) {
  if (!n || isNaN(n)) return "—"
  return Math.round(n).toLocaleString("fr-FR") + " €"
}

export default function EstimateurImmo({ onValider }) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [commune, setCommune] = useState(null)
  const [typeBien, setTypeBien] = useState("appartement")
  const [surface, setSurface] = useState("")
  const [prixData, setPrixData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingPrix, setLoadingPrix] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef(null)
  const inputRef = useRef(null)

  // Autocomplétion toutes communes France via geo.api.gouv.fr
  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&fields=nom,code,codesPostaux,population&boost=population&limit=8`
        )
        const data = await res.json()
        setSuggestions(data)
        setShowSuggestions(true)
      } catch (e) {
        setSuggestions([])
      }
      setLoading(false)
    }, 300)
  }, [query])

  // Récupération prix DVF dès qu'une commune et un type sont sélectionnés
  useEffect(() => {
    if (!commune) return
    fetchPrixDVF(commune.code, typeBien)
  }, [commune, typeBien])

  async function fetchPrixDVF(codeCommune, type) {
    setLoadingPrix(true)
    setPrixData(null)
    try {
      const typeLocal = TYPE_LOCAL_MAP[type]

      if (typeLocal) {
        // Appartements et maisons : données DVF via API Cerema
        const url = `https://apidf-preprod.cerema.fr/dvf_opendata/mutations/?code_commune=${codeCommune}&type_local=${encodeURIComponent(typeLocal)}&page_size=200`
        const res = await fetch(url)
        const data = await res.json()

        if (data.results && data.results.length > 0) {
          const prix = data.results
            .filter(m => m.surface_reelle_bati > 0 && m.valeur_fonciere > 0)
            .map(m => m.valeur_fonciere / m.surface_reelle_bati)
            .filter(p => p > 500 && p < 30000)

          if (prix.length > 0) {
            prix.sort((a, b) => a - b)
            const mediane = prix[Math.floor(prix.length / 2)]
            const moyenne = prix.reduce((s, p) => s + p, 0) / prix.length
            const min = prix[Math.floor(prix.length * 0.1)]
            const max = prix[Math.floor(prix.length * 0.9)]
            setPrixData({ mediane, moyenne, min, max, nb: prix.length, source: "DVF — données notariales officielles", annee: new Date().getFullYear() - 1 })
          } else {
            setPrixData({ error: "Pas assez de transactions récentes dans cette commune" })
          }
        } else {
          setPrixData({ error: "Aucune transaction trouvée pour ce type de bien" })
        }
      } else {
        // Terrains et immeubles : estimation approximative
        const res = await fetch(
          `https://apidf-preprod.cerema.fr/dvf_opendata/mutations/?code_commune=${codeCommune}&page_size=100`
        )
        const data = await res.json()
        if (data.results && data.results.length > 0) {
          const mutations = data.results.filter(m => m.valeur_fonciere > 0)
          if (mutations.length > 0) {
            const medianeFoncier = mutations
              .map(m => m.valeur_fonciere)
              .sort((a, b) => a - b)
            const mediane = medianeFoncier[Math.floor(medianeFoncier.length / 2)]
            setPrixData({ valeurMediane: mediane, nb: mutations.length, source: "DVF — toutes transactions", type: "foncier" })
          } else {
            setPrixData({ error: "Données insuffisantes pour cette commune" })
          }
        } else {
          setPrixData({ error: "Aucune donnée disponible" })
        }
      }
    } catch (e) {
      setPrixData({ error: "Impossible de récupérer les données (vérifiez votre connexion)" })
    }
    setLoadingPrix(false)
  }

  function selectCommune(c) {
    setCommune(c)
    setQuery(c.nom + (c.codesPostaux?.[0] ? " (" + c.codesPostaux[0] + ")" : ""))
    setSuggestions([])
    setShowSuggestions(false)
    setPrixData(null)
  }

  const prixM2 = prixData && !prixData.error && !prixData.type ? Math.round(prixData.mediane) : null
  const estimation = prixM2 && surface ? Math.round(prixM2 * parseFloat(surface)) : null

  return (
    <div style={{ background: "#e6f0fb", border: "1px solid #b5d4f4", borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: "#0c447c", marginBottom: 12 }}>
        Estimateur — données officielles DVF (notaires de France)
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
        {/* Autocomplétion ville */}
        <div style={{ position: "relative" }}>
          <label style={{ fontSize: 11, color: "#1a5fa0", fontWeight: 500, display: "block", marginBottom: 4 }}>Ville ou commune</label>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setCommune(null); setPrixData(null) }}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Ex: Lyon, Rennes..."
            style={{ width: "100%", padding: "8px 10px", border: "1px solid #b5d4f4", borderRadius: 7, fontSize: 13 }}
          />
          {loading && (
            <div style={{ position: "absolute", right: 10, top: 32, fontSize: 11, color: "#8a93b0" }}>...</div>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #b5d4f4", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", zIndex: 100, marginTop: 2, overflow: "hidden" }}>
              {suggestions.map(c => (
                <div
                  key={c.code}
                  onMouseDown={() => selectCommune(c)}
                  style={{ padding: "9px 12px", cursor: "pointer", fontSize: 13, borderBottom: "1px solid #f0f1f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f0f7ff"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontWeight: commune?.code === c.code ? 500 : 400 }}>{c.nom}</span>
                  <span style={{ fontSize: 11, color: "#8a93b0" }}>{c.codesPostaux?.[0]} · {c.population ? (c.population > 1000 ? Math.round(c.population / 1000) + "k hab." : c.population + " hab.") : ""}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Type de bien */}
        <div>
          <label style={{ fontSize: 11, color: "#1a5fa0", fontWeight: 500, display: "block", marginBottom: 4 }}>Type de bien</label>
          <select
            value={typeBien}
            onChange={e => setTypeBien(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", border: "1px solid #b5d4f4", borderRadius: 7, fontSize: 13, background: "#fff" }}
          >
            <option value="appartement">Appartement</option>
            <option value="maison">Maison</option>
            <option value="immeuble">Immeuble</option>
            <option value="terrain">Terrain</option>
          </select>
        </div>

        {/* Surface */}
        <div>
          <label style={{ fontSize: 11, color: "#1a5fa0", fontWeight: 500, display: "block", marginBottom: 4 }}>Surface (m²)</label>
          <input
            type="number"
            value={surface}
            onChange={e => setSurface(e.target.value)}
            placeholder="Ex: 65"
            style={{ width: "100%", padding: "8px 10px", border: "1px solid #b5d4f4", borderRadius: 7, fontSize: 13 }}
          />
        </div>
      </div>

      {/* Résultat */}
      {commune && (
        <div style={{ background: "#fff", borderRadius: 10, padding: "14px 16px" }}>
          {loadingPrix ? (
            <div style={{ fontSize: 13, color: "#8a93b0", textAlign: "center", padding: "8px 0" }}>
              Récupération des données DVF pour {commune.nom}...
            </div>
          ) : prixData?.error ? (
            <div style={{ fontSize: 13, color: "#b83030" }}>
              {prixData.error} — essayez une commune voisine plus grande
            </div>
          ) : prixData && !prixData.type ? (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
                {[
                  ["Prix médian/m²", Math.round(prixData.mediane) + " €"],
                  ["Fourchette basse", Math.round(prixData.min) + " €/m²"],
                  ["Fourchette haute", Math.round(prixData.max) + " €/m²"],
                  ["Transactions", prixData.nb + " ventes analysées"],
                ].map(([l, v]) => (
                  <div key={l} style={{ background: "#f0f7ff", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: "#1a5fa0", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.4px" }}>{l}</div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: "#0c447c" }}>{v}</div>
                  </div>
                ))}
              </div>

              {estimation && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0f7ff", borderRadius: 9, padding: "12px 14px", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#4a5578", marginBottom: 3 }}>
                      {typeBien} de {surface} m² à {commune.nom} — {Math.round(prixData.mediane).toLocaleString("fr-FR")} €/m² médian
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 500, color: "#0f1b35" }}>{fmt(estimation)}</div>
                    <div style={{ fontSize: 11, color: "#8a93b0", marginTop: 2 }}>
                      Fourchette : {fmt(Math.round(prixData.min * parseFloat(surface)))} — {fmt(Math.round(prixData.max * parseFloat(surface)))}
                    </div>
                  </div>
                  <button
                    onClick={() => onValider(estimation)}
                    style={{ background: "#1d7a4e", color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    Utiliser →
                  </button>
                </div>
              )}

              <div style={{ fontSize: 11, color: "#8a93b0", marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ background: "#e8f5ee", color: "#1d7a4e", padding: "2px 7px", borderRadius: 4, fontWeight: 500 }}>Officiel</span>
                {prixData.source} · Mise à jour semestrielle (avril & octobre)
              </div>
            </div>
          ) : prixData?.type === "foncier" ? (
            <div>
              <div style={{ fontSize: 13, color: "#4a5578", marginBottom: 10 }}>
                Valeur médiane des transactions à {commune.nom} : <strong>{fmt(prixData.valeurMediane)}</strong> ({prixData.nb} mutations analysées)
              </div>
              <div style={{ fontSize: 12, color: "#8a93b0" }}>
                Pour les terrains et immeubles, le prix dépend fortement de la localisation et du projet. Cette valeur est indicative.
              </div>
            </div>
          ) : null}
        </div>
      )}

      {!commune && query.length >= 2 && !loading && suggestions.length === 0 && (
        <div style={{ fontSize: 13, color: "#b83030", padding: "8px 0" }}>Commune introuvable — vérifiez l'orthographe</div>
      )}
    </div>
  )
}
