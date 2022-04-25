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

export const enum NotificationType {
  success = 'success',
  warning = 'warning',
  info = 'info',
  error = 'error',
}

export const enum ScreenshotBoundType {
  DOM = 'DOM',
  Render = 'Render',
}

export const enum DevicePlatform {
  Unknown = '0',
  IOS = '1',
  Android = '2',
}

export const enum AppClientType {
  Tunnel = 'TunnelAppClient',
  WS = 'WSAppClient',
  IWDP = 'IWDPAppClient',
}

export const enum ErrorCode {
  NotSupportDomTree = -1,
}

export const enum PH {
  Begin = 'B',
  End = 'E',
  MetaData = 'M',
  Complete = 'X',
}

export const enum OperatState {
  Init = 0,
  Collecting = 1,
  Analysing = 2,
  Collected = 3,
}
