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
import taskpool from '@ohos.taskpool';
import { LogUtils } from '../utils/LogUtils';

export type HippyTask = () => void
export interface IExcutor {
  execute( task: HippyTask): void
  isShutdown(): void
  shutdown(): void
}
const HIPPY_EXECUTOR_TAG = 'HippyExecutor'

export class HippyExecutor implements IExcutor{
  private hasShutdown:boolean = false
  private needSyncMainQueueTasksBlock: HippyTask| null = null

  performingMainQueueTask: Boolean = false
  private mainThreadTasksOnContextQueue: HippyTask[] = []

  async execute(func: HippyTask) {
    if (this.hasShutdown) {
      return
    }
    let task = new taskpool.Task(func, "create task, then execute");
    let val1 = await taskpool.execute(task );
    LogUtils.i(HIPPY_EXECUTOR_TAG,"taskpool.execute(task) result: " + val1);
  }

  performSyncMainQueueTasksBlockIfNeed() {
    if (this.needSyncMainQueueTasksBlock !== null) {
      this.needSyncMainQueueTasksBlock()
      this.needSyncMainQueueTasksBlock = null
    }
  }

  setNeedSyncMainQuequeTasks() {
    if (this.needSyncMainQueueTasksBlock === null) {
      this.needSyncMainQueueTasksBlock = () => {
        if (this.hasShutdown) {
          return
        }
        const tasks = this.mainThreadTasksOnContextQueue
        this.mainThreadTasksOnContextQueue = []

        try {
          this.performingMainQueueTask = true
          for (let index = 0; index < tasks.length; index++) {
            const task = tasks[index];
            task()
          }
          this.performingMainQueueTask = false
        }catch(err){
          LogUtils.e(HIPPY_EXECUTOR_TAG, `Get RdbStore failed, code is ${err.code},message is ${err.message}`);
        }
      }
      this.execute( ()=> {
        this.performSyncMainQueueTasksBlockIfNeed()
      })
    }
  }

  isShutdown():boolean{
    return this.hasShutdown
  }

  shutdown(){
    this.hasShutdown = true
    this.needSyncMainQueueTasksBlock = null
    this.mainThreadTasksOnContextQueue = []
  }
}

// Reference code:
/*
export interface IKRScheduler {
  scheduleTask(delayMs: number, task: KRSchedulerTask): void
  destroy(): void
}

export type KRSchedulerTask = () => void

export class KRContextScheduler implements IKRScheduler {
  private isDestroryed = false
  performTaskOnContextQueue(task: KRSchedulerTask, sync: Boolean) {
    if (this.isDestroryed) {
      return
    }

    if (sync) {
      task()
    } else {
      this.scheduleTask(1, task)
    }
  }

  scheduleTask(delayMs: number, task: KRSchedulerTask): void {
    setTimeout(() => {
      if (this.isDestroryed) {
        return
      }
      task();
    }, delayMs);
  }

  destroy(): void {
    this.isDestroryed = true
  }
}

export class KRUIScheduler implements IKRScheduler {
  private isDestroryed = false
  private needSyncMainQueueTasksBlock: KRSchedulerTask| null = null
  private delegate: HippyRenderUISchedulerDelegate | null = null
  performingMainQueueTask: Boolean = false
  private mainThreadTasksOnContextQueue: KRSchedulerTask[] = []
  private renderExceptionListener: IHippyRenderExceptionListener | null = null;

  setRenderExceptionListener(renderExceptionListener: IHippyRenderExceptionListener | null){
    this.renderExceptionListener = renderExceptionListener;
  }

  constructor(delegate: HippyRenderUISchedulerDelegate) {
    this.delegate = delegate
  }

  addTaskToMainQueueWithTask(task: KRSchedulerTask) {
    this.mainThreadTasksOnContextQueue.push(task)
    this.setNeedSyncMainQuequeTasks()
  }

  performSyncMainQueueTasksBlockIfNeed() {
    if (this.needSyncMainQueueTasksBlock !== null) {
      this.needSyncMainQueueTasksBlock()
      this.needSyncMainQueueTasksBlock = null
    }
  }

  scheduleTask(delayMs: number, task: KRSchedulerTask): void {
    setTimeout(() => {
      if (this.isDestroryed) {
        return
      }
      task();
    }, delayMs);
  }

  destroy(): void {
    this.isDestroryed = true
    this.delegate = null;
    this.needSyncMainQueueTasksBlock = null
    this.mainThreadTasksOnContextQueue = []
  }

  setNeedSyncMainQuequeTasks() {
    if (this.needSyncMainQueueTasksBlock === null) {
      this.needSyncMainQueueTasksBlock = () => {
        if (this.isDestroryed) {
          return
        }
        if (this.delegate) {
          this.delegate.willPerformUITasksWithScheduler()
        }
        const tasks = this.mainThreadTasksOnContextQueue
        this.mainThreadTasksOnContextQueue = []

        try {
          this.performingMainQueueTask = true
          for (let index = 0; index < tasks.length; index++) {
            const task = tasks[index];
            task()
          }
          this.performingMainQueueTask = false
        }catch(e){
          this.notifyException(e, ErrorReason.UPDATE_VIEW_TREE);
        }
      }
      this.scheduleTask(1, ()=> {
        this.performSyncMainQueueTasksBlockIfNeed()
      })
    }
  }

  private notifyException(exception: KRAny, errorReason: ErrorReason): void{
    if(this.renderExceptionListener){
      this.renderExceptionListener.onRenderException(exception, errorReason);
    }
  }
}

export interface HippyRenderUISchedulerDelegate {
  willPerformUITasksWithScheduler(): void
}
//*/
