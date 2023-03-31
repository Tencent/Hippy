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
import { unescapeHtml } from '../src/util';

/**
 * util.ts unit test case
 */
describe('util.ts', () => {
  it('unescapeHtml should work correctly', () => {
    const rawString = '&quot;1&amp;2&#39;3&lt;4&gt;5&quot;6&amp;7&#39;8&lt;9&gt;10';
    const destString = '"1&2\'3<4>5"6&7\'8<9>10';
    const regularString = 'fdsl1234ljkljf#%$$#$#$';
    expect(unescapeHtml(rawString)).toEqual(destString);
    expect(unescapeHtml(regularString)).toEqual(regularString);
  });
});
