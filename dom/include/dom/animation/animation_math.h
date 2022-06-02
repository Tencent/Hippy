#include <cstdint>

namespace hippy {

class CubicBezier {
 public:
  struct PolynomialCoefficients {
    double ax;
    double bx;
    double cx;
    double ay;
    double by;
    double cy;
  };

  struct ControlPoint {
    double x;
    double y;
  };

  constexpr static const ControlPoint kLinearP1        = {0.0,  0.0};
  constexpr static const ControlPoint kLinearP2        = {1.0,  1.0};
  constexpr static const ControlPoint kEaseInP1        = {0.42, 0.0};
  constexpr static const ControlPoint kEaseInP2        = {1.0,  1.0};
  constexpr static const ControlPoint kEaseOutP1       = {0.0,  0.0};
  constexpr static const ControlPoint kEaseOutP2       = {0.58, 1.0};
  constexpr static const ControlPoint kEaseInEaseOutP1 = {0.42, 0.0};
  constexpr static const ControlPoint kEaseInEaseOutP2 = {0.58, 1.0};
  constexpr static const ControlPoint kDefaultP1       = {0.25, 0.1};
  constexpr static const ControlPoint kDefaultP2       = {0.25, 1.0};
 public:
  CubicBezier(ControlPoint p1, ControlPoint p2);
  CubicBezier() = default;
  ~CubicBezier() = default;

  static ControlPoint NormalizedPoint(ControlPoint p);
  inline double SolveEpsilon(uint64_t duration) {
    return 1.0 / (200 * static_cast<double>(duration));
  }
  double SampleCurveX(double t) const;
  double SampleCurveY(double t) const;
  double SampleCurveDerivativeX(double t) const;
  double SolveCurveX(double x, double epsilon) const;

 private:
  void CalculatePolynomialCoefficients(ControlPoint p1, ControlPoint p2);
  PolynomialCoefficients p_;
};

}
