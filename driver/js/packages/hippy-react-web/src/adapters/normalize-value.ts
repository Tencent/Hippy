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

import unitlessNumbers from './unitless-numbers';

const units = {
  rotateZ: 'deg',
};

function normalizeValue(property: string, value: string | number | Element, valueType?: string) {
  let finalValue = value;
  if (valueType && typeof value === 'number') {
    finalValue = `${value}${valueType}`;
  } else if (!(unitlessNumbers as any)[property] && typeof value === 'number') {
    finalValue = (units as any)[property] ? `${value}${(units as any)[property]}` : `${value}px`;
  }
  return finalValue;
}

export default normalizeValue;
