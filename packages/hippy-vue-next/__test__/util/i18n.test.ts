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

import * as i18n from '../../src/util/i18n';
import { Native } from '../../src/runtime/native';

/**
 * i18n.ts unit test case
 */
describe('src/util/i18n', () => {
  it('isRTL should return right value', () => {
    let isRtl = i18n.isRTL();
    expect(isRtl).toBeFalsy();

    // set Native localization
    Native.Localization.direction = 1;
    isRtl = i18n.isRTL();
    expect(isRtl).toBeTruthy();
  });
});
