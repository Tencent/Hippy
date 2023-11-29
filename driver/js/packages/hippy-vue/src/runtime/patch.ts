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

// @ts-expect-error TS(2307): Cannot find module 'core/vdom/patch' or its corres... Remove this comment to see the full error message
import { createPatchFunction } from 'core/vdom/patch';
// @ts-expect-error TS(2307): Cannot find module 'core/vdom/modules/index' or it... Remove this comment to see the full error message
import baseModules from 'core/vdom/modules/index';
import platformModules from './modules/index';
import * as nodeOps from './node-ops';

const modules = platformModules.concat(baseModules);
const patch = createPatchFunction({
  nodeOps,
  modules,
});

export {
  patch,
};
