const double epsilon = 0.00001;

bool floatsEqual(double f1, double f2) {
  if (isDoubleNan(f1) || isDoubleNan(f2)) {
    return isDoubleNan(f1) && isDoubleNan(f2);
  }
  return (f2 - f1).abs() < epsilon;
}

bool isDoubleNan(double f1) {
  return f1.isNaN || f1.isInfinite;
}

/// 获取json格式下的double number, 如果当前number的值为null或nan，就返回默认值 或 0.0
double getJsonDoubleNumber(double? value, [double defaultValue = 0.0]) {
  var isNaN = value != null && value.isNaN;
  if (isNaN || value == null) {
    return defaultValue;
  }

  return value;
}
