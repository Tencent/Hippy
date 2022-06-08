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

// @ts-nocheck
import bezierEasing from 'bezier-easing';
import { warn } from '../utils';

const CUBIC_BEZIER_PATTERN = /^cubic-bezier\(([^,]*),([^,]*),([^,]*),([^,]*)\)$/;

export function tryMakeCubicBezierEasing(timingFunction: string): bezierEasing.EasingFunction | null {
  const matches = CUBIC_BEZIER_PATTERN.exec(timingFunction.trim());
  if (!matches) return null;
  try {
    const params = matches.slice(1, 5).map(parseFloat) as [number, number, number, number];
    return bezierEasing(...params);
  } catch (e) {
    warn(`Invalid cubic-bezier timingFunction: ${timingFunction}`);
    return null;
  }
}
