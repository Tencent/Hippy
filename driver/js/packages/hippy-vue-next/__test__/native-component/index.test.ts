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
 * native-component/index unit test
 */
import * as NativeComponent from '../../src/native-component/index';

/**
 * @author birdguo
 * @priority P0
 * @casetype unit
 */
describe('native-component/index.ts', () => {
  it('isNativeTag should work correctly', () => {
    const nativeTags = [
      'animation', 'dialog', 'pull-header', 'pull-footer', 'swiper', 'swiper-slider',
      'waterfall', 'ul-refresh-wrapper', 'ul-refresh',
    ];
    const nonNativeTags = ['div'];
    for (const tag of nativeTags) {
      expect(NativeComponent.isNativeTag(tag)).toBeTruthy();
    }
    for (const tag of nonNativeTags) {
      expect(NativeComponent.isNativeTag(tag)).toBeFalsy();
    }
  });
});
