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

public class HippyTag
{
  public static String TAG_CLASS_NAME                   = "className";
  public static String TAG_PROPS                        = "props";
  public static String TAG_PROPS_WILL_APPEAR            = "willAppear";
  public static String TAG_PROPS_DID_APPEAR             = "didAppear";
  public static String TAG_PROPS_DID_DISAPPEAR          = "didDisappear";

  public static HippyMap getTagMap(String className, HippyMap iniProps) {
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

      tagMap.pushMap(TAG_PROPS, propsMap);
    }
    return tagMap;
  }

  public static String getClassName(Object tagObj) {
    if (tagObj != null && tagObj instanceof HippyMap) {
      HippyMap tagMap = (HippyMap)tagObj;
      if (tagMap.containsKey(TAG_CLASS_NAME)) {
        return tagMap.getString(TAG_CLASS_NAME);
      }
    }

    return null;
  }
}
