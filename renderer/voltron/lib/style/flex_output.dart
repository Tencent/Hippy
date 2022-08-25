//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2019 THL A29 Limited, a Tencent company.
// All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

class FlexOutput {
  static int makeMeasureResult(double width, double height) {
    var w = width is double ? (width > 0 ? width : 0.0) : 0.0;
    var h = height is double ? (height > 0 ? height : 0.0) : 0.0;
    return makeInt(w.toInt(), h.toInt());
  }

  static int makeInt(int width, int height) {
    return width << 32 | height;
  }

  static int getWidth(int measureOutput) {
    return (0xFFFFFFFF & (measureOutput >> 32));
  }

  static int getHeight(int measureOutput) {
    return (0xFFFFFFFF & measureOutput);
  }
}
