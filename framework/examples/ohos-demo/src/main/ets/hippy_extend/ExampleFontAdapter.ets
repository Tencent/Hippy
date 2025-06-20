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
import { HippyFontAdapter } from 'hippy'

export class ExampleFontAdapter implements HippyFontAdapter {

  // 注册字体路径至hippy测量函数
  getCustomFontPathMap(): Map<string, string> | null {
    let map = new Map<string, string>();

    // 情况一：注册非rawfile目录自定义字体
    const fontFile = `${getContext().resourceDir}/fonts/TTTGB.otf`;
    map.set("TTTGB", fontFile);

    // 情况二：注册rawfile目录自定义字体
    // const fontFile = `${getContext().tempDir}/fonts/TTTGB.otf`;
    // map.set("TTTGB", fontFile);

    return map;
  }

}
