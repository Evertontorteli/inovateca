/**
 * Lê a cor de fundo dos avatares SVG: primeiro círculo central que cobre o viewBox
 * (fill sólido ou gradiente via url(#id)).
 */

/** @returns {{ r: number, g: number, b: number } | null} */
function hexParaRgb(hex) {
  const h = hex.replace(/^#/, '')
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16)
    const g = parseInt(h[1] + h[1], 16)
    const b = parseInt(h[2] + h[2], 16)
    return { r, g, b }
  }
  if (h.length === 6) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    }
  }
  return null
}

/** @returns {{ r: number, g: number, b: number } | null} */
function corParaRgb(bruto) {
  if (!bruto) return null
  const s = String(bruto).trim().toLowerCase()
  if (s === 'none' || s === 'transparent' || s === 'currentcolor') return null
  if (s.startsWith('#')) return hexParaRgb(s)
  const rgb = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (rgb) {
    return { r: +rgb[1], g: +rgb[2], b: +rgb[3] }
  }
  return hexParaRgb(s)
}

function rgbParaCss({ r, g, b }) {
  return `rgb(${r},${g},${b})`
}

function mediaRgb(lista) {
  if (lista.length === 0) return null
  let r = 0
  let g = 0
  let b = 0
  for (const c of lista) {
    r += c.r
    g += c.g
    b += c.b
  }
  const n = lista.length
  return rgbParaCss({
    r: Math.round(r / n),
    g: Math.round(g / n),
    b: Math.round(b / n),
  })
}

function lerCorStop(stop) {
  const attr = stop.getAttribute('stop-color')
  if (attr) {
    const c = corParaRgb(attr)
    if (c) return c
  }
  const style = stop.getAttribute('style') || ''
  const m = /stop-color\s*:\s*([^;]+)/i.exec(style)
  if (m) return corParaRgb(m[1].trim())
  return null
}

function resolverFillUrl(doc, fill) {
  const m = /^url\(\s*#([\w-]+)\s*\)$/i.exec(fill.trim())
  if (!m) return null
  const id = m[1]
  const ref = doc.getElementById(id)
  if (!ref) return null
  const tag = ref.tagName?.toLowerCase()
  if (tag === 'lineargradient' || tag === 'radialgradient') {
    const stops = ref.querySelectorAll('stop')
    const cores = []
    stops.forEach((st) => {
      const c = lerCorStop(st)
      if (c) cores.push(c)
    })
    return mediaRgb(cores)
  }
  return null
}

function resolverFill(doc, fill) {
  if (!fill) return null
  const f = fill.trim()
  if (f === 'none' || f.toLowerCase() === 'currentcolor') return null
  if (f.startsWith('url(')) return resolverFillUrl(doc, f)
  const c = corParaRgb(f)
  return c ? rgbParaCss(c) : null
}

function centroEraioMinimo(svg) {
  const vb = svg.getAttribute('viewBox')?.trim().split(/[\s,]+/) || []
  const w = parseFloat(vb[2]) || 64
  const h = parseFloat(vb[3]) || 64
  const vx = parseFloat(vb[0]) || 0
  const vy = parseFloat(vb[1]) || 0
  const cx = vx + w / 2
  const cy = vy + h / 2
  const raioMin = (Math.min(w, h) / 2) * 0.88
  return { cx, cy, raioMin }
}

function encontrarCirculoFundo(svg) {
  const { cx, cy, raioMin } = centroEraioMinimo(svg)
  const circulos = svg.querySelectorAll('circle')
  for (const el of circulos) {
    const r = parseFloat(el.getAttribute('r') || '0')
    const x = parseFloat(el.getAttribute('cx') || '0')
    const y = parseFloat(el.getAttribute('cy') || '0')
    if (r < raioMin) continue
    if (Math.abs(x - cx) > 1.5 || Math.abs(y - cy) > 1.5) continue
    const fill = el.getAttribute('fill')
    if (!fill || fill === 'none') continue
    return el
  }
  return null
}

/**
 * Busca o SVG, interpreta o primeiro círculo de fundo e devolve `rgb(r,g,b)` ou `null`.
 */
export function extrairCorFundoSvg(url) {
  return fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(String(res.status))
      return res.text()
    })
    .then((text) => {
      if (!/<svg[\s>]/i.test(text)) return null
      const doc = new DOMParser().parseFromString(text, 'image/svg+xml')
      if (doc.querySelector('parsererror')) return null
      const svg = doc.documentElement
      if (!svg || svg.tagName?.toLowerCase() !== 'svg') return null
      const circulo = encontrarCirculoFundo(svg)
      if (!circulo) return null
      return resolverFill(doc, circulo.getAttribute('fill') || '')
    })
    .catch(() => null)
}
