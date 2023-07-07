/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29  Limited, a Tencent company.
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

// event handler type
type EventHandler = (...args: any[]) => void;

/**
 * hippy 3.x scene builder class, provide node operate func and event listener
 */
export class SceneBuilder {
  // root view id
  private readonly rootViewId: number;

  constructor(rootViewId: number) {
    this.rootViewId = rootViewId;
  }

  /**
   * create native nodes
   *
   * @param nodes
   */
  public create(nodes: Array<HippyTypes.TranslatedNodes>) {
    // create native view list
    Hippy.bridge.callNative('UIManagerModule', 'createNode', this.rootViewId, nodes);
  }

  /**
   * update native nodes
   *
   * @param nodes
   */
  public update(nodes: Array<HippyTypes.TranslatedNodes>) {
    // create native view
    Hippy.bridge.callNative('UIManagerModule', 'updateNode', this.rootViewId, nodes);
  }

  /**
   * delete native nodes
   *
   * @param nodes
   */
  public delete(nodes: Array<HippyTypes.TranslatedNodes>) {
    Hippy.bridge.callNative('UIManagerModule', 'deleteNode', this.rootViewId, nodes);
  }

  /**
   * move native nodes
   *
   * @param nodes
   */
  public move(nodes: Array<HippyTypes.TranslatedNodes>) {
    Hippy.bridge.callNative('UIManagerModule', 'moveNode', this.rootViewId, nodes);
  }

  /**
   * start node operate
   */
  public build() {
    // noting need to do at web platform
  }

  /**
   * add event listener for native node
   *
   * @param id
   * @param eventName
   * @param handler
   */
  public addEventListener(id: number, eventName: string, handler: EventHandler) {
    console.log('add event listener', id, eventName);
    Hippy.bridge.callNative('UIManagerModule', 'addEventListener', id, eventName, handler);
  }

  /**
   * remove event listener of native node
   *
   * @param id
   * @param eventName
   * @param handler
   */
  public removeEventListener(id: number, eventName: string, handler: EventHandler) {
    console.log('remove event listener', id, eventName);
    Hippy.bridge.callNative('UIManagerModule', 'removeEventListener', id, eventName, handler);
  }
}
