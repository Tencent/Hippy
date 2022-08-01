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

/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

let performanceNow;

if (typeof performance !== 'undefined' && typeof performance.now !== 'undefined') {
  performanceNow = () => performance.now();
} else {
  performanceNow = () => Date.now();
}

const JSTimersExecution = {
  GUID: 1,
  immediates: [],
  timerIDs: [],
  types: [],
  callbacks: [],
  errors: [],
  identifiers: [],
  callImmediatesPass() {
    if (JSTimersExecution.immediates.length > 0) {
      const passImmediates = JSTimersExecution.immediates.slice();
      JSTimersExecution.immediates = [];

      passImmediates.forEach((immediate) => {
        JSTimersExecution.callTimer(immediate);
      });
    }

    return JSTimersExecution.immediates.length > 0;
  },
  callImmediates() {
    while (JSTimersExecution.callImmediatesPass()) {
      // repeat call callImmediatesPass, until return false
    }
  },
  callTimer(timerID) {
    const timerIndex = JSTimersExecution.timerIDs.indexOf(timerID);
    if (timerIndex === -1) {
      return;
    }

    const type = JSTimersExecution.types[timerIndex];
    const callback = JSTimersExecution.callbacks[timerIndex];
    if (!callback || !type) {
      console.error(`No callback found for timerID ${timerID}`); // eslint-disable-line
      return;
    }

    if (type === 'requestAnimationFrame') {
      JSTimersExecution._clearIndex(timerIndex);
    }

    try {
      if (type === 'requestAnimationFrame') {
        callback(performanceNow());
      } else {
        console.error(`Tried to call a callback with invalid type: ${type}`); // eslint-disable-line
      }
    } catch (e) {
      if (!JSTimersExecution.errors) {
        JSTimersExecution.errors = [e];
      } else {
        JSTimersExecution.errors.push(e);
      }
    }
  },
  _clearIndex(i) {
    JSTimersExecution.timerIDs[i] = null;
    JSTimersExecution.callbacks[i] = null;
    JSTimersExecution.types[i] = null;
    JSTimersExecution.identifiers[i] = null;
  },
};

exports.JSTimersExecution = JSTimersExecution;
