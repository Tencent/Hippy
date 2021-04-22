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

public final class StackTrace implements Cloneable {
  private StackFrame[] frames;

  public StackTrace(StackFrame[] frames) {
    this.frames = frames;
  }

  public StackFrame getFrame(int index) {
    return frames[index];
  }

  public StackFrame[] getFrames() {
    return frames;
  }

  public int getFrameCount() {
   return frames.length;
  }

  @Override
  public StackTrace clone() throws CloneNotSupportedException {
    StackTrace clonedObject = (StackTrace) super.clone();
    StackFrame[] newFrames = new StackFrame[frames.length];
    for (int i = 0; i < frames.length; i ++) {
      newFrames[i] = frames[i].clone();
    }
    clonedObject.frames = newFrames;
    return clonedObject;
  }

  @Override
  public String toString() {
    StringBuilder stringBuilder = new StringBuilder();
    for (StackFrame frame: frames) {
      stringBuilder.append("at ");
      stringBuilder.append(frame.getFunctionName());
      stringBuilder.append(" (");
      stringBuilder.append(frame.getScriptNameOrSourceURL());
      stringBuilder.append(":");
      stringBuilder.append(frame.getLineNumber());
      stringBuilder.append(":");
      stringBuilder.append(frame.getColumn());
      stringBuilder.append("\n");
    }
    int lastLFPosition = stringBuilder.length() - 1;
    if (lastLFPosition >= 0) {
      stringBuilder.deleteCharAt(lastLFPosition);
    }
    return stringBuilder.toString();
  }
}
