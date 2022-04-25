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

import { Channel } from './channel';

const channelMap: Map<ChannelTag, Channel> = new Map();
export const createChannel = (tag: ChannelTag): Channel => {
  if (channelMap.has(tag)) {
    return channelMap.get(tag) as Channel;
  }
  const channel = new Channel(tag);
  channelMap.set(tag, channel);
  return channel;
};

export const enum ChannelTag {
  memory = 'memory',
  uiInspector = 'ui_inspector',
  cdpDebug = 'cdp_debug',
  corePerformance = 'core_performance',
  vueDevtools = 'vue_devtools',
}
