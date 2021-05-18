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

import android.support.annotation.NonNull;

import java.util.regex.Pattern;

@SuppressWarnings({"unused"})
public class JSRegExp extends JSObject {

  // region JS RegExp Flags
  public static final int JS_GLOBAL = 1; // kGlobal - NOT supported in Java
  public static final int JS_IGNORE_CASE = 2; // kIgnoreCase
  public static final int JS_MULTILINE = 4; // kMultiline
  public static final int JS_STICKY = 8; // // kSticky - NOT supported in Java
  public static final int JS_UNICODE = 16; // kUnicode - always enable in Android
  public static final int JS_DOTALL = 32; // kDotAll
  // endregion

  // region object name
  private static final String SOURCE_NAME = "source";
  private static final String FLAGS_NAME = "flags";
  // endregion

  private Pattern pattern;

  public JSRegExp(String regex, int flags) {
    set(SOURCE_NAME, regex);
    set(FLAGS_NAME, flags);
  }

  public JSRegExp(Pattern pattern) {
    this.pattern = pattern;
    set(SOURCE_NAME, pattern.pattern());
    set(FLAGS_NAME, patternFlagsToJS(pattern.flags()));
  }

  // region flag convert
  public static int patternFlagsToJS(int flags) {
    int jsFlags = 0;

    if ((flags & Pattern.CASE_INSENSITIVE) == 0) {
      jsFlags |= JS_IGNORE_CASE;
    }
    if ((flags & Pattern.MULTILINE) != 0) {
      jsFlags |= Pattern.MULTILINE;
    }
    if ((flags & Pattern.DOTALL) != 0) {
      jsFlags |= Pattern.DOTALL;
    }

    return jsFlags;
  }

  public static int jsFlagsToPattern(int flags) {
    int patternFlags = 0;

    if ((flags & JS_IGNORE_CASE) == 0) {
      patternFlags |= Pattern.CASE_INSENSITIVE;
    }
    if ((flags & JS_MULTILINE) != 0) {
      patternFlags |= Pattern.MULTILINE;
    }
    if ((flags & JS_DOTALL) != 0) {
      patternFlags |= Pattern.DOTALL;
    }

    return patternFlags;
  }
  // endregion

  public String getSource() {
    return (String) get(SOURCE_NAME);
  }

  public int getFlags() {
    return (int) get(FLAGS_NAME);
  }

  public Pattern compile() {
    if (pattern == null) {
      pattern = Pattern.compile(getSource(), jsFlagsToPattern(getFlags()));
    }
    return pattern;
  }

  @NonNull
  @Override
  public JSRegExp clone() throws CloneNotSupportedException {
    JSRegExp clonedObject = (JSRegExp) super.clone();
    if (clonedObject.pattern != null) {
      clonedObject.pattern = Pattern.compile(pattern.pattern(), pattern.flags());
    }
    return clonedObject;
  }
}
