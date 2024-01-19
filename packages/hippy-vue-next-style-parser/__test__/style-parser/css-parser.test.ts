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

import { convertToDegree, DEGREE_UNIT, parseBackgroundImage, parseCSS } from '../../src/style-parser/css-parser';

/**
 * style-parser/css-parser.ts unit test case
 */
describe('style-parser/css-parser.ts', () => {
  it('convertToDegree should work correctly', () => {
    expect(convertToDegree('0deg', DEGREE_UNIT.DEG)).toEqual('0deg');
    expect(convertToDegree('90deg', DEGREE_UNIT.DEG)).toEqual('90deg');
    expect(convertToDegree('-180deg', DEGREE_UNIT.DEG)).toEqual('-180deg');
    expect(convertToDegree('1.234deg', DEGREE_UNIT.DEG)).toEqual('1.23');
    expect(convertToDegree('0rad', DEGREE_UNIT.RAD)).toEqual('0.00');
    expect(convertToDegree('1rad', DEGREE_UNIT.RAD)).toEqual('57.30');
    expect(convertToDegree('6rad', DEGREE_UNIT.RAD)).toEqual('343.77');
    expect(convertToDegree('0turn', DEGREE_UNIT.TURN)).toEqual('0.00');
    expect(convertToDegree('0.5turn', DEGREE_UNIT.TURN)).toEqual('180.00');
    expect(convertToDegree('1.2turn', DEGREE_UNIT.TURN)).toEqual('432.00');
  });

  it('parseBackgroundImage should work correctly', () => {
    const linearGradient = ['linearGradient', {
      angle: '30', colorStopList: [
        { color: 4278190335, ratio: 0.1 },
        { color: 4294967040, ratio: 0.4 },
        { color: 4294901760, ratio: 0.5 },
      ],
    }];
    expect(parseBackgroundImage('backgroundImage', 'linear-gradient(30deg, blue 10%, yellow 40%, red 50%)')).toEqual(linearGradient);
    const urlBgImg = ['backgroundImage', 'https://mat1.gtimg.com/www/qq2018/imgs/qq_logo_2018x2.png'];
    expect(parseBackgroundImage('backgroundImage', 'url(\'https://mat1.gtimg.com/www/qq2018/imgs/qq_logo_2018x2.png\')')).toEqual(urlBgImg);
    const url = ['backgroundImage', 'https://mat1.gtimg.com/www/qq2018/imgs/qq_logo_2018x2.png'];
    expect(parseBackgroundImage('backgroundImage', 'https://mat1.gtimg.com/www/qq2018/imgs/qq_logo_2018x2.png')).toEqual(url);
  });

  it('parseCSS should work correctly', () => {
    const cssString = `
      #root {
        flex: 1;
        background-color: white;
        display: flex;
        flex-direction: column;
      }
      #header {
        height: 60px;
        background-color: #40b883;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding-horizontal: 10px;
      }
      #root .left-title {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        box-shadow-opacity: 0.6;
        box-shadow-radius: 5;
        box-shadow-spread: 1; /* spread attr is only supported on iOS */
        box-shadow-offset: 10px 10px;
      }
      #root #back-btn {
        height: 20px;
        width: 24px;
        margin-top: 18px;
        margin-bottom: 18px;
        transform: rotate(30deg) scale(0.5);
      }
      .title {
        font-size: 0.4rem;
        line-height: 60px;
        margin-left: 5px;
        margin-right: 10px;
        font-weight: bold;
        background-color: #40b883;
        color: #ffffff;
      }
      #root .body-container {
        flex: 1;
        collapsable: false;
        background-image: url('https://test.com/test.jpg');
      }`;
    const parsedCss = parseCSS(cssString);
    const [root, header, leftTitle, backBtn, title, bodyContainer] = parsedCss.stylesheet.rules;
    expect(root.selectors).toEqual(['#root']);
    expect(root.declarations.length).toEqual(4);
    expect(header.selectors).toEqual(['#header']);
    expect(header.declarations.length).toEqual(7);
    expect(leftTitle.selectors).toEqual(['#root .left-title']);
    expect(leftTitle.declarations.length).toEqual(9);
    expect(backBtn.selectors).toEqual(['#root #back-btn']);
    expect(backBtn.declarations.length).toEqual(5);
    expect(title.selectors).toEqual(['.title']);
    expect(title.declarations.length).toEqual(7);
    expect(bodyContainer.selectors).toEqual(['#root .body-container']);
    expect(bodyContainer.declarations.length).toEqual(3);
  });
});
