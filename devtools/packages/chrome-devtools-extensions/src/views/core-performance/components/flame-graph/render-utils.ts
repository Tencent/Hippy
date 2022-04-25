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

import { BAR_HEIGHT, BAR_X_GUTTER, BAR_Y_GUTTER, PX_PER_MS } from './constants';
import FlameGraph from './index';

export type StateForLayout = {
  center: number;
  zoom: number;
  viewportWidth: number;
};

export type Layout = {
  width: number;
  height: number;
  x: number;
  y: number;
  isInView: boolean;
};

export function getRandomColor() {
  // 0.4, 0.5, 0.6 is used to adjust the randomness of color
  return [
    Math.floor((1 - Math.random() * 0.4) * 256),
    Math.floor((1 - Math.random() * 0.5) * 256),
    Math.floor((1 - Math.random() * 0.6) * 256),
  ];
}

export function getLayout(state: StateForLayout, renderTrace: FlameGraph.RenderTrace, startY: number): Layout {
  const { center, zoom, viewportWidth } = state;
  const { measure, stackIndex } = renderTrace;
  const width = Math.max((measure.duration || 0) * PX_PER_MS * zoom - BAR_X_GUTTER, 1);
  const height = BAR_HEIGHT;
  const x = ((measure.startTime || 0) - center) * PX_PER_MS * zoom + viewportWidth / 2;
  const y = stackIndex * (BAR_HEIGHT + BAR_Y_GUTTER) + startY;

  return {
    width,
    height,
    x,
    y,
    isInView: !(x + width < 0 || viewportWidth < x),
  };
}

export function isIntersectingWithPoint(
  rectangle: { x: number; y: number; width: number; height: number },
  point: { x: number; y: number },
) {
  const { x, y, width, height } = rectangle;
  const { x: pointX, y: pointY } = point;
  return !(pointX < x || x + width < pointX || pointY < y || y + height < pointY);
}
