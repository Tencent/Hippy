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
  View,
  Text,
} from '@hippy/react';

export default function TextEllipsizeModeCase() {
  return (<View style={{ width: 150 }}>
    <View  style={{ height: 20 }}>
      <Text style={[{ color: '#de4040', fontSize: 16 }]} ellipsizeMode={'ellipsis'}>
        Text is very long, use style with ellipsis, need show diff
      </Text>
    </View>
    <View  style={{ height: 20 }}>
      <Text style={[{ color: '#de4040', fontSize: 16 }]} ellipsizeMode={'clip'}>
        Text is very long, use style with clip, need show diff clip
      </Text>
    </View>
  </View>);
}

