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

import test from 'ava';
import translateColor from '../color-parser';

test('Test color translation', (t) => {
  t.is(translateColor('#abc'), 4289379276);
  t.is(translateColor('#abcd'), 3718953932);
  t.is(translateColor('#abcdef'), 4289449455);
  t.is(translateColor('#11223344'), 1141973555);
  t.is(translateColor('#123'), 4279312947);
  t.is(translateColor('rgb(10, 20, 30)'), 4278850590);
  t.is(translateColor('rgb(-10, 300, 30)'), 4278255390);
  t.is(translateColor('rgba(10, 20, 30, .8)'), 3423212574);
  t.is(translateColor('rgba(10, 20, 30, -.3)'), 660510);
  t.is(translateColor('rgba(10, 20, 30, 1.8)'), 4278850590);
  t.is(translateColor('hsl(100, 20%, 30%)'), 4282866749);
  t.is(translateColor('hsl(100000, 20%, 30%)'), 4283579740);
  t.is(translateColor('hsla(100, 40%, 50%, .8)'), 3429806925);
  t.is(translateColor('hsla(100, -10%, 120%, .8)'), 3439329279);
  t.is(translateColor('transparent'), 0);
  t.is(translateColor('blueviolet'), 4287245282);
  t.is(translateColor(4287245282), 3808397867);
  t.is(translateColor('var(-Bg)'), 'var(-Bg)');
});

test('Test color translation error handle NaN', (t) => {
  const err = t.throws(() => translateColor(NaN));
  t.is(err.message, 'Bad color value: NaN');
});

test('Test color translation error handle #abz', (t) => {
  const err = t.throws(() => translateColor('#abz'));
  t.is(err.message, 'Bad color value: #abz');
});

test('Test color translation error handle #abcdefz', (t) => {
  const err = t.throws(() => translateColor('#abcdefz'));
  t.is(err.message, 'Bad color value: #abcdefz');
});

test('Test color translation error handle #0 and #01', (t) => {
  const err = t.throws(() => translateColor('#0'));
  t.is(err.message, 'Bad color value: #0');
  const err2 = t.throws(() => translateColor('#01'));
  t.is(err2.message, 'Bad color value: #01');
});

test('Test color translation error handle abc', (t) => {
  const err = t.throws(() => translateColor('abc'));
  t.is(err.message, 'Bad color value: abc');
});
