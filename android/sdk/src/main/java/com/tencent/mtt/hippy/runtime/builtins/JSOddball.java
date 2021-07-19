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
package com.tencent.mtt.hippy.runtime.builtins;

@SuppressWarnings({"unused"})
public final class JSOddball extends JSValue {

  @Override
  public final Object dump() {
    return null;
  }

  @Override
  @SuppressWarnings("all") // "CloneDoesntCallSuperClone" not recognized
  protected Object clone() {
    return this;
  }

  public enum kindType {
    Hole,
    Undefined,
    Null
  }

  public static final JSOddball Hole = new JSOddball(kindType.Hole);
  public static final JSOddball Undefined = new JSOddball(kindType.Undefined);
  public static final JSOddball Null = new JSOddball(kindType.Null);

  private final kindType kind;

  private JSOddball(kindType kind) {
    this.kind = kind;
  }

  public final boolean isUndefined() {
    return kind == kindType.Undefined;
  }

  public final boolean isNull() {
    return kind == kindType.Null;
  }

  public final boolean isHole() {
    return kind == kindType.Hole;
  }
}
