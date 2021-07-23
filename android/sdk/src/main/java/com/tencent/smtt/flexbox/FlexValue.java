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
package com.tencent.smtt.flexbox;

@SuppressWarnings("unused")
public class FlexValue {

  public enum Unit {
    UNDEFINED,
    POINT,
    PERCENT,
    AUTO;

    public static Unit fromInt(int value) {
      switch (value) {
        case 0:
          return UNDEFINED;
        case 1:
          return POINT;
        case 2:
          return PERCENT;
        case 3:
          return AUTO;
        default:
          throw new IllegalArgumentException("Unknown enum value: " + value);
      }
    }
  }

  public final float value;
  public final Unit unit;

  public FlexValue(float value, Unit unit) {
    this.value = value;
    this.unit = unit;
  }


  FlexValue(float value, int unit) {
    this(value, Unit.fromInt(unit));
  }

  float value() {
    return value;
  }
}
