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

/** 定义Hippy Instance 缓存的格式 */
import type { ComponentPublicInstance, App } from '@vue/runtime-core';
import type { NeedToTyped } from '@hippy-shared/index';

/**
 * @public
 *
 * Hippy 缓存实例的类型接口
 */
export interface HippyCachedInstanceType {
  // 业务方传入的root container id，通常是root
  rootContainer?: string;
  // Native初始化的root view的id
  rootViewId: number;
  // 项目初始化参数，由终端传入，类型未定
  superProps: NeedToTyped;
  // 保存当前所使用的Vue app 实例
  app: App;
  // 保存Vue app实例mount之后得到的ComponentPublicInstance
  instance?: ComponentPublicInstance;
  // 设计稿基准宽度
  ratioBaseWidth: number;
}

// 缓存hippy instance实例
let hippyCachedInstance: HippyCachedInstanceType;

/**
 * 获取保存的hippy实例
 */
export function getHippyCachedInstance(): HippyCachedInstanceType {
  return hippyCachedInstance;
}

/**
 * 缓存hippy实例
 *
 * @param instance - hippy app 实例
 */
export function setHippyCachedInstance(instance: HippyCachedInstanceType): void {
  hippyCachedInstance = instance;
}

/**
 * 缓存hippy实例的某个key，key的类型是string，value
 * 是HippyCachedInstance的类型之一
 *
 * @param key - hippy app 缓存实例的key
 * @param value - 缓存的值
 */
export function setHippyCachedInstanceParams<
  K extends keyof HippyCachedInstanceType,
>(key: K, value: HippyCachedInstanceType[K]): void {
  hippyCachedInstance[key] = value;
}
