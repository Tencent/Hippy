import 'package:flutter/cupertino.dart';

import '../common/voltron_array.dart';
import '../common/voltron_map.dart';
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
      VoltronMap transform = transformList.get(transformIdx);
      if (transform.size() > 0) {
        for (var transformType in transform.keySet()) {
          MatrixUtil.resetIdentityMatrix(helperMatrix);
          Object value = transform.get(transformType);
          if (transformType == "matrix" && value is VoltronArray) {
            var matrix = value;
            for (var i = 0; i < 16; i++) {
              Object matrixValue = matrix.get(i);
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
              Object tranX = value.get(0);
              if (tranX is num) {
                x = tranX.toDouble();
              }
            }

            if (value.size() > 1) {
              Object tranY = value.get(1);
              if (tranY is num) {
                y = tranY.toDouble();
              }
            }

            if (value.size() > 2) {
              Object tranZ = value.get(1);
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
