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
import type { AnimationStyle } from '../../../native-component/animation';

interface CreateAnimationSetOptions {
  repeatCount: number;
  children: AnimationStyle[];
}

export interface AnimationModule {
  createAnimation: (
    flag: boolean,
    mode: string,
    fullOption: Record<string, NeedToTyped>,
  ) => number;
  startAnimation: (animationId: number) => void;
  createAnimationSet: (
    flag: boolean,
    options: CreateAnimationSetOptions,
  ) => number;
  resumeAnimation: (animationId: number) => void;
  pauseAnimation: (animationId: number) => void;
  destroyAnimation: (animationId: number) => void;
}
