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
import { ElNotification } from 'element-plus';
import createPersistedState from 'vuex-persistedstate';
import { TdfEvent } from '@hippy/devtools-protocol/types';
import { getDomTree, getRenderTree, getScreenshot, getSelectedRenderObject } from '@chrome-devtools-extensions/api';
import { parseRenderNodeProperty } from '@chrome-devtools-extensions/utils/ui-tree';
import log from '@chrome-devtools-extensions/utils/log';
import { NotificationType, ScreenshotBoundType, ErrorCode } from '@chrome-devtools-extensions/@types/enum';
import { createChannel, ChannelTag } from '@chrome-devtools-extensions/channel';
import TDFInspector = ProtocolTdf.TDFInspector;

const channel = createChannel(ChannelTag.uiInspector);
export const DEFAULT_SCREENSHOT_PARAMS: TDFInspector.GetScreenshotRequest = {
  format: 'jpeg',
  quality: 66,
  maxWidth: 720,
  maxHeight: 1440,
};

enum Getters {
  ScreenshotImg = 'screenshotImg',
}
enum Mutations {
  UpdateDomTree = 'updateDomTree',
  UpdateRenderTree = 'updateRenderTree',
  UpdateScreenshot = 'updateScreenshot',
  SelectDomNode = 'selectDomNode',
  SelectRenderNode = 'selectRenderNode',
  ToggleSelectMode = 'toggleSelectMode',
  SetDomExpandedKeys = 'setDomExpandedKeys',
  SetRenderExpandedKeys = 'setRenderExpandedKeys',
  SetVisibility = 'setVisibility',
  SetSupportDomTree = 'setSupportDomTree',
  SetSupportRenderTree = 'setSupportRenderTree',
  UpdateDomTreeError = 'updateDomTreeError',
  UpdateRenderTreeError = 'updateRenderTreeError',
  SetRefreshing = 'setRefreshing',
}
enum Actions {
  GetDomTree = 'getDomTree',
  GetRenderTree = 'getRenderTree',
  GetScreenshot = 'getScreenshot',
  GetSelectedRenderObject = 'getSelectedRenderObject',
  GegisterDomTreeUpdatedListener = 'registerDomTreeUpdatedListener',
  GegisterRenderTreeUpdatedListener = 'registerRenderTreeUpdatedListener',
  GegisterScreenshotUpdatedListener = 'registerScreenshotUpdatedListener',
}
export const EVENT_MAP = {
  getters: Getters,
  mutations: Mutations,
  actions: Actions,
};
export interface UiInspectorState {
  screenshot?: TDFInspector.GetScreenshotResponse;
  domTree?: TDFInspector.GetDomTreeResponse;
  renderTree?: TDFInspector.GetRenderTreeResponse;
  selectedDomNode?: TDFInspector.ITree & {
    boundsPercent?: TDFInspector.INodeBoundsStyleString;
  };
  selectedRenderNode?: SelectedRenderNode;
  hoverDomNode?: TDFInspector.ITree & {
    boundsPercent?: TDFInspector.INodeBoundsStyleString;
  };
  screenshotBoundType?: ScreenshotBoundType;
  isSelectMode: boolean;
  domExpandedKeys: number[];
  renderExpandedKeys: number[];
  showScreenshot: boolean;
  showDomTree: boolean;
  showRenderTree: boolean;
  showAttribute: boolean;
  getDomTreeError: boolean;
  getRenderTreeError: boolean;
  isRefreshing: boolean;
  isSupportDomTree: boolean;
  isSupportRenderTree: boolean;
}

const vuePersistKey = 'ui_inspector_vuex';

export default createStore<UiInspectorState>({
  plugins: [
    createPersistedState({
      key: vuePersistKey,
      paths: ['showScreenshot', 'showDomTree', 'showRenderTree', 'showAttribute'],
    }),
  ],
  state: {
    screenshot: undefined,
    domTree: undefined,
    renderTree: undefined,
    selectedDomNode: undefined,
    selectedRenderNode: undefined,
    screenshotBoundType: undefined,
    isSelectMode: false,
    domExpandedKeys: [],
    renderExpandedKeys: [],
    showScreenshot: true,
    showDomTree: true,
    showRenderTree: true,
    showAttribute: true,
    getDomTreeError: false,
    getRenderTreeError: false,
    isRefreshing: false,
    isSupportDomTree: true,
    isSupportRenderTree: true,
  },
  getters: {
    screenshotImg(state: UiInspectorState) {
      return state.screenshot?.data ? `data:image/png;base64,${state.screenshot?.data}` : '';
    },
  },
  mutations: {
    updateDomTree(state, domTree) {
      state.domTree = domTree;
    },
    updateRenderTree(state, renderTree) {
      state.renderTree = renderTree;
    },
    updateScreenshot(state, screenshot) {
      state.screenshot = screenshot;
    },
    selectDomNode(state, domNode) {
      state.selectedDomNode = domNode;
      state.screenshotBoundType = ScreenshotBoundType.DOM;
    },
    selectRenderNode(state, renderNode) {
      if (!renderNode) return;
      if (!state.selectedRenderNode) state.selectedRenderNode = {} as unknown as SelectedRenderNode;
      Object.keys(renderNode).forEach((key) => {
        state.selectedRenderNode![key] = renderNode[key];
      });
      state.screenshotBoundType = ScreenshotBoundType.Render;
    },
    toggleSelectMode(state) {
      state.isSelectMode = !state.isSelectMode;
    },
    setDomExpandedKeys(state, domExpandedKeys) {
      state.domExpandedKeys = domExpandedKeys;
    },
    setRenderExpandedKeys(state, renderExpandedKeys) {
      state.renderExpandedKeys = renderExpandedKeys;
    },
    setVisibility(state, { key, value }) {
      if (['showScreenshot', 'showDomTree', 'showRenderTree', 'showAttribute'].indexOf(key) !== -1) {
        state[key] = value;
      }
    },
    setSupportDomTree(state, isSupportDomTree: boolean) {
      state.isSupportDomTree = isSupportDomTree;
    },
    setSupportRenderTree(state, isSupportRenderTree: boolean) {
      state.isSupportRenderTree = isSupportRenderTree;
    },
    updateDomTreeError(state, getDomTreeError: boolean) {
      state.getDomTreeError = getDomTreeError;
    },
    updateRenderTreeError(state, getRenderTreeError: boolean) {
      state.getRenderTreeError = getRenderTreeError;
    },
    setRefreshing(state, isRefreshing: boolean) {
      state.isRefreshing = isRefreshing;
    },
  },
  actions: {
    async getDomTree({ commit, state }) {
      try {
        const res = await getDomTree();
        commit(EVENT_MAP.mutations.UpdateDomTree, res.result);
        commit(EVENT_MAP.mutations.UpdateDomTreeError, false);
      } catch (error) {
        log.error(error);
        if ((error as Adapter.CDP.ErrorRes).error.code === ErrorCode.NotSupportDomTree) {
          if (state.showDomTree) {
            ElNotification({
              title: (error as Adapter.CDP.ErrorRes).error.message,
              type: NotificationType.error,
            });
            commit(EVENT_MAP.mutations.SetVisibility, {
              key: 'showDomTree',
              value: false,
            });
            commit(EVENT_MAP.mutations.SetSupportDomTree, false);
          }
        }
        commit(EVENT_MAP.mutations.UpdateDomTree, undefined);
        commit(EVENT_MAP.mutations.UpdateDomTreeError, true);
      }
    },
    async getRenderTree({ commit, state }) {
      try {
        const res = await getRenderTree();
        commit(EVENT_MAP.mutations.UpdateRenderTree, res.result);
        commit(EVENT_MAP.mutations.UpdateRenderTreeError, false);
      } catch (error) {
        log.error(error);
        if ((error as Adapter.CDP.ErrorRes).error.code === ErrorCode.NotSupportDomTree) {
          if (state.showRenderTree) {
            ElNotification({
              title: (error as Adapter.CDP.ErrorRes).error.message,
              type: NotificationType.error,
            });
            commit(EVENT_MAP.mutations.SetVisibility, {
              key: 'showRenderTree',
              value: false,
            });
            commit('setSupportRenderTree', false);
          }
        }
        commit(EVENT_MAP.mutations.UpdateDomTree, undefined);
        commit(EVENT_MAP.mutations.UpdateRenderTreeError, true);
      }
    },
    async getScreenshot({ commit }) {
      try {
        const res = await getScreenshot(DEFAULT_SCREENSHOT_PARAMS);
        commit(EVENT_MAP.mutations.UpdateScreenshot, res.result);
      } catch (error) {
        log.error(error);
        ElNotification({
          title: '获取截图失败',
          type: NotificationType.error,
        });
      }
    },
    async getSelectedRenderObject({ state, commit }, renderNode) {
      if (renderNode.hadFetchedDetailInfo) return;
      try {
        const res = await getSelectedRenderObject({
          id: renderNode.id,
        });
        if (!res.result.rtree?.properties) return;
        delete (res.result.rtree as any).child;
        const node = parseRenderNodeProperty(res.result.rtree.properties);
        commit(EVENT_MAP.mutations.SelectRenderNode, {
          ...(state.selectedRenderNode || {}),
          ...node,
          hadFetchedDetailInfo: true,
        });
      } catch (error) {
        log.error(error);
        ElNotification({
          title: '获取Render Object失败',
          type: NotificationType.error,
        });
      }
    },
    registerDomTreeUpdatedListener({ commit }) {
      channel.addEventListener(TdfEvent.TDFInspectorDomTreeUpdated, (res: Adapter.CDP.EventRes) => {
        commit(EVENT_MAP.mutations.UpdateDomTree, res.params);
        commit(EVENT_MAP.mutations.UpdateDomTreeError, false);
      });
    },
    registerRenderTreeUpdatedListener({ commit }) {
      channel.addEventListener(TdfEvent.TDFInspectorRenderTreeUpdated, (res: Adapter.CDP.EventRes) => {
        commit(EVENT_MAP.mutations.UpdateRenderTree, res.params);
        commit(EVENT_MAP.mutations.UpdateRenderTreeError, false);
      });
    },
    registerScreenshotUpdatedListener({ commit }) {
      channel.addEventListener(TdfEvent.TDFInspectorScreenshotUpdated, (res: Adapter.CDP.EventRes) => {
        commit(EVENT_MAP.mutations.UpdateScreenshot, res.params);
      });
    },
  },
  modules: {},
});

type SelectedRenderNode = TDFInspector.RTree & {
  boundsPercent?: TDFInspector.INodeBoundsStyleString;
  hadFetchedDetailInfo?: boolean;
};
