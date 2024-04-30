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

import os from 'os';

const numCPUs = os.cpus().length;

export default {
  verbose: true,
  modules: false,
  cache: false,
  concurrency: numCPUs,
  failWithoutAssertions: true,
  tap: false,
  babel: false,
  extensions: false,
  compileEnhancements: false,
  nonSemVerExperiments: {
    tryAssertion: true,
  },
  files: [
    'packages/**/__tests__/*.test.js',
  ],
  require: [
    'esm', // Use ES modules in NodeJS.
    'module-alias/register', // Use _moduleDirectories defined package.json
    './scripts/flow-remove-types', // Remove flow definition from Vue.
    './scripts/mock-global', // Define the global
  ],
};
