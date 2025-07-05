function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h = 0,
    s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = d / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h *= 60
  }
  return { h, s, l }
}

function HSLToHex(hsl: { h: number; s: number; l: number }): string {
  const { s, l } = hsl
  const h = ((hsl.h % 360) + 360) % 360
  const c = (1 - Math.abs(2 * l - 1)) * s
  const hh = h / 60
  const x = c * (1 - Math.abs((hh % 2) - 1))
  let r1 = 0,
    g1 = 0,
    b1 = 0
  if (hh < 1) {
    r1 = c
    g1 = x
  } else if (hh < 2) {
    r1 = x
    g1 = c
  } else if (hh < 3) {
    g1 = c
    b1 = x
  } else if (hh < 4) {
    g1 = x
    b1 = c
  } else if (hh < 5) {
    r1 = x
    b1 = c
  } else {
    r1 = c
    b1 = x
  }
  const m = l - c / 2
  const r = Math.round((r1 + m) * 255)
  const g = Math.round((g1 + m) * 255)
  const b = Math.round((b1 + m) * 255)
  return (
    '#' +
    r.toString(16).padStart(2, '0') +
    g.toString(16).padStart(2, '0') +
    b.toString(16).padStart(2, '0')
  )
}

export function interpolateColorHex(
  colorA: string,
  colorB: string,
  step: number,
  totalSteps: number
): string {
  const aHSL = hexToHSL(colorA)
  const bHSL = hexToHSL(colorB)
  const t = step / totalSteps
  let dh = bHSL.h - aHSL.h
  if (dh > 180) dh -= 360
  if (dh < -180) dh += 360
  const h = aHSL.h + dh * t
  const s = aHSL.s + (bHSL.s - aHSL.s) * t
  const l = aHSL.l + (bHSL.l - aHSL.l) * t
  return HSLToHex({ h, s, l })
}
