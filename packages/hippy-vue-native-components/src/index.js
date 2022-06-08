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

import AnimationComponent from './animation';
import DialogComponent from './dialog';
import ListRefreshComponent from './ul-refresh';
import SwiperComponent from './swiper';
import PullsComponents from './pulls';
import WaterfallComponent from './waterfall';

/**
 * Register all of native components
 */
const HippyVueNativeComponents = {
  install(Vue) {
    AnimationComponent(Vue);
    DialogComponent(Vue);
    ListRefreshComponent(Vue);
    SwiperComponent(Vue);
    PullsComponents(Vue);
    WaterfallComponent(Vue);
  },
};

export default HippyVueNativeComponents;
// Export specific component for TreeSharking.
export {
  AnimationComponent,
  DialogComponent,
  ListRefreshComponent,
  SwiperComponent,
  PullsComponents,
  WaterfallComponent,
};
