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

import Animation from '../modules/animation';
import View from '../components/view';
import Text from '../components/text';
import Image from '../components/image';

interface TimingConfig {
  toValue: number;
  duration: number;
  easing?: 'linear' | 'ease' | 'in' | 'ease-in' | 'out' | 'ease-out' | 'inOut' | 'ease-in-out' | 'cubic-bezier';
}

class Animated {
  static View = View;

  static Text = Text;

  static Image = Image;

  static Value(val: any) {
    return val;
  }

  static timing(value: number, config: TimingConfig) {
    return new Animation({
      mode: 'timing',
      delay: 0,
      startValue: value,
      toValue: config.toValue,
      duration: config.duration,
      timingFunction: config.easing || 'linear',
    });
  }

  Value = Animated.Value;
}

export default Animated;
