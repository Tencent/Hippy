const Easing = {
  step0(n: number): number {
    return n > 0 ? 1 : 0;
  },

  step1(n: number): number {
    return n >= 1 ? 1 : 0;
  },

  linear() {
    return 'linear';
  },

  ease() {
    return 'ease';
  },

  quad(t: number): number {
    return t ** 2;
  },

  cubic(t: number): number {
    return t ** 3;
  },

  poly(n: number): (t: number) => number {
    return t => t ** n;
  },

  sin(t: number): number {
    return 1 - Math.cos(t * Math.PI / 2);
  },

  circle(t: number) {
    return 1 - Math.sqrt(1 - t * t);
  },

  exp(t: number) {
    return 2 ** (10 * (t - 1));
  },

  elastic() {
    return 'elastic';
  },

  back(s = 1.70158): (t: number) => number {
    return t => t * t * ((s + 1) * t - s);
  },

  bounce(t_: number): number {
    let t = t_;

    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    }

    if (t < 2 / 2.75) {
      t -= 1.5 / 2.75;
      return 7.5625 * t * t + 0.75;
    }

    if (t < 2.5 / 2.75) {
      t -= 2.25 / 2.75;
      return 7.5625 * t * t + 0.9375;
    }

    t -= 2.625 / 2.75;
    return 7.5625 * t * t + 0.984375;
  },

  bezier() {
    return 'bezier';
  },

  in() {
    return 'ease-in';
  },

  out() {
    return 'ease-out';
  },

  inOut() {
    return 'ease-in-out';
  },
};

export default Easing;
