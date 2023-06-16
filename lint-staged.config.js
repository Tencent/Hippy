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

// eslint-disable-next-line import/no-extraneous-dependencies
const micromatch = require('micromatch');
module.exports = (allFiles) => {
  const codeFiles = micromatch(allFiles, ['**/packages/**/*.{js,ts,tsx,vue}', '**/examples/hippy-react-demo/**/*.{js,ts,jsx}', '**/examples/hippy-vue-demo/**/*.{js,ts,vue}', '**/examples/hippy-vue--next-demo/**/*.{js,ts,vue}', '**/scripts/**/*.js', '**/core/js/**/*.js']);
  console.log('js codeFiles lint match length', codeFiles.length);
  return [`eslint --fix ${codeFiles.join(' ')}`];
};
