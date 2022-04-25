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

declare namespace ProtocolTdf {
  namespace TDFInspector {
    interface INodeBoundsStyleString {
      left?: string;
      top?: string;
      right?: string;
      bottom?: string;
      width?: string;
      height?: string;
      borderLeftWidth?: string;
      borderRightWidth?: string;
      borderTopWidth?: string;
      borderBottomWidth?: string;
      boxSizing?: string;
    }
    interface INodeBoundsStyle {
      left: number;
      right: number;
      top: number;
      bottom: number;
      borderLeftWidth?: number;
      borderRightWidth?: number;
      borderTopWidth?: number;
      borderBottomWidth?: number;
      paddingBottom?: number;
      boxSizing?: string;
    }
    interface RatioOption {
      rootWidth: number;
      rootHeight: number;
      imgWidth: number;
      imgHeight: number;
    }
    interface Point {
      x: number;
      y: number;
    }
  }
}
