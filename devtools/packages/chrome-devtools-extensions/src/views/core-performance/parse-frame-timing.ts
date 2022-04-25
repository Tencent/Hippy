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

import { preciseRound } from '@chrome-devtools-extensions/utils/number';

// 1ms = 1000000ns
const frameTimeMultiple = 1000000;
const precise = 3;

const toInt = (x) => Math.round(x);

const getFPS = (endTime: number, beginTime: number): number => {
  const dur = (endTime - beginTime) / frameTimeMultiple / 1000;
  return dur ? parseInt(String(1 / dur), 10) : 0;
};

export const parseFrameTimingData = (json: Performance.FrameTimingsMSG, startTime: number, endTime: number) => {
  const { frameTimings } = json;
  const uiRes: number[][] = [];
  const rasterRes: number[][] = [];
  let maxXAxis = 0;
  if (!Array.isArray(frameTimings)) {
    return {
      ui: uiRes,
      raster: rasterRes,
      maxXAxis,
    };
  }

  let uiPreBegin: number;
  let rasterPreBegin: number;

  if (!startTime) startTime = parseFloat(preciseRound(frameTimings[0].ui.e / frameTimeMultiple, precise));

  frameTimings.forEach((item, index) => {
    const { ui, raster } = item;
    const uiFps = getFPS(ui.e, ui.b);
    const rasterFps = getFPS(raster.e, raster.b);

    const uiBegin = ui.b / frameTimeMultiple;
    const uiEnd = ui.e / frameTimeMultiple;
    const rasterBegin = raster.b / frameTimeMultiple;
    const rasterEnd = raster.e / frameTimeMultiple;

    /**
     * no render if collection data is none, FPS is considered as 0
     */
    if (uiPreBegin) {
      uiRes.push([toInt(uiPreBegin + 1 - startTime), 0]);
      uiRes.push([toInt(uiBegin - 1 - startTime), 0]);
    }
    if (rasterPreBegin) {
      rasterRes.push([toInt(rasterPreBegin + 1 - startTime), 0]);
      rasterRes.push([toInt(rasterBegin - 1 - startTime), 0]);
    }
    uiRes.push([toInt(uiBegin - startTime), uiFps]);
    uiRes.push([toInt(uiEnd - startTime), uiFps]);

    rasterRes.push([toInt(rasterBegin - startTime), rasterFps]);
    rasterRes.push([toInt(rasterEnd - startTime), rasterFps]);

    uiPreBegin = uiBegin;
    rasterPreBegin = uiEnd;

    if (index === frameTimings.length - 1) {
      maxXAxis = toInt(rasterEnd - startTime);
    }
  });
  if (endTime) maxXAxis = toInt(endTime - startTime);

  return {
    ui: uiRes,
    raster: rasterRes,
    maxXAxis,
  };
};
