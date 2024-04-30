/* !
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2023 THL A29 Limited, a Tencent company.
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

/* eslint-disable */
// // @ts-ignore
declare var global: HippyTypes.HippyGlobal & typeof globalThis;

declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Global extends HippyTypes.HippyGlobal {};
  }
};

declare namespace HippyTypes {
  export interface FlexStyle {
    aspectRatio?: number | string;
  }
  export interface ViewStyle extends FlexStyle, BoxShadowStyle, BorderBoxStyle, TransformsStyle, BackgroundStyle {
    pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto';
  }
  export interface TransformsStyle {
    transform?: Transform[];
  }
  export interface TextStyle {
    textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  }
}