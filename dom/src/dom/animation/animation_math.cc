#include "dom/animation/animation_math.h"

#include <algorithm>
#include <cmath>

namespace hippy {

CubicBezier::CubicBezier(ControlPoint p1, ControlPoint p2): p_({}) {
  CalculatePolynomialCoefficients(p1, p2);
}

CubicBezier::ControlPoint CubicBezier::NormalizedPoint(ControlPoint p) {
  ControlPoint point{};
  point.x = std::max(0.0, std::min(1.0, p.x));
  point.y = std::max(0.0, std::min(1.0, p.y));
  return point;
}

void CubicBezier::CalculatePolynomialCoefficients(ControlPoint p1, ControlPoint p2) {
  p_.cx = 3.0 * p1.x;
  p_.bx = 3.0 * (p2.x - p1.x) - p_.cx;
  p_.ax = 1.0 - p_.cx - p_.bx;

  p_.cy = 3.0 * p1.y;
  p_.by = 3.0 * (p2.y - p1.y) - p_.cy;
  p_.ay = 1.0 - p_.cy - p_.by;
}

double CubicBezier::SampleCurveX(double t) const {
  return ((p_.ax * t + p_.bx) * t + p_.cx) * t;
}

double CubicBezier::SampleCurveY(double t) const {
  return ((p_.ay * t + p_.by) * t + p_.cy) * t;
}

double CubicBezier::SampleCurveDerivativeX(double t) const {
  return (3.0 * p_.ax * t + 2.0 * p_.bx) * t + p_.cx;
}

double CubicBezier::SolveCurveX(double x, double epsilon) const {
  // First try a few iterations of Newton's method
  double t2 = x;
  for (auto i = 0; i < 8; ++i) {
    double x2 = SampleCurveX(t2) - x;
    if (std::fabs(x2) < epsilon) {
      return t2;
    }
    double d2 = SampleCurveDerivativeX(t2);
    if (std::fabs(d2) < 1e-6) {
      break;
    }
    t2 = t2 - x2 / d2;
  }

  // Fall back to the bisection method for reliability.
  double t0 = 0.0;
  double t1 = 1.0;
  t2 = x;
  if (t2 < t0) {
    return t0;
  }
  if (t2 > t1) {
    return t1;
  }
  while (t0 < t1) {
    double x2 = SampleCurveX(t2);
    if (std::fabs(x2 - x) < epsilon) {
      return t2;
    }
    if (x > x2) {
      t0 = t2;
    } else {
      t1 = t2;
    }
    t2 = (t1 - t0) * 0.5 + t0;
  }

  return t2;
}

}
