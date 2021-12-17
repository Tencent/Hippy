import '../util.dart';
import 'flex_define.dart';

class FlexSpacing {
  static const int left = 0;
  static const int top = 1;
  static const int right = 2;
  static const int bottom = 3;
  static const int start = 4;
  static const int end = 5;
  static const int horizontal = 6;
  static const int vertical = 7;
  static const int all = 8;

  static final List<int> sFlags = [
    1,
    /*LEFT*/
    2,
    /*TOP*/
    4,
    /*RIGHT*/
    8,
    /*BOTTOM*/
    16,
    /*START*/
    32,
    /*END*/
    64,
    /*HORIZONTAL*/
    128,
    /*VERTICAL*/
    256 /*ALL*/
  ];

  final List<double> _spacing = [
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined
  ];
  int _valueFlags = 0;
  final double _defaultValue;
  bool _hasAliasesSet = false;

  FlexSpacing() : _defaultValue = 0;
  FlexSpacing.defaultVal(double defaultValue) : _defaultValue = defaultValue;

  bool set(int spacingType, double value) {
    if (!floatsEqual(_spacing[spacingType], value)) {
      _spacing[spacingType] = value;

      if (isDoubleNan(value)) {
        _valueFlags &= ~sFlags[spacingType];
      } else {
        _valueFlags |= sFlags[spacingType];
      }

      _hasAliasesSet = (_valueFlags & sFlags[all]) != 0 ||
          (_valueFlags & sFlags[vertical]) != 0 ||
          (_valueFlags & sFlags[horizontal]) != 0;

      return true;
    }

    return false;
  }

  double get(int spacingType) {
    var defaultValue = (spacingType == start || spacingType == end
        ? undefined
        : _defaultValue);

    if (_valueFlags == 0) {
      return defaultValue;
    }

    if ((_valueFlags & sFlags[spacingType]) != 0) {
      return _spacing[spacingType];
    }

    if (_hasAliasesSet) {
      var secondType =
          spacingType == top || spacingType == bottom ? vertical : horizontal;
      if ((_valueFlags & sFlags[secondType]) != 0) {
        return _spacing[secondType];
      } else if ((_valueFlags & sFlags[all]) != 0) {
        return _spacing[all];
      }
    }

    return defaultValue;
  }

  double getRaw(int spacingType) {
    return _spacing[spacingType];
  }

  void reset() {
    _spacing.fillRange(0, _spacing.length, undefined);
    _hasAliasesSet = false;
    _valueFlags = 0;
  }

  double getWithFallback(int spacingType, int fallbackType) {
    return (_valueFlags & sFlags[spacingType]) != 0
        ? _spacing[spacingType]
        : get(fallbackType);
  }
}
