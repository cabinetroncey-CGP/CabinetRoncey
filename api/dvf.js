export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET")

  const { code_commune, type_local } = req.query
  if (!code_commune) return res.status(400).json({ error: "code_commune requis" })

  try {
    // API DVF officielle data.gouv.fr — fichiers statistiques par commune
    // Dataset: demandes-de-valeurs-foncieres-geolocalisees
    const url = `https://tabular-api.data.gouv.fr/api/resources/90a98de0-f562-4328-aa16-fe0dd1dca60f/data/?code_commune__exact=${code_commune}&page_size=200`

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "PatrimIA/1.0"
      }
    })

    if (!response.ok) throw new Error(`API error ${response.status}`)
    const data = await response.json()

    if (!data.data || data.data.length === 0) {
      return res.status(200).json({ error: "Aucune transaction trouvée pour cette commune" })
    }

    // Filtrer par type de bien si précisé
    let rows = data.data
    if (type_local) {
      const filtered = rows.filter(r =>
        r.type_local && r.type_local.toLowerCase().includes(type_local.toLowerCase().substring(0, 4))
      )
      if (filtered.length > 0) rows = filtered
    }

    // Calculer prix au m² depuis valeur_fonciere / surface
    const prix = rows
      .filter(r => parseFloat(r.surface_reelle_bati) > 5 && parseFloat(r.valeur_fonciere) > 1000)
      .map(r => parseFloat(r.valeur_fonciere) / parseFloat(r.surface_reelle_bati))
      .filter(p => p > 300 && p < 30000)

    if (prix.length === 0) {
      return res.status(200).json({ error: "Données insuffisantes pour calculer un prix au m²" })
    }

    prix.sort((a, b) => a - b)
    const mediane = prix[Math.floor(prix.length / 2)]
    const min = prix[Math.floor(prix.length * 0.1)] || prix[0]
    const max = prix[Math.floor(prix.length * 0.9)] || prix[prix.length - 1]

    return res.status(200).json({ mediane, min, max, nb: prix.length, ok: true })

  } catch (e) {
    // Fallback : API DVF agrégée par commune (statistiques précalculées)
    try {
      const fallbackUrl = `https://tabular-api.data.gouv.fr/api/resources/d573456c-76a3-4ed9-8ca6-1a8f5b5feee9/data/?code_commune__exact=${code_commune}&page_size=50`
      const r2 = await fetch(fallbackUrl, { headers: { "Accept": "application/json", "User-Agent": "PatrimIA/1.0" } })
      if (!r2.ok) throw new Error()
      const d2 = await r2.json()

      if (d2.data && d2.data.length > 0) {
        const rows = type_local
          ? d2.data.filter(r => r.type_local && r.type_local.toLowerCase().includes(type_local.toLowerCase().substring(0, 4)))
          : d2.data
        const src = rows.length > 0 ? rows : d2.data
        const prixList = src
          .map(r => parseFloat(r.prix_m2_median || r.prix_m2_moyen || 0))
          .filter(p => p > 300 && p < 30000)

        if (prixList.length > 0) {
          prixList.sort((a, b) => a - b)
          return res.status(200).json({
            mediane: prixList[Math.floor(prixList.length / 2)],
            min: prixList[0],
            max: prixList[prixList.length - 1],
            nb: src.length,
            ok: true
          })
        }
      }
      return res.status(200).json({ error: "Données non disponibles pour cette commune" })
    } catch (e2) {
      return res.status(500).json({ error: "Service temporairement indisponible" })
    }
  }
}
