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
import type { NeedToTyped } from '@hippy-shared/index';
import { Native } from '../runtime/native';
import { getHippyCachedInstance } from './instance';

/**
 * 根据屏幕宽度对样式值中的rem值进行转换处理
 *
 * @param styleValue - 待处理的样式值
 */
export function parseRemStyle(styleValue: NeedToTyped): NeedToTyped {
  let value = styleValue;

  // 如果是非 rem 的样式，直接返回，不处理
  if (typeof value !== 'string' || !value.endsWith('rem')) {
    return value;
  }

  // 取出 rem 的数字值
  value = parseFloat(value);

  // 值不合法则返回原值
  if (Number.isNaN(value)) {
    return value;
  }

  // 设计稿基准宽度
  const { ratioBaseWidth } = getHippyCachedInstance();
  // 计算屏幕尺寸和设计稿的比例值
  const { width } = Native.dimensions.screen;
  const ratio = width / ratioBaseWidth;

  // rem处理后的值
  return value * 100 * ratio;
}
