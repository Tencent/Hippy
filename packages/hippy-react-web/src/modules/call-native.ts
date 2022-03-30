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

import { isFunc } from '../utils/validation';
import { error } from '../utils';

let module = {};
const callNative = (moduleName: string, fName: string, param: string) => {
  if (module[moduleName]) {
    if (isFunc(module[moduleName][fName])) {
      module[moduleName][fName](param);
    } else {
      error(`${moduleName}.${fName} is not a function`);
    }
  } else {
    error(`can not find module ${moduleName}`);
  }
};
callNative.init = (moduleMap: any) => {
  module = moduleMap;
};

export default callNative;
