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

import Style from '@localTypes/style';
import { Device } from '../native';

const ratio = Device.window.scale;
/* eslint-disable-next-line import/no-mutable-exports */
let HAIRLINE_WIDTH = Math.round(0.4 * ratio) / ratio;
if (HAIRLINE_WIDTH === 0) {
  HAIRLINE_WIDTH = 1 / ratio;
}

interface StyleObj {
  [key: string]: Style;
}

/**
 * Create new Stylesheet
 * @param {object} styleObj - The style object
 */
function create(styleObj: StyleObj): StyleObj {
  // TODO: validate the style key and value.
  // TODO: Convert the color and pixel unit at create.
  return styleObj;
}


export {
  HAIRLINE_WIDTH as hairlineWidth,
  create,
};
