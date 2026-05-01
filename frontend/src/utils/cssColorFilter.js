// Generates an approximate CSS filter string to recolor a black SVG/icon to a target color.
// Works best when the source asset is mostly dark/monochrome.
//
// Based on the approach popularized by Sosuke's "CSS filter generator" (public domain / widely adapted).
// We keep assets untouched (no SVG edits) and tint <img> via CSS filters.

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export { clamp };

function parseRgbString(rgb) {
  // supports: rgb(r, g, b) or rgba(r, g, b, a)
  const m = rgb.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+)?\s*\)/i);
  if (!m) return null;
  return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
}

export function resolveToRgb(color) {
  if (!color || typeof color !== 'string') return null;

  const trimmed = color.trim();
  if (trimmed.startsWith('var(')) {
    // var(--token) or var(--token, fallback)
    const inner = trimmed.slice(4, -1);
    const [token] = inner.split(',').map(s => s.trim());
    if (!token?.startsWith('--') || typeof window === 'undefined') return null;
    const computed = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
    // computed might be hex or rgb; try both paths
    const rgbFromComputed = parseRgbString(computed);
    if (rgbFromComputed) return rgbFromComputed;
    const rgbFromHex = hexToRgb(computed);
    if (rgbFromHex) return rgbFromHex;
    return null;
  }

  const rgbDirect = parseRgbString(trimmed);
  if (rgbDirect) return rgbDirect;

  const rgbFromHex = hexToRgb(trimmed);
  if (rgbFromHex) return rgbFromHex;

  return null;
}

export function rgbToHex({ r, g, b }) {
  const to2 = (n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  return `#${to2(r)}${to2(g)}${to2(b)}`;
}

export function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  const s = hex.trim().replace('#', '');
  if (s.length === 3) {
    const r = parseInt(s[0] + s[0], 16);
    const g = parseInt(s[1] + s[1], 16);
    const b = parseInt(s[2] + s[2], 16);
    if ([r, g, b].some(Number.isNaN)) return null;
    return { r, g, b };
  }
  if (s.length === 6) {
    const r = parseInt(s.slice(0, 2), 16);
    const g = parseInt(s.slice(2, 4), 16);
    const b = parseInt(s.slice(4, 6), 16);
    if ([r, g, b].some(Number.isNaN)) return null;
    return { r, g, b };
  }
  return null;
}

class Color {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  set(r, g, b) {
    this.r = clamp(r, 0, 255);
    this.g = clamp(g, 0, 255);
    this.b = clamp(b, 0, 255);
    return this;
  }

  hueRotate(angle = 0) {
    const rad = (angle / 180) * Math.PI;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const m = [
      0.213 + cos * 0.787 - sin * 0.213,
      0.715 - cos * 0.715 - sin * 0.715,
      0.072 - cos * 0.072 + sin * 0.928,
      0.213 - cos * 0.213 + sin * 0.143,
      0.715 + cos * 0.285 + sin * 0.140,
      0.072 - cos * 0.072 - sin * 0.283,
      0.213 - cos * 0.213 - sin * 0.787,
      0.715 - cos * 0.715 + sin * 0.715,
      0.072 + cos * 0.928 + sin * 0.072
    ];
    return this.multiply(m);
  }

  grayscale(value = 1) {
    const v = 1 - value;
    const m = [
      0.2126 + 0.7874 * v,
      0.7152 - 0.7152 * v,
      0.0722 - 0.0722 * v,
      0.2126 - 0.2126 * v,
      0.7152 + 0.2848 * v,
      0.0722 - 0.0722 * v,
      0.2126 - 0.2126 * v,
      0.7152 - 0.7152 * v,
      0.0722 + 0.9278 * v
    ];
    return this.multiply(m);
  }

  sepia(value = 1) {
    const v = 1 - value;
    const m = [
      0.393 + 0.607 * v,
      0.769 - 0.769 * v,
      0.189 - 0.189 * v,
      0.349 - 0.349 * v,
      0.686 + 0.314 * v,
      0.168 - 0.168 * v,
      0.272 - 0.272 * v,
      0.534 - 0.534 * v,
      0.131 + 0.869 * v
    ];
    return this.multiply(m);
  }

  saturate(value = 1) {
    const m = [
      0.213 + 0.787 * value,
      0.715 - 0.715 * value,
      0.072 - 0.072 * value,
      0.213 - 0.213 * value,
      0.715 + 0.285 * value,
      0.072 - 0.072 * value,
      0.213 - 0.213 * value,
      0.715 - 0.715 * value,
      0.072 + 0.928 * value
    ];
    return this.multiply(m);
  }

  brightness(value = 1) {
    this.r *= value;
    this.g *= value;
    this.b *= value;
    return this;
  }

  contrast(value = 1) {
    this.r = (this.r - 128) * value + 128;
    this.g = (this.g - 128) * value + 128;
    this.b = (this.b - 128) * value + 128;
    return this;
  }

  invert(value = 0) {
    this.r = (1 - value) * this.r + value * (255 - this.r);
    this.g = (1 - value) * this.g + value * (255 - this.g);
    this.b = (1 - value) * this.b + value * (255 - this.b);
    return this;
  }

  multiply(m) {
    const r = this.r;
    const g = this.g;
    const b = this.b;
    this.r = r * m[0] + g * m[1] + b * m[2];
    this.g = r * m[3] + g * m[4] + b * m[5];
    this.b = r * m[6] + g * m[7] + b * m[8];
    return this;
  }

  toRgb() {
    return {
      r: clamp(this.r, 0, 255),
      g: clamp(this.g, 0, 255),
      b: clamp(this.b, 0, 255)
    };
  }
}

class Solver {
  constructor(target) {
    this.target = target;
    this.targetHsl = this.rgbToHsl(target);
  }

  rgbToHsl({ r, g, b }) {
    const rr = r / 255;
    const gg = g / 255;
    const bb = b / 255;
    const max = Math.max(rr, gg, bb);
    const min = Math.min(rr, gg, bb);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    const d = max - min;
    if (d !== 0) {
      s = d / (1 - Math.abs(2 * l - 1));
      switch (max) {
        case rr:
          h = ((gg - bb) / d) % 6;
          break;
        case gg:
          h = (bb - rr) / d + 2;
          break;
        default:
          h = (rr - gg) / d + 4;
      }
      h *= 60;
      if (h < 0) h += 360;
    }
    return { h, s, l };
  }

  loss(filters) {
    const c = new Color(0, 0, 0);
    c.invert(filters[0] / 100);
    c.sepia(filters[1] / 100);
    c.saturate(filters[2] / 100);
    c.hueRotate(filters[3] * 3.6);
    c.brightness(filters[4] / 100);
    c.contrast(filters[5] / 100);

    const rgb = c.toRgb();
    const hsl = this.rgbToHsl(rgb);

    return (
      Math.abs(rgb.r - this.target.r) +
      Math.abs(rgb.g - this.target.g) +
      Math.abs(rgb.b - this.target.b) +
      Math.abs(hsl.h - this.targetHsl.h) +
      Math.abs(hsl.s - this.targetHsl.s) * 100 +
      Math.abs(hsl.l - this.targetHsl.l) * 100
    );
  }

  solve() {
    // Two-phase SPSA search: wide then refined.
    const wide = this.spsa([50, 20, 3750, 50, 100, 100], 1000, 50, 5);
    const refined = this.spsa(wide.values, 500, 15, 2);
    return refined;
  }

  spsa(start, iterations, a, c) {
    let best = start.slice();
    let bestLoss = this.loss(best);

    const values = start.slice();
    const deltas = new Array(6);
    const high = [100, 100, 7500, 100, 200, 200];
    const low = [0, 0, 0, 0, 0, 0];

    for (let k = 0; k < iterations; k++) {
      const ck = c / Math.pow(k + 1, 0.101);
      for (let i = 0; i < 6; i++) {
        deltas[i] = Math.random() > 0.5 ? 1 : -1;
      }

      const plus = new Array(6);
      const minus = new Array(6);
      for (let i = 0; i < 6; i++) {
        plus[i] = values[i] + ck * deltas[i];
        minus[i] = values[i] - ck * deltas[i];
      }

      const lossPlus = this.loss(plus);
      const lossMinus = this.loss(minus);
      const g = new Array(6);
      for (let i = 0; i < 6; i++) {
        g[i] = (lossPlus - lossMinus) / (2 * ck) * deltas[i];
      }

      const ak = a / Math.pow(k + 1, 0.602);
      for (let i = 0; i < 6; i++) {
        values[i] = clamp(values[i] - ak * g[i], low[i], high[i]);
      }

      const loss = this.loss(values);
      if (loss < bestLoss) {
        bestLoss = loss;
        for (let i = 0; i < 6; i++) best[i] = values[i];
      }
    }

    return { values: best, loss: bestLoss };
  }
}

export function cssFilterForColor(color) {
  const rgb = resolveToRgb(color);
  if (!rgb) return '';

  const solver = new Solver(rgb);
  const result = solver.solve();
  const [invert, sepia, saturate, hueRotate, brightness, contrast] = result.values;

  // Keep it deterministic/clean for style props.
  return `invert(${invert.toFixed(0)}%) sepia(${sepia.toFixed(0)}%) saturate(${saturate.toFixed(
    0
  )}%) hue-rotate(${(hueRotate * 3.6).toFixed(0)}deg) brightness(${brightness.toFixed(
    0
  )}%) contrast(${contrast.toFixed(0)}%)`;
}

