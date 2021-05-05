/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.tencent.mtt.hippy.uimanager;

/**
 * Created by leonardgong on 2017/12/12 0012.
 */

public class MatrixUtil
{
	private static final double EPSILON = .00001d;

	public static class MatrixDecompositionContext
	{
		final double[]	perspective		= new double[4];
		final double[]	quaternion		= new double[4];
		final double[]	scale			= new double[3];
		final double[]	skew			= new double[3];
		final double[]	translation		= new double[3];
		final double[]	rotationDegrees	= new double[3];

		public void reset()
		{
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

	private static boolean isZero(double d)
	{
		if (Double.isNaN(d))
		{
			return false;
		}
		return Math.abs(d) < EPSILON;
	}

	// 四维矩阵运算：out = matrixA * matrixB
	// 输入：matrixA，长度16的一维数组，代表四维矩阵
	// 输入：matrixB，长度16的一维数组，代表四维矩阵
	public static void multiplyInto(double[] out, double[] matrixA, double[] matrixB)
	{
		double b00 = matrixB[0], b01 = matrixB[1], b02 = matrixB[2], b03 = matrixB[3],
				b10 = matrixB[4], b11 = matrixB[5], b12 = matrixB[6], b13 = matrixB[7],
				b20 = matrixB[8], b21 = matrixB[9], b22 = matrixB[10], b23 = matrixB[11],
				b30 = matrixB[12], b31 = matrixB[13], b32 = matrixB[14], b33 = matrixB[15];

		double a0 = matrixA[0], a1 = matrixA[1], a2 = matrixA[2], a3 = matrixA[3];
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

	/**
	 * @param transformMatrix 16-element array of numbers representing 4x4 transform
	 *            matrix
	 */
	public static void decomposeMatrix(double[] transformMatrix, MatrixDecompositionContext ctx)
	{
		// output values
		final double[] perspective = ctx.perspective;
		final double[] quaternion = ctx.quaternion;
		final double[] scale = ctx.scale;
		final double[] skew = ctx.skew;
		final double[] translation = ctx.translation;
		final double[] rotationDegrees = ctx.rotationDegrees;

		// create normalized, 2d array matrix
		// and normalized 1d array perspectiveMatrix with redefined 4th column
		if (isZero(transformMatrix[15]))
		{
			return;
		}
		double[][] matrix = new double[4][4];
		double[] perspectiveMatrix = new double[16];
		for (int i = 0; i < 4; i++)
		{
			for (int j = 0; j < 4; j++)
			{
				double value = transformMatrix[(i * 4) + j] / transformMatrix[15];
				matrix[i][j] = value;
				perspectiveMatrix[(i * 4) + j] = j == 3 ? 0 : value;
			}
		}
		perspectiveMatrix[15] = 1;

		// test for singularity of upper 3x3 part of the perspective matrix
		if (isZero(determinant(perspectiveMatrix)))
		{
			return;
		}

		// isolate perspective
		if (!isZero(matrix[0][3]) || !isZero(matrix[1][3]) || !isZero(matrix[2][3]))
		{
			// rightHandSide is the right hand side of the equation.
			// rightHandSide is a vector, or point in 3d space relative to the origin.
			double[] rightHandSide = { matrix[0][3], matrix[1][3], matrix[2][3], matrix[3][3] };

			// Solve the equation by inverting perspectiveMatrix and multiplying
			// rightHandSide by the inverse.
			double[] inversePerspectiveMatrix = inverse(perspectiveMatrix);
			double[] transposedInversePerspectiveMatrix = transpose(inversePerspectiveMatrix);
			multiplyVectorByMatrix(rightHandSide, transposedInversePerspectiveMatrix, perspective);
		}
		else
		{
			// no perspective
			perspective[0] = perspective[1] = perspective[2] = 0d;
			perspective[3] = 1d;
		}

		// translation is simple
		System.arraycopy(matrix[3], 0, translation, 0, 3);

		// Now get scale and shear.
		// 'row' is a 3 element array of 3 component vectors
		double[][] row = new double[3][3];
		for (int i = 0; i < 3; i++)
		{
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
		double[] pdum3 = v3Cross(row[1], row[2]);
		if (v3Dot(row[0], pdum3) < 0)
		{
			for (int i = 0; i < 3; i++)
			{
				scale[i] *= -1;
				row[i][0] *= -1;
				row[i][1] *= -1;
				row[i][2] *= -1;
			}
		}

		// Now, get the rotations out
		quaternion[0] = 0.5 * Math.sqrt(Math.max(1 + row[0][0] - row[1][1] - row[2][2], 0));
		quaternion[1] = 0.5 * Math.sqrt(Math.max(1 - row[0][0] + row[1][1] - row[2][2], 0));
		quaternion[2] = 0.5 * Math.sqrt(Math.max(1 - row[0][0] - row[1][1] + row[2][2], 0));
		quaternion[3] = 0.5 * Math.sqrt(Math.max(1 + row[0][0] + row[1][1] + row[2][2], 0));

		if (row[2][1] > row[1][2])
		{
			quaternion[0] = -quaternion[0];
		}
		if (row[0][2] > row[2][0])
		{
			quaternion[1] = -quaternion[1];
		}
		if (row[1][0] > row[0][1])
		{
			quaternion[2] = -quaternion[2];
		}

		// correct for occasional, weird Euler synonyms for 2d rotation

		if (quaternion[0] < 0.001 && quaternion[0] >= 0 && quaternion[1] < 0.001 && quaternion[1] >= 0)
		{
			// this is a 2d rotation on the z-axis
			rotationDegrees[0] = rotationDegrees[1] = 0d;
			rotationDegrees[2] = roundTo3Places(Math.atan2(row[0][1], row[0][0]) * 180 / Math.PI);
		}
		else
		{
			quaternionToDegreesXYZ(quaternion, rotationDegrees);
		}
	}

	public static double determinant(double[] matrix)
	{
		double m00 = matrix[0], m01 = matrix[1], m02 = matrix[2], m03 = matrix[3], m10 = matrix[4], m11 = matrix[5], m12 = matrix[6], m13 = matrix[7],
				m20 = matrix[8], m21 = matrix[9], m22 = matrix[10], m23 = matrix[11], m30 = matrix[12], m31 = matrix[13], m32 = matrix[14],
				m33 = matrix[15];
		return (m03 * m12 * m21 * m30 - m02 * m13 * m21 * m30 - m03 * m11 * m22 * m30 + m01 * m13 * m22 * m30 + m02 * m11 * m23 * m30
				- m01 * m12 * m23 * m30 - m03 * m12 * m20 * m31 + m02 * m13 * m20 * m31 + m03 * m10 * m22 * m31 - m00 * m13 * m22 * m31
				- m02 * m10 * m23 * m31 + m00 * m12 * m23 * m31 + m03 * m11 * m20 * m32 - m01 * m13 * m20 * m32 - m03 * m10 * m21 * m32
				+ m00 * m13 * m21 * m32 + m01 * m10 * m23 * m32 - m00 * m11 * m23 * m32 - m02 * m11 * m20 * m33 + m01 * m12 * m20 * m33
				+ m02 * m10 * m21 * m33 - m00 * m12 * m21 * m33 - m01 * m10 * m22 * m33 + m00 * m11 * m22 * m33);
	}

	/**
	 * Inverse of a matrix. Multiplying by the inverse is used in matrix math
	 * instead of division.
	 *
	 * Formula from:
	 * http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
	 */
	public static double[] inverse(double[] matrix)
	{
		double det = determinant(matrix);
		if (isZero(det))
		{
			return matrix;
		}
		double m00 = matrix[0], m01 = matrix[1], m02 = matrix[2], m03 = matrix[3], m10 = matrix[4], m11 = matrix[5], m12 = matrix[6], m13 = matrix[7],
				m20 = matrix[8], m21 = matrix[9], m22 = matrix[10], m23 = matrix[11], m30 = matrix[12], m31 = matrix[13], m32 = matrix[14],
				m33 = matrix[15];
		return new double[] { (m12 * m23 * m31 - m13 * m22 * m31 + m13 * m21 * m32 - m11 * m23 * m32 - m12 * m21 * m33 + m11 * m22 * m33) / det,
				(m03 * m22 * m31 - m02 * m23 * m31 - m03 * m21 * m32 + m01 * m23 * m32 + m02 * m21 * m33 - m01 * m22 * m33) / det,
				(m02 * m13 * m31 - m03 * m12 * m31 + m03 * m11 * m32 - m01 * m13 * m32 - m02 * m11 * m33 + m01 * m12 * m33) / det,
				(m03 * m12 * m21 - m02 * m13 * m21 - m03 * m11 * m22 + m01 * m13 * m22 + m02 * m11 * m23 - m01 * m12 * m23) / det,
				(m13 * m22 * m30 - m12 * m23 * m30 - m13 * m20 * m32 + m10 * m23 * m32 + m12 * m20 * m33 - m10 * m22 * m33) / det,
				(m02 * m23 * m30 - m03 * m22 * m30 + m03 * m20 * m32 - m00 * m23 * m32 - m02 * m20 * m33 + m00 * m22 * m33) / det,
				(m03 * m12 * m30 - m02 * m13 * m30 - m03 * m10 * m32 + m00 * m13 * m32 + m02 * m10 * m33 - m00 * m12 * m33) / det,
				(m02 * m13 * m20 - m03 * m12 * m20 + m03 * m10 * m22 - m00 * m13 * m22 - m02 * m10 * m23 + m00 * m12 * m23) / det,
				(m11 * m23 * m30 - m13 * m21 * m30 + m13 * m20 * m31 - m10 * m23 * m31 - m11 * m20 * m33 + m10 * m21 * m33) / det,
				(m03 * m21 * m30 - m01 * m23 * m30 - m03 * m20 * m31 + m00 * m23 * m31 + m01 * m20 * m33 - m00 * m21 * m33) / det,
				(m01 * m13 * m30 - m03 * m11 * m30 + m03 * m10 * m31 - m00 * m13 * m31 - m01 * m10 * m33 + m00 * m11 * m33) / det,
				(m03 * m11 * m20 - m01 * m13 * m20 - m03 * m10 * m21 + m00 * m13 * m21 + m01 * m10 * m23 - m00 * m11 * m23) / det,
				(m12 * m21 * m30 - m11 * m22 * m30 - m12 * m20 * m31 + m10 * m22 * m31 + m11 * m20 * m32 - m10 * m21 * m32) / det,
				(m01 * m22 * m30 - m02 * m21 * m30 + m02 * m20 * m31 - m00 * m22 * m31 - m01 * m20 * m32 + m00 * m21 * m32) / det,
				(m02 * m11 * m30 - m01 * m12 * m30 - m02 * m10 * m31 + m00 * m12 * m31 + m01 * m10 * m32 - m00 * m11 * m32) / det,
				(m01 * m12 * m20 - m02 * m11 * m20 + m02 * m10 * m21 - m00 * m12 * m21 - m01 * m10 * m22 + m00 * m11 * m22) / det };
	}

	/**
	 * Turns columns into rows and rows into columns.
	 */
	public static double[] transpose(double[] m)
	{
		return new double[] { m[0], m[4], m[8], m[12], m[1], m[5], m[9], m[13], m[2], m[6], m[10], m[14], m[3], m[7], m[11], m[15] };
	}

	/**
	 * Based on: http://tog.acm.org/resources/GraphicsGems/gemsii/unmatrix.c
	 */
	public static void multiplyVectorByMatrix(double[] v, double[] m, double[] result)
	{
		double vx = v[0], vy = v[1], vz = v[2], vw = v[3];
		result[0] = vx * m[0] + vy * m[4] + vz * m[8] + vw * m[12];
		result[1] = vx * m[1] + vy * m[5] + vz * m[9] + vw * m[13];
		result[2] = vx * m[2] + vy * m[6] + vz * m[10] + vw * m[14];
		result[3] = vx * m[3] + vy * m[7] + vz * m[11] + vw * m[15];
	}

	/**
	 * From: https://code.google.com/p/webgl-mjs/source/browse/mjs.js
	 */
	public static double v3Length(double[] a)
	{
		return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
	}

	/**
	 * Based on: https://code.google.com/p/webgl-mjs/source/browse/mjs.js
	 */
	public static double[] v3Normalize(double[] vector, double norm)
	{
		double im = 1 / (isZero(norm) ? v3Length(vector) : norm);
		return new double[] { vector[0] * im, vector[1] * im, vector[2] * im };
	}

	/**
	 * The dot product of a and b, two 3-element vectors.
	 * From: https://code.google.com/p/webgl-mjs/source/browse/mjs.js
	 */
	public static double v3Dot(double[] a, double[] b)
	{
		return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	}

	/**
	 * From:
	 * http://www.opensource.apple.com/source/WebCore/WebCore-514/platform/graphics/transforms/TransformationMatrix.cpp
	 */
	public static double[] v3Combine(double[] a, double[] b, double aScale, double bScale)
	{
		return new double[] { aScale * a[0] + bScale * b[0], aScale * a[1] + bScale * b[1], aScale * a[2] + bScale * b[2] };
	}

	/**
	 * From:
	 * http://www.opensource.apple.com/source/WebCore/WebCore-514/platform/graphics/transforms/TransformationMatrix.cpp
	 */
	public static double[] v3Cross(double[] a, double[] b)
	{
		return new double[] { a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0] };
	}

	/**
	 * Based on:
	 * http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToEuler/
	 * and:
	 * http://quat.zachbennett.com/
	 *
	 * Note that this rounds degrees to the thousandth of a degree, due to
	 * floating point errors in the creation of the quaternion.
	 *
	 * Also note that this expects the qw value to be last, not first.
	 *
	 * Also, when researching this, remember that:
	 * yaw === heading === z-axis
	 * pitch === elevation/attitude === y-axis
	 * roll === bank === x-axis
	 */
	public static void quaternionToDegreesXYZ(double[] q, double[] result)
	{
		double qx = q[0], qy = q[1], qz = q[2], qw = q[3];
		double qw2 = qw * qw;
		double qx2 = qx * qx;
		double qy2 = qy * qy;
		double qz2 = qz * qz;
		double test = qx * qy + qz * qw;
		double unit = qw2 + qx2 + qy2 + qz2;
		double conv = 180 / Math.PI;

		if (test > 0.49999 * unit)
		{
			result[0] = 0;
			result[1] = 2 * Math.atan2(qx, qw) * conv;
			result[2] = 90;
			return;
		}
		if (test < -0.49999 * unit)
		{
			result[0] = 0;
			result[1] = -2 * Math.atan2(qx, qw) * conv;
			result[2] = -90;
			return;
		}

		result[0] = roundTo3Places(Math.atan2(2 * qx * qw - 2 * qy * qz, 1 - 2 * qx2 - 2 * qz2) * conv);
		result[1] = roundTo3Places(Math.atan2(2 * qy * qw - 2 * qx * qz, 1 - 2 * qy2 - 2 * qz2) * conv);
		result[2] = roundTo3Places(Math.asin(2 * qx * qy + 2 * qz * qw) * conv);
	}

	public static double roundTo3Places(double n)
	{
		return Math.round(n * 1000d) * 0.001;
	}

	public static double degreesToRadians(double degrees)
	{
		return degrees * Math.PI / 180;
	}

	public static void resetIdentityMatrix(double[] matrix)
	{
		matrix[1] = matrix[2] = matrix[3] = matrix[4] = matrix[6] = matrix[7] = matrix[8] = matrix[9] = matrix[11] = matrix[12] = matrix[13] = matrix[14] = 0;
		matrix[0] = matrix[5] = matrix[10] = matrix[15] = 1;
	}

	public static void applyPerspective(double[] m, double perspective)
	{
		m[11] = -1 / perspective;
	}

	public static void applyScaleX(double[] m, double factor)
	{
		m[0] = factor;
	}

	public static void applyScaleY(double[] m, double factor)
	{
		m[5] = factor;
	}

	public static void applyTranslate2D(double[] m, double x, double y)
	{
		m[12] = x;
		m[13] = y;
	}

	public static void applyTranslate3D(double[] m, double x, double y, double z)
	{
		m[12] = x;
		m[13] = y;
		m[14] = z;
	}

	public static void applySkewX(double[] m, double radians)
	{
		m[4] = Math.sin(radians);
		m[5] = Math.cos(radians);
	}

	public static void applySkewY(double[] m, double radians)
	{
		m[0] = Math.cos(radians);
		m[1] = Math.sin(radians);
	}

	public static void applyRotateX(double[] m, double radians)
	{
		m[5] = Math.cos(radians);
		m[6] = Math.sin(radians);
		m[9] = -Math.sin(radians);
		m[10] = Math.cos(radians);
	}

	public static void applyRotateY(double[] m, double radians)
	{
		m[0] = Math.cos(radians);
		m[2] = -Math.sin(radians);
		m[8] = Math.sin(radians);
		m[10] = Math.cos(radians);
	}

	// http://www.w3.org/TR/css3-transforms/#recomposing-to-a-2d-matrix
	public static void applyRotateZ(double[] m, double radians)
	{
		m[0] = Math.cos(radians);
		m[1] = Math.sin(radians);
		m[4] = -Math.sin(radians);
		m[5] = Math.cos(radians);
	}
}
