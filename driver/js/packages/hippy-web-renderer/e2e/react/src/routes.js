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

import * as components from './spec';
const routes = [
];
function getKebabCase2(str) {
  let temp = str.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
  if (temp.slice(0, 1) === '-') {
    temp = temp.slice(1);
  }
  return temp;
}
(function () {
  Object.keys(components).forEach((key) => {
    routes.push({
      path: `/${getKebabCase2(key)}`,
      name: `/${getKebabCase2(key)}`,
      component: components[key],
    });
  });
}());
export default routes;
