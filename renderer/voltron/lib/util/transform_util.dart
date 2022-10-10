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

import 'package:flutter/cupertino.dart';

import '../common.dart';
import 'log_util.dart';
import 'matrix_util.dart';

class TransformUtil {
  static MatrixDecompositionContext sMatrixDecompositionContext =
      MatrixDecompositionContext();
  static List<double> sTransformDecompositionArray = List.filled(16, 0);
  static List<double> sHelperMatrix = List.filled(16, 0);

  static double convertToRadians(VoltronMap transformMap, String key) {
    var value = 0.0;
    var inRadians = true;
    final valueTmp = transformMap.get(key);
    if (valueTmp is String) {
      var stringValue = valueTmp;
      if (stringValue.endsWith("rad")) {
        stringValue = stringValue.substring(0, stringValue.length - 3);
      } else if (stringValue.endsWith("deg")) {
        inRadians = false;
        stringValue = stringValue.substring(0, stringValue.length - 3);
      }
      value = double.parse(stringValue);
    } else if (valueTmp is num) {
      value = valueTmp.toDouble();
    }
    return inRadians ? value : MatrixUtil.degreesToRadians(value);
  }

  static Matrix4? getTransformMatrix4(VoltronArray? transformList) {
    if (transformList == null) {
      return null;
    }

    final result = List.filled(16, 0.0);
    final helperMatrix = sHelperMatrix;
    MatrixUtil.resetIdentityMatrix(result);
    var size = transformList.size();
    for (var transformIdx = 0; transformIdx < size; transformIdx++) {
      VoltronMap? transform = transformList.get<VoltronMap>(transformIdx);
      if (transform != null && transform.size() > 0) {
        for (var transformType in transform.keySet()) {
          MatrixUtil.resetIdentityMatrix(helperMatrix);
          Object? value = transform.get<Object>(transformType);
          if (transformType == "matrix" && value is VoltronArray) {
            var matrix = value;
            for (var i = 0; i < 16; i++) {
              Object? matrixValue = matrix.get<Object>(i);
              if (matrixValue is num) {
                helperMatrix[i] = matrixValue.toDouble();
              } else {
                helperMatrix[i] = 0;
              }
            }
          } else if (transformType == "perspective" && value is num) {
            MatrixUtil.applyPerspective(helperMatrix, value.toDouble());
          } else if (transformType == "rotateX") {
            MatrixUtil.applyRotateX(
                helperMatrix, convertToRadians(transform, transformType));
          } else if (transformType == "rotateY") {
            MatrixUtil.applyRotateY(
                helperMatrix, convertToRadians(transform, transformType));
          } else if (transformType == "rotate" || transformType == "rotateZ") {
            MatrixUtil.applyRotateZ(
                helperMatrix, convertToRadians(transform, transformType));
          } else if (transformType == "scale" && value is num) {
            var scale = value.toDouble();
            MatrixUtil.applyScaleX(helperMatrix, scale);
            MatrixUtil.applyScaleY(helperMatrix, scale);
          } else if (transformType == "scaleX" && value is num) {
            MatrixUtil.applyScaleX(helperMatrix, value.toDouble());
          } else if (transformType == "scaleY" && value is num) {
            MatrixUtil.applyScaleY(helperMatrix, value.toDouble());
          } else if (transformType == "translate" && value is VoltronArray) {
            var x = 0.0;
            var y = 0.0;
            var z = 0.0;
            if (value.size() > 0) {
              Object? tranX = value.get<Object>(0);
              if (tranX is num) {
                x = tranX.toDouble();
              }
            }

            if (value.size() > 1) {
              Object? tranY = value.get<Object>(1);
              if (tranY is num) {
                y = tranY.toDouble();
              }
            }

            if (value.size() > 2) {
              Object? tranZ = value.get<Object>(1);
              if (tranZ is num) {
                z = tranZ.toDouble();
              }
            }
            MatrixUtil.applyTranslate3D(helperMatrix, x, y, z);
          } else if (transformType == "translateX" && value is num) {
            MatrixUtil.applyTranslate2D(helperMatrix, value.toDouble(), 0);
          } else if (transformType == "translateY" && value is num) {
            MatrixUtil.applyTranslate2D(helperMatrix, 0, value.toDouble());
          } else if (transformType == "skewX") {
            MatrixUtil.applySkewX(
                helperMatrix, convertToRadians(transform, transformType));
          } else if (transformType == "skewY") {
            MatrixUtil.applySkewY(
                helperMatrix, convertToRadians(transform, transformType));
          } else {
            LogUtils.e(
                "transform", "Unsupported transform type:$transformType");
          }
          MatrixUtil.multiplyInto(result, result, helperMatrix);
        }
      }
    }

    return Matrix4.fromList(result);
  }
}
