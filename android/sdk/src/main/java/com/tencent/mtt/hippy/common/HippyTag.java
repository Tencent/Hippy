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
package com.tencent.mtt.hippy.common;

import android.text.TextUtils;
import android.view.View;

public class HippyTag
{
  private final static String TAG_CLASS_NAME                  = "className";
  public final static String TAG_PROPS_WILL_APPEAR            = "onWillAppear";
  public final static String TAG_PROPS_DID_APPEAR             = "onDidAppear";
  public final static String TAG_PROPS_DID_DISAPPEAR          = "onDidDisappear";
  private final static String TAG_EXPOSURE_STATE              = "exposureState";
  public final static int TAG_EXPOSURE_STATE_WILL_APPEAR      = 0;
  public final static int TAG_EXPOSURE_STATE_DID_APPEAR       = 1;
  public final static int TAG_EXPOSURE_STATE_DID_DISAPPEAR    = 2;

  public static HippyMap createTagMap(String className, HippyMap iniProps) {
    HippyMap tagMap = new HippyMap();
    tagMap.pushString(TAG_CLASS_NAME, className);

    if (iniProps != null && iniProps.size() > 0) {
      if (iniProps.containsKey(TAG_PROPS_WILL_APPEAR)) {
        tagMap.pushString(TAG_PROPS_WILL_APPEAR, "");
      }

      if (iniProps.containsKey(TAG_PROPS_DID_APPEAR)) {
        tagMap.pushString(TAG_PROPS_DID_APPEAR, "");
      }

      if (iniProps.containsKey(TAG_PROPS_DID_DISAPPEAR)) {
        tagMap.pushString(TAG_PROPS_DID_DISAPPEAR, "");
      }
    }

    return tagMap;
  }

  private static int getIntValue(View view, String key) {
    if (view != null && key != null) {
      Object tagObj = view.getTag();
      if (tagObj != null && tagObj instanceof HippyMap) {
        HippyMap tagMap = (HippyMap)tagObj;
        if (tagMap.containsKey(key)) {
          return tagMap.getInt(key);
        }
      }
    }

    return -1;
  }

  private static void setIntValue(View view, String key, int value) {
    if (view != null && key != null) {
      Object tagObj = view.getTag();
      if (tagObj != null && tagObj instanceof HippyMap) {
        HippyMap tagMap = (HippyMap)tagObj;
        tagMap.pushInt(key, value);
      }
    }
  }

  private static String getStringValue(View view, String key) {
    if (view != null && key != null) {
      Object tagObj = view.getTag();
      if (tagObj != null && tagObj instanceof HippyMap) {
        HippyMap tagMap = (HippyMap)tagObj;
        if (tagMap.containsKey(key)) {
          return tagMap.getString(key);
        }
      }
    }

    return null;
  }

  private static void setStringValue(View view, String key, String value) {
    if (view != null && key != null) {
      Object tagObj = view.getTag();
      if (tagObj != null && tagObj instanceof HippyMap) {
        HippyMap tagMap = (HippyMap)tagObj;
        tagMap.pushString(key, (value == null ? "" : value));
      }
    }
  }

  public static String getClassName(View view) {
    return getStringValue(view, TAG_CLASS_NAME);
  }

  public static void setExposureState(View view, int state) {
    setIntValue(view, TAG_EXPOSURE_STATE, state);
  }

  public static int getExposureState(View view) {
    return getIntValue(view, TAG_EXPOSURE_STATE);
  }

  public static boolean isContainTheSpecKey(View view, String key) {
    if (view != null && key != null) {
      Object tagObj = view.getTag();
      if (tagObj != null && tagObj instanceof HippyMap) {
        HippyMap tagMap = (HippyMap)tagObj;
        return tagMap.containsKey(key);
      }
    }

    return false;
  }

  public static boolean jsJustLayout(HippyMap props) {
    if (props != null && (props.containsKey(TAG_PROPS_WILL_APPEAR)
      || props.containsKey(TAG_PROPS_DID_APPEAR) || props.containsKey(TAG_PROPS_DID_DISAPPEAR))) {
      return false;
    }

    return true;
  }
}
