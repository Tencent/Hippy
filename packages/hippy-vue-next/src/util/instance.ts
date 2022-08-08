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

import type { ComponentPublicInstance, App } from '@vue/runtime-core';
import type { NeedToTyped } from '../config';

/**
 * @public
 *
 * cache initialization parameters passed by native, instance
 */
export interface HippyCachedInstanceType {
  // root container id
  rootContainer?: string;
  // id of root view returned by native
  rootViewId: number;
  // initialization parameters passed by native
  superProps: NeedToTyped;
  // Vue app instance
  app: App;
  // ComponentPublicInstance after mounted
  instance?: ComponentPublicInstance;
  // base screen width
  ratioBaseWidth: number;
}

// cache of hippy instance
let hippyCachedInstance: HippyCachedInstanceType;

/**
 * get cache of hippy instance
 */
export function getHippyCachedInstance(): HippyCachedInstanceType {
  return hippyCachedInstance;
}

/**
 * set cache of hippy instance
 *
 * @param instance - hippy app instance
 */
export function setHippyCachedInstance(instance: HippyCachedInstanceType): void {
  hippyCachedInstance = instance;
}

/**
 * set cache of hippy instance by key
 *
 * @param key - key of hippy app
 * @param value - value
 */
export function setHippyCachedInstanceParams<
  K extends keyof HippyCachedInstanceType,
>(key: K, value: HippyCachedInstanceType[K]): void {
  hippyCachedInstance[key] = value;
}
