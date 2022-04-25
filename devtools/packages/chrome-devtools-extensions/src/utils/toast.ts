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

import { ElMessage } from 'element-plus';

export const enum TipsType {
  Success = 'success',
  Warn = 'warning',
  Info = 'info',
  Error = 'error',
}

// dialog duration
const showDuration = 1000;

export function showToast(message: string, type: TipsType = TipsType.Info): void {
  switch (type) {
    case TipsType.Success:
      ElMessage.success({
        showClose: true,
        message,
        type,
        center: true,
        duration: showDuration,
      });
      break;
    case TipsType.Warn:
      ElMessage.warning({
        showClose: true,
        message,
        type,
        center: true,
        duration: showDuration,
      });
      break;
    case TipsType.Error:
      ElMessage.error({
        showClose: true,
        message,
        type,
        center: true,
        duration: showDuration,
      });
      break;
    case TipsType.Info:
      ElMessage.info({
        showClose: true,
        message,
        type,
        center: true,
        duration: showDuration,
      });
      break;
    default:
      ElMessage({
        showClose: true,
        message,
        center: true,
        duration: showDuration,
      });
      break;
  }
}
