export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET")
  const { code_commune, type_local } = req.query
  if (!code_commune) return res.status(400).json({ error: "code_commune requis" })
  const codeDept = code_commune.startsWith("97") ? code_commune.substring(0, 3) : code_commune.substring(0, 2)
  const annees = ["2024", "2023", "2022"]
  for (const annee of annees) {
    try {
      const url = `https://files.data.gouv.fr/geo-dvf/latest/csv/${annee}/communes/${codeDept}/${code_commune}.csv`
      const response = await fetch(url, { headers: { "User-Agent": "PatrimIA/1.0" } })
      if (!response.ok) continue
      const text = await response.text()
      const lines = text.trim().split("\n")
      if (lines.length < 2) continue
      const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""))
      const rows = lines.slice(1).map(line => {
        const vals = line.split(",").map(v => v.trim().replace(/"/g, ""))
        return Object.fromEntries(headers.map((h, i) => [h, vals[i]]))
      })
      const typeMap = { appartement: ["appartement"], maison: ["maison"], immeuble: ["maison", "appartement"], terrain: ["terrain"] }
      const keywords = typeMap[type_local?.toLowerCase()] || []
      let filtered = rows
      if (keywords.length > 0) {
        const f = rows.filter(r => keywords.some(k => (r.type_local || "").toLowerCase().includes(k)))
        if (f.length > 0) filtered = f
      }
      const prix = filtered.map(r => {
        const val = parseFloat(r.valeur_fonciere || 0)
        const surf = parseFloat(r.surface_reelle_bati || 0)
        return surf > 5 && val > 1000 ? val / surf : 0
      }).filter(p => p > 300 && p < 30000)
      if (prix.length < 3) continue
      prix.sort((a, b) => a - b)
      return res.status(200).json({ mediane: prix[Math.floor(prix.length / 2)], min: prix[Math.floor(prix.length * 0.1)] || prix[0], max: prix[Math.floor(prix.length * 0.9)] || prix[prix.length - 1], nb: prix.length, annee, ok: true })
    } catch (e) { continue }
  }
  return res.status(200).json({ error: "Données insuffisantes — essayez une ville plus grande" })
}
