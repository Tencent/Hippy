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

import { PH } from '@chrome-devtools-extensions/@types/enum';
import { preciseRound } from '@chrome-devtools-extensions/utils/number';
import FlameGraph from './components/flame-graph/index';

// 1ms = 1000us
const timeMultiple = 1000;

// float number precise
const precise = 3;

/**
 * parse trace stack
 * protocol reference: https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/edit#heading=h.uxpopqvbjezh
 * unit: ms
 */
export const parseTraceData = (events: Array<Performance.TraceInfo>, timeMultple = timeMultiple) => {
  // invoke stack, such as [[B,B,E,B,E,E], [B,E]]
  const sequences: Performance.TraceInfo[][] = [];

  const threadSequencesMap: Performance.ThreadSequencesMap = new Map();

  const threadOpenMap: Performance.ThreadOpenMap = new Map();

  const endEventMap: Performance.SuperEventMap = new Map();

  const startEventMap: Performance.SuperEventMap = new Map();

  const renderTrace: Array<FlameGraph.RenderTrace> = [];

  const renderTraceMap: FlameGraph.RenderTraceMap = new Map();

  if (!Array.isArray(events)) {
    return {
      renderTraceMap,
      renderTrace,
    };
  }

  events.forEach((event) => {
    const { tid, name, ts, ph } = event;
    if (event.ph === PH.Complete) {
      initMap(threadSequencesMap, tid, []);
      threadSequencesMap.get(tid)!.push(event);
    } else if (ph === PH.Begin) {
      initMap(threadSequencesMap, tid, []);
      threadSequencesMap.get(tid)!.push(event);

      threadOpenMap.set(tid, Math.max(threadOpenMap.get(tid) || 0) + 1);

      initMap(startEventMap, tid, new Map());
      initMap(startEventMap.get(tid)!, name, []);
      startEventMap.get(tid)!.get(name)!.push(ts);
    } else if (ph === PH.End && threadSequencesMap.has(tid) && startEventMap.get(tid)?.get(name)) {
      const startTimes = startEventMap.get(tid)?.get(name);
      if (!startTimes?.length) {
        throw new Error(`${JSON.stringify(event)} no match start event`);
      }
      const startTime = startTimes[startTimes.length - 1];
      startTimes.splice(startTimes.length - 1, 1);

      const mapKey = `${name}_${startTime}`;
      initMap(endEventMap, tid, new Map());
      initMap(endEventMap.get(tid)!, mapKey, []);
      endEventMap.get(tid)?.get(mapKey)?.push(ts);

      threadSequencesMap.get(tid)!.push(event);
      threadOpenMap.set(tid, threadOpenMap.get(tid)! - 1);

      if (threadOpenMap.get(tid) === 0) {
        sequences.push(threadSequencesMap.get(tid)!);
        const res = formatSequences(
          threadSequencesMap.get(tid)!,
          endEventMap.get(tid) as Performance.SubEventMap,
          timeMultple,
        );
        renderTrace.push(...res);
        initMap(renderTraceMap, tid, []);
        renderTraceMap.get(tid)!.push(...res);

        threadSequencesMap.set(tid, []);
        endEventMap.set(tid, new Map());
        startEventMap.set(tid, new Map());
      }
    } else if (threadSequencesMap.get(tid)) {
      initMap(threadSequencesMap, tid, []);
      threadSequencesMap.get(tid)!.push(event);
    }
  });
  return {
    renderTraceMap,
    renderTrace,
  };
};

const formatSequences = (
  sequences: Array<Performance.TraceInfo>,
  endEventMap: Performance.SubEventMap,
  timeMultple = timeMultiple,
) => {
  const sequencesWithRichInfo: Array<FlameGraph.TraceMeasure> = [];
  const startTimeMap: Performance.SubEventMap = new Map();
  sequences.forEach((item) => {
    const { ph, ts, name, dur } = item;
    if (ph === PH.Begin) {
      const mapKey = `${name}_${ts}`;
      const endTimes = endEventMap.get(mapKey);
      if (!endTimes || endTimes.length < 1) {
        throw new Error(`${JSON.stringify(item)} no match end event`);
      }
      const endTime = endTimes[endTimes.length - 1];
      endTimes.splice(endTimes.length - 1, 1);
      const st = parseFloat(preciseRound(ts / timeMultple, precise));
      sequencesWithRichInfo.push({
        duration: parseFloat(preciseRound((endTime - ts) / timeMultple, precise)),
        startTime: st,
        ...item,
      });
      initMap(startTimeMap, name, []);
      startTimeMap.get(name)?.push(st);
    } else if (ph === PH.End) {
      const startTimes = startTimeMap.get(name);
      if (!startTimes?.length) {
        throw new Error(`${JSON.stringify(item)} no match start event`);
      }
      const startTime = startTimes[startTimes.length - 1];
      startTimes.splice(startTimes.length - 1, 1);
      sequencesWithRichInfo.push({
        startTime,
        ...item,
      });
    } else if (ph === PH.Complete) {
      sequencesWithRichInfo.push({
        startTime: parseFloat(preciseRound(ts / timeMultple, precise)),
        duration: parseFloat(preciseRound((dur as number) / timeMultple, precise)),
        ...item,
      });
    } else {
      sequencesWithRichInfo.push({ ...item });
    }
  });

  const renderTrace: Array<FlameGraph.RenderTrace> = [];
  calculateCallLevel(sequencesWithRichInfo, renderTrace);
  return renderTrace;
};

const calculateCallLevel = (
  sequencesWithRichInfo: Array<FlameGraph.TraceMeasure>,
  renderTrace: Array<FlameGraph.RenderTrace>,
) => {
  const openStack: Array<FlameGraph.TraceMeasure | null> = [];

  const measuresStackIndexes: Performance.MeasuresStackIndexes = {};

  sequencesWithRichInfo.forEach((item) => {
    const { name, startTime, ph } = item;
    const stackIndex = openStack.length;
    const mapKey = `${name}_${startTime}`;
    const stackIndexToRemoveGroup = measuresStackIndexes[mapKey];
    const stackIndexToRemove = stackIndexToRemoveGroup
      ? stackIndexToRemoveGroup[stackIndexToRemoveGroup.length - 1]
      : undefined;

    let newLength = openStack.length;
    switch (ph) {
      case PH.Begin:
        renderTrace.push({
          stackIndex,
          measure: item,
        });
        if (!measuresStackIndexes[mapKey]) measuresStackIndexes[mapKey] = [];
        measuresStackIndexes[mapKey].push(stackIndex);

        openStack.push(item);
        break;
      case PH.Complete:
        renderTrace.push({
          stackIndex,
          measure: item,
        });
        break;
      case PH.End:
        if (stackIndexToRemove !== undefined) {
          openStack[stackIndexToRemove] = null;
          stackIndexToRemoveGroup.splice(stackIndexToRemoveGroup.length - 1, 1);
        }
        while (newLength > 0 && openStack[newLength - 1] === null) {
          newLength -= 1;
        }
        if (openStack.length !== newLength) {
          openStack.length = newLength;
        }
        break;
      default:
        throw new Error(`${JSON.stringify(item)} doesn't match the PH event`);
    }
  });
};

function initMap<TKey, TVal>(map: Map<TKey, TVal>, key: TKey, initVal: TVal): void {
  if (!map.has(key)) {
    map.set(key, initVal);
  }
}
