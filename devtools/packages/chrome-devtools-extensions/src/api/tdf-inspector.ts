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

import { TdfCommand } from '@hippy/devtools-protocol/types';
import { createChannel, ChannelTag } from '@chrome-devtools-extensions/channel';
import TDFInspector = ProtocolTdf.TDFInspector;

const channel = createChannel(ChannelTag.uiInspector);

export const getDomTree = async () =>
  channel.send<TDFInspector.GetDomTreeResponse>({
    method: TdfCommand.TDFInspectorGetDomTree,
    params: {},
  });

export const getRenderTree = async () =>
  channel.send<TDFInspector.GetRenderTreeResponse>({
    method: TdfCommand.TDFInspectorGetRenderTree,
    params: {},
  });

export const getSelectedDomNode = async () =>
  channel.send<TDFInspector.GetSelectedDomNodeResponse>({
    method: TdfCommand.TDFInspectorGetSelectedDomNode,
    params: {},
  });

export const getSelectedRenderObject = async (params: TDFInspector.GetSelectedRenderObjectRequest) =>
  channel.send<TDFInspector.GetSelectedRenderObjectResponse>({
    method: TdfCommand.TDFInspectorGetSelectedRenderObject,
    params,
  });

export const getScreenshot = async (params: TDFInspector.GetScreenshotRequest) =>
  channel.send<TDFInspector.GetScreenshotResponse>({
    method: TdfCommand.TDFInspectorGetScreenshot,
    params,
  });

export const enableUpdateNotification = async () =>
  channel.send({
    method: TdfCommand.TDFInspectorEnableUpdateNotification,
    params: {},
  });

export const disableUpdateNotification = async () =>
  channel.send({
    method: TdfCommand.TDFInspectorDisableUpdateNotification,
    params: {},
  });
