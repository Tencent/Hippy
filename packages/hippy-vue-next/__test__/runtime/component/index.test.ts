/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2022 THL A29 Limited, a Tencent company.
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
 * runtime/component/index.ts hippyNative组件注册模块
 */
import type { TagComponent } from '../../../src/runtime/component';
import * as index from '../../../src/runtime/component';

/**
 * @author birdguo
 * @priority P0
 * @casetype unit
 */
describe('runtime/component/index.ts', () => {
  it('getTagComponent should return undefined when no register', async () => {
    expect(index.getTagComponent('swiper')).toEqual(undefined);
  });

  it('getTagComponent should return right component when registered', async () => {
    const swiper: TagComponent = {
      // Native实际渲染的组件的类型，如View，TextView等
      name: 'Swiper',
      // 额外事件处理方法，如果存在的话，事件相应时需要调用
      // processEventData: () => {},
      // 事件Map，比如我们Dom的touchStart，在native这边实际是onTouchDown事件
      eventNamesMap: new Map().set('click', 'onClick'),
      // 组件默认都需要加上的样式
      defaultNativeStyle: {},
      // 组件默认都需要加上的props
      defaultNativeProps: {},
      // Native节点的属性，优先级最高
      nativeProps: {},
      // 属性Map，对属性做map处理
      attributeMaps: {},
    };

    index.registerHippyTag('swiper', swiper);
    expect(index.getTagComponent('swiper')).toEqual(swiper);
  });
});
