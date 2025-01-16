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
import { HippyFontScaleAdapter } from './HippyFontScaleAdapter';

export class DefaultFontScaleAdapter implements HippyFontScaleAdapter {
  public getFontScale(): number {
    return 1;
  }

  public getEmoticonText(text: string, fontSize: number): string {
    return text;
  }

  public getCustomFontFilePath(fontFamilyName: string, style: number): string {
    return "";
  }

  public getCustomTypeface(fontFamily: string, style: number): FontStyle {
    return FontStyle.Normal;
  }
}
