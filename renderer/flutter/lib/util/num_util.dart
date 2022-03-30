//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2019 THL A29 Limited, a Tencent company.
// All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

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
