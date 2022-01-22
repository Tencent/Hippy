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

/* eslint-disable no-underscore-dangle */

class Event {
  constructor(eventName) {
    this.type = eventName;
    this.bubbles = true;
    this.cancelable = true;
    this.eventPhase = false;
    this.timeStamp = Date.now();
    // TODO: Should point to VDOM element.
    this.originalTarget = null;
    this.currentTarget = null;
    this.target = null;
    // Private properties
    this._canceled = false;
  }

  get canceled() {
    return this._canceled;
  }

  stopPropagation() {
    this.bubbles = false;
  }

  preventDefault() {
    if (!this.cancelable) {
      return;
    }
    this._canceled = true;
  }

  /**
   * Old fashioned compatible.
   */
  initEvent(eventName, bubbles = true, cancelable = true) {
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
