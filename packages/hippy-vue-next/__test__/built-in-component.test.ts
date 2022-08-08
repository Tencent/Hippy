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
 * built-in-component  内置组件单测用例
 */

import BuiltInComponent from '../src/built-in-component';
import { getTagComponent } from '../src/runtime/component';

/**
 * @author birdguo
 * @priority P0
 * @casetype unit
 */
describe('built-in-component', () => {
  beforeAll(() => {
    // 注册全部内置组件
    BuiltInComponent.install();
  });

  it('all of the built-in tag component should registered', async () => {
    const tagList = [
      'div',
      'button',
      'form',
      'img',
      'ul',
      'li',
      'span',
      'label',
      'p',
      'a',
      'input',
      'textarea',
      'iframe',
    ];

    tagList.forEach((tag) => {
      const component = getTagComponent(tag);
      expect(component).toBeDefined();
    });
  });
});
