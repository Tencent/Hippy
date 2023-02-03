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

import React from 'react';
import {
  Text,
} from '@hippy/react';

export default function TextNestCase() {
  return (
    <Text numberOfLines={3}>
      <Text numberOfLines={3} style={[{ color: '#4c9afa' }]}>#SpiderMan#</Text>
      <Text numberOfLines={3}>
        Hello world, I am a spider man and I have five friends in other universe.
      </Text>
  </Text>);
}

