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
package com.tencent.mtt.hippy.dom.flex;

import java.util.Arrays;

@SuppressWarnings("unused")
public class FlexSpacing {

  public static final int LEFT = 0;

  public static final int TOP = 1;

  public static final int RIGHT = 2;

  public static final int BOTTOM = 3;

  public static final int START = 4;

  public static final int END = 5;

  public static final int HORIZONTAL = 6;

  public static final int VERTICAL = 7;

  public static final int ALL = 8;

  private static final int[] sFlagsMap = {
      1, /*LEFT*/
      2, /*TOP*/
      4, /*RIGHT*/
      8, /*BOTTOM*/
      16, /*START*/
      32, /*END*/
      64, /*HORIZONTAL*/
      128, /*VERTICAL*/
      256, /*ALL*/
  };

  private final float[] mSpacing = newFullSpacingArray();
  private int mValueFlags = 0;
  private final float mDefaultValue;
  private boolean mHasAliasesSet;

  public FlexSpacing() {
    this(0);
  }

  public FlexSpacing(float defaultValue) {
    mDefaultValue = defaultValue;
  }


  public boolean set(int spacingType, float value) {
    if (!FloatUtil.floatsEqual(mSpacing[spacingType], value)) {
      mSpacing[spacingType] = value;

      if (FlexConstants.isUndefined(value)) {
        mValueFlags &= ~sFlagsMap[spacingType];
      } else {
        mValueFlags |= sFlagsMap[spacingType];
      }

      mHasAliasesSet =
          (mValueFlags & sFlagsMap[ALL]) != 0 ||
              (mValueFlags & sFlagsMap[VERTICAL]) != 0 ||
              (mValueFlags & sFlagsMap[HORIZONTAL]) != 0;

      return true;
    }

    return false;
  }

  public float get(int spacingType) {
    float defaultValue = (spacingType == START || spacingType == END
        ? FlexConstants.UNDEFINED
        : mDefaultValue);

    if (mValueFlags == 0) {
      return defaultValue;
    }

    if ((mValueFlags & sFlagsMap[spacingType]) != 0) {
      return mSpacing[spacingType];
    }

    if (mHasAliasesSet) {
      int secondType = spacingType == TOP || spacingType == BOTTOM ? VERTICAL : HORIZONTAL;
      if ((mValueFlags & sFlagsMap[secondType]) != 0) {
        return mSpacing[secondType];
      } else if ((mValueFlags & sFlagsMap[ALL]) != 0) {
        return mSpacing[ALL];
      }
    }

    return defaultValue;
  }


  public float getRaw(int spacingType) {
    return mSpacing[spacingType];
  }


  public void reset() {
    Arrays.fill(mSpacing, FlexConstants.UNDEFINED);
    mHasAliasesSet = false;
    mValueFlags = 0;
  }


  float getWithFallback(int spacingType, int fallbackType) {
    return
        (mValueFlags & sFlagsMap[spacingType]) != 0
            ? mSpacing[spacingType]
            : get(fallbackType);
  }

  private static float[] newFullSpacingArray() {
    return new float[]{
        FlexConstants.UNDEFINED,
        FlexConstants.UNDEFINED,
        FlexConstants.UNDEFINED,
        FlexConstants.UNDEFINED,
        FlexConstants.UNDEFINED,
        FlexConstants.UNDEFINED,
        FlexConstants.UNDEFINED,
        FlexConstants.UNDEFINED,
        FlexConstants.UNDEFINED,
    };
  }
}
