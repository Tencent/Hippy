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

import '../util.dart';
import 'flex_define.dart';

class FlexSpacing {
  static final List<int> kFlags = [
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
        _valueFlags &= ~kFlags[spacingType];
      } else {
        _valueFlags |= kFlags[spacingType];
      }

      _hasAliasesSet = (_valueFlags & kFlags[FlexStyleEdge.all.index]) != 0 ||
          (_valueFlags & kFlags[FlexStyleEdge.vertical.index]) != 0 ||
          (_valueFlags & kFlags[FlexStyleEdge.horizontal.index]) != 0;

      return true;
    }

    return false;
  }

  double get(FlexStyleEdge spacingType) {
    var defaultValue = (spacingType == FlexStyleEdge.start.index ||
            spacingType == FlexStyleEdge.end.index
        ? undefined
        : _defaultValue);

    if (_valueFlags == 0) {
      return defaultValue;
    }

    if ((_valueFlags & kFlags[spacingType.index]) != 0) {
      return _spacing[spacingType.index];
    }

    if (_hasAliasesSet) {
      var secondType = spacingType == FlexStyleEdge.top ||
              spacingType == FlexStyleEdge.bottom
          ? FlexStyleEdge.vertical
          : FlexStyleEdge.horizontal;
      if ((_valueFlags & kFlags[secondType.index]) != 0) {
        return _spacing[secondType.index];
      } else if ((_valueFlags & kFlags[FlexStyleEdge.all.index]) != 0) {
        return _spacing[FlexStyleEdge.all.index];
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

  double getWithFallback(
      FlexStyleEdge spacingType, FlexStyleEdge fallbackType) {
    return (_valueFlags & kFlags[spacingType.index]) != 0
        ? _spacing[spacingType.index]
        : get(fallbackType);
  }
}
