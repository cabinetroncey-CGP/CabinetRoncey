import { useState, useEffect, useRef } from "react"

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
  const wrapperRef = useRef(null)

  // Ferme les suggestions si clic en dehors
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length < 2 || commune) { setSuggestions([]); setShowSuggestions(false); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&fields=nom,code,codesPostaux,population&boost=population&limit=8`)
        const data = await res.json()
        setSuggestions(Array.isArray(data) ? data : [])
        setShowSuggestions(true)
      } catch (e) { setSuggestions([]) }
      setLoading(false)
    }, 300)
  }, [query, commune])

  useEffect(() => { if (commune) fetchPrix(commune.code, typeBien) }, [commune, typeBien])

  async function fetchPrix(codeCommune, type) {
    setLoadingPrix(true); setPrixData(null)
    try {
      const res = await fetch(`/api/dvf?code_commune=${codeCommune}&type_local=${encodeURIComponent(type)}`)
      if (!res.ok) throw new Error()
      setPrixData(await res.json())
    } catch (e) { setPrixData({ error: "Impossible de récupérer les données" }) }
    setLoadingPrix(false)
  }

  function selectCommune(c) {
    setCommune(c)
    setQuery(c.nom + (c.codesPostaux?.[0] ? " (" + c.codesPostaux[0] + ")" : ""))
    setSuggestions([])
    setShowSuggestions(false)
    setPrixData(null)
  }

  function resetCommune() {
    setCommune(null); setQuery(""); setPrixData(null)
    setSuggestions([]); setShowSuggestions(false)
  }

  const prixM2 = prixData?.ok ? Math.round(prixData.mediane) : null
  const estimation = prixM2 && surface && parseFloat(surface) > 0 ? Math.round(prixM2 * parseFloat(surface)) : null

  return (
    <div style={{ background: "#e6f0fb", border: "1px solid #b5d4f4", borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: "#0c447c", marginBottom: 12 }}>
        Estimateur — données officielles DVF (transactions notariales)
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div ref={wrapperRef} style={{ position: "relative" }}>
          <label style={{ fontSize: 11, color: "#1a5fa0", fontWeight: 500, display: "block", marginBottom: 4 }}>Ville ou commune</label>
          <div style={{ position: "relative" }}>
            <input type="text" value={query}
              onChange={e => { setQuery(e.target.value); if (commune) resetCommune() }}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
              placeholder="Ex: Lyon, Brest..."
              style={{ width: "100%", padding: "8px 10px", border: "1px solid", borderColor: commune ? "#5dcaa5" : "#b5d4f4", borderRadius: 7, fontSize: 13, background: commune ? "#f0fff8" : "#fff" }}
            />
            {loading && <span style={{ position: "absolute", right: 8, top: 9, fontSize: 11, color: "#8a93b0" }}>...</span>}
            {commune && (
              <button onClick={resetCommune} style={{ position: "absolute", right: 6, top: 5, background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#8a93b0", padding: "2px 4px" }}>×</button>
            )}
          </div>
          {showSuggestions && suggestions.length > 0 && !commune && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #b5d4f4", borderRadius: 8, boxShadow: "0 6px 20px rgba(0,0,0,0.12)", zIndex: 999, marginTop: 2, overflow: "hidden" }}>
              {suggestions.map(c => (
                <div key={c.code}
                  onClick={() => selectCommune(c)}
                  style={{ padding: "10px 12px", cursor: "pointer", fontSize: 13, borderBottom: "1px solid #f0f1f6", display: "flex", justifyContent: "space-between", background: "#fff" }}
                  onMouseOver={e => e.currentTarget.style.background = "#f0f7ff"}
                  onMouseOut={e => e.currentTarget.style.background = "#fff"}
                >
                  <span style={{ fontWeight: 500 }}>{c.nom}</span>
                  <span style={{ fontSize: 11, color: "#8a93b0" }}>{c.codesPostaux?.[0]}{c.population ? " · " + (c.population > 1000 ? Math.round(c.population / 1000) + "k hab." : c.population + " hab.") : ""}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label style={{ fontSize: 11, color: "#1a5fa0", fontWeight: 500, display: "block", marginBottom: 4 }}>Type de bien</label>
          <select value={typeBien} onChange={e => { setTypeBien(e.target.value); setPrixData(null) }}
            style={{ width: "100%", padding: "8px 10px", border: "1px solid #b5d4f4", borderRadius: 7, fontSize: 13, background: "#fff" }}>
            <option value="appartement">Appartement</option>
            <option value="maison">Maison</option>
            <option value="immeuble">Immeuble</option>
            <option value="terrain">Terrain</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: 11, color: "#1a5fa0", fontWeight: 500, display: "block", marginBottom: 4 }}>Surface (m²)</label>
          <input type="number" value={surface} onChange={e => setSurface(e.target.value)} placeholder="Ex: 65" min="1"
            style={{ width: "100%", padding: "8px 10px", border: "1px solid #b5d4f4", borderRadius: 7, fontSize: 13 }} />
        </div>
      </div>

      {commune && (
        <div style={{ background: "#fff", borderRadius: 10, padding: "14px 16px" }}>
          {loadingPrix ? (
            <div style={{ fontSize: 13, color: "#1a5fa0", textAlign: "center", padding: "8px 0" }}>Chargement des données DVF pour {commune.nom}...</div>
          ) : prixData?.error ? (
            <div style={{ fontSize: 13, color: "#b83030" }}>{prixData.error}</div>
          ) : prixData?.ok ? (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {[["Prix médian/m²", Math.round(prixData.mediane).toLocaleString("fr-FR") + " €"], ["Fourchette", Math.round(prixData.min).toLocaleString("fr-FR") + " – " + Math.round(prixData.max).toLocaleString("fr-FR") + " €/m²"], ["Transactions " + (prixData.annee || ""), prixData.nb + " ventes"]].map(([l, v]) => (
                  <div key={l} style={{ background: "#f0f7ff", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: "#1a5fa0", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.4px" }}>{l}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#0c447c" }}>{v}</div>
                  </div>
                ))}
              </div>
              {estimation ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0fff8", border: "1px solid #9fe1cb", borderRadius: 9, padding: "12px 14px", gap: 12, marginTop: 14 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#4a5578", marginBottom: 3 }}>{typeBien} de {surface} m² à {commune.nom} — {Math.round(prixData.mediane).toLocaleString("fr-FR")} €/m²</div>
                    <div style={{ fontSize: 24, fontWeight: 500, color: "#0f1b35" }}>{fmt(estimation)}</div>
                    <div style={{ fontSize: 11, color: "#8a93b0", marginTop: 2 }}>Fourchette : {fmt(Math.round(prixData.min * parseFloat(surface)))} — {fmt(Math.round(prixData.max * parseFloat(surface)))}</div>
                  </div>
                  <button onClick={() => onValider(estimation)} style={{ background: "#1d7a4e", color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>Utiliser →</button>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: "#4a5578", marginTop: 10 }}>Entrez la surface pour obtenir l'estimation</div>
              )}
              <div style={{ fontSize: 11, color: "#8a93b0", marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ background: "#e8f5ee", color: "#1d7a4e", padding: "2px 7px", borderRadius: 4, fontWeight: 500 }}>Officiel</span>
                Données DVF — DGFiP · Mise à jour semestrielle
              </div>
            </div>
          ) : null}
        </div>
      )}
      {!commune && query.length >= 2 && !loading && suggestions.length === 0 && (
        <div style={{ fontSize: 13, color: "#b83030", marginTop: 6 }}>Commune introuvable — vérifiez l'orthographe</div>
      )}
    </div>
  )
}
