/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

/**
 * Hippy event bus, methods such as on off emit in Vue3 have been removed, and the event bus is implemented here
 */

import type { NeedToTyped } from '@hippy-shared/index';
import { TinyEmitter } from 'tiny-emitter';

const emitter = new TinyEmitter();

/**
 * use emitter to achieve event bus
 *
 * @public
 */
export const EventBus: {
  $on: (...arg: NeedToTyped) => void;
  $off: (...arg: NeedToTyped) => void;
  $once: (...arg: NeedToTyped) => void;
  $emit: (...arg: NeedToTyped) => void;
} = {
  $on: (...args: NeedToTyped[]) => emitter.on(args[0], args[1], args[2]),
  $off: (...args: NeedToTyped[]) => emitter.off(args[0], args[1]),
  $once: (...args: NeedToTyped[]) => emitter.once(args[0], args[1], args[2]),
  $emit: (...args: NeedToTyped[]) => emitter.emit(args[0], ...args.slice(1)),
};
