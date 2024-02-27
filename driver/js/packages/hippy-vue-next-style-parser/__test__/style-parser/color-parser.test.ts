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

import { translateColor } from '../../src/style-parser/color-parser';

/**
 * style-parser/color-parser.ts unit test case
 */
describe('style-parser/color-parser.ts', () => {
  it('color translation', () => {
    expect(translateColor('#abc')).toEqual(4289379276);
    expect(translateColor('#abcd')).toEqual(3718953932);
    expect(translateColor('#abcdef')).toEqual(4289449455);
    expect(translateColor('#11223344')).toEqual(1141973555);
    expect(translateColor('#123')).toEqual(4279312947);
    expect(translateColor('rgb(10, 20, 30)')).toEqual(4278850590);
    expect(translateColor('rgb(-10, 300, 30)')).toEqual(4278255390);
    expect(translateColor('rgba(10, 20, 30, .8)')).toEqual(3423212574);
    expect(translateColor('rgba(10, 20, 30, -.3)')).toEqual(660510);
    expect(translateColor('rgba(10, 20, 30, 1.8)')).toEqual(4278850590);
    expect(translateColor('hsl(100, 20%, 30%)')).toEqual(4282866749);
    expect(translateColor('hsl(100000, 20%, 30%)')).toEqual(4283579740);
    expect(translateColor('hsla(100, 40%, 50%, .8)')).toEqual(3429806925);
    expect(translateColor('hsla(100, -10%, 120%, .8)')).toEqual(3439329279);
    expect(translateColor('transparent')).toEqual(0);
    expect(translateColor('blueviolet')).toEqual(4287245282);
    expect(translateColor(4287245282)).toEqual(3808397867);
    expect(translateColor('var(-Bg)')).toEqual('var(-Bg)');
  });

  it('color translation error handle NaN', () => {
    expect(() => translateColor(NaN)).toThrow('Bad color value: NaN');
  });

  it('color translation error handle #abz', () => {
    expect(() => translateColor('#abz')).toThrow('Bad color value: #abz');
  });

  it('color translation error handle #abcdefz', () => {
    expect(() => translateColor('#abcdefz')).toThrow('Bad color value: #abcdefz');
  });

  it('color translation error handle #0 and #01', () => {
    expect(() => translateColor('#0')).toThrow('Bad color value: #0');
    expect(() => translateColor('#01')).toThrow('Bad color value: #01');
  });

  it('color translation error handle abc', () => {
    expect(() => translateColor('abc')).toThrow('Bad color value: abc');
  });
});
