/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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
import { HippyExecutorSupplierAdapter } from './HippyExecutorSupplierAdapter';
import { HippyExecutor } from '../../../support/common/HippyExecutor';
import { worker } from '@kit.ArkTS';
import { LogUtils } from '../../../support/utils/LogUtils';

export class DefaultExecutorSupplierAdapter implements HippyExecutorSupplierAdapter {
  mDBExecutor: worker.ThreadWorker | null = null
  mBackgroundTaskExecutor: HippyExecutor | null = null

  getDBExecutor(): worker.ThreadWorker {

    if (!this.mDBExecutor) {
      this.mDBExecutor = new worker.ThreadWorker("./././support/workers/worker.ets");
    }
    return this.mDBExecutor
  }

  getBackgroundTaskExecutor(): HippyExecutor {
    if (!this.mBackgroundTaskExecutor) {
      this.mBackgroundTaskExecutor = new HippyExecutor()
    }
    return this.mBackgroundTaskExecutor
  }

  destroyIfNeed() {
    if (this.mDBExecutor != null) {
      this.mDBExecutor.onexit = () => {
        LogUtils.d("ExecutorSupplierAdapter ", "onexit");
      }
      this.mDBExecutor.removeAllListener();
    }

    if (this.mBackgroundTaskExecutor != null && !this.mBackgroundTaskExecutor.isShutdown()) {
      this.mBackgroundTaskExecutor.shutdown();
      this.mBackgroundTaskExecutor = null;
    }
  }
}
