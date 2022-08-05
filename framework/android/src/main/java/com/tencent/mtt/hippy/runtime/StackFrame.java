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
package com.tencent.mtt.hippy.runtime;

@SuppressWarnings({"unused"})
public final class StackFrame implements Cloneable {

  private final int lineNumber;
  private final int column;
  private final int scriptId;
  private final String scriptNameOrUrl;
  private final String functionName;
  private final boolean eval;
  private final boolean constructor;
  private final boolean wasm;
  private final boolean userJavascript;

  public StackFrame(int lineNumber, int column, int scriptId, String scriptNameOrUrl,
      String functionName, boolean eval, boolean constructor, boolean wasm,
      boolean userJavascript) {
    this.lineNumber = lineNumber;
    this.column = column;
    this.scriptId = scriptId;
    this.scriptNameOrUrl = scriptNameOrUrl;
    this.functionName = functionName;
    this.eval = eval;
    this.constructor = constructor;
    this.wasm = wasm;
    this.userJavascript = userJavascript;
  }

  public int getLineNumber() {
    return lineNumber;
  }

  public int getColumn() {
    return column;
  }

  public int getScriptId() {
    return scriptId;
  }

  public String getScriptNameOrSourceURL() {
    return scriptNameOrUrl;
  }

  public String getFunctionName() {
    return functionName;
  }

  public boolean isConstructor() {
    return constructor;
  }

  public boolean isEval() {
    return eval;
  }

  public boolean isWasm() {
    return wasm;
  }

  public boolean isUserJavascript() {
    return userJavascript;
  }

  @Override
  public StackFrame clone() throws CloneNotSupportedException {
    return (StackFrame) super.clone();
  }
}
