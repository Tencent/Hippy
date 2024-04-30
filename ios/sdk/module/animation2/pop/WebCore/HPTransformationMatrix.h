/*!
 * iOS SDK
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * Copyright (C) 2005, 2006 Apple Computer, Inc.  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE COMPUTER, INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE COMPUTER, INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

#ifndef TransformationMatrix_h
#define TransformationMatrix_h

#include <string.h> //for memcpy

#include <CoreGraphics/CGAffineTransform.h>

#include <QuartzCore/QuartzCore.h>

namespace HPWebCore {

  class TransformationMatrix {
  public:

    typedef double Matrix4[4][4];

    TransformationMatrix() { makeIdentity(); }
    TransformationMatrix(const TransformationMatrix& t) { *this = t; }
    TransformationMatrix(double a, double b, double c, double d, double e, double f) { setMatrix(a, b, c, d, e, f); }
    TransformationMatrix(double m11, double m12, double m13, double m14,
                         double m21, double m22, double m23, double m24,
                         double m31, double m32, double m33, double m34,
                         double m41, double m42, double m43, double m44)
    {
      setMatrix(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44);
    }

    void setMatrix(double a, double b, double c, double d, double e, double f)
    {
      m_matrix[0][0] = a; m_matrix[0][1] = b; m_matrix[0][2] = 0; m_matrix[0][3] = 0;
      m_matrix[1][0] = c; m_matrix[1][1] = d; m_matrix[1][2] = 0; m_matrix[1][3] = 0;
      m_matrix[2][0] = 0; m_matrix[2][1] = 0; m_matrix[2][2] = 1; m_matrix[2][3] = 0;
      m_matrix[3][0] = e; m_matrix[3][1] = f; m_matrix[3][2] = 0; m_matrix[3][3] = 1;
    }

    void setMatrix(double m11, double m12, double m13, double m14,
                   double m21, double m22, double m23, double m24,
                   double m31, double m32, double m33, double m34,
                   double m41, double m42, double m43, double m44)
    {
      m_matrix[0][0] = m11; m_matrix[0][1] = m12; m_matrix[0][2] = m13; m_matrix[0][3] = m14;
      m_matrix[1][0] = m21; m_matrix[1][1] = m22; m_matrix[1][2] = m23; m_matrix[1][3] = m24;
      m_matrix[2][0] = m31; m_matrix[2][1] = m32; m_matrix[2][2] = m33; m_matrix[2][3] = m34;
      m_matrix[3][0] = m41; m_matrix[3][1] = m42; m_matrix[3][2] = m43; m_matrix[3][3] = m44;
    }

    TransformationMatrix& operator =(const TransformationMatrix &t)
    {
      setMatrix(t.m_matrix);
      return *this;
    }

    TransformationMatrix& makeIdentity()
    {
      setMatrix(1, 0, 0, 0,  0, 1, 0, 0,  0, 0, 1, 0,  0, 0, 0, 1);
      return *this;
    }

    bool isIdentity() const
    {
      return m_matrix[0][0] == 1 && m_matrix[0][1] == 0 && m_matrix[0][2] == 0 && m_matrix[0][3] == 0 &&
      m_matrix[1][0] == 0 && m_matrix[1][1] == 1 && m_matrix[1][2] == 0 && m_matrix[1][3] == 0 &&
      m_matrix[2][0] == 0 && m_matrix[2][1] == 0 && m_matrix[2][2] == 1 && m_matrix[2][3] == 0 &&
      m_matrix[3][0] == 0 && m_matrix[3][1] == 0 && m_matrix[3][2] == 0 && m_matrix[3][3] == 1;
    }

    // This form preserves the double math from input to output
    void map(double x, double y, double& x2, double& y2) const { multVecMatrix(x, y, x2, y2); }

    double m11() const { return m_matrix[0][0]; }
    void setM11(double f) { m_matrix[0][0] = f; }
    double m12() const { return m_matrix[0][1]; }
    void setM12(double f) { m_matrix[0][1] = f; }
    double m13() const { return m_matrix[0][2]; }
    void setM13(double f) { m_matrix[0][2] = f; }
    double m14() const { return m_matrix[0][3]; }
    void setM14(double f) { m_matrix[0][3] = f; }
    double m21() const { return m_matrix[1][0]; }
    void setM21(double f) { m_matrix[1][0] = f; }
    double m22() const { return m_matrix[1][1]; }
    void setM22(double f) { m_matrix[1][1] = f; }
    double m23() const { return m_matrix[1][2]; }
    void setM23(double f) { m_matrix[1][2] = f; }
    double m24() const { return m_matrix[1][3]; }
    void setM24(double f) { m_matrix[1][3] = f; }
    double m31() const { return m_matrix[2][0]; }
    void setM31(double f) { m_matrix[2][0] = f; }
    double m32() const { return m_matrix[2][1]; }
    void setM32(double f) { m_matrix[2][1] = f; }
    double m33() const { return m_matrix[2][2]; }
    void setM33(double f) { m_matrix[2][2] = f; }
    double m34() const { return m_matrix[2][3]; }
    void setM34(double f) { m_matrix[2][3] = f; }
    double m41() const { return m_matrix[3][0]; }
    void setM41(double f) { m_matrix[3][0] = f; }
    double m42() const { return m_matrix[3][1]; }
    void setM42(double f) { m_matrix[3][1] = f; }
    double m43() const { return m_matrix[3][2]; }
    void setM43(double f) { m_matrix[3][2] = f; }
    double m44() const { return m_matrix[3][3]; }
    void setM44(double f) { m_matrix[3][3] = f; }

    double a() const { return m_matrix[0][0]; }
    void setA(double a) { m_matrix[0][0] = a; }

    double b() const { return m_matrix[0][1]; }
    void setB(double b) { m_matrix[0][1] = b; }

    double c() const { return m_matrix[1][0]; }
    void setC(double c) { m_matrix[1][0] = c; }

    double d() const { return m_matrix[1][1]; }
    void setD(double d) { m_matrix[1][1] = d; }

    double e() const { return m_matrix[3][0]; }
    void setE(double e) { m_matrix[3][0] = e; }

    double f() const { return m_matrix[3][1]; }
    void setF(double f) { m_matrix[3][1] = f; }

    // this = this * mat
    TransformationMatrix& multiply(const TransformationMatrix&);

    TransformationMatrix& scale(double);
    TransformationMatrix& scaleNonUniform(double sx, double sy);
    TransformationMatrix& scale3d(double sx, double sy, double sz);

    TransformationMatrix& rotate(double d) { return rotate3d(0, 0, d); }
    TransformationMatrix& rotateFromVector(double x, double y);
    TransformationMatrix& rotate3d(double rx, double ry, double rz);

    // The vector (x,y,z) is normalized if it's not already. A vector of
    // (0,0,0) uses a vector of (0,0,1).
    TransformationMatrix& rotate3d(double x, double y, double z, double angle);

    TransformationMatrix& translate(double tx, double ty);
    TransformationMatrix& translate3d(double tx, double ty, double tz);

    // translation added with a post-multiply
    TransformationMatrix& translateRight(double tx, double ty);
    TransformationMatrix& translateRight3d(double tx, double ty, double tz);

    TransformationMatrix& flipX();
    TransformationMatrix& flipY();
    TransformationMatrix& skew(double angleX, double angleY);
    TransformationMatrix& skewX(double angle) { return skew(angle, 0); }
    TransformationMatrix& skewY(double angle) { return skew(0, angle); }

    TransformationMatrix& applyPerspective(double p);
    bool hasPerspective() const { return m_matrix[2][3] != 0.0f; }

    bool isInvertible() const;

    // This method returns the identity matrix if it is not invertible.
    // Use isInvertible() before calling this if you need to know.
    TransformationMatrix inverse() const;

    // decompose the matrix into its component parts
    typedef struct {
      double scaleX, scaleY, scaleZ;
      double skewXY, skewXZ, skewYZ;
      double rotateX, rotateY, rotateZ;
      double quaternionX, quaternionY, quaternionZ, quaternionW;
      double translateX, translateY, translateZ;
      double perspectiveX, perspectiveY, perspectiveZ, perspectiveW;
    } DecomposedType;
    
    bool decompose(DecomposedType& decomp) const;
    void recompose(const DecomposedType& decomp, bool useEulerAngle = false);

    void blend(const TransformationMatrix& from, double progress);

    bool isAffine() const
    {
      return (m13() == 0 && m14() == 0 && m23() == 0 && m24() == 0 &&
              m31() == 0 && m32() == 0 && m33() == 1 && m34() == 0 && m43() == 0 && m44() == 1);
    }

    // Throw away the non-affine parts of the matrix (lossy!)
    void makeAffine();

    bool operator==(const TransformationMatrix& m2) const
    {
      return (m_matrix[0][0] == m2.m_matrix[0][0] &&
              m_matrix[0][1] == m2.m_matrix[0][1] &&
              m_matrix[0][2] == m2.m_matrix[0][2] &&
              m_matrix[0][3] == m2.m_matrix[0][3] &&
              m_matrix[1][0] == m2.m_matrix[1][0] &&
              m_matrix[1][1] == m2.m_matrix[1][1] &&
              m_matrix[1][2] == m2.m_matrix[1][2] &&
              m_matrix[1][3] == m2.m_matrix[1][3] &&
              m_matrix[2][0] == m2.m_matrix[2][0] &&
              m_matrix[2][1] == m2.m_matrix[2][1] &&
              m_matrix[2][2] == m2.m_matrix[2][2] &&
              m_matrix[2][3] == m2.m_matrix[2][3] &&
              m_matrix[3][0] == m2.m_matrix[3][0] &&
              m_matrix[3][1] == m2.m_matrix[3][1] &&
              m_matrix[3][2] == m2.m_matrix[3][2] &&
              m_matrix[3][3] == m2.m_matrix[3][3]);
    }

    bool operator!=(const TransformationMatrix& other) const { return !(*this == other); }

    // *this = *this * t (i.e., a multRight)
    TransformationMatrix& operator*=(const TransformationMatrix& t)
    {
      return multiply(t);
    }

    // result = *this * t (i.e., a multRight)
    TransformationMatrix operator*(const TransformationMatrix& t)
    {
      TransformationMatrix result = *this;
      result.multiply(t);
      return result;
    }

    CATransform3D transform3d () const;
    CGAffineTransform affineTransform () const;

    TransformationMatrix(const CATransform3D&);
    operator CATransform3D() const;

    TransformationMatrix(const CGAffineTransform&);
    operator CGAffineTransform() const;

  private:

    // multiply passed 2D point by matrix (assume z=0)
    void multVecMatrix(double x, double y, double& dstX, double& dstY) const;

    // multiply passed 3D point by matrix
    void multVecMatrix(double x, double y, double z, double& dstX, double& dstY, double& dstZ) const;

    void setMatrix(const Matrix4 m)
    {
      if (m && m != m_matrix)
        memcpy(m_matrix, m, sizeof(Matrix4));
    }

    bool isIdentityOrTranslation() const
    {
      return m_matrix[0][0] == 1 && m_matrix[0][1] == 0 && m_matrix[0][2] == 0 && m_matrix[0][3] == 0 &&
      m_matrix[1][0] == 0 && m_matrix[1][1] == 1 && m_matrix[1][2] == 0 && m_matrix[1][3] == 0 &&
      m_matrix[2][0] == 0 && m_matrix[2][1] == 0 && m_matrix[2][2] == 1 && m_matrix[2][3] == 0 &&
      m_matrix[3][3] == 1;
    }

    Matrix4 m_matrix;
  };

} // namespace HPWebCore

#endif // TransformationMatrix_h
