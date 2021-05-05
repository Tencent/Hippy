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
public final class JSException implements Cloneable {
  public enum ErrorLevel {
    Log,
    Debug,
    Info,
    Error,
    Warning,
    All
  }

  private final String message;
  private final ErrorLevel errorLevel;
  private final int startPosition;
  private final int endPosition;
  private final int startColumn;
  private final int endColumn;
  private final int wasmFunctionIndex;
  private final boolean sharedCrossOrigin;
  private final boolean opaque;
  private StackTrace stack;

  public JSException(String message, ErrorLevel errorLevel, StackTrace stack, int startPosition, int endPosition, int startColumn, int endColumn, int wasmFunctionIndex, boolean sharedCrossOrigin, boolean opaque) {
    this.message = message;
    this.errorLevel = errorLevel;
    this.stack = stack;
    this.startPosition = startPosition;
    this.endPosition = endPosition;
    this.startColumn = startColumn;
    this.endColumn = endColumn;
    this.wasmFunctionIndex = wasmFunctionIndex;
    this.sharedCrossOrigin = sharedCrossOrigin;
    this.opaque = opaque;
  }

  public String getMessage() {
    return message;
  }

  public ErrorLevel getErrorLevel() {
    return errorLevel;
  }

  public StackTrace getStack() {
    return stack;
  }

  public int getStartPosition() {
    return startPosition;
  }

  public int getEndPosition() {
    return endPosition;
  }

  public int getStartColumn() {
    return startColumn;
  }

  public int getEndColumn() {
    return endColumn;
  }

  public int getWasmFunctionIndex() {
    return wasmFunctionIndex;
  }

  public boolean isSharedCrossOrigin() {
    return sharedCrossOrigin;
  }

  public boolean isOpaque() {
    return opaque;
  }

  @Override
  public String toString() {
    return message + "\n" + stack.toString();
  }

  @Override
  protected JSException clone() throws CloneNotSupportedException {
    JSException clonedObject = (JSException) super.clone();
    clonedObject.stack = stack.clone();
    return clonedObject;
  }
}
