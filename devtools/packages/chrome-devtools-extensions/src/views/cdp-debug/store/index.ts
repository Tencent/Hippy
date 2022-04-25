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
import { NotificationType } from '@chrome-devtools-extensions/@types/enum';
import { createChannel, ChannelTag } from '@chrome-devtools-extensions/channel';

const channel = createChannel(ChannelTag.cdpDebug);

export interface CdpListState {
  records: CdpRecord[];
  selectedIndex: number;
  isSending: boolean;
  newRecord?: CdpRecord;
}

export default createStore<CdpListState>({
  state: {
    records: [],
    selectedIndex: -1,
    isSending: false,
    newRecord: undefined,
  },
  getters: {
    showNewPanel(state) {
      return state.selectedIndex === -1;
    },
  },
  mutations: {
    addRecord(state, record: CdpRecord) {
      state.records.push(record);
      if (state.selectedIndex !== -1) state.newRecord = record;
    },
    clearRecord(state) {
      state.selectedIndex = -1;
      state.records = [];
      state.isSending = false;
    },
    changeToNewRecordView(state) {
      state.selectedIndex = -1;
      state.newRecord = undefined;
    },
    selectRecord(state, i: number) {
      state.selectedIndex = i;
    },
  },
  actions: {
    async send({ commit, state }, data: Channel.RequestData) {
      try {
        const res = await channel.send(data);
        commit('addRecord', {
          id: res.id,
          method: data.method,
          req: data.params,
          res,
        });
      } catch (e) {
        if ('error' in (e as Adapter.CDP.Res)) {
          const res = e as Adapter.CDP.CommandRes;
          return commit('addRecord', {
            id: res.id,
            method: data.method,
            req: data.params,
            res,
          });
        }
        ElNotification({
          title: 'send protocol fail',
          type: NotificationType.error,
        });
      }
      state.isSending = false;
    },
    async registerEventListener({ commit }) {
      channel.addEventListener(new RegExp('.*'), (res: Adapter.CDP.EventRes) => {
        commit('addRecord', {
          method: res.method,
          res: res.params,
        });
      });
    },
  },
  modules: {},
});

type CdpRecord = CdpCommandRecord | CdpEventRecord;
type CdpCommandRecord = {
  id: number;
  method: string;
  req: unknown;
  res: unknown;
};
type CdpEventRecord = {
  method: string;
  res: unknown;
};
