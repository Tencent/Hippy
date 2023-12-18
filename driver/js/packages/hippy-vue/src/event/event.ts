/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import ElementNode from '../renderer/element-node';
import { NeedToTyped } from '../types/native';


class Event {
  // event name
  public type: string;

  public value = '';

  // the object that triggered the event, the original target
  public target: ElementNode | null = null;

  // the current object that triggered the event, which is changing as the event bubbles up
  public currentTarget: ElementNode | null = null;

  public originalTarget: ElementNode | null = null;

  // whether the event can bubble, the default is true
  public bubbles = true;

  // native parameters
  public nativeParams?: NeedToTyped;

  // whether the default behavior of the event can be canceled, the default is true
  protected cancelable = true;

  // indicates which stage of event stream processing, useless for now
  protected eventPhase = 0;

  // whether the event has been canceled
  private isCanceled = false;

  public constructor(eventName: string) {
    this.type = eventName;
    this.bubbles = true;
    this.cancelable = true;
    this.eventPhase = 0;
    this.originalTarget = null;
    this.currentTarget = null;
    this.target = null;
    // Private properties
    this.isCanceled = false;
  }

  public get canceled() {
    return this.isCanceled;
  }

  public stopPropagation() {
    this.bubbles = false;
  }

  public preventDefault() {
    if (!this.cancelable) {
      return;
    }
    this.isCanceled = true;
  }

  /**
   * Old compatible.
   */
  public initEvent(eventName: string, bubbles = true, cancelable = true) {
    this.type = eventName;
    if (bubbles === false) {
      this.bubbles = false;
    }
    if (cancelable === false) {
      this.cancelable = false;
    }
    return this;
  }
}

export {
  Event,
};
