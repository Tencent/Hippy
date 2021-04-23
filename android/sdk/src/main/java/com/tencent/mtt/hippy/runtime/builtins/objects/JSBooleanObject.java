/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2021 THL A29 Limited, a Tencent company. All rights reserved.
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
package com.tencent.mtt.hippy.runtime.builtins.objects;

public class JSBooleanObject extends JSPrimitiveWrapper<Boolean> {
  public static final JSBooleanObject True = new JSBooleanObject(true);
  public static final JSBooleanObject False = new JSBooleanObject(false);

  private JSBooleanObject(boolean value) {
    super(value);
  }

  public final boolean isTrue() {
    return getValue();
  }

  public final boolean isFalse() {
    return !getValue();
  }

  @Override
  @SuppressWarnings("all") // "CloneDoesntCallSuperClone" not recognized
  public final JSBooleanObject clone() {
    return this;
  }
}
