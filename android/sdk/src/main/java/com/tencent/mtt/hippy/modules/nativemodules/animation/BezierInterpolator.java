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
package com.tencent.mtt.hippy.modules.nativemodules.animation;

import android.graphics.Path;
import android.graphics.PathMeasure;
import android.view.animation.Interpolator;

class BezierInterpolator implements Interpolator {

  private static final float PRECISION = 0.002f;

  private float[] mX; // x coordinates in the line

  private float[] mY; // y coordinates in the line

  @SuppressWarnings("unused")
  public BezierInterpolator(float controlX1, float controlY1, float controlX2, float controlY2) {
    initCubic(controlX1, controlY1, controlX2, controlY2);
  }

  private void initCubic(float x1, float y1, float x2, float y2) {

    Path path = new Path();
    path.moveTo(0, 0);
    path.cubicTo(x1, y1, x2, y2, 1f, 1f);
    initPath(path);
  }

  private void initPath(Path path) {
    final PathMeasure pathMeasure = new PathMeasure(path, false /* forceClosed */);

    final float pathLength = pathMeasure.getLength();
    final int numPoints = (int) (pathLength / PRECISION) + 1;

    mX = new float[numPoints];
    mY = new float[numPoints];

    final float[] position = new float[2];
    for (int i = 0; i < numPoints; ++i) {
      final float distance = (i * pathLength) / (numPoints - 1);
      pathMeasure.getPosTan(distance, position, null /* tangent */);

      mX[i] = position[0];
      mY[i] = position[1];
    }
  }

  @Override
  public float getInterpolation(float t) {
    if (t <= 0.0f) {
      return 0.0f;
    } else if (t >= 1.0f) {
      return 1.0f;
    }

    int startIndex = 0;
    int endIndex = mX.length - 1;
    while (endIndex - startIndex > 1) {
      int midIndex = (startIndex + endIndex) / 2;
      if (t < mX[midIndex]) {
        endIndex = midIndex;
      } else {
        startIndex = midIndex;
      }
    }

    final float xRange = mX[endIndex] - mX[startIndex];
    if (xRange == 0) {
      return mY[startIndex];
    }

    final float tInRange = t - mX[startIndex];
    final float fraction = tInRange / xRange;

    final float startY = mY[startIndex];
    final float endY = mY[endIndex];

    return startY + (fraction * (endY - startY));
  }
}
