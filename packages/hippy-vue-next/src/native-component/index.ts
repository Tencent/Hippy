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

import type { App } from '@vue/runtime-core';

import { registerAnimation } from './animation';
import { registerDialog } from './dialog';
import { registerPull } from './pulls';
import { registerSwiper } from './swiper';
import { registerUlRefresh } from './ul-refresh';
import { registerWaterfall } from './waterfall';

/**
 * install native components uniformly
 */
export default {
  // install as a plugin for vue
  install(vueApp: App): void {
    registerAnimation(vueApp);
    registerDialog();
    registerPull(vueApp);
    registerUlRefresh(vueApp);
    registerWaterfall(vueApp);
    registerSwiper(vueApp);
  },
};
