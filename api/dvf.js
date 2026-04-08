export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET")

  const { code_commune, type_local } = req.query
  if (!code_commune) return res.status(400).json({ error: "code_commune requis" })

  try {
    const params = new URLSearchParams({
      code_commune,
      page_size: "200",
    })
    if (type_local) params.append("type_local", type_local)

    const url = `https://apidf-preprod.cerema.fr/dvf_opendata/mutations/?${params}`
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    })

    if (!response.ok) throw new Error(`DVF error ${response.status}`)
    const data = await response.json()

    if (!data.results || data.results.length === 0) {
      return res.status(200).json({ error: "Aucune transaction trouvée" })
    }

    const prix = data.results
      .filter(m => m.surface_reelle_bati > 0 && m.valeur_fonciere > 0)
      .map(m => m.valeur_fonciere / m.surface_reelle_bati)
      .filter(p => p > 300 && p < 30000)

    if (prix.length === 0) {
      return res.status(200).json({ error: "Pas assez de données exploitables" })
    }

    prix.sort((a, b) => a - b)
    const mediane = prix[Math.floor(prix.length / 2)]
    const min = prix[Math.floor(prix.length * 0.1)]
    const max = prix[Math.floor(prix.length * 0.9)]
    const nb = prix.length

    return res.status(200).json({ mediane, min, max, nb, ok: true })
  } catch (e) {
    return res.status(500).json({ error: "Erreur serveur : " + e.message })
  }
}
