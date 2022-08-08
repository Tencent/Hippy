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
import type { NeedToTyped } from '../config';
import { Native } from '../runtime/native';
import { getHippyCachedInstance } from './instance';

/**
 * Convert the rem value in the style value according to the screen width
 *
 * @param styleValue - style
 */
export function parseRemStyle(styleValue: NeedToTyped): NeedToTyped {
  let value = styleValue;

  // If it is a non-rem style, return directly without processing
  if (typeof value !== 'string' || !value.endsWith('rem')) {
    return value;
  }

  // get the numeric value of rem
  value = parseFloat(value);

  // If the value is invalid, return the original value
  if (Number.isNaN(value)) {
    return value;
  }

  // base screen width
  const { ratioBaseWidth } = getHippyCachedInstance();
  // calculate ratio
  const { width } = Native.dimensions.screen;
  const ratio = width / ratioBaseWidth;

  return value * 100 * ratio;
}
