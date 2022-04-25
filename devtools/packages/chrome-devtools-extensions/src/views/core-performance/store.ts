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

import { createStore } from 'vuex';
import { ElMessage } from 'element-plus';
import { OperatState, DevicePlatform } from '@chrome-devtools-extensions/@types/enum';
import { getWSUrlParam } from '@chrome-devtools-extensions/utils/url';
import { preciseRound } from '@chrome-devtools-extensions/utils/number';
import {
  startCoreTrace,
  startJsTrace,
  endCoreTrace,
  endJsTrace,
  getV8Trace,
  getTdfFrameTimings,
  getTdfTimeline,
} from '@chrome-devtools-extensions/api';
import log from '@chrome-devtools-extensions/utils/log';
import { parseTraceData } from './parse-trace';
import { parseFrameTimingData } from './parse-frame-timing';
import FlameGraph from './components/flame-graph/index';

const isIOS = getWSUrlParam('platform') === DevicePlatform.IOS;
const timeOutError = 5000;

// 1ms = 1000000ns
const nanosecondTimeMultiple = 1000000;

// 1ms = 1000us
const microsecondTimeMultiple = 1000;
const precise = 3;
const messageDuration = 1000;

export interface PerformanceState {
  startTime: number;
  endTime: number;
  operatState: OperatState;
  renderCoreTrace: Array<FlameGraph.RenderTrace>;
  renderCoreTraceMap: FlameGraph.RenderTraceMap;
  renderV8Trace: Array<FlameGraph.RenderTrace>;
  renderV8TraceMap: FlameGraph.RenderTraceMap;
  timelineEventsStr: string;
}

enum Getters {
  IsStartBtnDisabled = 'isStartBtnDisabled',
  IsEndBtnDisabled = 'isEndBtnDisabled',
  IsClearBtnDisabled = 'isClearBtnDisabled',
  IsInitState = 'isInitState',
  IsCollectingState = 'isCollectingState',
  IsAnalysingState = 'isAnalysingState',
  IsCollectedState = 'isCollectedState',
}
enum Mutations {
  SetOperateState = 'setOperateState',
}
enum Actions {
  Start = 'start',
  End = 'end',
  Clear = 'clear',
  GetFrameTimings = 'getFrameTimings',
  GetTimeline = 'getTimeline',
  GetV8Trace = 'getV8Trace',
  HandleErrorCallback = 'handleErrorCallback',
  SetV8Trace = 'setV8Trace',
}
export const EVENT_MAP = {
  getters: Getters,
  mutations: Mutations,
  actions: Actions,
};

export default createStore<PerformanceState>({
  state: {
    startTime: 0,
    endTime: 0,
    operatState: OperatState.Init,
    renderCoreTrace: [],
    renderCoreTraceMap: new Map(),
    renderV8Trace: [],
    renderV8TraceMap: new Map(),
    timelineEventsStr: '',
  },
  getters: {
    isStartBtnDisabled(state: PerformanceState) {
      return !(state.operatState === OperatState.Init || state.operatState === OperatState.Collected);
    },
    isEndBtnDisabled(state: PerformanceState) {
      return !(state.operatState === OperatState.Collecting);
    },
    isClearBtnDisabled(state: PerformanceState) {
      return !(state.operatState === OperatState.Collected);
    },
    isInitState(state: PerformanceState) {
      return state.operatState === OperatState.Init;
    },
    isCollectingState(state: PerformanceState) {
      return state.operatState === OperatState.Collecting;
    },
    isAnalysingState(state: PerformanceState) {
      return state.operatState === OperatState.Analysing;
    },
    isCollectedState(state: PerformanceState) {
      return state.operatState === OperatState.Collected;
    },
  },
  mutations: {
    setOperateState(state: PerformanceState, toState: OperatState) {
      switch (toState) {
        case OperatState.Init:
          if (state.operatState === OperatState.Collected) state.operatState = OperatState.Init;
          break;
        case OperatState.Collecting:
          if (state.operatState === OperatState.Init || state.operatState === OperatState.Collected)
            state.operatState = OperatState.Collecting;
          break;
        case OperatState.Analysing:
          if (state.operatState === OperatState.Collecting) state.operatState = OperatState.Analysing;
          break;
        case OperatState.Collected:
          if (state.operatState === OperatState.Analysing) state.operatState = OperatState.Collected;
          break;
        default:
          break;
      }
    },
  },
  actions: {
    async start({ state, commit, dispatch }) {
      startCoreTrace()
        .then((res) => {
          if (res.result.startTime) {
            state.startTime = parseFloat(preciseRound(res.result.startTime / nanosecondTimeMultiple, precise));
            commit(EVENT_MAP.mutations.SetOperateState, OperatState.Collecting);
          }
        })
        .catch((error) => {
          dispatch(EVENT_MAP.actions.HandleErrorCallback, error);
        });
      if (isIOS) startJsTrace();
    },
    async end({ state, commit, dispatch }) {
      endCoreTrace()
        .then((res) => {
          if (res.result.endTime) {
            state.endTime = parseFloat(preciseRound(res.result.endTime / nanosecondTimeMultiple, precise));
            commit(EVENT_MAP.mutations.SetOperateState, OperatState.Analysing);
            return;
          }
        })
        .catch((error) => {
          if (error) {
            dispatch(EVENT_MAP.actions.HandleErrorCallback, error);
          }
        });
      if (isIOS) endJsTrace();
    },
    clear({ state }) {
      state.timelineEventsStr = '';
    },
    async getFrameTimings({ state, dispatch }) {
      try {
        const res = await getTdfFrameTimings();
        return parseFrameTimingData(res.result, state.startTime, state.endTime);
      } catch (error) {
        if (error) {
          dispatch(EVENT_MAP.actions.HandleErrorCallback, error);
        }
      }
    },
    async getTimeline({ state, dispatch }) {
      try {
        const res = await getTdfTimeline();
        state.timelineEventsStr = JSON.stringify(res.result);
        if (!res.result?.traceEvents) {
          log.error(`getTimeline json traceEvents nil: ${JSON.stringify(res)}`);
        }
        if (!Array.isArray(res.result.traceEvents)) {
          log.error(`getTimeline json traceEvents is not an Array: ${JSON.stringify(res)}`);
        }
        const { renderTrace, renderTraceMap } = parseTraceData(res.result.traceEvents, nanosecondTimeMultiple);
        state.renderCoreTrace.splice(0, state.renderCoreTrace.length);
        state.renderCoreTrace.push(...renderTrace);
        state.renderCoreTraceMap.clear();
        for (const key of renderTraceMap.keys()) {
          state.renderCoreTraceMap.set(key, renderTraceMap.get(key) || []);
        }
      } catch (error) {
        if (error) {
          dispatch(EVENT_MAP.actions.HandleErrorCallback, error);
        }
      }
    },
    async getV8Trace({ state, dispatch }) {
      const res = await getV8Trace();
      try {
        const { renderTrace, renderTraceMap } = parseTraceData(res.result.traceEvents, microsecondTimeMultiple);
        state.renderV8Trace.splice(0, state.renderV8Trace.length);
        state.renderV8Trace.push(...renderTrace);

        state.renderV8TraceMap.clear();
        for (const key of renderTraceMap.keys()) {
          state.renderV8TraceMap.set(key, renderTraceMap.get(key) || []);
        }
      } catch (error) {
        if (error) {
          dispatch(EVENT_MAP.actions.HandleErrorCallback, error);
        }
      }
    },
    handleErrorCallback({ commit }, error) {
      if (error?.code === timeOutError) {
        commit(EVENT_MAP.mutations.SetOperateState, OperatState.Init);
        ElMessage.warning({
          message: '请求超时，请重试',
          type: 'warning',
          duration: messageDuration,
        });
      }
    },

    setV8Trace({ dispatch, state }, { error, json }) {
      if (error) {
        dispatch(EVENT_MAP.actions.HandleErrorCallback, error);
        return;
      }
      json.traceEvents = json.value;
      try {
        const { renderTrace, renderTraceMap } = parseTraceData(json.traceEvents, microsecondTimeMultiple);
        state.renderV8Trace.splice(0, state.renderV8Trace.length);
        state.renderV8Trace.push(...renderTrace);

        state.renderV8TraceMap.clear();
        for (const key of renderTraceMap.keys()) {
          state.renderV8TraceMap.set(key, renderTraceMap.get(key) || []);
        }
      } catch (error) {
        log.error(error);
      }
    },
  },
  modules: {},
});
