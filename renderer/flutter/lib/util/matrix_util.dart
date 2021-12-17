import 'dart:math';

class MatrixUtil {
  static const double epsilon = 0.00001;

  static bool _isZero(double value) {
    if (value.isNaN) {
      return false;
    }
    return value.abs() < epsilon;
  }

  // 四维矩阵运算：out = matrixA * matrixB
  // 输入：matrixA，长度16的一维数组，代表四维矩阵
  // 输入：matrixB，长度16的一维数组，代表四维矩阵
  static void multiplyInto(
      List<double> out, List<double> matrixA, List<double> matrixB) {
    var b00 = matrixB[0];
    var b01 = matrixB[1];
    var b02 = matrixB[2];
    var b03 = matrixB[3];
    var b10 = matrixB[4];
    var b11 = matrixB[5];
    var b12 = matrixB[6];
    var b13 = matrixB[7];
    var b20 = matrixB[8];
    var b21 = matrixB[9];
    var b22 = matrixB[10];
    var b23 = matrixB[11];
    var b30 = matrixB[12];
    var b31 = matrixB[13];
    var b32 = matrixB[14];
    var b33 = matrixB[15];

    var a0 = matrixA[0];
    var a1 = matrixA[1];
    var a2 = matrixA[2];
    var a3 = matrixA[3];

    out[0] = a0 * b00 + a1 * b10 + a2 * b20 + a3 * b30;
    out[1] = a0 * b01 + a1 * b11 + a2 * b21 + a3 * b31;
    out[2] = a0 * b02 + a1 * b12 + a2 * b22 + a3 * b32;
    out[3] = a0 * b03 + a1 * b13 + a2 * b23 + a3 * b33;

    a0 = matrixA[4];
    a1 = matrixA[5];
    a2 = matrixA[6];
    a3 = matrixA[7];
    out[4] = a0 * b00 + a1 * b10 + a2 * b20 + a3 * b30;
    out[5] = a0 * b01 + a1 * b11 + a2 * b21 + a3 * b31;
    out[6] = a0 * b02 + a1 * b12 + a2 * b22 + a3 * b32;
    out[7] = a0 * b03 + a1 * b13 + a2 * b23 + a3 * b33;

    a0 = matrixA[8];
    a1 = matrixA[9];
    a2 = matrixA[10];
    a3 = matrixA[11];
    out[8] = a0 * b00 + a1 * b10 + a2 * b20 + a3 * b30;
    out[9] = a0 * b01 + a1 * b11 + a2 * b21 + a3 * b31;
    out[10] = a0 * b02 + a1 * b12 + a2 * b22 + a3 * b32;
    out[11] = a0 * b03 + a1 * b13 + a2 * b23 + a3 * b33;

    a0 = matrixA[12];
    a1 = matrixA[13];
    a2 = matrixA[14];
    a3 = matrixA[15];
    out[12] = a0 * b00 + a1 * b10 + a2 * b20 + a3 * b30;
    out[13] = a0 * b01 + a1 * b11 + a2 * b21 + a3 * b31;
    out[14] = a0 * b02 + a1 * b12 + a2 * b22 + a3 * b32;
    out[15] = a0 * b03 + a1 * b13 + a2 * b23 + a3 * b33;
  }

  //
  // @param transformMatrix 16-element array of numbers representing 4x4 transform
  //            matrix
  //
  static void decomposeMatrix(
      List<double> transformMatrix, MatrixDecompositionContext ctx) {
    // output values
    final perspective = ctx.perspective;
    final quaternion = ctx.quaternion;
    final scale = ctx.scale;
    final skew = ctx.skew;
    final translation = ctx.translation;
    final rotationDegrees = ctx.rotationDegrees;

    // create normalized, 2d array matrix
    // and normalized 1d array perspectiveMatrix with redefined 4th column
    if (_isZero(transformMatrix[15])) {
      return;
    }
    var matrix = <List<double>>[
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    var perspectiveMatrix = List<double>.filled(16, 0);
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        var value = transformMatrix[(i * 4) + j] / transformMatrix[15];
        matrix[i][j] = value;
        perspectiveMatrix[(i * 4) + j] = j == 3 ? 0 : value;
      }
    }
    perspectiveMatrix[15] = 1;

    // test for singularity of upper 3x3 part of the perspective matrix
    if (_isZero(determinant(perspectiveMatrix))) {
      return;
    }

    // isolate perspective
    if (!_isZero(matrix[0][3]) ||
        !_isZero(matrix[1][3]) ||
        !_isZero(matrix[2][3])) {
      // rightHandSide is the right hand side of the equation.
      // rightHandSide is a vector, or point in 3d space relative to the origin.
      var rightHandSide = <double>[
        matrix[0][3],
        matrix[1][3],
        matrix[2][3],
        matrix[3][3]
      ];

      // Solve the equation by inverting perspectiveMatrix and multiplying
      // rightHandSide by the inverse.
      var inversePerspectiveMatrix = inverse(perspectiveMatrix);
      var transposedInversePerspectiveMatrix =
          transpose(inversePerspectiveMatrix);
      multiplyVectorByMatrix(
          rightHandSide, transposedInversePerspectiveMatrix, perspective);
    } else {
      // no perspective
      perspective[0] = perspective[1] = perspective[2] = 0;
      perspective[3] = 1;
    }

    // translation is simple
    for (var i = 0; i < 3; i++) {
      translation[i] = matrix[3][i];
    }

    // Now get scale and shear.
    // 'row' is a 3 element array of 3 component vectors
    var row = <List<double>>[
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];
    for (var i = 0; i < 3; i++) {
      row[i][0] = matrix[i][0];
      row[i][1] = matrix[i][1];
      row[i][2] = matrix[i][2];
    }

    // Compute X scale factor and normalize first row.
    scale[0] = v3Length(row[0]);
    row[0] = v3Normalize(row[0], scale[0]);

    // Compute XY shear factor and make 2nd row orthogonal to 1st.
    skew[0] = v3Dot(row[0], row[1]);
    row[1] = v3Combine(row[1], row[0], 1.0, -skew[0]);

    // Compute XY shear factor and make 2nd row orthogonal to 1st.
    skew[0] = v3Dot(row[0], row[1]);
    row[1] = v3Combine(row[1], row[0], 1.0, -skew[0]);

    // Now, compute Y scale and normalize 2nd row.
    scale[1] = v3Length(row[1]);
    row[1] = v3Normalize(row[1], scale[1]);
    skew[0] /= scale[1];

    // Compute XZ and YZ shears, orthogonalize 3rd row
    skew[1] = v3Dot(row[0], row[2]);
    row[2] = v3Combine(row[2], row[0], 1.0, -skew[1]);
    skew[2] = v3Dot(row[1], row[2]);
    row[2] = v3Combine(row[2], row[1], 1.0, -skew[2]);

    // Next, get Z scale and normalize 3rd row.
    scale[2] = v3Length(row[2]);
    row[2] = v3Normalize(row[2], scale[2]);
    skew[1] /= scale[2];
    skew[2] /= scale[2];

    // At this point, the matrix (in rows) is orthonormal.
    // Check for a coordinate system flip.  If the determinant
    // is -1, then negate the matrix and the scaling factors.
    var pdum3 = v3Cross(row[1], row[2]);
    if (v3Dot(row[0], pdum3) < 0) {
      for (var i = 0; i < 3; i++) {
        scale[i] *= -1;
        row[i][0] *= -1;
        row[i][1] *= -1;
        row[i][2] *= -1;
      }
    }

    // Now, get the rotations out
    quaternion[0] = 0.5 * sqrt(max(1 + row[0][0] - row[1][1] - row[2][2], 0));
    quaternion[1] = 0.5 * sqrt(max(1 - row[0][0] + row[1][1] - row[2][2], 0));
    quaternion[2] = 0.5 * sqrt(max(1 - row[0][0] - row[1][1] + row[2][2], 0));
    quaternion[3] = 0.5 * sqrt(max(1 + row[0][0] + row[1][1] + row[2][2], 0));

    if (row[2][1] > row[1][2]) {
      quaternion[0] = -quaternion[0];
    }
    if (row[0][2] > row[2][0]) {
      quaternion[1] = -quaternion[1];
    }
    if (row[1][0] > row[0][1]) {
      quaternion[2] = -quaternion[2];
    }

    // correct for occasional, weird Euler synonyms for 2d rotation

    if (quaternion[0] < 0.001 &&
        quaternion[0] >= 0 &&
        quaternion[1] < 0.001 &&
        quaternion[1] >= 0) {
      // this is a 2d rotation on the z-axis
      rotationDegrees[0] = rotationDegrees[1] = 0;
      rotationDegrees[2] =
          roundTo3Places(atan2(row[0][1], row[0][0]) * 180 / pi);
    } else {
      quaternionToDegreesXYZ(quaternion, rotationDegrees);
    }
  }

  static double determinant(List<double> matrix) {
    var m00 = matrix[0];
    var m01 = matrix[1];
    var m02 = matrix[2];
    var m03 = matrix[3];
    var m10 = matrix[4];
    var m11 = matrix[5];
    var m12 = matrix[6];
    var m13 = matrix[7];
    var m20 = matrix[8];
    var m21 = matrix[9];
    var m22 = matrix[10];
    var m23 = matrix[11];
    var m30 = matrix[12];
    var m31 = matrix[13];
    var m32 = matrix[14];
    var m33 = matrix[15];
    return (m03 * m12 * m21 * m30 -
        m02 * m13 * m21 * m30 -
        m03 * m11 * m22 * m30 +
        m01 * m13 * m22 * m30 +
        m02 * m11 * m23 * m30 -
        m01 * m12 * m23 * m30 -
        m03 * m12 * m20 * m31 +
        m02 * m13 * m20 * m31 +
        m03 * m10 * m22 * m31 -
        m00 * m13 * m22 * m31 -
        m02 * m10 * m23 * m31 +
        m00 * m12 * m23 * m31 +
        m03 * m11 * m20 * m32 -
        m01 * m13 * m20 * m32 -
        m03 * m10 * m21 * m32 +
        m00 * m13 * m21 * m32 +
        m01 * m10 * m23 * m32 -
        m00 * m11 * m23 * m32 -
        m02 * m11 * m20 * m33 +
        m01 * m12 * m20 * m33 +
        m02 * m10 * m21 * m33 -
        m00 * m12 * m21 * m33 -
        m01 * m10 * m22 * m33 +
        m00 * m11 * m22 * m33);
  }

  //
  // Inverse of a matrix. Multiplying by the inverse is used in matrix math
  // instead of division.
  //
  // Formula from:
  // http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
  //
  static List<double> inverse(List<double> matrix) {
    var det = determinant(matrix);
    if (_isZero(det)) {
      return matrix;
    }
    var m00 = matrix[0];
    var m01 = matrix[1];
    var m02 = matrix[2];
    var m03 = matrix[3];
    var m10 = matrix[4];
    var m11 = matrix[5];
    var m12 = matrix[6];
    var m13 = matrix[7];
    var m20 = matrix[8];
    var m21 = matrix[9];
    var m22 = matrix[10];
    var m23 = matrix[11];
    var m30 = matrix[12];
    var m31 = matrix[13];
    var m32 = matrix[14];
    var m33 = matrix[15];
    return [
      (m12 * m23 * m31 -
              m13 * m22 * m31 +
              m13 * m21 * m32 -
              m11 * m23 * m32 -
              m12 * m21 * m33 +
              m11 * m22 * m33) /
          det,
      (m03 * m22 * m31 -
              m02 * m23 * m31 -
              m03 * m21 * m32 +
              m01 * m23 * m32 +
              m02 * m21 * m33 -
              m01 * m22 * m33) /
          det,
      (m02 * m13 * m31 -
              m03 * m12 * m31 +
              m03 * m11 * m32 -
              m01 * m13 * m32 -
              m02 * m11 * m33 +
              m01 * m12 * m33) /
          det,
      (m03 * m12 * m21 -
              m02 * m13 * m21 -
              m03 * m11 * m22 +
              m01 * m13 * m22 +
              m02 * m11 * m23 -
              m01 * m12 * m23) /
          det,
      (m13 * m22 * m30 -
              m12 * m23 * m30 -
              m13 * m20 * m32 +
              m10 * m23 * m32 +
              m12 * m20 * m33 -
              m10 * m22 * m33) /
          det,
      (m02 * m23 * m30 -
              m03 * m22 * m30 +
              m03 * m20 * m32 -
              m00 * m23 * m32 -
              m02 * m20 * m33 +
              m00 * m22 * m33) /
          det,
      (m03 * m12 * m30 -
              m02 * m13 * m30 -
              m03 * m10 * m32 +
              m00 * m13 * m32 +
              m02 * m10 * m33 -
              m00 * m12 * m33) /
          det,
      (m02 * m13 * m20 -
              m03 * m12 * m20 +
              m03 * m10 * m22 -
              m00 * m13 * m22 -
              m02 * m10 * m23 +
              m00 * m12 * m23) /
          det,
      (m11 * m23 * m30 -
              m13 * m21 * m30 +
              m13 * m20 * m31 -
              m10 * m23 * m31 -
              m11 * m20 * m33 +
              m10 * m21 * m33) /
          det,
      (m03 * m21 * m30 -
              m01 * m23 * m30 -
              m03 * m20 * m31 +
              m00 * m23 * m31 +
              m01 * m20 * m33 -
              m00 * m21 * m33) /
          det,
      (m01 * m13 * m30 -
              m03 * m11 * m30 +
              m03 * m10 * m31 -
              m00 * m13 * m31 -
              m01 * m10 * m33 +
              m00 * m11 * m33) /
          det,
      (m03 * m11 * m20 -
              m01 * m13 * m20 -
              m03 * m10 * m21 +
              m00 * m13 * m21 +
              m01 * m10 * m23 -
              m00 * m11 * m23) /
          det,
      (m12 * m21 * m30 -
              m11 * m22 * m30 -
              m12 * m20 * m31 +
              m10 * m22 * m31 +
              m11 * m20 * m32 -
              m10 * m21 * m32) /
          det,
      (m01 * m22 * m30 -
              m02 * m21 * m30 +
              m02 * m20 * m31 -
              m00 * m22 * m31 -
              m01 * m20 * m32 +
              m00 * m21 * m32) /
          det,
      (m02 * m11 * m30 -
              m01 * m12 * m30 -
              m02 * m10 * m31 +
              m00 * m12 * m31 +
              m01 * m10 * m32 -
              m00 * m11 * m32) /
          det,
      (m01 * m12 * m20 -
              m02 * m11 * m20 +
              m02 * m10 * m21 -
              m00 * m12 * m21 -
              m01 * m10 * m22 +
              m00 * m11 * m22) /
          det
    ];
  }

  //
  // Turns columns into rows and rows into columns.
  //
  static List<double> transpose(List<double> m) {
    return [
      m[0],
      m[4],
      m[8],
      m[12],
      m[1],
      m[5],
      m[9],
      m[13],
      m[2],
      m[6],
      m[10],
      m[14],
      m[3],
      m[7],
      m[11],
      m[15]
    ];
  }

  //
  // Based on: http://tog.acm.org/resources/GraphicsGems/gemsii/unmatrix.c
  //
  static void multiplyVectorByMatrix(
      List<double> v, List<double> m, List<double> result) {
    var vx = v[0];
    var vy = v[1];
    var vz = v[2];
    var vw = v[3];
    result[0] = vx * m[0] + vy * m[4] + vz * m[8] + vw * m[12];
    result[1] = vx * m[1] + vy * m[5] + vz * m[9] + vw * m[13];
    result[2] = vx * m[2] + vy * m[6] + vz * m[10] + vw * m[14];
    result[3] = vx * m[3] + vy * m[7] + vz * m[11] + vw * m[15];
  }

  //
  // From: https://code.google.com/p/webgl-mjs/source/browse/mjs.js
  //
  static double v3Length(List<double> a) {
    return sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
  }

  //
  // Based on: https://code.google.com/p/webgl-mjs/source/browse/mjs.js
  //
  static List<double> v3Normalize(List<double> vector, double norm) {
    var im = 1 / (_isZero(norm) ? v3Length(vector) : norm);
    return [vector[0] * im, vector[1] * im, vector[2] * im];
  }

  //
  // The dot product of a and b, two 3-element vectors.
  // From: https://code.google.com/p/webgl-mjs/source/browse/mjs.js
  //
  static double v3Dot(List<double> a, List<double> b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  //
  // From:
  // http://www.opensource.apple.com/source/WebCore/WebCore-514/platform/graphics/transforms/TransformationMatrix.cpp
  //
  static List<double> v3Combine(
      List<double> a, List<double> b, double aScale, double bScale) {
    return [
      aScale * a[0] + bScale * b[0],
      aScale * a[1] + bScale * b[1],
      aScale * a[2] + bScale * b[2]
    ];
  }

  //
  // From:
  // http://www.opensource.apple.com/source/WebCore/WebCore-514/platform/graphics/transforms/TransformationMatrix.cpp
  //
  static List<double> v3Cross(List<double> a, List<double> b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
  }

  //
  // Based on:
  // http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToEuler/
  // and:
  // http://quat.zachbennett.com/
  //
  // Note that this rounds degrees to the thousandth of a degree, due to
  // floating point errors in the creation of the quaternion.
  //
  // Also note that this expects the qw value to be last, not first.
  //
  // Also, when researching this, remember that:
  // yaw === heading === z-axis
  // pitch === elevation/attitude === y-axis
  // roll === bank === x-axis
  //
  static void quaternionToDegreesXYZ(List<double> q, List<double> result) {
    var qx = q[0];
    var qy = q[1];
    var qz = q[2];
    var qw = q[3];
    var qw2 = qw * qw;
    var qx2 = qx * qx;
    var qy2 = qy * qy;
    var qz2 = qz * qz;
    var test = qx * qy + qz * qw;
    var unit = qw2 + qx2 + qy2 + qz2;
    var conv = 180 / pi;

    if (test > 0.49999 * unit) {
      result[0] = 0;
      result[1] = 2 * atan2(qx, qw) * conv;
      result[2] = 90;
      return;
    }
    if (test < -0.49999 * unit) {
      result[0] = 0;
      result[1] = -2 * atan2(qx, qw) * conv;
      result[2] = -90;
      return;
    }

    result[0] = roundTo3Places(
        atan2(2 * qx * qw - 2 * qy * qz, 1 - 2 * qx2 - 2 * qz2) * conv);
    result[1] = roundTo3Places(
        atan2(2 * qy * qw - 2 * qx * qz, 1 - 2 * qy2 - 2 * qz2) * conv);
    result[2] = roundTo3Places(asin(2 * qx * qy + 2 * qz * qw) * conv);
  }

  static double roundTo3Places(double n) {
    return (n * 1000).round() * 0.001;
  }

  static double degreesToRadians(double degrees) {
    return degrees * pi / 180;
  }

  static void resetIdentityMatrix(List<double> matrix) {
    matrix[1] = matrix[2] = matrix[3] = matrix[4] = matrix[6] = matrix[7] =
        matrix[8] =
            matrix[9] = matrix[11] = matrix[12] = matrix[13] = matrix[14] = 0;
    matrix[0] = matrix[5] = matrix[10] = matrix[15] = 1;
  }

  static void applyPerspective(List<double> m, double perspective) {
    m[11] = -1 / perspective;
  }

  static void applyScaleX(List<double> m, double factor) {
    m[0] = factor;
  }

  static void applyScaleY(List<double> m, double factor) {
    m[5] = factor;
  }

  static void applyTranslate2D(List<double> m, double x, double y) {
    m[12] = x;
    m[13] = y;
  }

  static void applyTranslate3D(List<double> m, double x, double y, double z) {
    m[12] = x;
    m[13] = y;
    m[14] = z;
  }

  static void applySkewX(List<double> m, double radians) {
    m[4] = sin(radians);
    m[5] = cos(radians);
  }

  static void applySkewY(List<double> m, double radians) {
    m[0] = cos(radians);
    m[1] = sin(radians);
  }

  static void applyRotateX(List<double> m, double radians) {
    m[5] = cos(radians);
    m[6] = sin(radians);
    m[9] = -sin(radians);
    m[10] = cos(radians);
  }

  static void applyRotateY(List<double> m, double radians) {
    m[0] = cos(radians);
    m[2] = -sin(radians);
    m[8] = sin(radians);
    m[10] = cos(radians);
  }

  // http://www.w3.org/TR/css3-transforms/#recomposing-to-a-2d-matrix
  static void applyRotateZ(List<double> m, double radians) {
    m[0] = cos(radians);
    m[1] = sin(radians);
    m[4] = -sin(radians);
    m[5] = cos(radians);
  }
}

class MatrixDecompositionContext {
  List<double> perspective = List.filled(4, 0);
  List<double> quaternion = List.filled(4, 0);
  List<double> scale = List.filled(3, 0);
  List<double> skew = List.filled(3, 0);
  List<double> translation = List.filled(3, 0);
  List<double> rotationDegrees = List.filled(3, 0);

  void reset() {
    perspective[0] = 0;
    perspective[1] = 0;
    perspective[2] = 0;
    perspective[3] = 0;

    quaternion[0] = 0;
    quaternion[1] = 0;
    quaternion[2] = 0;
    quaternion[3] = 0;

    scale[0] = 0;
    scale[1] = 0;
    scale[2] = 0;

    skew[0] = 0;
    skew[1] = 0;
    skew[2] = 0;

    translation[0] = 0;
    translation[1] = 0;
    translation[2] = 0;

    rotationDegrees[0] = 0;
    rotationDegrees[1] = 0;
    rotationDegrees[2] = 0;
  }
}
