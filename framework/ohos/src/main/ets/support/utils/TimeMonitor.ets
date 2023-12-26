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
import ArrayList from '@ohos.util.ArrayList';
import systemDateTime from '@ohos.systemDateTime';
import HashMap from '@ohos.util.HashMap';
import { LogUtils } from './LogUtils';

export class TimeMonitor {
  public static TAG = "TimeMonitor";

  public static MONITOR_GROUP_INIT_ENGINE = "initEngine";
  public static MONITOR_GROUP_RUN_BUNDLE = "runBundle";
  public static MONITOR_GROUP_PAINT = "paint";

  public static MONITOR_POINT_INIT_NATIVE_ENGINE: string = "initNativeEngine";
  public static MONITOR_POINT_LOAD_VENDOR_JS: string = "loadVendorJs";
  public static MONITOR_POINT_LOAD_MAIN_JS: string = "loadMainJs";
  public static MONITOR_POINT_FIRST_PAINT: string = "firstPaint";
  public static MONITOR_POINT_FIRST_CONTENTFUL_PAINT = "firstContentfulPaint";

  public static MONITOR_POINT_INIT_JS_ENGINE: string = "initJSEngine";
  public static MONITOR_POINT_LOAD_INSTANCE: string = "loadInstance";
  public static MONITOR_POINT_NOTIFY_ENGINE_INITIALIZED: string = "notifyEngineInitialized";
  public mMonitorGroups: HashMap<string, MonitorGroup> | null = null;

  public beginGroup(groupName: string) {
    if (this.mMonitorGroups == null) {
      this.mMonitorGroups = new HashMap();
    }
    let monitorGroup: MonitorGroup = this.mMonitorGroups.get(groupName);
    if (monitorGroup == null) {
      const monitorGroup = new MonitorGroup(groupName);
      this.mMonitorGroups.set(groupName, monitorGroup);
    } else {
      monitorGroup.reset();
    }
  }

  public endGroup(groupName: string): void {
    if (this.mMonitorGroups == null) {
      return;
    }
    let monitorGroup: MonitorGroup = this.mMonitorGroups.get(groupName);
    if (monitorGroup != null) {
      monitorGroup.end();
    }
  }

  public addPoint(groupName: string, point: string) {
    if (this.mMonitorGroups == null) {
      return;
    }
    let monitorGroup: MonitorGroup = this.mMonitorGroups.get(groupName);
    if (monitorGroup != null) {
      monitorGroup.addPoint(point);
    }
  }

  public printGroup(groupName: string) {
    if (this.mMonitorGroups == null) {
      return;
    }
    let monitorGroup: MonitorGroup = this.mMonitorGroups.get(groupName);
    if (monitorGroup != null) {
      monitorGroup.print();
    }
  }
}

export class MonitorGroup {
  public name: string
  public beginTime: number = -1
  public totalTime: number = -1
  public isActive: boolean;
  private mMonitorPoints: ArrayList<MonitorPoint> | null = null;
  private mLastPoint: MonitorPoint | null = null;

  constructor(name: string) {
    this.name = name;
    this.isActive = true;
  }

  public reset() {
    this.beginTime = -1;
    this.totalTime = -1;
    this.isActive = true;
    this.mLastPoint = null;
    if (this.mMonitorPoints != null) {
      this.mMonitorPoints.clear();
    }
  }

  addPoint(pointKey: string): void {
    if (!this.isActive) {
      return;
    }
    if (this.mMonitorPoints == null) {
      this.mMonitorPoints = new ArrayList();
    }
    let monitorPoint: MonitorPoint | null = this.checkMonitorPoint(pointKey);
    if (monitorPoint != null) {
        return;
    }
    monitorPoint = new MonitorPoint(pointKey);
    this.mMonitorPoints.add(monitorPoint);
    let currentTime: number = this.getCurrentTime()
    monitorPoint.startTime = currentTime;
    if (this.mLastPoint != null) {
      this.mLastPoint.endTime = currentTime;
    }
    this.mLastPoint = monitorPoint;
    if (this.beginTime == -1) {
      this.beginTime = currentTime;
    }
  }

  end(): void {
    if (this.isActive) {
      this.isActive = false;
      if (this.mLastPoint != null) {
        this.mLastPoint.endTime = this.getCurrentTime()
      }
      if (this.beginTime != -1) {
        this.totalTime = this.getCurrentTime() - this.beginTime;
      }
      this.print();
    }
  }

  print(): void {
    if (this.mMonitorPoints != null) {
      LogUtils.e(TimeMonitor.TAG, "group " + this.name + ", totalTime " + this.totalTime + "ms");
      for (const monitorPoint of this.mMonitorPoints) {
        LogUtils.e(TimeMonitor.TAG, monitorPoint.key + ": " + (monitorPoint.endTime - monitorPoint.startTime) + "ms");
      }
    }
  }

  public getMonitorPoints(): ArrayList<MonitorPoint> | null {
    return this.mMonitorPoints;
  }

  getCurrentTime(): number {
    return systemDateTime.getTime();
  }

  private checkMonitorPoint(pointKey: string): MonitorPoint | null {
    if (this.mMonitorPoints && this.mMonitorPoints.length > 0) {
      this.mMonitorPoints.forEach((monitorPoint) => {
        if (monitorPoint.key == pointKey) {
          return monitorPoint
        }
        return null;
      });
    }
    return null;
  }
}

export class MonitorPoint {
  public key: string
  public startTime: number = 0
  public endTime: number = 0

  constructor(key: string) {
    this.key = key;
  }
}
