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

import android.view.View;

public class HippyTag
{
  private final static String TAG_CLASS_NAME                  = "className";
  private final static String TAG_PROPS                       = "props";
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

    if (iniProps != null) {
      HippyMap propsMap = new HippyMap();
      if (iniProps.containsKey(TAG_PROPS_WILL_APPEAR)) {
        propsMap.pushString(TAG_PROPS_WILL_APPEAR, "");
      }

      if (iniProps.containsKey(TAG_PROPS_DID_APPEAR)) {
        propsMap.pushString(TAG_PROPS_DID_APPEAR, "");
      }

      if (iniProps.containsKey(TAG_PROPS_DID_DISAPPEAR)) {
        propsMap.pushString(TAG_PROPS_DID_DISAPPEAR, "");
      }

      if (propsMap.size() > 0) {
        tagMap.pushMap(TAG_PROPS, propsMap);
        tagMap.pushInt(TAG_EXPOSURE_STATE, TAG_EXPOSURE_STATE_DID_DISAPPEAR);
      }
    }
    return tagMap;
  }

  public static String getClassName(View view) {
    if (view != null) {
      Object tagObj = view.getTag();
      if (tagObj != null && tagObj instanceof HippyMap) {
        HippyMap tagMap = (HippyMap)tagObj;
        if (tagMap.containsKey(TAG_CLASS_NAME)) {
          return tagMap.getString(TAG_CLASS_NAME);
        }
      }
    }

    return null;
  }

  public static void setExposureState(View view, int state) {
    if (view != null) {
      Object tagObj = view.getTag();
      if (tagObj != null && tagObj instanceof HippyMap) {
        HippyMap tagMap = (HippyMap)tagObj;
        tagMap.pushInt(TAG_EXPOSURE_STATE, state);
        view.setTag(tagObj);
      }
    }
  }

  public static int getExposureState(View view) {
    if (view != null) {
      Object tagObj = view.getTag();
      if (tagObj != null && tagObj instanceof HippyMap) {
        HippyMap tagMap = (HippyMap)tagObj;
        if (tagMap.containsKey(TAG_EXPOSURE_STATE)) {
          return tagMap.getInt(TAG_EXPOSURE_STATE);
        }
      }
    }

    return -1;
  }

  public static boolean isContainEventOfExposure (View view, String event) {
    if (view != null) {
      Object tagObj = view.getTag();
      if (tagObj != null && tagObj instanceof HippyMap) {
        HippyMap tagMap = (HippyMap)tagObj;
        if (tagMap.containsKey(TAG_PROPS)) {
          HippyMap propsMap = tagMap.getMap(TAG_PROPS);
          return propsMap.containsKey(event);
        }
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
