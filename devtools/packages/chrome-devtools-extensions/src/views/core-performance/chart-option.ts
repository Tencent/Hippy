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


/**
 * extend echarts declaration
 */
interface Format {
  componentType?: 'series' | undefined;
  seriesType?: string | undefined;
  seriesIndex?: number | undefined;
  seriesName?: string | undefined;
  marker?: string | undefined;
  name?: string | undefined;
  dataIndex?: number | undefined;
  data?: any;
  value?: number | any[] | undefined;
  axisValue?: number | string | undefined;
  axisValueLabel?: string | undefined;
  encode?: Record<any, any> | undefined;
  dimensionNames?: string[] | undefined;
  dimensionIndex?: number | undefined;
  color?: string | undefined;
  percent?: number | undefined;
}

export const echartOption = {
  title: {},
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
    },
    formatter: (params: Format | Format[]) => {
      const format = Array.isArray(params) ? params[0] : params;
      const prefix = `时间点: ${format.axisValue} ms<br/>`;
      return `${prefix} ${format.seriesName}: ${format.data[1]}<br/>`;
    },
  },
  grid: {
    left: '50px',
    right: '50px',
    top: '50px',
    bottom: '40px',
  },
  legend: {
    data: [
      {
        name: 'UI FPS',
      },
      {
        name: 'Raster FPS',
      },
    ],
  },
  dataZoom: [
    {
      type: 'inside',
      xAxisIndex: [0],
      start: 0,
      end: 100,
      minValueSpan: 10,
    },
  ],
  xAxis: {
    type: 'value',
    name: 'ms',
    show: true,
    axisTick: { show: false },
    min: 0,
  },
  yAxis: {
    type: 'value',
    name: 'FPS',
    axisTick: { show: true },
    min: 0,
    splitLine: {
      show: true,
      lineStyle: {
        color: ['#FFF', '#DDD', '#FFF', '#FFF', '#DDD', '#FFF', '#FFF', '#FFF', '#DDD'],
      },
    },
  },
  series: [
    {
      name: 'Raster FPS',
      type: 'line',
      step: 'true',
      symbol: 'none',
      data: [],
      emphasis: {
        focus: 'series',
      },
      areaStyle: {},
      select: {
        itemStyle: {
          borderWidth: 2,
        },
      },
    },
    {
      name: 'UI FPS',
      type: 'line',
      step: 'true',
      symbol: 'none',
      data: [],
      areaStyle: {},
      select: {
        itemStyle: {
          borderWidth: 2,
        },
      },
    },
  ],
};
