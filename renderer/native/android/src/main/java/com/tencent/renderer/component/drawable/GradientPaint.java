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

package com.tencent.renderer.component.drawable;

import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.PointF;
import android.graphics.RectF;
import android.graphics.Shader;
import android.text.TextUtils;
import androidx.annotation.NonNull;
import com.tencent.mtt.hippy.utils.LogUtils;
import java.util.List;

public class GradientPaint extends Paint {
    private static final String TAG = "GradientPaint";
    @NonNull
    private String mGradientAngleDesc = "";
    private int mGradientAngle = Integer.MAX_VALUE;
    private int[] mGradientColors;
    private float[] mGradientPositions;
    private final RectF mRect = new RectF();
    private boolean mUpdateRequired = false;

    public void setGradientAngleDesc(@NonNull String angleDesc) {
        mGradientAngleDesc = angleDesc;
        mUpdateRequired = true;
    }

    public void setGradientColors(@NonNull List<Integer> colors) {
        int size = colors.size();
        if (size > 0) {
            mGradientColors = new int[size];
            for (int i = 0; i < size; i++) {
                mGradientColors[i] = colors.get(i);
            }
        } else {
            mGradientColors = null;
        }
        mUpdateRequired = true;
    }

    public void setGradientPositions(@NonNull List<Float> positions) {
        int size = positions.size();
        if (size > 0) {
            int lastPos = 0;
            float lastValue = 0.0f;
            mGradientPositions = new float[size];
            for (int i = 0; i < size; i++) {
                float value = positions.get(i);
                if (i == 0) {
                    mGradientPositions[i] = value;
                    lastValue = value;
                    continue;
                }
                if (value <= 0.0f && lastPos < i) {
                    continue;
                }
                if (value > 0.0f && lastPos < (i - 1)) {
                    float average = (value - lastValue) / (i - lastPos);
                    for (int j = (lastPos + 1); j < i; j++) {
                        mGradientPositions[j] = lastValue + average * (j - lastPos);
                    }
                }
                lastPos = i;
                lastValue = value;
                mGradientPositions[i] = value;
            }
        } else {
            mGradientPositions = null;
        }
        mUpdateRequired = true;
    }

    private int getOppositeAngle() {
        double radian = Math.atan(mRect.width() / mRect.height());
        double degree = Math.toDegrees(radian);
        return (int) Math.round(degree);
    }

    private boolean checkSpecialAngle(PointF start, PointF end) {
        switch (mGradientAngle) {
            case 0:
                end.x = mRect.centerX();
                end.y = mRect.top;
                start.x = mRect.centerX();
                start.y = mRect.bottom;
                break;
            case 90:
                end.x = mRect.right;
                end.y = mRect.centerY();
                start.x = mRect.left;
                start.y = mRect.centerY();
                break;
            case 180:
                end.x = mRect.centerX();
                end.y = mRect.bottom;
                start.x = mRect.centerX();
                start.y = mRect.top;
                break;
            case 270:
                end.x = mRect.left;
                end.y = mRect.centerY();
                start.x = mRect.right;
                start.y = mRect.centerY();
                break;
            default:
                return false;
        }
        return true;
    }

    private void correctPointWithOriginDegree(PointF start, PointF end) {
        if (mGradientAngle > 90 && mGradientAngle < 180) {
            start.y = mRect.bottom - start.y;
            end.y = mRect.bottom - end.y;
        } else if (mGradientAngle > 180 && mGradientAngle < 270) {
            PointF tempPoint = new PointF(start.x, start.y);
            start.x = end.x;
            start.y = end.y;
            end.x = tempPoint.x;
            end.y = tempPoint.y;
        } else if (mGradientAngle > 270 && mGradientAngle < 360) {
            end.x = mRect.left + (mRect.right - end.x);
            start.x = mRect.right - start.x;
        }
    }

    private void calculateStartEndPoint(PointF start, PointF end, int oppositeDegree) {
        if (checkSpecialAngle(start, end)) {
            return;
        }
        int tempDegree = mGradientAngle % 90;
        if ((mGradientAngle > 90 && mGradientAngle < 180) || (mGradientAngle > 270
                && mGradientAngle < 360)) {
            tempDegree = 90 - tempDegree;
        }
        if (tempDegree == oppositeDegree) {
            end.x = mRect.right;
            end.y = mRect.top;
            start.x = mRect.left;
            start.y = mRect.bottom;
        } else if (tempDegree < oppositeDegree) {
            float xl = (float) (Math.tan(Math.toRadians(tempDegree)) * mRect.height() / 2);
            end.x = mRect.centerX() + xl;
            end.y = mRect.top;
            start.x = mRect.centerX() - xl;
            start.y = mRect.bottom;
        } else {
            float yl = (float) (Math.tan(Math.toRadians(90 - tempDegree)) * mRect.width() / 2);
            end.x = mRect.right;
            end.y = mRect.centerY() - yl;
            start.x = mRect.left;
            start.y = mRect.centerY() + yl;
        }
        correctPointWithOriginDegree(start, end);
    }

    private void calculateGradientAngle(int oppositeDegree) {
        switch (mGradientAngleDesc) {
            case "totopright":
                mGradientAngle = (90 - oppositeDegree);
                break;
            case "tobottomright":
                mGradientAngle = (90 + oppositeDegree);
                break;
            case "tobottomleft":
                mGradientAngle = 270 - oppositeDegree;
                break;
            case "totopleft":
                mGradientAngle = 270 + oppositeDegree;
                break;
            default:
                try {
                    float fa = Float.parseFloat(mGradientAngleDesc);
                    mGradientAngle = Math.round(fa) % 360;
                } catch (NumberFormatException e) {
                    LogUtils.w(TAG, "Angel desc parse to number failed: " + e.getMessage());
                }
        }
    }

    protected boolean initialize(RectF rect) {
        if (!mUpdateRequired && mRect.equals(rect)) {
            return true;
        }
        mRect.set(rect);
        if (TextUtils.isEmpty(mGradientAngleDesc)) {
            return false;
        }
        int oppositeDegree = getOppositeAngle();
        calculateGradientAngle(oppositeDegree);
        if (mGradientAngle == Integer.MAX_VALUE || mGradientColors == null
                || mGradientColors.length < 2) {
            return false;
        }
        if (mGradientPositions != null && mGradientColors.length != mGradientPositions.length) {
            mGradientPositions = null;
        }
        setStyle(Paint.Style.FILL);
        PointF start = new PointF();
        PointF end = new PointF();
        calculateStartEndPoint(start, end, oppositeDegree);
        try {
            LinearGradient linearGradient = new LinearGradient(start.x, start.y, end.x, end.y,
                    mGradientColors, mGradientPositions, Shader.TileMode.CLAMP);
            setShader(linearGradient);
        } catch (IllegalArgumentException e) {
            LogUtils.w(TAG, "Initialize gradient paint failed: " + e.getMessage());
            return false;
        }
        mUpdateRequired = false;
        return true;
    }
}
