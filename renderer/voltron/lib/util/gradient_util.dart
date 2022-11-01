//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

import 'dart:math';
import 'package:flutter/material.dart';

import '../common/voltron_array.dart';
import '../common/voltron_map.dart';

class GradientUtil {
  static double degreeToRadian(double degree) {
    return degree * pi / 180;
  }

  static double radianToDegree(double radian) {
    return radian * 180 / pi;
  }


  static int _getOppositeAngle (double width, double height) {
    var ratio = width / height;
    var angrad = atan(ratio);
    return radianToDegree(angrad).round();
  }

  static int _calculateGradientAngle (String angle, int oppositeDegree) {
    var gradientAngle = 180;
    if (angle == 'totopright') {
      gradientAngle = (90 - oppositeDegree);
    } else if (angle == 'tobottomright') {
      gradientAngle = (90 + oppositeDegree);
    } else if (angle == 'tobottomleft') {
      gradientAngle = (270 - oppositeDegree);
    } else if (angle == 'totopleft') {
      gradientAngle = (270 + oppositeDegree);
    } else {
      try {
        var fa = double.parse(angle);
        gradientAngle = fa.round() % 360;
      } catch(err) {
        //
      }
    }
    return gradientAngle;
  }

  static List<Alignment>? _checkSpecialAngle(int gradientAngle) {
    var begin = Alignment.topCenter;
    var end = Alignment.bottomCenter;
    switch (gradientAngle) {
      case 0:
        end = Alignment.topCenter;
        begin = Alignment.bottomCenter;
        break;
      case 90:
        end = Alignment.centerRight;
        begin = Alignment.centerLeft;
        break;
      case 180:
        end = Alignment.bottomCenter;
        begin = Alignment.topCenter;
        break;
      case 270:
        end = Alignment.centerLeft;
        begin = Alignment.centerRight;
        break;
      default:
        return null;
    }
    return [begin, end];
  }

  static List<Alignment> _calculateBeginAndEnd(double w, double h, int gradientAngle, int oppositeDegree) {
    Alignment begin;
    Alignment end;
    var tempDegree = gradientAngle%90;
    if ((gradientAngle > 90 && gradientAngle < 180) || (gradientAngle > 270 && gradientAngle < 360)) {
      tempDegree = 90 - tempDegree;
    }
    if (tempDegree == oppositeDegree) {
      end = Alignment.topRight;
      begin = Alignment.bottomLeft;
    } else if (tempDegree < oppositeDegree) {
      var xl = tan(degreeToRadian(tempDegree.toDouble())) * h / w;
      end = Alignment(xl, -1);
      begin = Alignment(-xl, 1);
    } else {
      var yl = tan(degreeToRadian(90 - tempDegree.toDouble())) * w / h;
      end = Alignment(1, -yl);
      begin = Alignment(-1, yl);
    }
    if (gradientAngle > 90 && gradientAngle < 180) {
      begin = Alignment(begin.x, -begin.y);
      end = Alignment(end.x, -end.y);
    } else if (gradientAngle > 180 && gradientAngle < 270) {
      var tempBegin = Alignment(begin.x, begin.y);
      begin = Alignment(end.x, end.y);
      end = Alignment(tempBegin.x, tempBegin.y);
    } else if (gradientAngle > 270 && gradientAngle < 360) {
      begin = Alignment(-begin.x, begin.y);
      end = Alignment(-end.x, end.y);
    }
    return [begin, end];
  }

  static LinearGradient? generateHippyLinearGradient (double width, double height, String angle, VoltronArray colorStopList) {
    if (colorStopList.size() < 2) return null;
    var oppositeDegree = _getOppositeAngle(width, height);
    var gradientAngle = _calculateGradientAngle(angle, oppositeDegree);
    var initBeginAndEnd = _checkSpecialAngle(gradientAngle);
    Alignment begin;
    Alignment end;
    initBeginAndEnd ??= _calculateBeginAndEnd(width, height, gradientAngle, oppositeDegree);
    begin = initBeginAndEnd[0];
    end = initBeginAndEnd[1];

    var colors = <Color>[];
    var stops = <double>[];
    for (var i = 0; i < colorStopList.size(); i++) {
      VoltronMap? colorStop = colorStopList.get<VoltronMap>(i);
      var color = colorStop?.get<int>('color') ?? colorStop?.get<double>('color')?.toInt();
      var stop = colorStop?.get<double>('ratio');
      if (color != null) colors.add(Color(color));
      if (stop != null) stops.add(stop);
    }

    return LinearGradient(
      begin: begin,
      end: end,
      colors: colors,
      stops: stops.isNotEmpty ? stops : null,
    );
  }
}
