/* eslint-disable */
export class Color {
  constructor(q, p, o) {
    this.set(q, p, o);
  }
  set(q, p, o) {
    this.r = this.clamp(q);
    this.g = this.clamp(p);
    this.b = this.clamp(o);
  }
  hueRotate() {
    let q = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    q = q / 180 * Math.PI;
    const o = Math.sin(q);
    const p = Math.cos(q);
    this.multiply([0.213 + p * 0.787 - o * 0.213, 0.715 - p * 0.715 - o * 0.715, 0.072 - p * 0.072 + o * 0.928, 0.213 - p * 0.213 + o * 0.143, 0.715 + p * 0.285 + o * 0.14, 0.072 - p * 0.072 - o * 0.283, 0.213 - p * 0.213 - o * 0.787, 0.715 - p * 0.715 + o * 0.715, 0.072 + p * 0.928 + o * 0.072]);
  }
  grayscale() {
    const o = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
    this.multiply([0.2126 + 0.7874 * (1 - o), 0.7152 - 0.7152 * (1 - o), 0.0722 - 0.0722 * (1 - o), 0.2126 - 0.2126 * (1 - o), 0.7152 + 0.2848 * (1 - o), 0.0722 - 0.0722 * (1 - o), 0.2126 - 0.2126 * (1 - o), 0.7152 - 0.7152 * (1 - o), 0.0722 + 0.9278 * (1 - o)]);
  }
  sepia() {
    const o = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
    this.multiply([0.393 + 0.607 * (1 - o), 0.769 - 0.769 * (1 - o), 0.189 - 0.189 * (1 - o), 0.349 - 0.349 * (1 - o), 0.686 + 0.314 * (1 - o), 0.168 - 0.168 * (1 - o), 0.272 - 0.272 * (1 - o), 0.534 - 0.534 * (1 - o), 0.131 + 0.869 * (1 - o)]);
  }
  saturate() {
    const o = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
    this.multiply([0.213 + 0.787 * o, 0.715 - 0.715 * o, 0.072 - 0.072 * o, 0.213 - 0.213 * o, 0.715 + 0.285 * o, 0.072 - 0.072 * o, 0.213 - 0.213 * o, 0.715 - 0.715 * o, 0.072 + 0.928 * o]);
  }
  multiply(o) {
    const q = this.clamp(this.r * o[0] + this.g * o[1] + this.b * o[2]);
    const p = this.clamp(this.r * o[3] + this.g * o[4] + this.b * o[5]);
    const r = this.clamp(this.r * o[6] + this.g * o[7] + this.b * o[8]);
    this.r = q;
    this.g = p;
    this.b = r;
  }
  brightness() {
    const o = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
    this.linear(o);
  }
  contrast() {
    const o = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
    this.linear(o, -(0.5 * o) + 0.5);
  }
  linear() {
    const o = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
    const p = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    this.r = this.clamp(this.r * o + p * 255);
    this.g = this.clamp(this.g * o + p * 255);
    this.b = this.clamp(this.b * o + p * 255);
  }
  invert() {
    const o = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
    this.r = this.clamp((o + this.r / 255 * (1 - 2 * o)) * 255);
    this.g = this.clamp((o + this.g / 255 * (1 - 2 * o)) * 255);
    this.b = this.clamp((o + this.b / 255 * (1 - 2 * o)) * 255);
  }
  hsl() {
    const o = this.r / 255;
    const u = this.g / 255;
    const w = this.b / 255;
    const x = Math.max(o, u, w);
    const q = Math.min(o, u, w);
    let t = void 0;
    let y = void 0;
    const p = (x + q) / 2;
    if (x === q) {
      t = y = 0;
    } else {
      const v = x - q;
      y = p > 0.5 ? v / (2 - x - q) : v / (x + q);
      switch (x) {
        case o:
          t = (u - w) / v + (u < w ? 6 : 0);
          break;
        case u:
          t = (w - o) / v + 2;
          break;
        case w:
          t = (o - u) / v + 4;
          break;
      }
      t /= 6;
    }
    return {
      h: t * 100,
      s: y * 100,
      l: p * 100,
    };
  }
  clamp(o) {
    if (o > 255) {
      o = 255;
    } else {
      if (o < 0) {
        o = 0;
      }
    }
    return o;
  }
}
export class Solver {
  constructor(h) {
    this.target = h;
    this.targetHSL = h.hsl();
    this.reusedColor = new Color(0, 0, 0);
  }
  solve() {
    const h = this.solveNarrow(this.solveWide());
    return {
      values: h.values,
      loss: h.loss,
      filter: this.css(h.values),
    };
  }
  solveWide() {
    const j = 5;
    const o = 15;
    const k = [60, 180, 18000, 600, 1.2, 1.2];
    let n = {
      loss: Infinity,
    };
    for (let m = 0; n.loss > 25 && m < 3; m++) {
      const l = [50, 20, 3750, 50, 100, 100];
      const h = this.spsa(j, k, o, l, 1000);
      if (h.loss < n.loss) {
        n = h;
      }
    }
    return n;
  }
  solveNarrow(k) {
    const h = k.loss;
    const l = 2;
    const j = h + 1;
    const i = [0.25 * j, 0.25 * j, j, 0.25 * j, 0.2 * j, 0.2 * j];
    return this.spsa(h, i, l, k.values, 500);
  }
  spsa(w, E, C, j, q) {
    const o = 1;
    const r = 0.16666666666666666;
    let m = null;
    let h = Infinity;
    const s = new Array(6);
    const p = new Array(6);
    const D = new Array(6);
    for (let x = 0; x < q; x++) {
      const t = C / Math.pow(x + 1, r);
      for (let z = 0; z < 6; z++) {
        s[z] =  1 ;
        p[z] = j[z] + t * s[z];
        D[z] = j[z] - t * s[z];
      }
      const u = this.loss(p) - this.loss(D);
      for (let l = 0; l < 6; l++) {
        const B = u / (2 * t) * s[l];
        const y = E[l] / Math.pow(w + x + 1, o);
        j[l] = v(j[l] - y * B, l);
      }
      const n = this.loss(j);
      if (n < h) {
        m = j.slice(0);
        h = n;
      }
    }
    return {
      values: m,
      loss: h,
    };
    function v(A, k) {
      let i = 100;
      if (k === 2) {
        i = 7500;
      } else {
        if (k === 4 || k === 5) {
          i = 200;
        }
      }
      if (k === 3) {
        if (A > i) {
          A %= i;
        } else {
          if (A < 0) {
            A = i + A % i;
          }
        }
      } else {
        if (A < 0) {
          A = 0;
        } else {
          if (A > i) {
            A = i;
          }
        }
      }
      return A;
    }
  }
  loss(i) {
    const h = this.reusedColor;
    h.set(0, 0, 0);
    h.invert(i[0] / 100);
    h.sepia(i[1] / 100);
    h.saturate(i[2] / 100);
    h.hueRotate(i[3] * 3.6);
    h.brightness(i[4] / 100);
    h.contrast(i[5] / 100);
    const j = h.hsl();
    return Math.abs(h.r - this.target.r) + Math.abs(h.g - this.target.g) + Math.abs(h.b - this.target.b) + Math.abs(j.h - this.targetHSL.h) + Math.abs(j.s - this.targetHSL.s) + Math.abs(j.l - this.targetHSL.l);
  }
  css(i) {
    function h(j) {
      const k = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      return Math.round(i[j] * k);
    }
    return `invert(${h(0)}%) sepia(${h(1)}%) saturate(${h(2)}%) hue-rotate(${h(3, 3.6)}deg) brightness(${h(4)}%) contrast(${h(5)}%)`;
  }
}

